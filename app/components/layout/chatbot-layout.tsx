'use client';

import { usePathname } from 'next/navigation';

interface ChatbotLayoutProps {
  children: React.ReactNode;
}

/**
 * Minimal chatbot widget layout
 * Designed to run inside ImageTrend - no sidebar, toolbar, or navigation needed
 */
export function ChatbotLayout({ children }: ChatbotLayoutProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <div className="chatbot-layout">
      <main className={`chatbot-main ${!isLoginPage ? 'pb-20' : ''}`}>
        {children}
      </main>
    </div>
  );
}
