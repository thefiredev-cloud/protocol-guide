import fs from 'fs';

const kb = JSON.parse(fs.readFileSync('data/ems_kb_clean.json', 'utf8'));
const entries = kb.filter(e => e.id && e.id.includes('1242') && !e.id.includes('1242-P'));

entries.forEach((e, i) => {
  console.log(`\n===== ENTRY ${i + 1}: ${e.id} =====`);
  console.log(e.content);
  console.log('\n');
});

console.log(`\nFound ${entries.length} Protocol 1242 (adult) entries`);
