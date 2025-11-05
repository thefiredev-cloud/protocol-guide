type WelcomeCardHeaderProps = {
  title: string;
  description: string;
};

export function WelcomeCardHeader({ title, description }: WelcomeCardHeaderProps) {
  return (
    <header style={{ marginBottom: "12px" }}>
      <h2 style={{ margin: 0, fontSize: "18px" }}>{title}</h2>
      <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>{description}</p>
    </header>
  );
}

