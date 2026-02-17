import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  REGISTRY_UPDATE_FAILED,
  validateAnimationNameInput,
  validateRendererInput,
  toAnimationId,
  toAnimationAlias,
  renderTemplate,
  getAnimationDisplayName,
  createAnimationTemplateSource,
  updateAnimationRegistrySource,
} = require("./animation-template-utils.cjs");

const baseRegistrySource = `import { AnimationSettings } from "@/types/animations";

import { settings as orbitalAnimation } from "./orbital";
import { settings as demoAnimation } from "./demo";

export { settings as defaultAnimation } from "./orbital";
export { settings as orbitalAnimation } from "./orbital";
export { settings as demoAnimation } from "./demo";

export const animationSettings: Record<string, AnimationSettings> = {
  [orbitalAnimation.id]: orbitalAnimation,
  [demoAnimation.id]: demoAnimation,
};
`;

describe("animation-template-utils", () => {
  it("validates animation name input", () => {
    expect(validateAnimationNameInput("  New Name  ")).toEqual({
      ok: true,
      name: "New Name",
    });
    expect(validateAnimationNameInput("   ")).toEqual({
      ok: false,
      code: "INVALID_NAME",
      message: 'Field "name" is required.',
    });
  });

  it("builds slug id from name", () => {
    expect(toAnimationId("  Hello__World  ")).toBe("hello-world");
    expect(toAnimationId("%%%")).toBe("");
  });

  it("builds deterministic alias from id", () => {
    expect(toAnimationAlias("my-new-animation")).toBe("myNewAnimationAnimation");
    expect(toAnimationAlias("123")).toBe("generatedAnimation");
  });

  it("validates renderer input and applies p5 default", () => {
    expect(validateRendererInput("webgl")).toEqual({ok: true, renderer: "webgl"});
    expect(validateRendererInput(undefined)).toEqual({ok: true, renderer: "p5"});
    expect(validateRendererInput("three")).toEqual({
      ok: false,
      code: "INVALID_RENDERER",
      message: "Renderer must be one of: p5, webgl, r3f.",
    });
  });

  it("renders template tokens", () => {
    const rendered = renderTemplate("A={{a}}, B={{b}}", {a: 1, b: "x"});
    expect(rendered).toBe("A=1, B=x");
  });

  it("creates animation source from template and renderer metadata", () => {
    const source = createAnimationTemplateSource({
      templateSource: [
        "id: {{idLiteral}}",
        "name: {{displayNameLiteral}}",
        "label: {{nameLiteral}}",
      ].join("\n"),
      renderer: "p5",
      name: "Test Scene",
      id: "test-scene",
    });
    expect(source).toContain('id: "test-scene"');
    expect(source).toContain('name: "🎨 Test Scene"');
    expect(source).toContain('label: "Test Scene"');
  });

  it("maps renderer to emoji display name", () => {
    expect(getAnimationDisplayName("p5", "Demo")).toBe("🎨 Demo");
    expect(getAnimationDisplayName("webgl", "Nebula")).toBe("🧪 Nebula");
    expect(getAnimationDisplayName("r3f", "Scene")).toBe("🧊 Scene");
  });

  it("updates registry source idempotently", () => {
    const once = updateAnimationRegistrySource({
      source: baseRegistrySource,
      id: "fresh-loop",
      alias: "freshLoopAnimation",
    });
    const twice = updateAnimationRegistrySource({
      source: once,
      id: "fresh-loop",
      alias: "freshLoopAnimation",
    });

    expect(once).toContain(
      'import { settings as freshLoopAnimation } from "./fresh-loop";',
    );
    expect(once).toContain(
      'export { settings as freshLoopAnimation } from "./fresh-loop";',
    );
    expect(once).toContain(
      "  [freshLoopAnimation.id]: freshLoopAnimation,",
    );
    expect(twice).toBe(once);
  });

  it("throws clear registry update error for invalid source", () => {
    try {
      updateAnimationRegistrySource({
        source: "export const animationSettings = {};",
        id: "broken",
        alias: "brokenAnimation",
      });
      throw new Error("Expected error");
    } catch (error) {
      expect((error as { code?: string }).code).toBe(REGISTRY_UPDATE_FAILED);
    }
  });
});
