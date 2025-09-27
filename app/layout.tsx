import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import React from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

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
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0b0b0b" />
      </head>
      <body>
        <header className="siteHeader">
          <div className="siteHeaderInner">
            <div className="brand">
              <div className="brandMark" aria-hidden="true">🚒</div>
              <div className="brandText">
                <div className="brandTitle">LA County Fire</div>
                <div className="brandSubtitle">Medic Bot • Prehospital Care Manual</div>
              </div>
            </div>
            <div className="envBadge">Enterprise</div>
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
      </body>
    </html>
  );
}
