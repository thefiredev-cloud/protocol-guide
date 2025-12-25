"use client";

import { memo, useMemo } from "react";
import { sanitizeProtocolContent } from "@/lib/security/content-sanitizer";

/**
 * Whitelist of LA County authorized medication names - only these get bold highlighting
 * NOTE: Unauthorized medications (ketamine, etomidate, propofol, etc.) removed
 */
const MEDICATION_NAMES = [
  // Cardiac/Emergency - LA County authorized
  "Epinephrine", "Atropine", "Amiodarone", "Lidocaine", "Adenosine",
  "Calcium Chloride", "Sodium Bicarbonate", "Magnesium Sulfate",
  // Sedation/Analgesia - LA County authorized
  "Fentanyl", "Morphine", "Midazolam", "Versed", "Ketorolac", "Toradol",
  "Acetaminophen", "Tylenol",
  // NOTE: Ketamine, Etomidate, Propofol NOT authorized in LA County
  // Respiratory
  "Albuterol", "Oxygen",
  // Fluids/Other - LA County authorized
  "Normal Saline", "Dextrose", "D10", "D50",
  "Nitroglycerin", "Aspirin", "Ondansetron", "Zofran", "Diphenhydramine",
  "Benadryl", "Glucagon", "Naloxone", "Narcan",
  // Behavioral - LA County authorized
  "Olanzapine",
  // Other LA County authorized
  "Pralidoxime", "Tranexamic Acid",
  // Push-dose
  "Push-dose Epinephrine", "Push-dose Epi",
];

/**
 * Section headers that should be bold
 */
const SECTION_HEADERS = [
  "PROTOCOL",
  "BASE HOSPITAL CONTACT REQUIRED",
  "BASE CONTACT REQUIRED",
  "IMMEDIATE ACTIONS",
  "MEDICATIONS",
  "KEY ASSESSMENTS",
  "TRANSPORT",
  "RED FLAGS",
  "CONTRAINDICATIONS",
  "DOSING",
  "ASSESSMENT",
  "INTERVENTIONS",
  "NOTES",
  "WARNING",
  "CAUTION",
];

/**
 * ProtocolFormatter - Formats protocol text with proper structure:
 * - Bold section headers
 * - Bold medication names (whitelist only)
 * - Bullet points for list items
 * - Clean, scannable layout
 */
export const ProtocolFormatter = memo(function ProtocolFormatter({
  content,
}: {
  content: string;
}) {
  const formattedContent = useMemo(() => {
    return formatProtocolText(content);
  }, [content]);

  return (
    <div className="protocol-response" role="article" aria-label="Protocol information">
      {formattedContent}
    </div>
  );
});

/**
 * Main formatting function - parses protocol text into structured React elements
 */
function formatProtocolText(text: string): React.ReactNode {
  // Clean up the text
  const cleanText = text
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
    .replace(/[\u{2600}-\u{26FF}]/gu, "")
    .replace(/🚨|⚠️|📍|🚑/g, "")
    .trim();

  // Split into lines for processing
  const lines = cleanText.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="protocol-list">
          {currentList.map((item, i) => (
            <li key={i}>{highlightMedications(item)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    // Check if line is a section header (ends with : or is all caps with known header)
    const isHeader = isSectionHeader(trimmed);
    
    // Check if line is a list item (starts with - or •)
    const isListItem = /^[-•]\s+/.test(trimmed);

    if (isHeader) {
      flushList();
      elements.push(
        <div key={`header-${index}`} className="protocol-section-header">
          <strong>{trimmed}</strong>
        </div>
      );
    } else if (isListItem) {
      // Add to current list
      const itemText = trimmed.replace(/^[-•]\s+/, "");
      currentList.push(itemText);
    } else {
      flushList();
      // Regular paragraph
      elements.push(
        <p key={`p-${index}`} className="protocol-paragraph">
          {highlightMedications(trimmed)}
        </p>
      );
    }
  });

  // Flush any remaining list items
  flushList();

  return elements.length > 0 ? <>{elements}</> : <p>{text}</p>;
}

/**
 * Check if a line is a section header
 */
function isSectionHeader(line: string): boolean {
  const upper = line.toUpperCase();
  
  // Check against known headers
  for (const header of SECTION_HEADERS) {
    if (upper.startsWith(header)) {
      return true;
    }
  }
  
  // Check for "WORD:" or "WORD WORD:" pattern at start (like "TRANSPORT:" or "RED FLAGS:")
  if (/^[A-Z][A-Z\s]+:/.test(line)) {
    return true;
  }
  
  // Check for protocol reference like "PROTOCOL: TP 1207"
  if (/^PROTOCOL:/i.test(line)) {
    return true;
  }

  return false;
}

/**
 * Highlights only actual medication names from the whitelist
 */
function highlightMedications(text: string): React.ReactNode {
  const parts: Array<string | JSX.Element> = [];
  let remaining = text;
  let keyCounter = 0;

  // Build regex from medication names (case insensitive, word boundaries)
  const medicationPattern = new RegExp(
    `\\b(${MEDICATION_NAMES.map(m => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
    "gi"
  );

  // Also match protocol codes like "TP 1207" or "Protocol 1207"
  const protocolPattern = /\b(TP\s*\d{4}|Protocol\s+\d{4})\b/gi;

  // Find all medication matches
  let match;
  let lastIndex = 0;
  const matches: Array<{ index: number; text: string; type: "med" | "protocol" }> = [];

  // Find medications
  while ((match = medicationPattern.exec(text)) !== null) {
    matches.push({ index: match.index, text: match[0], type: "med" });
  }

  // Find protocol codes
  while ((match = protocolPattern.exec(text)) !== null) {
    matches.push({ index: match.index, text: match[0], type: "protocol" });
  }

  // Sort by position and remove overlaps
  matches.sort((a, b) => a.index - b.index);
  const filtered: typeof matches = [];
  for (const m of matches) {
    const overlaps = filtered.some(
      (existing) =>
        m.index < existing.index + existing.text.length &&
        m.index + m.text.length > existing.index
    );
    if (!overlaps) {
      filtered.push(m);
    }
  }

  // Build result
  for (const m of filtered) {
    if (m.index > lastIndex) {
      parts.push(text.slice(lastIndex, m.index));
    }
    parts.push(
      <strong key={`highlight-${keyCounter++}`} className={m.type === "med" ? "medication-name" : "protocol-code"}>
        {m.text}
      </strong>
    );
    lastIndex = m.index + m.text.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}
