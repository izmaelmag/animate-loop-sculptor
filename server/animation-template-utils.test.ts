import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  REGISTRY_UPDATE_FAILED,
  ARCHIVE_DIR_NAME,
  DEFAULT_TEMPLATE_CONFIG,
  validateAnimationNameInput,
  validateRendererInput,
  validateTemplateConfigInput,
  toAnimationId,
  toAnimationAlias,
  renderTemplate,
  getAnimationDisplayName,
  createAnimationTemplateSourceWithConfig,
  updateAnimationRegistrySource,
  removeAnimationFromRegistrySource,
  getDefaultAnimationIdFromRegistrySource,
  buildArchiveFolderName,
  getNextAnimationCopyName,
  resolveNextCopyIdentity,
} = require("./animation-template-utils.cjs");

const baseRegistrySource = `import { AnimationSettings } from "../types/animations";

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

  it("validates template config with defaults", () => {
    expect(validateTemplateConfigInput({})).toEqual({
      ok: true,
      config: DEFAULT_TEMPLATE_CONFIG,
    });
    expect(validateTemplateConfigInput({durationSeconds: 0})).toEqual({
      ok: false,
      code: "INVALID_TEMPLATE_CONFIG",
      message: "Duration must be between 1 and 600 seconds.",
    });
    expect(validateTemplateConfigInput({fps: 0})).toEqual({
      ok: false,
      code: "INVALID_TEMPLATE_CONFIG",
      message: "FPS must be between 1 and 240.",
    });
  });

  it("renders template tokens", () => {
    const rendered = renderTemplate("A={{a}}, B={{b}}", {a: 1, b: "x"});
    expect(rendered).toBe("A=1, B=x");
  });

  it("creates animation source from template and renderer metadata", () => {
    const source = createAnimationTemplateSourceWithConfig({
      templateSource: [
        "fps: {{fpsLiteral}}",
        "id: {{idLiteral}}",
        "name: {{displayNameLiteral}}",
        "label: {{nameLiteral}}",
        "duration: {{durationSecondsLiteral}}",
        "width: {{widthLiteral}}",
        "height: {{heightLiteral}}",
      ].join("\n"),
      renderer: "p5",
      name: "Test Scene",
      id: "test-scene",
      config: {fps: 60, durationSeconds: 12, width: 2048, height: 1024},
    });
    expect(source).toContain("fps: 60");
    expect(source).toContain('id: "test-scene"');
    expect(source).toContain('name: "🎨 Test Scene"');
    expect(source).toContain('label: "Test Scene"');
    expect(source).toContain("duration: 12");
    expect(source).toContain("width: 2048");
    expect(source).toContain("height: 1024");
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

  it("removes animation lines from registry source", () => {
    const source = updateAnimationRegistrySource({
      source: baseRegistrySource,
      id: "fresh-loop",
      alias: "freshLoopAnimation",
    });
    const without = removeAnimationFromRegistrySource({
      source,
      id: "fresh-loop",
      alias: "freshLoopAnimation",
    });
    expect(without).not.toContain('import { settings as freshLoopAnimation } from "./fresh-loop";');
    expect(without).not.toContain('export { settings as freshLoopAnimation } from "./fresh-loop";');
    expect(without).not.toContain("  [freshLoopAnimation.id]: freshLoopAnimation,");
  });

  it("reads default animation id from registry", () => {
    expect(getDefaultAnimationIdFromRegistrySource(baseRegistrySource)).toBe("orbital");
  });

  it("builds archive folder name", () => {
    expect(ARCHIVE_DIR_NAME).toBe("archive");
    expect(buildArchiveFolderName({id: "demo", timestamp: 123})).toBe("123-demo");
  });

  it("increments animation copy names", () => {
    expect(getNextAnimationCopyName("Lissajou Curves")).toBe("Lissajou Curves 2");
    expect(getNextAnimationCopyName("Lissajou Curves 2")).toBe("Lissajou Curves 3");
    expect(getNextAnimationCopyName("Scene9")).toBe("Scene10");
  });

  it("resolves next unique copy identity", () => {
    const taken = new Set(["demo-2", "demo-3"]);
    const identity = resolveNextCopyIdentity({
      name: "Demo",
      isIdTaken: (id: string) => taken.has(id),
    });
    expect(identity).toEqual({
      name: "Demo 4",
      id: "demo-4",
    });
  });
});
