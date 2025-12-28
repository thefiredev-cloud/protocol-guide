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

      animation: {
        "bounce-subtle": "bounce 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
