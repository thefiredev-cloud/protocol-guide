#!/usr/bin/env npx tsx
/**
 * LA County Protocol Whitelist Generator
 *
 * Scans PDFs/ folder to auto-generate authoritative protocol whitelist.
 * Extracts protocol codes, names, and revision dates from LA County DHS documents.
 *
 * Usage: npx tsx scripts/generate-protocol-whitelist.ts
 */

import * as fs from "fs";
import * as path from "path";

type ProviderScope = "EMT" | "Paramedic" | "both";

interface ProtocolEntry {
  code: string;
  name: string;
  category: ProtocolCategory;
  scope: ProviderScope;
  revisionDate?: string;
  sourceFile: string;
  isPediatric: boolean;
}

type ProtocolCategory =
  | "treatment_protocol"      // 1200 series
  | "mcg"                     // 1300 series
  | "drug_reference"          // 1317.XX
  | "policy"                  // 200-900 series
  | "administrative"
  | "other";

const PDF_DIR = path.resolve(__dirname, "../PDFs");
const OUTPUT_FILE = path.resolve(__dirname, "../lib/protocols/la-county-protocol-whitelist.ts");

// Regex patterns for extracting protocol codes from filenames
const PROTOCOL_PATTERNS = {
  // Treatment Protocols: 1200.X, 1201, 1210, etc.
  treatmentProtocol: /_(1[0-2]\d{2}(?:\.\d+)?)/,
  // Pediatric variants: 1202-P, 1210-P
  pediatricProtocol: /_(1[0-2]\d{2})-P/,
  // Drug Reference: 1317.1, 1317.29, etc.
  drugReference: /_(1317\.\d+)/,
  // MCG: 1301-1399
  mcg: /_(13\d{2})/,
  // Policy: 200-899
  policy: /_([2-8]\d{2}(?:\.\d+)?)/,
};

// Scope mapping based on protocol content patterns
const PARAMEDIC_ONLY_INDICATORS = [
  "intubation", "iv", "io", "cardioversion", "pacing",
  "epinephrine", "amiodarone", "adenosine", "fentanyl",
  "morphine", "midazolam", "ketamine", "rsi"
];

const EMT_AUTHORIZED = [
  "1200", "1200.1", "1200.4", // Assessment protocols
  "epipen", "aspirin", "glucose", "oxygen", "naloxone"
];

