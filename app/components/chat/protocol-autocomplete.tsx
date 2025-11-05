"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Common LA County EMS protocols for autocomplete
 * Based on the LA County Prehospital Care Manual
 */
const COMMON_PROTOCOLS = [
  { name: "Protocol 1201", description: "Assessment", keywords: ["assessment", "1201"] },
  { name: "Protocol 1202", description: "General Medical", keywords: ["general", "medical", "1202"] },
  { name: "Protocol 1203", description: "Diabetic Emergencies", keywords: ["diabetic", "diabetes", "hypoglycemia", "hyperglycemia", "1203"] },
  { name: "Protocol 1204", description: "Fever/Sepsis", keywords: ["fever", "sepsis", "infection", "1204"] },
  { name: "Protocol 1205", description: "GI/GU Emergencies", keywords: ["gi", "gu", "gastrointestinal", "genitourinary", "1205"] },
  { name: "Protocol 1207", description: "Shock/Hypotension", keywords: ["shock", "hypotension", "low blood pressure", "1207"] },
  { name: "Protocol 1208", description: "Agitated Delirium", keywords: ["agitated", "delirium", "excited", "1208"] },
  { name: "Protocol 1209", description: "Behavioral/Psychiatric Crisis", keywords: ["behavioral", "psychiatric", "mental health", "1209"] },
  { name: "Protocol 1210", description: "Cardiac Arrest", keywords: ["cardiac arrest", "cpr", "code", "1210"] },
  { name: "Protocol 1211", description: "Cardiac Chest Pain", keywords: ["chest pain", "cardiac", "heart", "1211"] },
  { name: "Protocol 1212", description: "Cardiac Dysrhythmia - Bradycardia", keywords: ["bradycardia", "slow heart", "dysrhythmia", "1212"] },
  { name: "Protocol 1213", description: "Cardiac Dysrhythmia - Tachycardia", keywords: ["tachycardia", "fast heart", "dysrhythmia", "1213"] },
  { name: "Protocol 1214", description: "Pulmonary Edema/CHF", keywords: ["pulmonary edema", "chf", "congestive heart failure", "1214"] },
  { name: "Protocol 1219", description: "Allergy", keywords: ["allergy", "anaphylaxis", "allergic reaction", "1219"] },
  { name: "Protocol 1220", description: "Burns", keywords: ["burns", "burn", "thermal", "1220"] },
  { name: "Protocol 1224", description: "Stings/Venomous Bites", keywords: ["sting", "bite", "venomous", "snake", "1224"] },
  { name: "Protocol 1229", description: "ALOC", keywords: ["aloc", "altered level of consciousness", "unconscious", "1229"] },
  { name: "Protocol 1231", description: "Airway Obstruction", keywords: ["airway", "obstruction", "choking", "1231"] },
  { name: "Protocol 1233", description: "Respiratory Distress - Bronchospasm", keywords: ["respiratory", "bronchospasm", "asthma", "copd", "1233"] },
  { name: "Protocol 1237", description: "Respiratory Distress - Other", keywords: ["respiratory", "distress", "breathing", "1237"] },
  { name: "Protocol 1236", description: "Inhalation Injury", keywords: ["inhalation", "smoke", "chemical", "1236"] },
  { name: "MCG 1309", description: "Respiratory Distress (Pediatric)", keywords: ["pediatric", "respiratory", "mcg", "1309"] },
];

export interface ProtocolSuggestion {
  name: string;
  description: string;
  score: number;
}

interface ProtocolAutocompleteProps {
  input: string;
  onSelect: (protocol: string) => void;
  onInputChange?: (value: string) => void;
}

/**
 * Fuzzy search function for protocol matching
 * Scores based on:
 * - Exact match (highest)
 * - Starts with query
 * - Contains query
 * - Keyword matches
 */
function fuzzySearchProtocols(query: string): ProtocolSuggestion[] {
  if (!query.trim()) return [];

  const queryLower = query.toLowerCase().trim();
  const results: ProtocolSuggestion[] = [];

  for (const protocol of COMMON_PROTOCOLS) {
    let score = 0;
    const nameLower = protocol.name.toLowerCase();
    const descLower = protocol.description.toLowerCase();

    // Exact match
    if (nameLower === queryLower) {
      score += 100;
    } else if (nameLower.startsWith(queryLower)) {
      score += 50;
    } else if (nameLower.includes(queryLower)) {
      score += 30;
    }

    // Description match
    if (descLower.includes(queryLower)) {
      score += 20;
    }

    // Keyword matches
    const keywordMatches = protocol.keywords.filter((kw) =>
      kw.toLowerCase().includes(queryLower)
    ).length;
    score += keywordMatches * 10;

    // Protocol number match (e.g., "1210" matches "Protocol 1210")
    const protocolNumberMatch = queryLower.match(/\d{4}/);
    if (protocolNumberMatch) {
      const num = protocolNumberMatch[0];
      if (nameLower.includes(num)) {
        score += 40;
      }
    }

    if (score > 0) {
      results.push({
        name: protocol.name,
        description: protocol.description,
        score,
      });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score).slice(0, 5);
}

/**
 * ProtocolAutocomplete - Provides autocomplete suggestions for LA County protocols
 */
export function ProtocolAutocomplete({
  input,
  onSelect,
  onInputChange,
}: ProtocolAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<ProtocolSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Update suggestions based on input
  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const results = fuzzySearchProtocols(input);
    setSuggestions(results);
    setIsOpen(results.length > 0);
    setSelectedIndex(-1);
  }, [input]);

  const handleSelect = useCallback(
    (protocolName: string) => {
      onSelect(protocolName);
      setIsOpen(false);
      setSuggestions([]);
      if (onInputChange) {
        onInputChange("");
      }
    },
    [onSelect, onInputChange]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          e.stopPropagation();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSelect(suggestions[selectedIndex].name);
          }
          break;
        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, suggestions, selectedIndex, handleSelect]
  );

  // Expose keyboard handler
  useEffect(() => {
    if (isOpen && suggestions.length > 0) {
      const handler = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        // Only handle if focus is on textarea or input
        if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
          handleKeyDown(e as unknown as React.KeyboardEvent);
        }
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }
  }, [isOpen, suggestions.length, handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  if (!isOpen || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="protocol-autocomplete"
      role="listbox"
      aria-label="Protocol suggestions"
      aria-expanded={isOpen}
    >
      <ul
        ref={listRef}
        className="protocol-autocomplete-list"
        role="list"
      >
        {suggestions.map((suggestion, index) => (
          <li
            key={suggestion.name}
            role="option"
            aria-selected={index === selectedIndex}
            className={`protocol-autocomplete-item ${
              index === selectedIndex ? "selected" : ""
            }`}
            onClick={() => handleSelect(suggestion.name)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="protocol-autocomplete-name">{suggestion.name}</div>
            <div className="protocol-autocomplete-description">
              {suggestion.description}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Hook to integrate autocomplete with input
 */
export function useProtocolAutocomplete(
  input: string,
  onSelect: (protocol: string) => void
) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // This will be handled by the ProtocolAutocomplete component
      // but we can extend it here if needed
    },
    []
  );

  return {
    handleKeyDown,
  };
}

