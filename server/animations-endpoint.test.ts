import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { createApp } = require("./index.cjs");

const makeBaseRegistrySource = () => `import { AnimationSettings } from "../types/animations";

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

describe("POST /api/animations/new", () => {
  let rootDir = "";
  let server: { close: () => void } | null = null;
  let baseUrl = "";

  beforeEach(async () => {
    rootDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "animate-loop-sculptor-test-"),
    );
    const animationsDir = path.join(rootDir, "src", "animations");
    const orbitalDir = path.join(animationsDir, "orbital");
    const demoDir = path.join(animationsDir, "demo");
    await fs.promises.mkdir(orbitalDir, { recursive: true });
    await fs.promises.mkdir(demoDir, { recursive: true });
    await fs.promises.writeFile(path.join(demoDir, "demo.ts"), "export const x = 1;\n", "utf8");
    await fs.promises.writeFile(
      path.join(animationsDir, "index.ts"),
      makeBaseRegistrySource(),
      "utf8",
    );

    const app = createApp({ rootDir });
    server = await new Promise((resolve) => {
      const started = app.listen(0, () => resolve(started));
    });
    const address = (server as unknown as { address: () => { port: number } }).address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server?.close(() => resolve());
      });
      server = null;
    }
    if (rootDir) {
      await fs.promises.rm(rootDir, { recursive: true, force: true });
    }
  });

  it("returns 400 for invalid name", async () => {
    const res = await fetch(`${baseUrl}/api/animations/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "   " }),
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("INVALID_NAME");
  });

  it("returns 400 for invalid renderer", async () => {
    const res = await fetch(`${baseUrl}/api/animations/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test", renderer: "three" }),
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("INVALID_RENDERER");
  });

  it("returns 409 on existing animation id", async () => {
    const res = await fetch(`${baseUrl}/api/animations/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Orbital" }),
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(body.error.code).toBe("ANIMATION_EXISTS");
  });

  it("creates animation files and updates registry", async () => {
    const res = await fetch(`${baseUrl}/api/animations/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Bloom",
        fps: 60,
        durationSeconds: 11,
        width: 1080,
        height: 1080,
      }),
    });
    const body = (await res.json()) as {
      animation: { id: string; name: string; renderer: string };
      filesCreated: string[];
    };

    expect(res.status).toBe(201);
    expect(body.animation).toEqual({
      id: "test-bloom",
      name: "🎨 Test Bloom",
      renderer: "p5",
    });
    expect(body.filesCreated).toEqual([
      "src/animations/test-bloom/test-bloom.ts",
      "src/animations/test-bloom/index.ts",
      "src/animations/index.ts",
    ]);

    const animationFile = await fs.promises.readFile(
      path.join(rootDir, "src", "animations", "test-bloom", "test-bloom.ts"),
      "utf8",
    );
    expect(animationFile).toContain('id: "test-bloom"');
    expect(animationFile).toContain('name: "🎨 Test Bloom"');
    expect(animationFile).toContain("const FPS = 60;");
    expect(animationFile).toContain("const WIDTH = 1080;");
    expect(animationFile).toContain("const HEIGHT = 1080;");
    expect(animationFile).toContain("const DURATION_SECONDS = 11;");

    const registrySource = await fs.promises.readFile(
      path.join(rootDir, "src", "animations", "index.ts"),
      "utf8",
    );
    expect(registrySource).toContain(
      'import { settings as testBloomAnimation } from "./test-bloom";',
    );
    expect(registrySource).toContain(
      'export { settings as testBloomAnimation } from "./test-bloom";',
    );
    expect(registrySource).toContain(
      "  [testBloomAnimation.id]: testBloomAnimation,",
    );
  });

  it("creates webgl and r3f templates with proper file extensions", async () => {
    const webglRes = await fetch(`${baseUrl}/api/animations/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Prism", renderer: "webgl" }),
    });
    const webglBody = (await webglRes.json()) as {
      animation: { id: string; name: string; renderer: string };
      filesCreated: string[];
    };
    expect(webglRes.status).toBe(201);
    expect(webglBody.animation).toEqual({
      id: "prism",
      name: "🧪 Prism",
      renderer: "webgl",
    });
    expect(webglBody.filesCreated[0]).toBe("src/animations/prism/prism.ts");

    const r3fRes = await fetch(`${baseUrl}/api/animations/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Orbit Mesh", renderer: "r3f" }),
    });
    const r3fBody = (await r3fRes.json()) as {
      animation: { id: string; name: string; renderer: string };
      filesCreated: string[];
    };
    expect(r3fRes.status).toBe(201);
    expect(r3fBody.animation).toEqual({
      id: "orbit-mesh",
      name: "🧊 Orbit Mesh",
      renderer: "r3f",
    });
    expect(r3fBody.filesCreated[0]).toBe(
      "src/animations/orbit-mesh/orbit-mesh.tsx",
    );
  });
});

describe("POST /api/animations/archive", () => {
  let rootDir = "";
  let server: { close: () => void } | null = null;
  let baseUrl = "";

  beforeEach(async () => {
    rootDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "animate-loop-sculptor-test-"),
    );
    const animationsDir = path.join(rootDir, "src", "animations");
    const orbitalDir = path.join(animationsDir, "orbital");
    const demoDir = path.join(animationsDir, "demo");
    await fs.promises.mkdir(orbitalDir, { recursive: true });
    await fs.promises.mkdir(demoDir, { recursive: true });
    await fs.promises.writeFile(path.join(demoDir, "demo.ts"), "export const x = 1;\n", "utf8");
    await fs.promises.writeFile(
      path.join(animationsDir, "index.ts"),
      makeBaseRegistrySource(),
      "utf8",
    );

    const app = createApp({ rootDir });
    server = await new Promise((resolve) => {
      const started = app.listen(0, () => resolve(started));
    });
    const address = (server as unknown as { address: () => { port: number } }).address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server?.close(() => resolve());
      });
      server = null;
    }
    if (rootDir) {
      await fs.promises.rm(rootDir, { recursive: true, force: true });
    }
  });

  it("archives non-default animation and removes it from registry", async () => {
    const res = await fetch(`${baseUrl}/api/animations/archive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "demo" }),
    });
    const body = (await res.json()) as {
      archived: { id: string; archivedTo: string };
      filesMoved: string[];
    };

    expect(res.status).toBe(200);
    expect(body.archived.id).toBe("demo");
    expect(body.archived.archivedTo).toMatch(/^src\/animations\/archive\/\d+-demo$/);

    const movedDir = path.join(rootDir, body.archived.archivedTo);
    await expect(fs.promises.stat(movedDir)).resolves.toBeTruthy();
    await expect(
      fs.promises.stat(path.join(rootDir, "src", "animations", "demo")),
    ).rejects.toThrow();

    const registrySource = await fs.promises.readFile(
      path.join(rootDir, "src", "animations", "index.ts"),
      "utf8",
    );
    expect(registrySource).not.toContain('import { settings as demoAnimation } from "./demo";');
    expect(registrySource).not.toContain('export { settings as demoAnimation } from "./demo";');
    expect(registrySource).not.toContain("  [demoAnimation.id]: demoAnimation,");
  });

  it("forbids archiving default animation", async () => {
    const res = await fetch(`${baseUrl}/api/animations/archive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "orbital" }),
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(body.error.code).toBe("DEFAULT_ANIMATION_FORBIDDEN");
  });

  it("returns 404 for unknown animation", async () => {
    const res = await fetch(`${baseUrl}/api/animations/archive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "missing" }),
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(404);
    expect(body.error.code).toBe("ANIMATION_NOT_FOUND");
  });
});

