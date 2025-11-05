"use client";

export function SectionCard({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div
      className="protocol-dropdown glass-subtle scroll-animate-fade"
      style={{
        borderRadius: "8px",
        padding: "16px",
        marginTop: "8px",
      }}
    >
      <h4 style={{ margin: "0 0 8px 0", color: "var(--accent)" }}>{title}</h4>
      <ul style={{ margin: 0, paddingLeft: "20px" }}>
        {items.map((line, idx) => (
          <li key={idx} style={{ marginBottom: "4px", fontSize: "14px" }}>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}


