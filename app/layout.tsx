import "./globals.css";
import "./styles/modern-ui.css";

import type { Metadata, Viewport } from "next";
import React from "react";

import { ErrorBoundary } from "./components/layout/error-boundary";
import { RootLayoutContent } from "./components/layout/root-layout-content";
import { ToastProvider } from "./components/layout/toast-notification";
import { WebVitals } from "./components/layout/web-vitals";

// Using system font stack for offline build compatibility
const fontClass = "";

export const metadata: Metadata = {
  metadataBase: new URL("https://fanciful-pithivier-308482.netlify.app"),
  title: {
    default: "LA County Fire Medic Bot",
    template: "%s • LA County Fire Medic Bot",
  },
  description:
    "Enterprise-grade EMS protocol assistant powered by Next.js and the Los Angeles County Prehospital Care Manual.",
  openGraph: {
    type: "website",
    title: "LA County Fire Medic Bot",
    description:
      "Reference the LA County Prehospital Care Manual anywhere. Built on Next.js with MCP-powered retrieval.",
    url: "https://fanciful-pithivier-308482.netlify.app",
    siteName: "LA County Fire Medic Bot",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LA County Fire Medic Bot interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LA County Fire Medic Bot",
    description: "Next.js-powered medic assistant for LA County protocols.",
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
          <ToastProvider>
            <WebVitals />
            <RootLayoutContent>{children}</RootLayoutContent>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
