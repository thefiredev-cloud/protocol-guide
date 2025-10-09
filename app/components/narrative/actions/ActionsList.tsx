"use client";

import { useCallback, useState } from "react";

export function ActionsList({ actions }: { actions: string[] }) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const toggleItem = useCallback((index: number) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  }, []);

  const getPriorityBadge = useCallback((action: string): JSX.Element | null => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes("immediate") || lowerAction.includes("rapidly") || lowerAction.includes("emergency") || lowerAction.includes("critical")) {
      return <span className="priority-badge" aria-label="Critical Action" />;
    }
    if (lowerAction.includes("monitor") || lowerAction.includes("reassess") || lowerAction.includes("every") || lowerAction.includes("continuous")) {
      return <span className="priority-badge" aria-label="Time-Sensitive" />;
    }
    return <span className="priority-badge" aria-label="Routine" />;
  }, []);

  if (!actions.length) return null;

  return (
    <div>
      <h3>Actions</h3>
      <ul className="checklist">
        {actions.map((action, index) => (
          <li
            key={index}
            className={`checklist-item ${checkedItems.has(index) ? "checked" : ""}`}
            onClick={() => toggleItem(index)}
          >
            <div className="checklist-checkbox">
              {checkedItems.has(index) && <span style={{ color: "white", fontSize: "18px" }}>✓</span>}
            </div>
            <div className="checklist-text">
              {getPriorityBadge(action)}
              {action}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


