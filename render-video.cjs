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
    dpiScale: 2, // Default DPI scaling factor
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
    } else if (args[i] === "--dpi-scale" || args[i] === "-d") {
      const scale = parseFloat(args[i + 1]);
      if (!isNaN(scale) && scale > 0) {
        options.dpiScale = scale;
      } else {
        console.warn(`Invalid DPI scale: ${args[i + 1]}. Using default: 2`);
      }
      i++;
    }
  }

  return options;
};

// Get command line options
const options = parseArgs();

// VIDEO SETTINGS
const FPS = 60;
const DURATION_IN_SECONDS = 10;
const WIDTH = 1080;
const HEIGHT = 1920;
const QUALITY = options.quality; // 'high', 'medium', 'low'
const TEMPLATE = options.template;
const DPI_SCALE = options.dpiScale;

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
  console.log(`Starting video rendering with template: ${TEMPLATE}`);
  console.log(`Quality setting: ${QUALITY}`);
  console.log(`DPI scaling factor: ${DPI_SCALE}`);

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
        dpiScale: DPI_SCALE
      },
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
        templateName: TEMPLATE,
        dpiScale: DPI_SCALE
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
        enableGPU: true,
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
    console.log(`Template: ${TEMPLATE}, Quality: ${QUALITY}, DPI Scale: ${DPI_SCALE}`);
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
  --template, -t <name>    Animation template to use (default: gridOrbit)
  --quality, -q <level>    Video quality: high, medium, or low (default: high)
  --dpi-scale, -d <factor> DPI scaling factor for text and graphics (default: 2)
  --help, -h               Show this help message

Examples:
  node render-video.cjs --template basic --quality medium
  node render-video.cjs -t gridOrbit -q high -d 2.5
  `);
  process.exit(0);
}

// Prepare arguments for Node.js to enable garbage collection
if (process.argv.indexOf("--enable-gc") === -1) {
  const nodeArgs = ["--expose-gc", "--max-old-space-size=" + MEMORY_LIMIT];
  
  // Filter out our custom arguments to avoid passing them twice
  const scriptArgs = process.argv.slice(2).filter(arg => {
    return !["--template", "-t", "--quality", "-q", "--dpi-scale", "-d"].includes(arg) && 
           !["high", "medium", "low", "basic", "gsap", "gridOrbit"].includes(arg) &&
           !isNaN(parseFloat(arg));
  });

  const spawn = require("child_process").spawn;
  const child = spawn(
    process.execPath,
    [...nodeArgs, __filename, ...scriptArgs, "--enable-gc", 
     "--template", TEMPLATE, "--quality", QUALITY, "--dpi-scale", DPI_SCALE],
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
