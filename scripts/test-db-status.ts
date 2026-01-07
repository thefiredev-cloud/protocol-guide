import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

async function main() {
  const { count, error } = await supabase
    .from('protocol_chunks')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.log('Error:', error.message);
    console.log('Hint:', error.hint);
    return;
  }
  console.log('Total chunks:', count);

  const { count: withEmbeddings, error: e2 } = await supabase
    .from('protocol_chunks')
    .select('*', { count: 'exact', head: true })
    .not('embedding', 'is', null);

  if (e2) {
    console.log('Error 2:', e2.message);
    return;
  }

  console.log('With embeddings:', withEmbeddings);
  console.log('Missing:', (count || 0) - (withEmbeddings || 0));
}

main();
