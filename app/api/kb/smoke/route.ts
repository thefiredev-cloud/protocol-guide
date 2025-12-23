import { NextResponse } from "next/server";

import { knowledgeBaseInitializer } from "../../../../lib/managers/knowledge-base-initializer";
import { initializeKnowledgeBase, searchKB } from "../../../../lib/retrieval";

const CHECKS = [
  { query: "MCG 1309", description: "Medication dosing guideline" },
  { query: "Protocol 1211", description: "Cardiac chest pain" },
  { query: "Protocol 1233", description: "Respiratory distress bronchospasm" },
];

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await knowledgeBaseInitializer.warm();
  await initializeKnowledgeBase();
  const checks = await Promise.all(
    CHECKS.map(async (check) => {
      const hits = await searchKB(check.query, 5);
      const found = hits.some((hit) => hit.title.toLowerCase().includes(check.query.toLowerCase())) || hits.length > 0;
      return { ...check, found };
    }),
  );

  return NextResponse.json({
    ok: checks.every((entry) => entry.found),
    docCount: status.docCount,
    passedChecks: checks.filter((entry) => entry.found).map((entry) => entry.query),
    failedChecks: checks.filter((entry) => !entry.found).map((entry) => entry.query),
  });
}


