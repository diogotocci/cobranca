import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const eslint = new ESLint({ cwd: process.cwd() });

async function ruleIdsFor(code: string, filePath: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? []).map((message) => message.ruleId ?? "fatal");
}

async function errorRuleIdsFor(code: string, filePath: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath });
  return (result?.messages ?? [])
    .filter((message) => message.severity === 2)
    .map((message) => message.ruleId ?? "fatal");
}

function manyLines(count: number): string {
  return (
    Array.from({ length: count }, (_, i) => `export const value${i} = ${i};`).join("\n") + "\n"
  );
}

describe("simulation boundary", () => {
  it("rejects a Three.js import inside src/sim", async () => {
    const ids = await errorRuleIdsFor(
      'import { Vector3 } from "three";\nexport const origin = new Vector3();\n',
      "src/sim/ball.ts",
    );
    expect(ids).toContain("no-restricted-imports");
  });

  it("rejects browser globals inside src/sim", async () => {
    const ids = await errorRuleIdsFor(
      "export const width = window.innerWidth;\n",
      "src/sim/pitch.ts",
    );
    expect(ids).toContain("no-restricted-globals");
  });

  it("rejects a Three.js import inside src/config", async () => {
    const ids = await errorRuleIdsFor(
      'import { Color } from "three";\nexport const grass = new Color();\n',
      "src/config/balance.ts",
    );
    expect(ids).toContain("no-restricted-imports");
  });

  it("allows Three.js in the render layer", async () => {
    const ids = await errorRuleIdsFor(
      'import { Vector3 } from "three";\nexport const origin = new Vector3();\n',
      "src/render/scene.ts",
    );
    expect(ids).not.toContain("no-restricted-imports");
  });
});

describe("console usage", () => {
  it("rejects console calls in production source", async () => {
    const ids = await errorRuleIdsFor(
      'export function shoot(): void {\n  console.log("kick");\n}\n',
      "src/sim/kick.ts",
    );
    expect(ids).toContain("no-console");
  });

  it("allows console calls in tests", async () => {
    const ids = await ruleIdsFor('console.log("debug");\n', "tests/sim/kick.test.ts");
    expect(ids).not.toContain("no-console");
  });
});

describe("file size budget", () => {
  it("fails a production file above 350 lines", async () => {
    const ids = await errorRuleIdsFor(manyLines(351), "src/sim/huge.ts");
    expect(ids).toContain("max-lines");
  });

  it("only warns for a test file above 350 lines", async () => {
    const all = await ruleIdsFor(manyLines(351), "tests/sim/huge.test.ts");
    const errors = await errorRuleIdsFor(manyLines(351), "tests/sim/huge.test.ts");
    expect(all).toContain("max-lines");
    expect(errors).not.toContain("max-lines");
  });
});

describe("function complexity budget", () => {
  it("warns, without failing, on a function with too many parameters", async () => {
    const code =
      "export function kick(a: number, b: number, c: number, d: number, e: number): number {\n  return a + b + c + d + e;\n}\n";
    const all = await ruleIdsFor(code, "src/sim/kick.ts");
    const errors = await errorRuleIdsFor(code, "src/sim/kick.ts");
    expect(all).toContain("max-params");
    expect(errors).not.toContain("max-params");
  });
});
