"use client";

import { memo, useEffect, useMemo, useRef } from "react";

/**
 * ProtocolFormatter - Formats protocol text with priority indicators,
 * medication highlighting, and visual structure for emergency medical use
 */
export const ProtocolFormatter = memo(function ProtocolFormatter({
  content,
}: {
  content: string;
}) {
  const formattedContent = useMemo(() => {
    return formatProtocolText(content);
  }, [content]);

  const announcementRef = useRef<HTMLDivElement>(null);
  const previousContentRef = useRef<string>("");

  // Screen reader announcements for critical information
  useEffect(() => {
    if (!announcementRef.current || content === previousContentRef.current) return;
    
    const hasPriority = /\b(P[123]|Priority\s*[123])\b/i.test(content);
    const hasMedications = /\b([A-Z][a-z]+(?:\s+\d+\.?\d*\s*(?:mg|mcg|g|mL|units?|puffs?|tablets?))?)\b/.test(content);
    const hasCriticalInfo = /\b(critical|urgent|emergency|immediate|base\s+contact|base\s+hospital)\b/i.test(content);

    if (hasPriority || hasMedications || hasCriticalInfo) {
      const announcement = [];
      if (hasPriority) {
        const priorityMatch = content.match(/\b(P[123]|Priority\s*[123])\b/i);
        if (priorityMatch) {
          announcement.push(`Priority ${priorityMatch[1].toUpperCase().replace('P', '')} protocol information`);
        }
      }
      if (hasMedications) {
        announcement.push("Medication dosing information included");
      }
      if (hasCriticalInfo) {
        announcement.push("Critical information present");
      }

      announcementRef.current.textContent = announcement.join(". ");
      announcementRef.current.setAttribute("aria-live", "polite");
      announcementRef.current.setAttribute("aria-atomic", "true");
    }

    previousContentRef.current = content;
  }, [content]);

  return (
    <>
      <div 
        ref={announcementRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
      <div 
        className="protocol-response"
        role="article"
        aria-label="Protocol information"
      >
        {formattedContent}
      </div>
    </>
  );
});

/**
 * Formats protocol text by:
 * - Detecting numbered sections (1., 2., 3., etc.)
 * - Extracting protocol headers
 * - Detecting priority indicators (P1, P2, P3)
 * - Highlighting medication names and dosages
 * - Adding visual structure with proper hierarchy
 */
function formatProtocolText(text: string): React.ReactNode {
  // Split text into paragraphs/sections
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
  
  if (paragraphs.length === 0) {
    return <div>{text}</div>;
  }

  const elements: React.ReactNode[] = [];
  let protocolNumber: string | null = null;
  let protocolName: string | null = null;
  let protocolUrgency: string | null = null;

  paragraphs.forEach((paragraph, index) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return;

    // Detect numbered sections (e.g., "1. **SECTION NAME**" or "2. **Protocol: 1207...")
    const numberedSectionMatch = trimmed.match(/^(\d+)\.\s+\*\*(.+?)\*\*/);
    const isNumberedSection = numberedSectionMatch !== null;
    
    // Extract protocol header (e.g., "2. **Protocol: 1207 - Shock/Hypotension** (Critical)")
    const protocolHeaderMatch = trimmed.match(/^(\d+)\.\s+\*\*Protocol:\s*(\d+)\s*-\s*(.+?)\*\*\s*\((.+?)\)/i);
    if (protocolHeaderMatch) {
      protocolNumber = protocolHeaderMatch[2];
      protocolName = protocolHeaderMatch[3];
      protocolUrgency = protocolHeaderMatch[4];
      
      // Render protocol header with badge
      elements.push(
        <div key={`protocol-header-${index}`} className="protocol-header-section">
          <div className="protocol-badge-container">
            <span className={`protocol-badge protocol-badge-${protocolUrgency.toLowerCase()}`}>
              Protocol {protocolNumber}
            </span>
            <span className={`protocol-urgency-badge urgency-${protocolUrgency.toLowerCase()}`}>
              {protocolUrgency}
            </span>
          </div>
          <h2 className="protocol-title">{protocolName}</h2>
        </div>,
      );
      return;
    }

    // Detect priority indicators (P1, P2, P3)
    const priorityMatch = trimmed.match(/\b(P[123]|Priority\s*[123])\b/i);
    const priority: "P1" | "P2" | "P3" | null = priorityMatch
      ? priorityMatch[1].toUpperCase().includes("P1")
        ? "P1"
        : priorityMatch[1].toUpperCase().includes("P2")
          ? "P2"
          : "P3"
      : null;

    const formatted = highlightMedications(trimmed);

    // Numbered section headers (but not protocol header)
    if (isNumberedSection && !protocolHeaderMatch) {
      const sectionNumber = numberedSectionMatch[1];
      const sectionTitle = numberedSectionMatch[2].replace(/\*\*/g, '').trim();
      const restOfContent = trimmed.substring(numberedSectionMatch[0].length).trim();
      
      elements.push(
        <div key={`numbered-section-${index}`} className="numbered-protocol-section">
          <h3 className="protocol-section-header">
            <span className="section-number">{sectionNumber}.</span>
            {sectionTitle}
          </h3>
          {restOfContent && (
            <div className="protocol-section-content">
              {highlightMedications(restOfContent)}
            </div>
          )}
        </div>,
      );
      return;
    }

    // Priority-highlighted sections
    if (priority) {
      const priorityLevel = priority === "P1" ? "Critical" : priority === "P2" ? "High" : "Medium";
      elements.push(
        <div 
          key={`priority-${priority}-${index}`} 
          className={`protocol-priority-${priority.toLowerCase()}`}
          role="alert"
          aria-label={`Priority ${priority} - ${priorityLevel} priority protocol section`}
        >
          <span className="sr-only">Priority {priority}: {priorityLevel} priority</span>
          {formatted}
        </div>,
      );
    } else {
      // Regular protocol sections
      elements.push(
        <section 
          key={`section-${index}`} 
          className="protocol-section"
          aria-label={`Protocol section ${index + 1}`}
        >
          {formatted}
        </section>,
      );
    }
  });

  return elements.length > 0 ? <>{elements}</> : <div>{text}</div>;
}

