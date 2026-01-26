/**
 * Check existing LA County protocol chunks
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('Checking LA County protocol chunks...\n');
  
  // Get all LA County chunks
  const { data: chunks, error } = await supabase
    .from('manus_protocol_chunks')
    .select('id, protocol_number, protocol_title, section, source_pdf_url')
    .ilike('agency_name', '%los angeles%')
    .order('protocol_number');

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log(`Total LA County chunks: ${chunks?.length || 0}\n`);

  if (chunks && chunks.length > 0) {
    // Get unique protocols
    const protocols = new Map<string, { title: string; section: string; url: string; count: number }>();
    
    for (const chunk of chunks) {
      const key = chunk.protocol_number || chunk.protocol_title;
      if (!protocols.has(key)) {
        protocols.set(key, {
          title: chunk.protocol_title,
          section: chunk.section || 'Unknown',
          url: chunk.source_pdf_url,
          count: 1
        });
      } else {
        protocols.get(key)!.count++;
      }
    }

    console.log(`Unique protocols: ${protocols.size}\n`);
    console.log('Protocols by section:');
    
    // Group by section
    const sections = new Map<string, string[]>();
    for (const [num, proto] of protocols) {
      const section = proto.section;
      if (!sections.has(section)) {
        sections.set(section, []);
      }
      sections.get(section)!.push(`  ${num}: ${proto.title} (${proto.count} chunks)`);
    }

    for (const [section, protos] of sections) {
      console.log(`\n${section}:`);
      protos.forEach(p => console.log(p));
    }

    // Show unique source URLs
    const urls = [...new Set(chunks.map(c => c.source_pdf_url).filter(Boolean))];
    console.log(`\n\nUnique source URLs (${urls.length}):`);
    urls.slice(0, 10).forEach(u => console.log(u));
    if (urls.length > 10) console.log(`... and ${urls.length - 10} more`);
  }
}

main().catch(console.error);
