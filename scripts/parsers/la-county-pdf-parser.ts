/**
 * LA County PDF Protocol Parser
 *
 * Parses LA County EMS protocols from official PDFs with pattern recognition
 * for Reference (Ref), Treatment Protocol (TP), and Medical Control Guidelines (MCG).
 *
 * Protocol Patterns:
 * - Ref ### - Reference materials (506, 814, 817)
 * - TP #### - Treatment protocols (1210, 1335)
 * - MCG #### - Medical Control Guidelines
 * - ###.# - Sub-protocols (1200.3, 1317.39)
 */

import { chunkProtocol, type ProtocolChunk } from '../../server/_core/protocol-chunker';

// ============================================================================
// LA COUNTY PROTOCOL PATTERNS
// ============================================================================

export const LA_COUNTY_PATTERNS = {
  // Reference number in header: "REFERENCE NO. 506" or "Ref. No. 1345"
  referenceNumber: /(?:REFERENCE|Ref\.?)\s*NO\.?\s*:?\s*(\d+\s*\d*\.?\d*)/i,

  // Treatment Protocol: "TREATMENT PROTOCOL 1210"
  treatmentProtocol: /TREATMENT\s*PROTOCOL\s*:?\s*(\d+\.?\d*)/i,

  // Protocol number with prefix: "TP 1210", "Ref 506", "MCG 1300"
  prefixedProtocol: /\b(TP|Ref|MCG)\s*(\d+\.?\d*)/i,

  // Medical Control Guideline title
  mcgTitle: /Medical\s*Control\s*Guideline\s*:?\s*([A-Z][A-Z\s\-–—\.]+)/i,

  // Effective date extraction
  effectiveDate: /(?:EFFECTIVE|REVISED)\s*DATE\s*:?\s*(\d{2}[-/]\d{2}[-/]\d{2,4})/i,

  // Provider scope: "(PARAMEDIC, MICN, EMT)"
  providerScope: /\(([A-Z,\s]+)\)/,

  // Page number: "PAGE 1 OF 3"
  pageInfo: /PAGE\s*(\d+)\s*OF\s*(\d+)/i,
};

// ============================================================================
// PROTOCOL SECTIONS
// ============================================================================

export const LA_COUNTY_SECTIONS = {
  trauma: ['506', '1243', '1244', '1370'],
  cardiac: ['1208', '1209', '1210', '1211', '1212', '1213'],
  respiratory: ['1220', '1221', '1222', '1223', '1224'],
  neurological: ['1230', '1231', '1232', '1233'],
  obgyn: ['1215', '1216', '1217', '1218', '1219'],
  pediatric: ['1250', '1251', '1252', '1253'],
  toxicology: ['1260', '1261', '1262'],
  environmental: ['1270', '1271', '1272'],
  behavioral: ['1307', '1307.1', '1307.2', '1307.3'],
  reference: ['506', '814', '817', '1200.3'],
  drugs: ['1317', '1317.1', '1317.2', '1317.3'],
};

// ============================================================================
// TYPES
// ============================================================================

export interface ParsedProtocol {
  protocolNumber: string;
  protocolTitle: string;
  section: string;
  content: string;
  effectiveDate: string | null;
  providerScope: string | null;
  sourcePdfUrl: string;
  protocolYear: number;
  pageStart?: number;
  pageEnd?: number;
}

export interface ParseResult {
  protocols: ParsedProtocol[];
  errors: string[];
  stats: {
    totalPages: number;
    protocolsFound: number;
    chunksGenerated: number;
  };
}

// ============================================================================
// PARSING FUNCTIONS
// ============================================================================

/**
 * Extract protocol number from content using LA County patterns
 */
export function extractProtocolNumber(content: string): string | null {
  // Clean spaces in numbers (e.g., "13 17.39" -> "1317.39")
  const cleanContent = content.replace(/(\d+)\s+(\d+)/g, '$1$2');

  // Try reference number first
  const refMatch = cleanContent.match(LA_COUNTY_PATTERNS.referenceNumber);
  if (refMatch) {
    return refMatch[1].replace(/\s+/g, '').trim();
  }

  // Try treatment protocol
  const tpMatch = cleanContent.match(LA_COUNTY_PATTERNS.treatmentProtocol);
  if (tpMatch) {
    return tpMatch[1].trim();
  }

  // Try prefixed protocol
  const prefixMatch = cleanContent.match(LA_COUNTY_PATTERNS.prefixedProtocol);
  if (prefixMatch) {
    return prefixMatch[2].trim();
  }

  return null;
}

