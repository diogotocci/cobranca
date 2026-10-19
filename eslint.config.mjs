// Fast lint tier: no type information, so it stays quick enough to run on every change.
// Rules that need the type checker live in eslint.typed.config.mjs (`pnpm lint:typed`).
//
// Two severities only: "error" for what is always a bug, unsafe or an architecture
// violation; "warn" for refactoring pressure (size and complexity budgets), which never
// fails CI. Formatting (quotes, semicolons, wrapping, eqeqeq-style choices) belongs to
// Prettier and is deliberately absent here.
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

const testFiles = [
  "tests/**/*.{js,ts,mjs}",
  "e2e/**/*.{js,ts,mjs}",
  "**/*.{test,spec}.{js,ts,mjs}",
];

// The simulation (ball physics, keeper AI, score, round state) and the tuning numbers
// must stay runnable and testable without a browser or a renderer. The scene graph is a
// view layer over that state, never the other way round.
const pureModules = ["src/sim/**/*.ts", "src/config/**/*.ts"];

const browserOnlyGlobals = [
  "window",
  "document",
  "navigator",
  "localStorage",
  "sessionStorage",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "performance",
  "AudioContext",
  "HTMLElement",
  "HTMLCanvasElement",
  "PointerEvent",
  "TouchEvent",
].map((name) => ({
  name,
  message: "src/sim and src/config are pure: pass the value in from the app or input layer.",
}));

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.strict,

  {
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
      globals: { ...globals.browser },
    },
  },

  // Error tier, every file.
  {
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      // Empty catch blocks are allowed for expected, harmless failures (blocked storage,
      // missing vibration or fullscreen API, autoplay restrictions); say why in a comment.
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-duplicate-imports": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector:
            ":matches(FunctionDeclaration, ArrowFunctionExpression, FunctionExpression) TSInterfaceDeclaration",
          message: "Declare interfaces at module scope or in a shared types module.",
        },
      ],
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Pragmatic escape hatch, allowed on purpose.
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  // Production source: no console (debug output goes to the `?debug` overlay), a hard
  // file-size ceiling, and a warn-only size and complexity budget.
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-console": "error",
      // A function that grew too complex is a nudge; a file that grew too large is a stop.
      "max-lines": ["error", { max: 350 }],
      complexity: ["warn", 12],
      "max-depth": ["warn", 4],
      "max-statements": ["warn", 20],
      "max-params": ["warn", 4],
      "max-lines-per-function": ["warn", { max: 150, skipBlankLines: true, skipComments: true }],
      "max-nested-callbacks": ["warn", 3],
    },
  },

  {
    files: pureModules,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["three", "three/*"],
              message: "src/sim and src/config are pure TypeScript: no Three.js.",
            },
            {
              group: ["**/render/**", "**/ui/**", "**/audio/**", "**/input/**"],
              message: "src/sim and src/config must not depend on view, audio or input layers.",
            },
          ],
        },
      ],
      "no-restricted-globals": ["error", ...browserOnlyGlobals],
    },
  },

  // Tests: console allowed, size budget relaxed. A giant test file still gets flagged,
  // as a warning. max-params stays on: a five-parameter helper is still a smell.
  {
    files: testFiles,
    languageOptions: { globals: { ...globals.node } },
    rules: {
      "max-lines": ["warn", { max: 350 }],
      "max-statements": "off",
      "max-lines-per-function": "off",
      "max-nested-callbacks": "off",
      "max-params": ["warn", 4],
    },
  },

  // Node-side tooling: configs and scripts.
  {
    files: ["*.config.{js,mjs,ts}", "eslint.typed.config.mjs", "scripts/**/*.{js,mjs,ts}"],
    languageOptions: { globals: { ...globals.node } },
  },

  globalIgnores([
    "node_modules/**",
    // Build and test output.
    "dist/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    // Vendored agent skills and harness files: third-party content, not this game's code.
    ".agents/**",
    ".claude/**",
    // Generated knowledge graph.
    "graphify-out/**",
    // Standalone brainstorming prototype kept as visual reference, not shipped.
    "docs/reference/**",
  ]),
]);
