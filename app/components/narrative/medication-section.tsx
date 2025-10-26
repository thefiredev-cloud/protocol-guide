"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";

export function MedicationSection({ medications }: { medications: string[] }) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleItem = useCallback((medication: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(medication)) newSet.delete(medication);
      else newSet.add(medication);
      return newSet;
    });
  }, []);

  const toggleSection = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleHeaderKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSection();
    }
  }, [toggleSection]);

  const handleItemKeyDown = useCallback((medication: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleItem(medication);
    }
  }, [toggleItem]);

  if (!medications?.length) return null;

  const contentId = "medications-content";

  return (
    <div className={`collapsible-section ${isExpanded ? "expanded" : ""}`}>
      <button
        type="button"
        className="collapsible-header"
        onClick={toggleSection}
        onKeyDown={handleHeaderKeyDown}
        aria-expanded={isExpanded}
        aria-controls={contentId}
      >
        <h3>Medications ({checkedItems.size}/{medications.length} completed)</h3>
        <div className="collapsible-icon">
          <ChevronDown size={20} strokeWidth={2} />
        </div>
      </button>
      <div id={contentId} className="collapsible-content">
        <ul className="checklist">
          {medications.map((medication) => (
            <li
              key={medication}
              className={`checklist-item ${checkedItems.has(medication) ? "checked" : ""}`}
              onClick={() => toggleItem(medication)}
              onKeyDown={(e) => handleItemKeyDown(medication, e)}
              role="checkbox"
              aria-checked={checkedItems.has(medication)}
              tabIndex={0}
            >
              <div className="checklist-checkbox">
                {checkedItems.has(medication) && <span style={{ color: "white", fontSize: "18px" }}>✓</span>}
              </div>
              <div className="checklist-text">{medication}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
