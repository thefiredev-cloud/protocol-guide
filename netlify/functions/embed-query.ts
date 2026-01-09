import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

// Types
interface EmbedRequest {
  query: string;
}

interface EmbedResponse {
  embedding: number[];
  dimensions: number;
}

interface CacheEntry {
  embedding: number[];
  timestamp: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Constants
const MAX_QUERY_LENGTH = 8000;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60;
const EMBEDDING_DIMENSIONS = 768;
const GEMINI_EMBEDDING_MODEL = 'text-embedding-004';

// In-memory cache and rate limiting
const embeddingCache = new Map<string, CacheEntry>();
const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Get client identifier for rate limiting (IP address)
 */
function getClientId(event: HandlerEvent): string {
  return event.headers['x-forwarded-for']?.split(',')[0].trim() ||
         event.headers['client-ip'] ||
         'unknown';
}

/**
 * Check and update rate limit for client
 */
function checkRateLimit(clientId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(clientId);

  // Clean up old entry or create new one
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  // Check if limit exceeded
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  // Increment counter
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count };
}

/**
 * Get embedding from cache if available and not expired
 */
function getCachedEmbedding(query: string): number[] | null {
  const cached = embeddingCache.get(query);

  if (!cached) {
    return null;
  }

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL_MS) {
    // Cache expired, remove it
    embeddingCache.delete(query);
    return null;
  }

  return cached.embedding;
}

/**
 * Store embedding in cache
 */
function cacheEmbedding(query: string, embedding: number[]): void {
  embeddingCache.set(query, {
    embedding,
    timestamp: Date.now()
  });

  // Clean up expired entries periodically (keep cache size manageable)
  if (embeddingCache.size > 1000) {
    cleanupCache();
  }
}

/**
 * Remove expired cache entries
 */
function cleanupCache(): void {
  const now = Date.now();
  const entriesToDelete: string[] = [];

  embeddingCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_TTL_MS) {
      entriesToDelete.push(key);
    }
  });

  entriesToDelete.forEach(key => embeddingCache.delete(key));
}

/**
 * Generate embedding using Gemini API
 */
async function generateEmbedding(query: string, apiKey: string): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBEDDING_MODEL}:embedContent`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: `models/${GEMINI_EMBEDDING_MODEL}`,
        content: {
          parts: [{
            text: query
          }]
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (!data.embedding || !data.embedding.values) {
      throw new Error('Invalid response from Gemini API: missing embedding data');
    }

    return data.embedding.values;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Netlify function handler
 */
export const handler: Handler = async (
  event: HandlerEvent,
  _context: HandlerContext
) => {
  // CORS headers - restrict to allowed origins
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
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
    };
  }

  try {
    // Rate limiting
    const clientId = getClientId(event);
    const rateLimit = checkRateLimit(clientId);

    if (!rateLimit.allowed) {
      return {
        statusCode: 429,
        headers: {
          ...headers,
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60',
        },
        body: JSON.stringify({
          error: 'Rate limit exceeded. Maximum 60 requests per minute.',
          retryAfter: 60
        }),
      };
    }

    // Validate API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error: API key not configured' }),
      };
    }

    // Parse and validate request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    let requestData: EmbedRequest;
    try {
      requestData = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }

    // Validate query parameter
    const { query } = requestData;

    if (!query || typeof query !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query must be a non-empty string' }),
      };
    }

    if (query.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query cannot be empty or whitespace only' }),
      };
    }

    if (query.length > MAX_QUERY_LENGTH) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`,
          maxLength: MAX_QUERY_LENGTH,
          providedLength: query.length
        }),
      };
    }

    // Check cache first
    const cachedEmbedding = getCachedEmbedding(query);

    let embedding: number[];
    let fromCache = false;

    if (cachedEmbedding) {
      embedding = cachedEmbedding;
      fromCache = true;
    } else {
      // Generate new embedding
      embedding = await generateEmbedding(query, apiKey);

      // Cache the result
      cacheEmbedding(query, embedding);
    }

    // Verify embedding dimensions
    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      console.warn(`Unexpected embedding dimensions: ${embedding.length}, expected ${EMBEDDING_DIMENSIONS}`);
    }

    const response: EmbedResponse = {
      embedding,
      dimensions: embedding.length
    };

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-Cache-Status': fromCache ? 'HIT' : 'MISS',
      },
      body: JSON.stringify(response),
    };

  } catch (error) {
    console.error('Error generating embedding:', error);

    // Determine appropriate error message and status code
    let statusCode = 500;
    let errorMessage = 'Internal server error while generating embedding';

    if (error instanceof Error) {
      if (error.message.includes('Gemini API error')) {
        statusCode = 502;
        errorMessage = 'Error communicating with embedding service';
      } else if (error.message.includes('fetch')) {
        statusCode = 503;
        errorMessage = 'Embedding service temporarily unavailable';
      }
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : String(error)
        })
      }),
    };
  }
};
