const express = require("express");
const fs = require("fs");
const path = require("path");
const {
  createRenderJob,
  getRenderJob,
  cancelRenderJob,
} = require("./render-jobs.cjs");
const {
  REGISTRY_UPDATE_FAILED,
  validateAnimationNameInput,
  validateRendererInput,
  toAnimationId,
  toAnimationAlias,
  createAnimationTemplateSource,
  getAnimationDisplayName,
  updateAnimationRegistrySource,
} = require("./animation-template-utils.cjs");

const createApp = ({
  rootDir = process.cwd(),
  templatePaths = {
    p5: path.resolve(__dirname, "templates/p5-animation.ts.tpl"),
    webgl: path.resolve(__dirname, "templates/webgl-animation.ts.tpl"),
    r3f: path.resolve(__dirname, "templates/r3f-animation.tsx.tpl"),
  },
} = {}) => {
  const app = express();
  const outputDir = path.resolve(rootDir, "output");
  const animationsDir = path.resolve(rootDir, "src/animations");
  const animationsIndexPath = path.resolve(animationsDir, "index.ts");
  const templateSources = {
    p5: fs.readFileSync(templatePaths.p5, "utf8"),
    webgl: fs.readFileSync(templatePaths.webgl, "utf8"),
    r3f: fs.readFileSync(templatePaths.r3f, "utf8"),
  };

  app.use(express.json());
  app.use("/output", express.static(outputDir));

  app.get("/api/health", (_req, res) => {
    res.json({ok: true});
  });

  app.post("/api/animations/new", async (req, res) => {
    const validation = validateAnimationNameInput(req.body?.name);
    if (!validation.ok) {
      return res.status(400).json({
        error: {
          code: validation.code,
          message: validation.message,
        },
      });
    }

    const name = validation.name;
    const rendererValidation = validateRendererInput(req.body?.renderer);
    if (!rendererValidation.ok) {
      return res.status(400).json({
        error: {
          code: rendererValidation.code,
          message: rendererValidation.message,
        },
      });
    }
    const renderer = rendererValidation.renderer;

    const id = toAnimationId(name);
    if (!id) {
      return res.status(400).json({
        error: {
          code: "INVALID_NAME",
          message: "Animation name must contain letters or numbers.",
        },
      });
    }

    const animationDir = path.resolve(animationsDir, id);
    if (!animationDir.startsWith(`${animationsDir}${path.sep}`)) {
      return res.status(400).json({
        error: {
          code: "INVALID_NAME",
          message: "Animation name produced an invalid directory path.",
        },
      });
    }

    if (fs.existsSync(animationDir)) {
      return res.status(409).json({
        error: {
          code: "ANIMATION_EXISTS",
          message: `Animation "${id}" already exists.`,
        },
      });
    }

    const createdFiles = [];

    try {
      await fs.promises.mkdir(animationDir);

      const animationExtension = renderer === "r3f" ? "tsx" : "ts";
      const animationFilePath = path.resolve(
        animationDir,
        `${id}.${animationExtension}`,
      );
      const indexFilePath = path.resolve(animationDir, "index.ts");

      await fs.promises.writeFile(
        animationFilePath,
        createAnimationTemplateSource({
          templateSource: templateSources[renderer],
          renderer,
          name,
          id,
        }),
        "utf8",
      );
      createdFiles.push(path.relative(rootDir, animationFilePath));

      await fs.promises.writeFile(
        indexFilePath,
        `export * from "./${id}";\n`,
        "utf8",
      );
      createdFiles.push(path.relative(rootDir, indexFilePath));

      const registrySource = await fs.promises.readFile(
        animationsIndexPath,
        "utf8",
      );
      const alias = toAnimationAlias(id);
      const updatedRegistry = updateAnimationRegistrySource({
        source: registrySource,
        id,
        alias,
      });

      await fs.promises.writeFile(animationsIndexPath, updatedRegistry, "utf8");
      createdFiles.push(path.relative(rootDir, animationsIndexPath));

      return res.status(201).json({
        animation: {
          id,
          name: getAnimationDisplayName(renderer, name),
          renderer,
        },
        filesCreated: createdFiles,
      });
    } catch (error) {
      if (error?.code === REGISTRY_UPDATE_FAILED) {
        return res.status(500).json({
          error: {
            code: REGISTRY_UPDATE_FAILED,
            message: "Animation files were created, but registry update failed.",
            details: error.message,
          },
          filesCreated: createdFiles,
        });
      }

      return res.status(500).json({
        error: {
          code: "CREATE_ANIMATION_FAILED",
          message: "Failed to create animation template.",
          details: error?.message || "Unknown server error",
        },
        filesCreated: createdFiles,
      });
    }
  });

  app.post("/api/renders", (req, res) => {
    const {templateId, quality = "high"} = req.body || {};

    try {
      const job = createRenderJob({templateId, quality});
      res.status(201).json({job});
    } catch (error) {
      if (error.code === "RENDER_IN_PROGRESS") {
        return res.status(409).json({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      if (
        error.code === "INVALID_TEMPLATE_ID" ||
        error.code === "INVALID_QUALITY"
      ) {
        return res.status(400).json({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      return res.status(500).json({
        error: {
          code: "CREATE_RENDER_JOB_FAILED",
          message: "Failed to create render job.",
          details: error.message,
        },
      });
    }
  });

  app.get("/api/renders/:id", (req, res) => {
    const job = getRenderJob(req.params.id);
    if (!job) {
      return res.status(404).json({
        error: {
          code: "RENDER_NOT_FOUND",
          message: "Render job not found.",
        },
      });
    }

    return res.json({job});
  });

  app.delete("/api/renders/:id", (req, res) => {
    const job = cancelRenderJob(req.params.id);
    if (!job) {
      return res.status(404).json({
        error: {
          code: "RENDER_NOT_FOUND",
          message: "Render job not found.",
        },
      });
    }

    return res.json({job});
  });

  return app;
};

const startServer = ({port = Number(process.env.RENDER_SERVER_PORT || 3000)} = {}) => {
  const app = createApp();
  const server = app.listen(port, () => {
    console.log(`Render API listening on http://localhost:${port}`);
  });

  // Some Node environments may not keep the event loop alive with only a listener.
  const keepAliveInterval = setInterval(() => {}, 1 << 30);

  const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down render API...`);
    clearInterval(keepAliveInterval);
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = {
  createApp,
  startServer,
};
