import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// Rate limiting map (in-memory, resets on cold start)
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

interface ChatRequest {
  prompt: string;
  context?: string;
  systemPrompt?: string;
}

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Simple rate limiting check
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT) {
    return false;
  }

  limit.count++;
  return true;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers - restrict to specific domain in production
  const allowedOrigins = [
    'https://protocol-guide.com',
    'https://www.protocol-guide.com',
    'https://protocol-guide.netlify.app',
    process.env.URL, // Netlify deploy preview URL
  ].filter(Boolean);

  const origin = event.headers['origin'] || '';
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || '';

  const headers = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Rate limiting - use Netlify's trusted client IP header (cannot be spoofed)
  const clientIP = event.headers['x-nf-client-connection-ip']
    || event.headers['client-ip']
    || event.headers['x-forwarded-for']?.split(',')[0]
    || 'unknown';
  if (!checkRateLimit(clientIP)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({ error: 'Rate limit exceeded. Please wait before sending more requests.' }),
    };
  }

  // Verify authentication (validate Supabase JWT)
  const authHeader = event.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Authentication required' }),
    };
  }

  // Extract and validate the JWT token
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  if (!token || token.length < 10) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid token format' }),
    };
  }

  // Validate JWT structure (header.payload.signature)
  const jwtParts = token.split('.');
  if (jwtParts.length !== 3) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Malformed token' }),
    };
  }

  // Decode and check expiration (basic validation without full signature verification)
  // Full verification would require Supabase JWT secret
  try {
    const payload = JSON.parse(Buffer.from(jwtParts[1], 'base64').toString());
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token expired' }),
      };
    }
  } catch {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
  }

  // Get API key from environment (server-side only)
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not configured');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  try {
    const body: ChatRequest = JSON.parse(event.body || '{}');

    if (!body.prompt || typeof body.prompt !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    // Sanitize and limit prompt length
    const prompt = body.prompt.slice(0, 4000);
    const context = body.context?.slice(0, 8000) || '';

    // Build the system prompt for medical reference
    const systemPrompt = body.systemPrompt || `ROLE: Protocol-Guide (LA County Fire EMS Medical Reference)

CRITICAL: You are a medical reference for emergency responders. ACCURACY IS PARAMOUNT.

STRICT RULES:
1. ONLY answer using the PROTOCOL CONTEXT provided. No external knowledge.
2. If context insufficient: "I don't have specific protocol information for this query."
3. NEVER invent dosages, procedures, or clinical guidance.
4. ALWAYS cite protocol reference (e.g., "Per TP-1201:" or "Ref: MCG 1302")
5. If CONFIDENCE is LOW, prepend: "Limited protocol match. Verify with protocol manual."
6. Be concise but complete. Field responders need quick answers.

VERBATIM REQUIREMENTS (CRITICAL FOR CLINICAL ACCURACY):
- For ALL clinical facts, quote EXACT text from the protocol context
- NEVER paraphrase: dosages, procedure steps, clinical criteria, time windows, contraindications
- Format verbatim quotes: "Per TP-1201: [exact text]"
- If unable to quote verbatim: "Protocol context does not contain specific [dosage/criteria/etc.]"`;

    // Build messages
    const messages: GeminiMessage[] = [];

    if (context) {
      messages.push({
        role: 'user',
        parts: [{ text: `PROTOCOL CONTEXT:\n${context}` }],
      });
      messages.push({
        role: 'model',
        parts: [{ text: 'I have reviewed the protocol context. I will only answer based on this information.' }],
      });
    }

    messages.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    // Call Gemini API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey, // API key in header instead of URL (security best practice)
        },
        body: JSON.stringify({
          contents: messages,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.2, // Low temperature for accuracy
            maxOutputTokens: 2048,
            topP: 0.8,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'AI service temporarily unavailable' }),
      };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: text,
        model: 'gemini-1.5-flash',
      }),
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        statusCode: 504,
        headers,
        body: JSON.stringify({ error: 'Request timeout. Please try again.' }),
      };
    }

    console.error('Chat function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