/**
 * Highlights medication names and dosages in text
 */
function highlightMedications(text: string): React.ReactNode {
  // First, strip markdown formatting and emojis for clean display
  const cleanText = text
    // Remove bold/italic markdown
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')  // ***text*** -> text
    .replace(/\*\*(.+?)\*\*/g, '$1')      // **text** -> text
    .replace(/\*(.+?)\*/g, '$1')          // *text* -> text
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')          // ### Header -> Header
    // Remove emojis
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/🚨|⚠️|📍|🚑/g, '')            // Specific emojis from prompt
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();

  // Critical medications requiring red emphasis
  const CRITICAL_MEDICATIONS = [
    'epinephrine', 'norepinephrine', 'dopamine', 'dobutamine',
    'rocuronium', 'vecuronium', 'succinylcholine', 'ketamine',
    'etomidate', 'propofol', 'midazolam', 'fentanyl', 'morphine',
    'atropine', 'calcium', 'amiodarone', 'lidocaine'
  ];

  // Simple approach: look for medication patterns and replace them
  const patterns: Array<{ regex: RegExp; className: string }> = [
    // Critical drug doses (epinephrine 0.5mg, etc.) - Gets red emphasis
    {
      regex: new RegExp(`\\b(${CRITICAL_MEDICATIONS.join('|')})\\s+(\\d+\\.?\\d*\\s*(?:mg|mcg|g|units?))\\b`, 'gi'),
      className: "dosing-value-critical",
    },
    // Medication doses (mg, mcg, g, units) - Normal emphasis
    {
      regex: /\b(\d+\.?\d*\s*(?:mg|mcg|g|units?))\b/gi,
      className: "dosing-value",
    },
    // Contextual measurements (mL, L/min, puffs) - De-emphasized
    {
      regex: /\b(\d+\.?\d*\s*(?:mL|L(?:\/min)?|puffs?|tablets?))\b/gi,
      className: "measurement-value",
    },
    // Medication names with dosages: "Epinephrine 0.5mg", "Albuterol 5mg"
    {
      regex: /\b([A-Z][a-z]+(?:\s+\d+\.?\d*\s*(?:mg|mcg|g|mL|units?|puffs?|tablets?))?)\b/g,
      className: "medication-highlight",
    },
    // Protocol numbers: "Protocol 1231"
    {
      regex: /\b(Protocol\s+\d+)\b/gi,
      className: "medication-highlight",
    },
  ];

  const parts: Array<string | JSX.Element> = [];
  let lastIndex = 0;
  let keyCounter = 0;

  // Collect all matches
  const allMatches: Array<{ index: number; length: number; text: string; className: string }> = [];

  patterns.forEach(({ regex, className }) => {
    let match;
    const regexCopy = new RegExp(regex.source, regex.flags);
    while ((match = regexCopy.exec(cleanText)) !== null) {
      allMatches.push({
        index: match.index,
        length: match[0].length,
        text: match[0],
        className,
      });
    }
  });

  // Sort by index and remove overlaps (keep first match)
  allMatches.sort((a, b) => a.index - b.index);
  const filteredMatches: typeof allMatches = [];

  for (const match of allMatches) {
    const overlaps = filteredMatches.some(
      (existing) =>
        match.index < existing.index + existing.length &&
        match.index + match.length > existing.index,
    );
    if (!overlaps) {
      filteredMatches.push(match);
    }
  }

  // Build result
  filteredMatches.forEach((match) => {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(cleanText.slice(lastIndex, match.index));
    }

    // Add highlighted match
    const isMedication = match.className === "medication-highlight";
    const isDosing = match.className === "dosing-value";
    const ariaLabel = isMedication
      ? `Medication: ${match.text}`
      : isDosing
        ? `Dosage: ${match.text}`
        : undefined;

    parts.push(
      <span
        key={`med-${keyCounter++}`}
        className={match.className}
        aria-label={ariaLabel}
        role={isMedication ? "text" : undefined}
      >
        {match.text}
      </span>,
    );

    lastIndex = match.index + match.length;
  });

  // Add remaining text
  if (lastIndex < cleanText.length) {
    parts.push(cleanText.slice(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : cleanText;
}
