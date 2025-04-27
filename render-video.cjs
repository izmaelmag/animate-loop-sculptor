const fs = require("fs");
const path = require("path");
const { bundle } = require("@remotion/bundler");
const { renderMedia, getCompositions } = require("@remotion/renderer");

// Parse command line arguments
const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    template: "gridOrbit", // Default template
    quality: "high", // Default quality
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--template" || args[i] === "-t") {
      options.template = args[i + 1];
      i++;
    } else if (args[i] === "--quality" || args[i] === "-q") {
      const quality = args[i + 1];
      if (["high", "medium", "low"].includes(quality)) {
        options.quality = quality;
      } else {
        console.warn(`Invalid quality: ${quality}. Using default: high`);
      }
      i++;
    }
  }

  return options;
};

// Get command line options
const options = parseArgs();

// VIDEO SETTINGS
const QUALITY = options.quality; // 'high', 'medium', 'low'
const TEMPLATE = options.template;

// MEMORY MANAGEMENT SETTINGS
const CONCURRENCY = 1;
const MEMORY_LIMIT = 4096;

// OUTPUT FILE PATH
const OUTPUT_DIR = path.join(__dirname, "output");
const OUTPUT_FILE = path.join(
  OUTPUT_DIR,
  `animation--${options.template}-${options.quality}-${Date.now()}.mp4`
);

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
  console.log(`Starting video rendering with template: ${TEMPLATE}`);
  console.log(`Quality setting: ${QUALITY}`);

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
      inputProps: {
        templateName: TEMPLATE,
      },
    });

    // Find the target composition
    const composition = compositions.find((c) => c.id === "MyVideo");

    if (!composition) {
      throw new Error('Composition "MyVideo" not found');
    }

    // Get fps and durationInFrames from the composition
    const { fps, durationInFrames } = composition;

    console.log(`Starting render...`);
    console.log(
      `Using composition settings: ${fps}fps, ${durationInFrames} frames`
    );
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
        templateName: TEMPLATE,
      },
      imageFormat: "jpeg",
      fps,
      durationInFrames,
      crf,
      concurrency: CONCURRENCY,
      frameRange: undefined,
      chromiumOptions: {
        disableWebSecurity: true,
        headless: true,
        enableGPU: true,
        gl: 'angle',
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
    console.log(`Template: ${TEMPLATE}, Quality: ${QUALITY}`);
  } catch (error) {
    console.error("Error during rendering:", error);
  }
}

// Display help if requested
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
Render Video Script - Help
--------------------------
Options:
  --template, -t <name>      Animation template to use (default: gridOrbit)
  --quality, -q <level>      Video quality: high, medium, or low (default: high)
  --help, -h                 Show this help message

Examples:
  node render-video.cjs --template basic --quality medium
  node render-video.cjs -t gridOrbit -q high
  `);
  process.exit(0);
}

// Prepare arguments for Node.js to enable garbage collection
if (process.argv.indexOf("--enable-gc") === -1) {
  const nodeArgs = ["--expose-gc", "--max-old-space-size=" + MEMORY_LIMIT];

  // Filter out our custom arguments to avoid passing them twice
  const scriptArgs = process.argv.slice(2).filter((arg) => {
    return (
      !["--template", "-t", "--quality", "-q"].includes(arg) &&
      !["high", "medium", "low", "basic", "gsap", "gridOrbit"].includes(arg)
    );
  });

  const spawn = require("child_process").spawn;
  const child = spawn(
    process.execPath,
    [
      ...nodeArgs,
      __filename,
      ...scriptArgs,
      "--enable-gc",
      "--template",
      TEMPLATE,
      "--quality",
      QUALITY,
    ],
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
