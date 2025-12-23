#!/usr/bin/env npx tsx
/**
 * LA County Prehospital Care Manual - KB Coverage Verification Script
 *
 * This script verifies 100% parity between:
 * - Source files in PDFs/ folder (LA County PCM)
 * - Knowledge base entries in public/kb/ems_kb_clean.json
 * - Protocol whitelist in lib/protocols/la-county-protocol-whitelist.ts
 *
 * Exit codes:
 * - 0: All protocols verified (100% coverage)
 * - 1: Missing protocols detected (BLOCKING)
 *
 * Usage: npx tsx scripts/verify-kb-coverage.ts
 */

import * as fs from "fs";
import * as path from "path";

// Types
interface VerificationResult {
  protocolCode: string;
  protocolName: string;
  sourceFile: string;
  inKB: boolean;
  kbEntryIds: string[];
  inWhitelist: boolean;
  status: "pass" | "partial" | "fail";
}

interface KBEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory: string;
  source?: string;
}

interface VerificationReport {
  timestamp: string;
  summary: {
    totalSourceFiles: number;
    protocolsFound: number;
    inKB: number;
    inWhitelist: number;
    passed: number;
    failed: number;
    coverage: string;
  };
  results: VerificationResult[];
  missingProtocols: VerificationResult[];
}

// Paths
const PDFS_DIR = path.join(process.cwd(), "PDFs");
const KB_PATH = path.join(process.cwd(), "public/kb/ems_kb_clean.json");
const WHITELIST_PATH = path.join(process.cwd(), "lib/protocols/la-county-protocol-whitelist.ts");
const REPORT_JSON_PATH = path.join(process.cwd(), "docs/verification-report.json");
const REPORT_MD_PATH = path.join(process.cwd(), "docs/protocol-coverage-matrix.md");

// Extract protocol code from filename
function extractProtocolCode(filename: string): string | null {
  // Pattern matches: 1210, 1317.25, 802.1, 1210-P, etc.
  // Filenames are like: 1040387_1210CardiacArrest2018-05-30.md
  // The document ID is before the underscore, protocol code is after

  // Remove extension
  const base = filename.replace(/\.md$/, "");

  // Split by underscore - format is: documentId_protocolCodeName
  const parts = base.split("_");
  if (parts.length < 2) return null;

  // The protocol code is in the second part, before the name
  // Examples: "1210CardiacArrest2018-05-30" -> "1210"
  //           "1317.25-Midazolam" -> "1317.25"
  //           "1210-PCardiacArrest" -> "1210-P"
  const protocolPart = parts[1];

  // Match protocol code at start of string
  const patterns = [
    /^(\d{3,4}\.\d+(?:-P)?)/,  // With decimal: 1317.25, 1317.25-P
    /^(\d{3,4}-P)/,            // Pediatric suffix: 1210-P
    /^(\d{3,4})/,              // Standard: 1210, 803
  ];

  for (const pattern of patterns) {
    const match = protocolPart.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

// Extract protocol name from filename
function extractProtocolName(filename: string): string {
  // Remove document ID prefix and extension
  const withoutExt = filename.replace(/\.md$/, "");
  const parts = withoutExt.split("_");
  if (parts.length > 1) {
    // Remove date suffix if present
    let name = parts.slice(1).join("_");
    name = name.replace(/\d{4}-\d{2}-\d{2}$/, "").trim();
    return name;
  }
  return withoutExt;
}

// Load KB entries
function loadKB(): KBEntry[] {
  try {
    const content = fs.readFileSync(KB_PATH, "utf-8");
    return JSON.parse(content) as KBEntry[];
  } catch (error) {
    console.error("Failed to load KB:", error);
    return [];
  }
}

// Load whitelist codes
function loadWhitelistCodes(): Set<string> {
  try {
    const content = fs.readFileSync(WHITELIST_PATH, "utf-8");
    const codes = new Set<string>();

    // Match protocol codes in the whitelist
    const codeMatches = content.matchAll(/"(\d{3,4}(?:\.\d+)?(?:-P)?)"/g);
    for (const match of codeMatches) {
      codes.add(match[1]);
    }

    return codes;
  } catch (error) {
    console.error("Failed to load whitelist:", error);
    return new Set();
  }
}

// Check if protocol exists in KB
function findInKB(protocolCode: string, kbEntries: KBEntry[]): string[] {
  const matchingIds: string[] = [];

  for (const entry of kbEntries) {
    // Check if protocol code appears in ID, title, or source
    if (
      entry.id?.includes(protocolCode) ||
      entry.title?.includes(protocolCode) ||
      entry.source?.includes(protocolCode) ||
      entry.content?.includes(`Protocol ${protocolCode}`) ||
      entry.content?.includes(`Ref. No. ${protocolCode}`)
    ) {
      matchingIds.push(entry.id);
    }
  }

  return matchingIds;
}

// Main verification function
function runVerification(): VerificationReport {
  console.log("🔍 LA County PCM Coverage Verification\n");
  console.log("Loading data sources...");

  // Load source files
  const sourceFiles = fs.readdirSync(PDFS_DIR)
    .filter(f => f.endsWith(".md"))
    .filter(f => !f.includes("ChangeLog"))  // Exclude changelog files
    .filter(f => !f.startsWith("cms1_"));   // Exclude CMS reference files

  console.log(`  📁 Source files: ${sourceFiles.length}`);

  // Load KB
  const kbEntries = loadKB();
  console.log(`  📚 KB entries: ${kbEntries.length}`);

  // Load whitelist
  const whitelistCodes = loadWhitelistCodes();
  console.log(`  📋 Whitelist codes: ${whitelistCodes.size}`);

  // Verify each source file
  const results: VerificationResult[] = [];
  let passed = 0;
  let failed = 0;

  console.log("\nVerifying protocols...\n");

  for (const file of sourceFiles) {
    const protocolCode = extractProtocolCode(file);
    const protocolName = extractProtocolName(file);

    if (!protocolCode) {
      // Skip files without protocol codes (TOCs, manifests, etc.)
      continue;
    }

    const kbMatches = findInKB(protocolCode, kbEntries);
    const inKB = kbMatches.length > 0;
    const inWhitelist = whitelistCodes.has(protocolCode);

    // Primary requirement: Protocol content must be in KB
    // Whitelist is secondary (used for protocol matcher, not KB coverage)
    let status: "pass" | "partial" | "fail";
    if (inKB) {
      status = inWhitelist ? "pass" : "partial";  // partial = in KB but not whitelist
      passed++;
    } else {
      status = "fail";  // BLOCKING: not in KB
      failed++;
    }

    results.push({
      protocolCode,
      protocolName,
      sourceFile: file,
      inKB,
      kbEntryIds: kbMatches,
      inWhitelist,
      status,
    });
  }

  // Sort by protocol code
  results.sort((a, b) => {
    const codeA = parseFloat(a.protocolCode.replace("-P", ".5"));
    const codeB = parseFloat(b.protocolCode.replace("-P", ".5"));
    return codeA - codeB;
  });

  const missingProtocols = results.filter(r => r.status === "fail");
  const partialProtocols = results.filter(r => r.status === "partial");

  const coverage = ((passed / results.length) * 100).toFixed(1);

  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalSourceFiles: sourceFiles.length,
      protocolsFound: results.length,
      inKB: results.filter(r => r.inKB).length,
      inWhitelist: results.filter(r => r.inWhitelist).length,
      passed,
      failed,
      coverage: `${coverage}%`,
    },
    results,
    missingProtocols,
  };
}

