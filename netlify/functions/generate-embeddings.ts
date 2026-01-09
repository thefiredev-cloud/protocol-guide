import { createClient } from '@supabase/supabase-js';
import type { Handler } from '@netlify/functions';

const EMBEDDING_MODEL = 'text-embedding-004';
const BATCH_SIZE = 50;

const handler: Handler = async (event) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!supabaseUrl || !supabaseKey || !geminiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Missing environment variables',
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseKey,
        hasGeminiKey: !!geminiKey
      })
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get chunks without embeddings
  const { data: chunks, error } = await supabase
    .from('protocol_chunks')
    .select('id, content, protocol_id')
    .is('embedding', null)
    .limit(BATCH_SIZE);

  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }

  if (!chunks || chunks.length === 0) {
    const { count, error: countError } = await supabase
      .from('protocol_chunks')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Failed to get chunk count:', countError);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'All chunks have embeddings',
        totalChunks: count ?? 0,
        remaining: 0
      })
    };
  }

  let successCount = 0;
  const errors: string[] = [];

  for (const chunk of chunks) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${EMBEDDING_MODEL}:embedContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: `models/${EMBEDDING_MODEL}`,
            content: { parts: [{ text: chunk.content.substring(0, 8000) }] }
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        errors.push(`${chunk.protocol_id}: ${errText.substring(0, 100)}`);
        continue;
      }

      const data = await response.json();
      const embedding = data.embedding?.values;

      if (embedding && embedding.length === 768) {
        const { error: updateError } = await supabase
          .from('protocol_chunks')
          .update({ embedding })
          .eq('id', chunk.id);

        if (!updateError) {
          successCount++;
        } else {
          errors.push(`${chunk.protocol_id}: Update failed - ${updateError.message}`);
        }
      }
    } catch (e) {
      errors.push(`${chunk.protocol_id}: ${e}`);
    }
  }

  // Get remaining count
  const { count: remaining } = await supabase
    .from('protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .is('embedding', null);

  return {
    statusCode: 200,
    body: JSON.stringify({
      processed: chunks.length,
      successful: successCount,
      remaining,
      errors: errors.slice(0, 5),
      message: remaining > 0 ? `Call again to process more. ${remaining} chunks remaining.` : 'Complete!'
    })
  };
};

export { handler };
