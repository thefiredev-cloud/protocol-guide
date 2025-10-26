import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    include: ["**/*.test.ts", "**/*.test.tsx"],
    environment: "happy-dom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    reporters: "default",
    coverage: {
      provider: "v8",
      include: [
        "lib/**/*.ts",
        "app/api/**/*.ts",
        "app/components/**/*.tsx",
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/node_modules/**",
        "lib/storage/knowledge-base-chunked.ts",
        "lib/storage/knowledge-base-merge.ts",
        "lib/managers/passive-manager.ts",
      ],
      reporter: ["text", "html", "json-summary"],
      all: true,
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
