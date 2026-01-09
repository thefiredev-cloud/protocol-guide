import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// Rate limiting map (in-memory, resets on cold start)
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

interface ChatRequest {
  prompt: string;
  context?: string;
  systemPrompt?: string;
  priorContext?: string;  // For context-dependent follow-up responses (yes/no/confirmations)
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

// Format data for Server-Sent Events
function formatSSE(data: string, event?: string): string {
  let message = '';
  if (event) {
    message += `event: ${event}\n`;
  }
  message += `data: ${data}\n\n`;
  return message;
}

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // CORS headers - restrict to allowed origins
  const allowedOrigins = [
    'https://protocol-guide.com',
    'https://www.protocol-guide.com',
    'https://protocol-guide.netlify.app',
    process.env.URL, // Netlify deploy preview URL
  ].filter(Boolean);

  const origin = event.headers['origin'] || '';
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || '';

  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Rate limiting
  const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  if (!checkRateLimit(clientIP)) {
    return {
      statusCode: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Rate limit exceeded. Please wait before sending more requests.' }),
    };
  }

  // Verify authentication (check for Bearer token)
  const authHeader = event.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Authentication required' }),
    };
  }

  // Get API key from environment (server-side only, not VITE_ prefixed)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not configured');
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  try {
    const body: ChatRequest = JSON.parse(event.body || '{}');

    if (!body.prompt || typeof body.prompt !== 'string') {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    // Sanitize and limit prompt length
    const prompt = body.prompt.slice(0, 4000);
    const context = body.context?.slice(0, 8000) || '';
    const priorContext = body.priorContext?.slice(0, 1000) || '';  // Prior conversation context for follow-ups

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

    // Add prior context first if this is a follow-up response (yes/no/confirmation)
    if (priorContext) {
      messages.push({
        role: 'user',
        parts: [{ text: priorContext }],
      });
      messages.push({
        role: 'model',
        parts: [{ text: 'I understand the context of our previous exchange. I will consider this when responding.' }],
      });
    }

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

    // Call Gemini API with streaming
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout for streaming

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'AI service temporarily unavailable' }),
      };
    }

    // Process streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    let buffer = '';
    let streamData = '';

    // Read and process chunks
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages from Gemini
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonData = line.slice(6); // Remove 'data: ' prefix
            if (jsonData === '[DONE]') continue;

            const parsed = JSON.parse(jsonData);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
              streamData += formatSSE(JSON.stringify({
                text,
                model: 'gemini-2.0-flash'
              }), 'message');
            }
          } catch (e) {
            // Skip malformed JSON chunks
            console.error('Failed to parse chunk:', e);
          }
        }
      }
    }

    // Send completion event
    streamData += formatSSE(JSON.stringify({ done: true }), 'done');

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering for Nginx
      },
      body: streamData,
    };

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        statusCode: 504,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Request timeout. Please try again.' }),
      };
    }

    console.error('Chat stream function error:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