/**
 * Extract protocol title from content
 */
export function extractProtocolTitle(content: string, protocolNumber: string): string {
  // Look for MCG title
  const mcgMatch = content.match(LA_COUNTY_PATTERNS.mcgTitle);
  if (mcgMatch) {
    const title = mcgMatch[1]
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/Ref\.?\s*No\.?\s*\d+.*$/i, '')
      .trim();

    if (title.length > 5 && title.length < 100) {
      return `MCG ${protocolNumber} - ${title}`;
    }
  }

  // Look for Treatment Protocol title
  const tpMatch = content.match(/TREATMENT\s*PROTOCOL\s*[:\-–]?\s*([A-Z][A-Z0-9\s\-–—\/]+)/i);
  if (tpMatch) {
    const title = tpMatch[1]
      .trim()
      .replace(/\s+/g, ' ')
      .substring(0, 80);

    if (title.length > 5) {
      return `TP ${protocolNumber} - ${title}`;
    }
  }

  // Check for known section
  const numericPart = protocolNumber.replace(/\D/g, '').substring(0, 2);
  for (const [section, numbers] of Object.entries(LA_COUNTY_SECTIONS)) {
    if (numbers.some(n => protocolNumber === n || protocolNumber.startsWith(n))) {
      return `Ref ${protocolNumber} - ${section.charAt(0).toUpperCase() + section.slice(1)} Protocol`;
    }
  }

  // Default
  return `Ref ${protocolNumber}`;
}

/**
 * Determine section category for a protocol
 */
export function determineSection(protocolNumber: string, content: string): string {
  // Check by protocol number
  for (const [section, numbers] of Object.entries(LA_COUNTY_SECTIONS)) {
    if (numbers.some(n => protocolNumber === n || protocolNumber.startsWith(n))) {
      return section.charAt(0).toUpperCase() + section.slice(1);
    }
  }

  // Infer from content keywords
  const lower = content.toLowerCase();

  if (lower.includes('cardiac') || lower.includes('arrest') || lower.includes('stemi')) {
    return 'Cardiac';
  }
  if (lower.includes('trauma') || lower.includes('injury') || lower.includes('hemorrhage')) {
    return 'Trauma';
  }
  if (lower.includes('airway') || lower.includes('respiratory') || lower.includes('breathing')) {
    return 'Respiratory';
  }
  if (lower.includes('stroke') || lower.includes('seizure') || lower.includes('neurolog')) {
    return 'Neurological';
  }
  if (lower.includes('pediatric') || lower.includes('child') || lower.includes('infant')) {
    return 'Pediatric';
  }
  if (lower.includes('pregnancy') || lower.includes('childbirth') || lower.includes('obstetric')) {
    return 'OB/GYN';
  }
  if (lower.includes('overdose') || lower.includes('poison') || lower.includes('toxic')) {
    return 'Toxicology';
  }
  if (lower.includes('behavioral') || lower.includes('psychiatric') || lower.includes('agitat')) {
    return 'Behavioral';
  }
  if (lower.includes('drug reference') || lower.includes('medication')) {
    return 'Medications';
  }

  return 'General';
}

/**
 * Extract effective date from content
 */
