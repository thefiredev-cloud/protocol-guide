import "./globals.css";
import "./styles/modern-ui.css";
import "./chatbot-widget.css";

import type { Metadata, Viewport } from "next";
import React from "react";

import { ErrorBoundary } from "./components/layout/error-boundary";
import { RootLayoutContent } from "./components/layout/root-layout-content";
import { ToastProvider } from "./components/layout/toast-notification";
import { WebVitals } from "./components/layout/web-vitals";
import { AuthProvider } from "./contexts/authentication-context";

// Using system font stack for offline build compatibility
const fontClass = "";

export const metadata: Metadata = {
  metadataBase: new URL("https://protocolguide.com"),
  title: {
    default: "ProtocolGuide",
    template: "%s • ProtocolGuide",
  },
  description:
    "AI-powered EMS protocol assistant for the Los Angeles County Prehospital Care Manual.",
  openGraph: {
    type: "website",
    title: "ProtocolGuide",
    description:
      "Reference the LA County Prehospital Care Manual anywhere. AI-powered protocol retrieval.",
    url: "https://protocolguide.com",
    siteName: "ProtocolGuide",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ProtocolGuide interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProtocolGuide",
    description: "AI-powered EMS protocol assistant for LA County protocols.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff", // Force light mode theme color
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontClass}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider>
              <WebVitals />
              <RootLayoutContent>{children}</RootLayoutContent>
            </ToastProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
