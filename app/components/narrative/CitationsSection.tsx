"use client";

import type { Citation } from "@/app/types/chat";

export function CitationsSection({ citations }: { citations: Citation[] }) {
  if (!citations.length) return null;
  return (
    <div style={{ marginBottom: "16px" }}>
      <h3>Source Citations</h3>
      <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px" }}>
        {citations.map((citation, index) => (
          <li key={`${citation.title}-${index}`}>
            {citation.title} ({citation.category} – {citation.subcategory || "LA County EMS"})
          </li>
        ))}
      </ul>
    </div>
  );
}