export function extractEffectiveDate(content: string): string | null {
  const match = content.match(LA_COUNTY_PATTERNS.effectiveDate);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * Extract provider scope from content
 */
export function extractProviderScope(content: string): string | null {
  const match = content.match(LA_COUNTY_PATTERNS.providerScope);
  if (match) {
    return match[1].trim();
  }
  return null;
}

/**
 * Parse a single protocol page/block
 */
export function parseProtocolBlock(
  content: string,
  sourcePdfUrl: string,
  defaultYear: number = new Date().getFullYear()
): ParsedProtocol | null {
  // Skip empty or very short content
  if (!content || content.trim().length < 100) {
    return null;
  }

  // Extract protocol number
  const protocolNumber = extractProtocolNumber(content);
  if (!protocolNumber) {
    return null;
  }

  // Extract other metadata
  const protocolTitle = extractProtocolTitle(content, protocolNumber);
  const section = determineSection(protocolNumber, content);
  const effectiveDate = extractEffectiveDate(content);
  const providerScope = extractProviderScope(content);

  // Determine protocol year from effective date
  let protocolYear = defaultYear;
  if (effectiveDate) {
    const yearMatch = effectiveDate.match(/(\d{4})|(\d{2})$/);
    if (yearMatch) {
      const year = yearMatch[1] || `20${yearMatch[2]}`;
      protocolYear = parseInt(year, 10);
    }
  }

  return {
    protocolNumber,
    protocolTitle,
    section,
    content: content.trim(),
    effectiveDate,
    providerScope,
    sourcePdfUrl,
    protocolYear,
  };
}

/**
 * Split PDF text by protocol boundaries
 */
export function splitByProtocolBoundaries(fullText: string): string[] {
  const blocks: string[] = [];

  // Split by page markers or protocol header patterns
  const splitPatterns = [
    /(?=DEPARTMENT\s+OF\s+HEALTH\s+SERVICES)/gi,
    /(?=TREATMENT\s+PROTOCOL\s+\d)/gi,
    /(?=REFERENCE\s+NO\.\s*\d)/gi,
    /(?=Medical\s+Control\s+Guideline:)/gi,
  ];

  let currentText = fullText;

  for (const pattern of splitPatterns) {
    const parts = currentText.split(pattern).filter(p => p.trim().length > 100);
    if (parts.length > 1) {
      return parts;
    }
  }

  // If no split patterns worked, return as single block
  return [fullText];
}

/**
 * Parse full LA County protocol PDF content
 */
export function parseLACountyProtocols(
  pdfText: string,
  sourcePdfUrl: string,
  defaultYear: number = new Date().getFullYear()
): ParseResult {
  const result: ParseResult = {
    protocols: [],
    errors: [],
    stats: {
      totalPages: 0,
      protocolsFound: 0,
      chunksGenerated: 0,
    },
  };

  // Split by protocol boundaries
  const blocks = splitByProtocolBoundaries(pdfText);
  result.stats.totalPages = blocks.length;

  // Parse each block
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    try {
      const parsed = parseProtocolBlock(block, sourcePdfUrl, defaultYear);
      if (parsed) {
        result.protocols.push(parsed);
        result.stats.protocolsFound++;
      }
    } catch (error: any) {
      result.errors.push(`Block ${i}: ${error.message}`);
    }
  }

  return result;
}

/**
 * Generate chunks from parsed protocols
 */
export function generateChunksFromParsed(
  protocols: ParsedProtocol[]
): { protocol: ParsedProtocol; chunks: ProtocolChunk[] }[] {
  const results: { protocol: ParsedProtocol; chunks: ProtocolChunk[] }[] = [];

  for (const protocol of protocols) {
    const chunks = chunkProtocol(
      protocol.content,
      protocol.protocolNumber,
      protocol.protocolTitle
    );

    results.push({ protocol, chunks });
  }

  return results;
}

// ============================================================================
// LA COUNTY SOURCE URLS
// ============================================================================

export const LA_COUNTY_SOURCES = {
  masterPdf: 'https://file.lacounty.gov/SDSInter/dhs/1075386_LACountyTreatmentProtocols.pdf',
  webIndex: 'https://dhs.lacounty.gov/emergency-medical-services-agency/home/resources-ems/prehospital-care-manual/',

  // Individual protocol PDFs (examples)
  protocols: {
    '506': 'https://file.lacounty.gov/SDSInter/dhs/206332_Ref.No.506_TraumaTriage.pdf',
    '814': 'https://file.lacounty.gov/SDSInter/dhs/206340_Ref.No.814_DeterminationOfDeath.pdf',
    '817': 'https://file.lacounty.gov/SDSInter/dhs/206341_Ref.No.817_HERT.pdf',
    '1335': 'https://file.lacounty.gov/SDSInter/dhs/1040611_1335NeedleThoracostomy.pdf',
    '1215': 'https://file.lacounty.gov/SDSInter/dhs/1040599_1215Childbirth.pdf',
    '1242': 'https://file.lacounty.gov/SDSInter/dhs/1040606_1242CrushInjury.pdf',
  },
};
