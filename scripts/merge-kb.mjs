#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const primaryPath = process.argv[2] || path.join(root, 'data', 'ems_kb_clean.json');
const supplementalPath = process.argv[3] || path.join(root, 'data', 'supplemental_kb.json');
const outPath = process.argv[4] || path.join(root, 'data', 'ems_kb_merged.json');

async function main() {
  const [{ mergeKnowledgeBases }] = await Promise.all([
    import(path.join(root, 'lib', 'storage', 'knowledge-base-merge.ts')).then(m => m),
  ]);
  const primary = JSON.parse(await fs.readFile(primaryPath, 'utf8'));
  const supplemental = JSON.parse(await fs.readFile(supplementalPath, 'utf8'));
  const merged = mergeKnowledgeBases(primary, supplemental);
  await fs.writeFile(outPath, JSON.stringify(merged, null, 2), 'utf8');
  console.log(`[merge-kb] wrote ${merged.length} docs to ${outPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });


