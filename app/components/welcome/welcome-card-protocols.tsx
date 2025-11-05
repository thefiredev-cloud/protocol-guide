export function WelcomeCardProtocols({ items }: { items: string[] }) {
  return (
    <div className="welcome-protocols-container">
      {items.map((item) => (
        <span
          key={item}
          className="welcome-protocol-badge"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

