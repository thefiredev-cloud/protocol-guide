import "./globals.css";

import { Ambulance } from "lucide-react";
import type { Metadata, Viewport } from "next";
import React from "react";

import { MobileNavBar } from "./components/layout/mobile-nav-bar";
import { OfflineIndicator } from "./components/layout/offline-indicator";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
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
        <meta name="theme-color" content="#0b0b0b" />
      </head>
      <body>
        <OfflineIndicator />
        <header className="siteHeader">
          <div className="siteHeaderInner">
            <div className="brand">
              <div className="brandMark" aria-hidden="true">
                <Ambulance size={28} strokeWidth={2.5} />
              </div>
              <div className="brandText">
                <div className="brandTitle">LA County Fire</div>
                <div className="brandSubtitle">Medic Bot • Prehospital Care Manual</div>
              </div>
            </div>
            <div className="envBadge">Enterprise</div>
            <nav className="headerNav">
              <a href="/protocols">Protocols</a>
              <a href="/dosing">Dosing</a>
            </nav>
          </div>
        </header>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function(){
                    navigator.serviceWorker.register('/sw.js').catch(function(){ /* noop */ });
                  });
                }
              })();
            `,
          }}
        />
        {children}
        <MobileNavBar />
      </body>
    </html>
  );
}