function extractProtocolFromFilename(filename: string): Partial<ProtocolEntry> | null {
  const isPediatric = filename.includes("-P") || filename.toLowerCase().includes("pediatric");

  // Try each pattern
  for (const pattern of Object.values(PROTOCOL_PATTERNS)) {
    const match = filename.match(pattern);
    if (match) {
      const code = match[1];

      // Extract name from filename (part after protocol number)
      const nameMatch = filename.match(new RegExp(`${code.replace(".", "\\.")}[-_]?(.+?)(?:\\d{4}|\\.|$)`));
      let name = nameMatch?.[1] || "";
      name = name
        .replace(/[-_]/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .trim();

      // Determine category
      let protocolCategory: ProtocolCategory;
      if (code.startsWith("1317.")) {
        protocolCategory = "drug_reference";
      } else if (code.match(/^1[0-2]\d{2}/)) {
        protocolCategory = "treatment_protocol";
      } else if (code.match(/^13\d{2}/)) {
        protocolCategory = "mcg";
      } else if (code.match(/^[2-8]\d{2}/)) {
        protocolCategory = "policy";
      } else {
        protocolCategory = "other";
      }

      return {
        code: isPediatric ? `${code}-P` : code,
        name,
        category: protocolCategory,
        isPediatric,
        sourceFile: filename,
      };
    }
  }

  return null;
}

function extractRevisionDate(content: string): string | undefined {
  // Match patterns like "REVISED: 07-01-24" or "REVISED: 04-01-25"
  const match = content.match(/REVISED:\s*(\d{2}-\d{2}-\d{2,4})/);
  if (match) {
    return match[1];
  }
  return undefined;
}

function determineScope(content: string, code: string): ProviderScope {
  const lowerContent = content.toLowerCase();

  // Check if explicitly EMT-authorized
  if (EMT_AUTHORIZED.some(pattern => code.includes(pattern))) {
    return "both";
  }

  // Check for paramedic-only indicators
  if (PARAMEDIC_ONLY_INDICATORS.some(indicator => lowerContent.includes(indicator))) {
    // Unless explicitly mentions EMT
    if (lowerContent.includes("emt") && lowerContent.includes("authorized")) {
      return "both";
    }
    return "Paramedic";
  }

  // Default to both if unclear
  return "both";
}

function generateWhitelist(): void {
  console.log("Scanning PDFs directory...");

  const files = fs.readdirSync(PDF_DIR).filter(f => f.endsWith(".md"));
  console.log(`Found ${files.length} protocol files`);

  const protocols: Map<string, ProtocolEntry> = new Map();

  for (const file of files) {
    const extracted = extractProtocolFromFilename(file);
    if (!extracted || !extracted.code) continue;

    // Read file content for revision date and scope determination
    const filePath = path.join(PDF_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8").slice(0, 2000); // First 2KB

    const revisionDate = extractRevisionDate(content);
    const scope = determineScope(content, extracted.code);

    const entry: ProtocolEntry = {
      code: extracted.code,
      name: extracted.name || extracted.code,
      category: extracted.category || "other",
      scope,
      revisionDate,
      sourceFile: file,
      isPediatric: extracted.isPediatric || false,
    };

    // Use latest revision if duplicate
    const existing = protocols.get(entry.code);
    if (!existing || (revisionDate && (!existing.revisionDate || revisionDate > existing.revisionDate))) {
      protocols.set(entry.code, entry);
    }
  }

  console.log(`Extracted ${protocols.size} unique protocol codes`);

  // Generate TypeScript file
  const sortedProtocols = Array.from(protocols.values()).sort((a, b) =>
    a.code.localeCompare(b.code, undefined, { numeric: true })
  );

  const output = generateTypeScriptFile(sortedProtocols);

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`Generated whitelist at: ${OUTPUT_FILE}`);

  // Print summary
  const categories = new Map<string, number>();
  for (const p of sortedProtocols) {
    categories.set(p.category, (categories.get(p.category) || 0) + 1);
  }
  console.log("\nProtocol Summary:");
  for (const [cat, count] of Array.from(categories.entries())) {
    console.log(`  ${cat}: ${count}`);
  }
}

function generateTypeScriptFile(protocols: ProtocolEntry[]): string {
  const protocolEntries = protocols.map(p => {
    return `  "${p.code}": {
    name: ${JSON.stringify(p.name)},
    category: ${JSON.stringify(p.category)},
    scope: ${JSON.stringify(p.scope)},
    isPediatric: ${p.isPediatric},
    revisionDate: ${p.revisionDate ? JSON.stringify(p.revisionDate) : "undefined"},
  }`;
  }).join(",\n");

  return `/**
 * LA County Protocol Whitelist
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 *
 * Generated from PDFs/ folder on ${new Date().toISOString().split("T")[0]}
 * Source: LA County Department of Health Services EMS Agency
 *
 * Total protocols: ${protocols.length}
 */

export type ProviderScope = "EMT" | "Paramedic" | "both";

export type ProtocolCategory =
  | "treatment_protocol"
  | "mcg"
  | "drug_reference"
  | "policy"
  | "administrative"
  | "other";

export interface LACountyProtocol {
  name: string;
  category: ProtocolCategory;
  scope: ProviderScope;
  isPediatric: boolean;
  revisionDate?: string;
}

/**
 * Authoritative whitelist of all LA County EMS protocols.
 * Every protocol citation in LLM responses MUST be validated against this list.
 */
export const LA_COUNTY_PROTOCOLS: Record<string, LACountyProtocol> = {
${protocolEntries}
} as const;

/**
 * Check if a protocol code is valid in LA County EMS system.
 * @param code - Protocol code (e.g., "1210", "1317.29", "803")
 * @returns true if the protocol exists in LA County PCM
 */
export function isValidProtocol(code: string): boolean {
  // Normalize code (remove "TP ", "Ref ", "MCG " prefixes)
  const normalized = normalizeProtocolCode(code);
  return normalized in LA_COUNTY_PROTOCOLS;
}

/**
 * Get protocol information if valid.
 * @param code - Protocol code
 * @returns Protocol info or null if invalid
 */
export function getProtocol(code: string): LACountyProtocol | null {
  const normalized = normalizeProtocolCode(code);
  return LA_COUNTY_PROTOCOLS[normalized] ?? null;
}

/**
 * Get provider scope for a protocol.
 * @param code - Protocol code
 * @returns "EMT", "Paramedic", "both", or null if invalid
 */
export function getProtocolScope(code: string): ProviderScope | null {
  const protocol = getProtocol(code);
  return protocol?.scope ?? null;
}

/**
 * Validate multiple protocol citations and return invalid ones.
 * @param codes - Array of protocol codes to validate
 * @returns Array of invalid protocol codes
 */
export function findInvalidProtocols(codes: string[]): string[] {
  return codes.filter(code => !isValidProtocol(code));
}

/**
 * Normalize a protocol code by removing common prefixes.
 */
export function normalizeProtocolCode(code: string): string {
  return code
    .replace(/^(TP|Ref\\.?|MCG|Reference|Protocol)\\s*/i, "")
    .replace(/\\s+/g, "")
    .trim();
}

/**
 * Extract all protocol codes from text (for validation).
 */
export function extractProtocolCodes(text: string): string[] {
  const patterns = [
    /\\b(1[0-2]\\d{2}(?:\\.\\d+)?(?:-P)?)\\b/g,  // Treatment protocols
    /\\b(13\\d{2}(?:\\.\\d+)?)\\b/g,              // MCG
    /\\b([2-8]\\d{2}(?:\\.\\d+)?)\\b/g,           // Policies
    /(?:TP|Ref|MCG|Protocol)\\s*(\\d{3,4}(?:\\.\\d+)?)/gi,
  ];

  const codes = new Set<string>();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      codes.add(match[1]);
    }
  }

  return Array.from(codes);
}

// Export count for validation
export const PROTOCOL_COUNT = ${protocols.length};
`;
}

// Run generator
generateWhitelist();
