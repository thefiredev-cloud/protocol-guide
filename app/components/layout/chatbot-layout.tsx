'use client';

interface ChatbotLayoutProps {
  children: React.ReactNode;
}

/**
 * Minimal chatbot widget layout
 * Designed to run inside ImageTrend - no sidebar, toolbar, or navigation needed
 */
export function ChatbotLayout({ children }: ChatbotLayoutProps) {
  return (
    <div className="chatbot-layout">
      <header className="chatbot-header">
        <div className="chatbot-header-content">
          <h1 className="chatbot-title">Medic-Bot</h1>
          <span className="chatbot-subtitle">LA County Protocol Assistant</span>
        </div>
      </header>
      <main className="chatbot-main">
        {children}
      </main>
    </div>
  );
}
