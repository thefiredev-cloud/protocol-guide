"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";

export function MedicationSection({ medications }: { medications: string[] }) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleItem = useCallback((index: number) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  }, []);

  const toggleSection = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  if (!medications.length) return null;

  return (
    <div className={`collapsible-section ${isExpanded ? "expanded" : ""}`}>
      <div className="collapsible-header" onClick={toggleSection}>
        <h3>Medications ({checkedItems.size}/{medications.length} completed)</h3>
        <div className="collapsible-icon">
          <ChevronDown size={20} strokeWidth={2} />
        </div>
      </div>
      <div className="collapsible-content">
        <ul className="checklist">
          {medications.map((medication, index) => (
            <li
              key={index}
              className={`checklist-item ${checkedItems.has(index) ? "checked" : ""}`}
              onClick={() => toggleItem(index)}
            >
              <div className="checklist-checkbox">
                {checkedItems.has(index) && <span style={{ color: "white", fontSize: "18px" }}>✓</span>}
              </div>
              <div className="checklist-text">{medication}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


