"use client";

import { useMemo, useState } from "react";

export type TreeNode =
  | { id: string; type: "question"; text: string; options: Array<{ label: string; to: string }> }
  | { id: string; type: "result"; text: string; actions?: string[] };

export function DecisionTree({ nodes, startId, title }: { nodes: TreeNode[]; startId: string; title: string }) {
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

  return (
    <div className="decisionTree" style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button type="button" onClick={reset} aria-label="Reset decision tree">
          Reset
        </button>
      </div>
      <div className="path" style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
        Path: {path.join(" → ")}
      </div>
      {current.type === "question" ? (
        <div>
          <div style={{ marginBottom: 12 }}>{current.text}</div>
          <div style={{ display: "grid", gap: 8 }}>
            {current.options.map((opt) => (
              <button key={opt.label} type="button" onClick={() => go(opt.to)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 8 }}>{current.text}</div>
          {current.actions?.length ? (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {current.actions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}


