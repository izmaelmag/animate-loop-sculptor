const fs = require("fs");
const path = require("path");
const { bundle } = require("@remotion/bundler");
const { renderMedia, getCompositions } = require("@remotion/renderer");

// VIDEO SETTINGS
const FPS = 60;
const DURATION_IN_SECONDS = 10;
const WIDTH = 1080;
const HEIGHT = 1920;
const QUALITY = "high"; // 'high', 'medium', 'low'

// MEMORY MANAGEMENT SETTINGS
const CONCURRENCY = 4;
const MEMORY_LIMIT = 4096;

// OUTPUT FILE PATH
const OUTPUT_DIR = path.join(__dirname, "output");
const OUTPUT_FILE = path.join(OUTPUT_DIR, `animation-${Date.now()}.mp4`);

// CREATE OUTPUT DIRECTORY IF IT DOESN'T EXIST
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Memory management function
function forceGarbageCollection() {
  if (global.gc) {
    global.gc();
    console.log("Forced garbage collection");
  }
}

async function renderVideo() {
  console.log("Starting video rendering...");

  // Setup quality
  const crf = QUALITY === "high" ? 18 : QUALITY === "medium" ? 23 : 28;

  // Start Remotion rendering
  try {
    // Start garbage collection before rendering
    forceGarbageCollection();

    // Bundle the composition
    console.log("Bundling the composition...");
    const bundleLocation = await bundle(
      path.join(__dirname, "src/remotion/index.tsx")
    );

    // Get compositions
    console.log("Getting composition list...");
    const compositions = await getCompositions(bundleLocation, {
      inputProps: { templateName: "default" },
    });

    // Find the target composition
    const composition = compositions.find((c) => c.id === "MyVideo");

    if (!composition) {
      throw new Error('Composition "MyVideo" not found');
    }

    // Rendering settings
    const durationInFrames = FPS * DURATION_IN_SECONDS;

    console.log(`Rendering ${durationInFrames} frames at ${FPS} FPS...`);
    console.log(`Video dimensions: ${WIDTH}x${HEIGHT}`);
    console.log(`Quality: ${QUALITY} (CRF: ${crf})`);
    console.log(`Concurrency: ${CONCURRENCY}, Memory limit: ${MEMORY_LIMIT}MB`);

    // Initialize counters for memory tracking
    let completedFrames = 0;
    let lastGcFrame = 0;

    // Render video
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: OUTPUT_FILE,
      inputProps: {
        templateName: "default",
      },
      imageFormat: "jpeg",
      fps: FPS,
      durationInFrames,
      crf,
      concurrency: CONCURRENCY,
      frameRange: undefined,
      chromiumOptions: {
        disableWebSecurity: true,
        headless: true,
        enableGPU: false,
      },
      browserExecutable: undefined,
      envVariables: {
        MEMORY_LIMIT: MEMORY_LIMIT.toString(),
      },
      onProgress: ({ progress, renderedFrames }) => {
        const percent = Math.round(progress * 100);
        process.stdout.write(`\rProgress: ${percent}%`);

        // Progress rendering for memory tracking
        if (renderedFrames) {
          const currentFrame = renderedFrames.length;
          completedFrames = currentFrame;

          // Every 100 frames, force garbage collection
          if (currentFrame - lastGcFrame >= 100) {
            forceGarbageCollection();
            lastGcFrame = currentFrame;
          }
        }
      },
    });

    // Last garbage collection run after completion
    forceGarbageCollection();

    console.log("\nRendering complete!");
    console.log(`Video saved to: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("Error during rendering:", error);
  }
}

// Prepare arguments for Node.js to enable garbage collection
if (process.argv.indexOf("--enable-gc") === -1) {
  const nodeArgs = ["--expose-gc", "--max-old-space-size=" + MEMORY_LIMIT];
  const scriptArgs = process.argv.slice(2);

  const spawn = require("child_process").spawn;
  const child = spawn(
    process.execPath,
    [...nodeArgs, __filename, ...scriptArgs],
    {
      stdio: "inherit",
    }
  );

  child.on("exit", (code) => {
    process.exit(code);
  });
} else {
  renderVideo();
}
