"use client";

import { useMemo, useState } from "react";

export type TreeNode =
  | { id: string; type: "question"; text: string; options: Array<{ label: string; to: string }> }
  | { 
      id: string; 
      type: "result"; 
      text: string; 
      actions?: string[];
      criteria?: string[];
      urgency?: "Code 1" | "Code 2" | "Code 3";
      baseContact?: string;
    };

interface DecisionTreeProps {
  nodes: TreeNode[];
  startId: string;
  title: string;
  showCriteria?: boolean;
}

export function DecisionTree({ nodes, startId, title, showCriteria = true }: DecisionTreeProps) {
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const [currentId, setCurrentId] = useState<string>(startId);
  const [path, setPath] = useState<string[]>([startId]);

  const current = byId.get(currentId);
  if (!current) return null;

  function go(to: string) {
    setCurrentId(to);
    setPath((p) => [...p, to]);
  }

  function reset() {
    setCurrentId(startId);
    setPath([startId]);
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "Code 3":
        return "var(--error)"; // Red
      case "Code 2":
        return "var(--warning)"; // Amber
      case "Code 1":
        return "var(--success)"; // Green
      default:
        return "var(--text-primary)";
    }
  };

  const getUrgencyBackground = (urgency?: string) => {
    switch (urgency) {
      case "Code 3":
        return "rgba(220, 38, 38, 0.1)"; // Light red
      case "Code 2":
        return "rgba(217, 119, 6, 0.1)"; // Light amber
      case "Code 1":
        return "rgba(34, 197, 94, 0.1)"; // Light green
      default:
        return "transparent";
    }
  };

  return (
    <div
      className="decisionTree glass-elevated scroll-animate-fade"
      style={{
        borderRadius: 16,
        padding: 24,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: "28px", fontWeight: 800 }}>{title}</h3>
        <button 
          type="button" 
          onClick={reset} 
          aria-label="Reset decision tree" 
          style={{ minHeight: "52px", padding: "0 24px", fontSize: "17px", fontWeight: 700 }}
        >
          Reset
        </button>
      </div>

      {/* Path Breadcrumb */}
      <div style={{ fontSize: 15, color: "var(--muted)", marginBottom: 24, fontWeight: 600 }}>
        Path: {path.join(" → ")}
      </div>

      {/* Question Node */}
      {current.type === "question" ? (
        <div>
          <div style={{ marginBottom: 24, fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4 }}>
            {current.text}
          </div>
          <div style={{ display: "grid", gap: 24 }}>
            {current.options.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => go(opt.to)}
                className="btn-press hover-glow"
                style={{
                  minHeight: "68px",
                  fontSize: "22px",
                  fontWeight: 800,
                  borderRadius: "14px",
                  letterSpacing: "0.5px",
                  padding: "12px 20px",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Result Header with Urgency */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ 
              fontSize: "20px", 
              fontWeight: 700, 
              color: "var(--accent)",
              marginBottom: 8,
            }}>
              {current.text}
            </div>
            {current.urgency && (
              <div 
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  background: getUrgencyBackground(current.urgency),
                  border: `2px solid ${getUrgencyColor(current.urgency)}`,
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: getUrgencyColor(current.urgency),
                  marginBottom: 12,
                }}
              >
                {current.urgency}
              </div>
            )}
          </div>

          {/* Criteria Display */}
          {showCriteria && current.criteria && current.criteria.length > 0 && (
            <div style={{ 
              marginBottom: 24, 
              padding: 16, 
              background: "rgba(59, 130, 246, 0.05)",
              borderLeft: "4px solid #3b82f6",
              borderRadius: 8,
            }}>
              <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: 12, color: "var(--text-primary)" }}>
                Criteria Met:
              </div>
              <ul style={{ margin: 0, paddingLeft: 24, fontSize: "15px", lineHeight: 1.7 }}>
                {current.criteria.map((c, i) => (
                  <li key={i} style={{ marginBottom: "8px", color: "var(--text-primary)" }}>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Base Contact */}
          {current.baseContact && (
            <div style={{
              marginBottom: 20,
              padding: 12,
              background: "var(--surface)",
              borderRadius: 8,
              fontSize: "16px",
              fontWeight: 600,
            }}>
              <span style={{ color: "var(--muted)" }}>Base Hospital Contact: </span>
              <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                {current.baseContact}
              </span>
            </div>
          )}

          {/* Actions/Recommendations */}
          {current.actions?.length ? (
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: 12, color: "var(--text-primary)" }}>
                Actions:
              </div>
              <ul style={{ margin: 0, paddingLeft: 28, fontSize: "17px", lineHeight: 1.7 }}>
                {current.actions.map((a, i) => (
                  <li key={i} style={{ marginBottom: "10px", color: "var(--text-primary)" }}>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}


