import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color (LA County Fire Red)
        primary: {
          DEFAULT: "#dc2626",
          dark: "#b91c1c",
          light: "#ef4444",
        },

        // Background colors
        "background-light": "#f9fafb",
        "background-dark": "#111827",

        // Card/Surface colors
        "card-light": "#ffffff",
        "card-dark": "#1f2937",
        "surface-light": "#ffffff",
        "surface-dark": "#1e293b",
        "surface-input-light": "#f1f5f9",
        "surface-input-dark": "#334155",

        // Text colors
        "text-light": "#111827",
        "text-primary-light": "#0f172a",
        "text-primary-dark": "#f8fafc",
        "text-secondary-light": "#64748b",
        "text-secondary-dark": "#94a3b8",
        "text-subtle": "#6b7280",

        // Border colors
        "border-light": "#e5e7eb",
        "border-dark": "#334155",

        // Status colors (medical grade)
        success: "#30d158",
        warning: "#ffd60a",
        error: "#ff453a",
        info: "#64d2ff",
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      boxShadow: {
        soft: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        glow: "0 10px 15px -3px rgba(220, 38, 38, 0.1), 0 4px 6px -2px rgba(220, 38, 38, 0.05)",
        "glow-lg":
          "0 10px 15px -3px rgba(220, 38, 38, 0.2), 0 4px 6px -2px rgba(220, 38, 38, 0.1)",
      },

      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },

      padding: {
        safe: "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
      },

      // iPad-specific spacing
      spacing: {
        "touch": "56px", // Minimum touch target for gloved/field use
        "touch-sm": "44px", // Standard touch target
      },

      // iPad-specific min dimensions
      minHeight: {
        "touch": "56px",
        "touch-sm": "44px",
      },
      minWidth: {
        "touch": "56px",
        "touch-sm": "44px",
      },

      animation: {
        "bounce-subtle": "bounce 1s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "recording": "recording 1.5s ease-in-out infinite",
      },

      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(220, 38, 38, 0.4), 0 0 40px rgba(220, 38, 38, 0.2)"
          },
          "50%": {
            boxShadow: "0 0 30px rgba(220, 38, 38, 0.6), 0 0 60px rgba(220, 38, 38, 0.3)"
          },
        },
        "recording": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.1)", opacity: "0.8" },
        },
      },

      // Category colors for protocol library
      colors: {
        "category-cardiac": "#ef4444",
        "category-trauma": "#f97316",
        "category-peds": "#a855f7",
        "category-medical": "#3b82f6",
        "category-pharma": "#10b981",
        "category-procedures": "#6366f1",
        "category-admin": "#64748b",
      },
    },
  },

  // iPad-specific screens
  screens: {
    "ipad-mini": { min: "744px", max: "820px" },
    "ipad-air": { min: "820px", max: "1024px" },
    "ipad-pro": { min: "1024px", max: "1366px" },
  },

  plugins: [],
};

export default config;
