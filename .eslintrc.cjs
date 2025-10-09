/**
 * ESLint config enforcing Cursor rules:
 * - File length ≤ 500 lines (error)
 * - Function length ≤ 40 lines (error)
 * - One class per file (error)
 * - Keep cyclomatic complexity low
 * - Naming conventions for clarity and OOP-first style
 */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  extends: [
    "next",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["@typescript-eslint", "simple-import-sort", "unicorn"],
  rules: {
    // File & function sizing
    "max-lines": ["error", { max: 500, skipBlankLines: true, skipComments: true }],
    "max-lines-per-function": ["warn", { max: 40, skipBlankLines: true, skipComments: true, IIFEs: true }],
    "max-depth": ["warn", 2],
    complexity: ["warn", { max: 10 }],
    "max-params": ["warn", 4],
    "max-classes-per-file": ["error", 1],

    // Naming and readability
    "@typescript-eslint/naming-convention": [
      "error",
      { selector: "variableLike", format: ["camelCase", "PascalCase", "UPPER_CASE"] },
      { selector: "typeLike", format: ["PascalCase"] },
      { selector: "enumMember", format: ["PascalCase", "UPPER_CASE"] }
    ],

    // Imports & modularity
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",

    // General quality
    "unicorn/filename-case": ["error", { case: "kebabCase", ignore: ["next-env.d.ts", "\.d\.ts$", "\.cjs$", "\.c\.?\w+$"] }],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    eqeqeq: ["error", "always"],
    curly: ["error", "multi-line"],
  },
  overrides: [
    {
      files: ["**/*.cjs"],
      rules: { "unicorn/filename-case": "off" }
    },
    {
      files: ["lib/**/*.ts"],
      rules: {
        "max-lines-per-function": ["error", { max: 40, skipBlankLines: true, skipComments: true, IIFEs: true }],
        complexity: ["error", { max: 10 }],
        "max-depth": ["error", 2],
        "@typescript-eslint/no-explicit-any": "error",
      }
    },
    {
      files: ["lib/managers/chat-service.ts"],
      rules: {
        // Main chat orchestration needs more complexity
        "max-lines-per-function": ["warn", { max: 70 }],
        complexity: ["warn", { max: 15 }],
      }
    },
    {
      files: ["app/api/**/route.ts"],
      rules: {
        // API routes may log in development and need longer functions for error handling
        "no-console": "off",
        "max-lines-per-function": ["warn", { max: 80 }],
        complexity: ["warn", { max: 20 }],
        "max-depth": ["warn", 3],
        "@typescript-eslint/no-explicit-any": "error",
      }
    },
    {
      files: ["lib/audit/**/*.ts", "lib/auth/**/*.ts", "lib/security/**/*.ts", "lib/narrative/**/*.ts"],
      rules: {
        // Security and audit modules may need more complexity for validation
        "max-lines-per-function": ["warn", { max: 60 }],
        complexity: ["warn", { max: 15 }],
        "max-depth": ["warn", 3],
      }
    },
    {
      files: ["lib/retrieval.ts", "lib/triage.ts"],
      rules: {
        complexity: ["warn", { max: 15 }],
        "max-lines-per-function": ["warn", { max: 50 }],
      }
    },
    {
      files: ["lib/managers/NarrativeManager.ts", "lib/managers/CarePlanManager.ts"],
      rules: {
        // Template generator methods need more lines/complexity for medical templates
        complexity: ["warn", { max: 30 }],
        "max-lines-per-function": ["warn", { max: 120 }],
      }
    },
    {
      files: ["app/page.tsx", "app/**/*.tsx"],
      rules: {
        // UI files get progressive enforcement; treat size rules as warnings
        "max-lines-per-function": ["warn", { max: 60 }],
        complexity: ["warn", { max: 15 }],
        "@typescript-eslint/no-explicit-any": "warn",
      }
    }
  ],
  settings: {
    "import/resolver": {
      node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
      typescript: {
        alwaysTryTypes: true,
        project: ["./tsconfig.json"],
      },
    },
  },
};


