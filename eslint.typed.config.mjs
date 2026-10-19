// Type-aware lint tier, kept out of eslint.config.mjs because it builds a full
// TypeScript program. Greenfield project, so the two async-safety rules start as
// errors: asset loading and WebAudio unlocks are promise-based and a dropped promise
// fails silently on a phone.
import defaultConfig from "./eslint.config.mjs";

export default [
  ...defaultConfig,
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
    },
  },
];
