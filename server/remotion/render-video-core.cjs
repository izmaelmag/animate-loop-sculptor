const fs = require("fs");
const path = require("path");
const {bundle} = require("@remotion/bundler");
const {renderMedia, selectComposition} = require("@remotion/renderer");

const DEFAULT_CONCURRENCY = 1;
const DEFAULT_MEMORY_LIMIT_MB = 8192;
const DEFAULT_TIMEOUT_MS = 120000;
const DEFAULT_OUTPUT_DIR = path.resolve(process.cwd(), "output");
const DEFAULT_RENDERER_PORT = 3100;
const COMPOSITION_ID = "MyVideo";
const ENTRY_POINT = path.resolve(process.cwd(), "src/remotion/index.tsx");

let cachedBundleLocation = null;
let cachedEntryMtimeMs = null;

const QUALITY_TO_CRF = {
  high: 18,
  medium: 23,
  low: 28,
};

const forceGarbageCollection = () => {
  if (global.gc) {
    global.gc();
  }
};

const ensureOutputDirectory = (outputDir) => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {recursive: true});
  }
};

const getBundleLocation = async ({forceRebundle = false}) => {
  const stat = fs.statSync(ENTRY_POINT);
  const mtime = stat.mtimeMs;
  const canReuse = !forceRebundle && cachedBundleLocation && cachedEntryMtimeMs === mtime;

  if (canReuse) {
    return cachedBundleLocation;
  }

  cachedBundleLocation = await bundle(ENTRY_POINT);
  cachedEntryMtimeMs = mtime;
  return cachedBundleLocation;
};

const getCrf = (quality) => {
  if (!QUALITY_TO_CRF[quality]) {
    const allowed = Object.keys(QUALITY_TO_CRF).join(", ");
    throw new Error(`Invalid quality "${quality}". Allowed values: ${allowed}.`);
  }

  return QUALITY_TO_CRF[quality];
};

const buildOutputPath = ({outputDir, templateId, quality}) => {
  const safeTemplate = String(templateId).replace(/[^a-zA-Z0-9-_]/g, "_");
  const timestamp = Date.now();
  const filename = `animation--${safeTemplate}-${quality}-${timestamp}.mp4`;
  return {
    filename,
    outputPath: path.join(outputDir, filename),
  };
};

const renderVideoCore = async ({
  templateId,
  quality = "high",
  outputDir = DEFAULT_OUTPUT_DIR,
  concurrency = DEFAULT_CONCURRENCY,
  timeoutInMilliseconds = DEFAULT_TIMEOUT_MS,
  memoryLimitMb = DEFAULT_MEMORY_LIMIT_MB,
  port = Number(process.env.REMOTION_RENDER_PORT || DEFAULT_RENDERER_PORT),
  forceRebundle = false,
  cancelSignal,
  onProgress,
  onStart,
} = {}) => {
  if (!templateId || typeof templateId !== "string") {
    throw new Error('Parameter "templateId" must be a non-empty string.');
  }

  const crf = getCrf(quality);
  ensureOutputDirectory(outputDir);
  forceGarbageCollection();

  const {filename, outputPath} = buildOutputPath({
    outputDir,
    templateId,
    quality,
  });

  const bundleLocation = await getBundleLocation({forceRebundle});
  const inputProps = {templateId};

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: COMPOSITION_ID,
    inputProps,
    port,
  });

  if (typeof onStart === "function") {
    onStart({
      compositionId: COMPOSITION_ID,
      outputPath,
      filename,
      fps: composition.fps,
      durationInFrames: composition.durationInFrames,
      width: composition.width,
      height: composition.height,
      quality,
      crf,
      concurrency,
    });
  }

  let lastGcFrame = 0;

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    port,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
    imageFormat: "jpeg",
    crf,
    concurrency,
    logLevel: "info",
    timeoutInMilliseconds,
    cancelSignal,
    chromiumOptions: {
      chromeMode: "chrome-for-testing",
      disableWebSecurity: true,
      enableGPU: true,
      gl: "angle",
    },
    envVariables: {
      MEMORY_LIMIT: String(memoryLimitMb),
    },
    onProgress: (payload) => {
      if (payload.renderedFrames) {
        const renderedCount = payload.renderedFrames.length;
        if (renderedCount - lastGcFrame >= 100) {
          forceGarbageCollection();
          lastGcFrame = renderedCount;
        }
      }

      if (typeof onProgress === "function") {
        onProgress(payload);
      }
    },
  }).catch((error) => {
    // Known environment issue with some Node/libuv setups.
    if (String(error?.message || "").includes("uv_interface_addresses")) {
      error.message = `${error.message}. Try using Node.js LTS (22.x) and set REMOTION_RENDER_PORT=3100 before running.`;
    }
    throw error;
  });

  forceGarbageCollection();

  return {
    outputPath,
    filename,
    quality,
    templateId,
    crf,
  };
};

module.exports = {
  renderVideoCore,
  QUALITY_TO_CRF,
};