describe("POST /api/animations/copy", () => {
  let rootDir = "";
  let server: { close: () => void } | null = null;
  let baseUrl = "";

  beforeEach(async () => {
    rootDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "animate-loop-sculptor-test-"),
    );
    const animationsDir = path.join(rootDir, "src", "animations");
    const orbitalDir = path.join(animationsDir, "orbital");
    const sourceDir = path.join(animationsDir, "lissajou-curves");
    const existingCopyDir = path.join(animationsDir, "lissajou-curves-2");

    await fs.promises.mkdir(orbitalDir, { recursive: true });
    await fs.promises.mkdir(sourceDir, { recursive: true });
    await fs.promises.mkdir(existingCopyDir, { recursive: true });

    await fs.promises.writeFile(
      path.join(sourceDir, "lissajou-curves.ts"),
      `export const settings = {
  id: "lissajou-curves",
  name: "🎨 Lissajou Curves",
  renderer: "p5",
};
`,
      "utf8",
    );
    await fs.promises.writeFile(
      path.join(sourceDir, "index.ts"),
      'export * from "./lissajou-curves";\n',
      "utf8",
    );
    await fs.promises.writeFile(
      path.join(existingCopyDir, "lissajou-curves-2.ts"),
      `export const settings = {
  id: "lissajou-curves-2",
  name: "🎨 Lissajou Curves 2",
  renderer: "p5",
};
`,
      "utf8",
    );
    await fs.promises.writeFile(
      path.join(existingCopyDir, "index.ts"),
      'export * from "./lissajou-curves-2";\n',
      "utf8",
    );

    await fs.promises.writeFile(
      path.join(animationsDir, "index.ts"),
      `import { AnimationSettings } from "../types/animations";

import { settings as orbitalAnimation } from "./orbital";
import { settings as lissajouCurvesAnimation } from "./lissajou-curves";
import { settings as lissajouCurves2Animation } from "./lissajou-curves-2";

export { settings as defaultAnimation } from "./orbital";
export { settings as orbitalAnimation } from "./orbital";
export { settings as lissajouCurvesAnimation } from "./lissajou-curves";
export { settings as lissajouCurves2Animation } from "./lissajou-curves-2";

export const animationSettings: Record<string, AnimationSettings> = {
  [orbitalAnimation.id]: orbitalAnimation,
  [lissajouCurvesAnimation.id]: lissajouCurvesAnimation,
  [lissajouCurves2Animation.id]: lissajouCurves2Animation,
};
`,
      "utf8",
    );

    const app = createApp({ rootDir });
    server = await new Promise((resolve) => {
      const started = app.listen(0, () => resolve(started));
    });
    const address = (server as unknown as { address: () => { port: number } }).address();
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server?.close(() => resolve());
      });
      server = null;
    }
    if (rootDir) {
      await fs.promises.rm(rootDir, { recursive: true, force: true });
    }
  });

  it("returns 400 for invalid id", async () => {
    const res = await fetch(`${baseUrl}/api/animations/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "   " }),
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(400);
    expect(body.error.code).toBe("INVALID_ID");
  });

  it("returns 404 for unknown animation", async () => {
    const res = await fetch(`${baseUrl}/api/animations/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "missing" }),
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(404);
    expect(body.error.code).toBe("ANIMATION_NOT_FOUND");
  });

  it("copies animation files and increments name suffix", async () => {
    const res = await fetch(`${baseUrl}/api/animations/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "lissajou-curves" }),
    });
    const body = (await res.json()) as {
      animation: { id: string; name: string; renderer: string };
      filesCopied: string[];
    };

    expect(res.status).toBe(201);
    expect(body.animation).toEqual({
      id: "lissajou-curves-3",
      name: "🎨 Lissajou Curves 3",
      renderer: "p5",
    });
    expect(body.filesCopied).toEqual([
      "src/animations/lissajou-curves-3/lissajou-curves-3.ts",
      "src/animations/lissajou-curves-3/index.ts",
      "src/animations/index.ts",
    ]);

    const copiedSource = await fs.promises.readFile(
      path.join(
        rootDir,
        "src",
        "animations",
        "lissajou-curves-3",
        "lissajou-curves-3.ts",
      ),
      "utf8",
    );
    expect(copiedSource).toContain('id: "lissajou-curves-3"');
    expect(copiedSource).toContain('name: "🎨 Lissajou Curves 3"');
    expect(copiedSource).toContain('renderer: "p5"');

    const copiedIndex = await fs.promises.readFile(
      path.join(rootDir, "src", "animations", "lissajou-curves-3", "index.ts"),
      "utf8",
    );
    expect(copiedIndex).toContain('export * from "./lissajou-curves-3";');

    const registrySource = await fs.promises.readFile(
      path.join(rootDir, "src", "animations", "index.ts"),
      "utf8",
    );
    expect(registrySource).toContain(
      'import { settings as lissajouCurves3Animation } from "./lissajou-curves-3";',
    );
    expect(registrySource).toContain(
      'export { settings as lissajouCurves3Animation } from "./lissajou-curves-3";',
    );
    expect(registrySource).toContain(
      "  [lissajouCurves3Animation.id]: lissajouCurves3Animation,",
    );
  });
});
