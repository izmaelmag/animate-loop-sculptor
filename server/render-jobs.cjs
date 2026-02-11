const path = require("path");
const {randomUUID} = require("crypto");
const {makeCancelSignal} = require("@remotion/renderer");
const {renderVideoCore, QUALITY_TO_CRF} = require("./remotion/render-video-core.cjs");

const OUTPUT_DIR = path.resolve(process.cwd(), "output");
const JOB_TTL_MS = 1000 * 60 * 30;
const TERMINAL_STATUSES = new Set(["success", "error", "cancelled"]);
const RENDER_STATUSES = new Set(["queued", "running"]);

/** @type {Map<string, any>} */
const jobs = new Map();

const toPublicJob = (job) => ({
  id: job.id,
  templateId: job.templateId,
  quality: job.quality,
  status: job.status,
  progress: job.progress,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
  startedAt: job.startedAt,
  finishedAt: job.finishedAt,
  outputFile: job.outputFile,
  outputPath: job.outputPath,
  outputUrl: job.outputUrl,
  error: job.error,
});

const nowIso = () => new Date().toISOString();

const updateJob = (jobId, patch) => {
  const current = jobs.get(jobId);
  if (!current) {
    return null;
  }

  const next = {
    ...current,
    ...patch,
    updatedAt: nowIso(),
  };

  jobs.set(jobId, next);
  return next;
};

const hasRunningJob = () => {
  for (const job of jobs.values()) {
    if (RENDER_STATUSES.has(job.status)) {
      return true;
    }
  }
  return false;
};

const cleanupExpiredJobs = () => {
  const now = Date.now();

  for (const [id, job] of jobs.entries()) {
    if (!TERMINAL_STATUSES.has(job.status)) {
      continue;
    }

    const finishedAt = job.finishedAt ? Date.parse(job.finishedAt) : Date.parse(job.updatedAt);
    if (Number.isNaN(finishedAt)) {
      continue;
    }

    if (now - finishedAt > JOB_TTL_MS) {
      jobs.delete(id);
    }
  }
};

setInterval(cleanupExpiredJobs, 60_000).unref();

const runRender = async (jobId) => {
  const current = jobs.get(jobId);
  if (!current) {
    return;
  }

  const {cancelSignal, cancel} = makeCancelSignal();

  updateJob(jobId, {
    status: "running",
    startedAt: nowIso(),
    cancel,
  });

  try {
    const result = await renderVideoCore({
      templateId: current.templateId,
      quality: current.quality,
      outputDir: OUTPUT_DIR,
      concurrency: 1,
      cancelSignal,
      onProgress: ({progress, stitchStage, renderedFrames, encodedFrames}) => {
        const percent = Math.max(0, Math.min(100, Math.round(progress * 100)));
        updateJob(jobId, {
          progress: percent,
          stitchStage: stitchStage || null,
          renderedFrames: renderedFrames?.length ?? null,
          encodedFrames: typeof encodedFrames === "number" ? encodedFrames : null,
        });
      },
    });

    updateJob(jobId, {
      status: "success",
      progress: 100,
      finishedAt: nowIso(),
      outputFile: result.filename,
      outputPath: result.outputPath,
      outputUrl: `/output/${result.filename}`,
      cancel: null,
      error: null,
    });
  } catch (error) {
    const latest = jobs.get(jobId);
    const isCancelled =
      latest?.status === "cancelled" ||
      String(error?.message || "").toLowerCase().includes("cancel");

    if (isCancelled) {
      updateJob(jobId, {
        status: "cancelled",
        finishedAt: nowIso(),
        cancel: null,
        error: null,
      });
      return;
    }

    updateJob(jobId, {
      status: "error",
      finishedAt: nowIso(),
      cancel: null,
      error: {
        code: "RENDER_FAILED",
        message: error?.message || "Unknown render error",
      },
    });
  }
};

const createRenderJob = ({templateId, quality}) => {
  if (!templateId || typeof templateId !== "string") {
    const err = new Error('Field "templateId" is required.');
    err.code = "INVALID_TEMPLATE_ID";
    throw err;
  }

  if (!QUALITY_TO_CRF[quality]) {
    const err = new Error('Field "quality" must be one of: high, medium, low.');
    err.code = "INVALID_QUALITY";
    throw err;
  }

  if (hasRunningJob()) {
    const err = new Error("A render is already in progress.");
    err.code = "RENDER_IN_PROGRESS";
    throw err;
  }

  const id = randomUUID();
  const createdAt = nowIso();
  const job = {
    id,
    templateId,
    quality,
    status: "queued",
    progress: 0,
    createdAt,
    updatedAt: createdAt,
    startedAt: null,
    finishedAt: null,
    outputFile: null,
    outputPath: null,
    outputUrl: null,
    cancel: null,
    error: null,
  };

  jobs.set(id, job);
  void runRender(id);
  return toPublicJob(job);
};

const getRenderJob = (id) => {
  const job = jobs.get(id);
  return job ? toPublicJob(job) : null;
};

const cancelRenderJob = (id) => {
  const job = jobs.get(id);
  if (!job) {
    return null;
  }

  if (TERMINAL_STATUSES.has(job.status)) {
    return toPublicJob(job);
  }

  updateJob(id, {status: "cancelled", finishedAt: nowIso()});
  if (typeof job.cancel === "function") {
    job.cancel();
  }

  return getRenderJob(id);
};

module.exports = {
  createRenderJob,
  getRenderJob,
  cancelRenderJob,
};
