import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    include: ["**/*.test.ts"],
    environment: "node",
    reporters: "default",
    coverage: {
      provider: "v8",
      include: [
        "lib/**/*.ts",
        "app/api/**/*.ts",
      ],
      exclude: [
        "**/*.test.ts",
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

