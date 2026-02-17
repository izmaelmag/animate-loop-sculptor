import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { createApp } = require("./index.cjs");

const makeBaseRegistrySource = () => `import { AnimationSettings } from "@/types/animations";

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
      body: JSON.stringify({ name: "Test Bloom" }),
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
