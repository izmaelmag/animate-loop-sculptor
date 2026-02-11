const express = require("express");
const path = require("path");
const {
  createRenderJob,
  getRenderJob,
  cancelRenderJob,
} = require("./render-jobs.cjs");

const app = express();
const PORT = Number(process.env.RENDER_SERVER_PORT || 3000);
const OUTPUT_DIR = path.resolve(process.cwd(), "output");

app.use(express.json());
app.use("/output", express.static(OUTPUT_DIR));

app.get("/api/health", (_req, res) => {
  res.json({ok: true});
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

    if (error.code === "INVALID_TEMPLATE_ID" || error.code === "INVALID_QUALITY") {
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

const server = app.listen(PORT, () => {
  console.log(`Render API listening on http://localhost:${PORT}`);
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
