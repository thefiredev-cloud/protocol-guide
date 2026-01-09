import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  // Check total chunks
  const { count: totalChunks } = await supabase
    .from('protocol_chunks')
    .select('id', { count: 'exact', head: true });

  console.log('Total chunks:', totalChunks);

  // Check chunks with embeddings
  const { data: withEmbed, count: embedCount } = await supabase
    .from('protocol_chunks')
    .select('id, embedding', { count: 'exact' })
    .not('embedding', 'is', null)
    .limit(3);

  console.log('Chunks WITH embeddings:', embedCount);

  if (withEmbed && withEmbed.length > 0) {
    const firstEmbed = withEmbed[0].embedding;
    console.log('Embedding type:', typeof firstEmbed);
    console.log('Embedding length:', Array.isArray(firstEmbed) ? firstEmbed.length : 'not array');
    console.log('Sample values:', Array.isArray(firstEmbed) ? firstEmbed.slice(0, 3) : firstEmbed);
  }

  // Check chunks without embeddings
  const { count: noEmbedCount } = await supabase
    .from('protocol_chunks')
    .select('id', { count: 'exact', head: true })
    .is('embedding', null);

  console.log('Chunks WITHOUT embeddings:', noEmbedCount);

  // Check if semantic_search_protocols RPC exists
  const { data: rpcTest, error: rpcError } = await supabase.rpc('semantic_search_protocols', {
    query_embedding: new Array(768).fill(0.1),
    match_count: 1,
    similarity_threshold: 0.0
  });

  if (rpcError) {
    console.log('semantic_search_protocols RPC error:', rpcError.message);
  } else {
    console.log('semantic_search_protocols returned:', rpcTest?.length, 'results');
  }

  // Test keyword search
  const { data: keywordTest, error: keywordError } = await supabase
    .from('protocol_chunks')
    .select('id, protocol_id, content')
    .textSearch('content', 'cardiac arrest')
    .limit(3);

  if (keywordError) {
    console.log('Keyword search error:', keywordError.message);
  } else {
    console.log('Keyword search for "cardiac arrest" returned:', keywordTest?.length, 'results');
    keywordTest?.forEach(r => console.log('  -', r.protocol_id));
  }
}

main().catch(console.error);