// Generate markdown report
function generateMarkdownReport(report: VerificationReport): string {
  const lines: string[] = [
    "# LA County Prehospital Care Manual - Protocol Coverage Matrix",
    "",
    `**Generated:** ${report.timestamp}`,
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "|--------|-------|",
    `| Total Source Files | ${report.summary.totalSourceFiles} |`,
    `| Protocols Found | ${report.summary.protocolsFound} |`,
    `| In KB | ${report.summary.inKB} |`,
    `| In Whitelist | ${report.summary.inWhitelist} |`,
    `| **Passed** | ${report.summary.passed} |`,
    `| **Failed** | ${report.summary.failed} |`,
    `| **Coverage** | ${report.summary.coverage} |`,
    "",
  ];

  if (report.missingProtocols.length > 0) {
    lines.push("## ❌ Missing Protocols (BLOCKING)", "");
    lines.push("| Protocol | Name | In KB | In Whitelist |");
    lines.push("|----------|------|-------|--------------|");
    for (const p of report.missingProtocols) {
      lines.push(`| ${p.protocolCode} | ${p.protocolName} | ${p.inKB ? "✓" : "✗"} | ${p.inWhitelist ? "✓" : "✗"} |`);
    }
    lines.push("");
  }

  lines.push("## Full Coverage Matrix", "");
  lines.push("| Protocol | Name | Source File | In KB | In Whitelist | Status |");
  lines.push("|----------|------|-------------|-------|--------------|--------|");

  for (const r of report.results) {
    const statusIcon = r.status === "pass" ? "✓" : r.status === "partial" ? "⚠️" : "✗";
    lines.push(
      `| ${r.protocolCode} | ${r.protocolName.substring(0, 40)} | ${r.sourceFile.substring(0, 30)}... | ${r.inKB ? "✓" : "✗"} | ${r.inWhitelist ? "✓" : "✗"} | ${statusIcon} |`
    );
  }

  return lines.join("\n");
}

// Main execution
function main() {
  const report = runVerification();

  // Ensure docs directory exists
  const docsDir = path.join(process.cwd(), "docs");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Write JSON report
  fs.writeFileSync(REPORT_JSON_PATH, JSON.stringify(report, null, 2));
  console.log(`📄 JSON report: ${REPORT_JSON_PATH}`);

  // Write markdown report
  const mdReport = generateMarkdownReport(report);
  fs.writeFileSync(REPORT_MD_PATH, mdReport);
  console.log(`📄 Markdown report: ${REPORT_MD_PATH}`);

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("VERIFICATION SUMMARY");
  console.log("=".repeat(50));
  console.log(`Total Source Files: ${report.summary.totalSourceFiles}`);
  console.log(`Protocols Found: ${report.summary.protocolsFound}`);
  console.log(`In KB: ${report.summary.inKB}`);
  console.log(`In Whitelist: ${report.summary.inWhitelist}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Coverage: ${report.summary.coverage}`);
  console.log("=".repeat(50));

  if (report.missingProtocols.length > 0) {
    console.log("\n❌ VERIFICATION FAILED - Missing protocols:");
    for (const p of report.missingProtocols.slice(0, 10)) {
      console.log(`  - ${p.protocolCode}: ${p.protocolName}`);
    }
    if (report.missingProtocols.length > 10) {
      console.log(`  ... and ${report.missingProtocols.length - 10} more`);
    }
    console.log("\nSee docs/protocol-coverage-matrix.md for full list.");
    process.exit(1);
  }

  console.log("\n✅ VERIFICATION PASSED - 100% coverage achieved!");
  process.exit(0);
}

main();
