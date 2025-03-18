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
let FPS = 60; // Default fallback
let DURATION_IN_SECONDS = 10; // Default fallback
const QUALITY = options.quality; // 'high', 'medium', 'low'
const TEMPLATE = options.template;

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

// Import animation settings to get dimensions
const getAnimationSettings = (templateName) => {
  try {
    // Try to dynamically require the animation settings
    const settingsPath = path.join(__dirname, `src/animations/${templateName}.ts`);
    if (fs.existsSync(settingsPath)) {
      console.log(`Found animation settings at ${settingsPath}`);
      // For TypeScript files, we can't directly require them in Node.js
      // Try to read the file contents to extract values
      const content = fs.readFileSync(settingsPath, 'utf8');
      
      // Simple regex to extract fps and duration values
      const fpsMatch = content.match(/fps:\s*(\d+)/);
      const durationMatch = content.match(/duration:\s*(\d+)/);
      
      const fps = fpsMatch ? parseInt(fpsMatch[1]) : 60;
      const duration = durationMatch ? parseInt(durationMatch[1]) : 10;
      
      // Update global settings
      FPS = fps;
      DURATION_IN_SECONDS = duration;
      
      console.log(`Using settings from file: fps=${fps}, duration=${duration}s`);
      
      return {
        width: content.match(/width:\s*(\d+)/) ? parseInt(content.match(/width:\s*(\d+)/)[1]) : 1080,
        height: content.match(/height:\s*(\d+)/) ? parseInt(content.match(/height:\s*(\d+)/)[1]) : 1920,
        fps,
        duration
      };
    }
    
    // Try JavaScript version
    const jsSettingsPath = path.join(__dirname, `src/animations/${templateName}.js`);
    if (fs.existsSync(jsSettingsPath)) {
      console.log(`Found animation settings at ${jsSettingsPath}`);
      const settings = require(jsSettingsPath).settings;
      
      // Update global settings
      FPS = settings.fps || 60;
      DURATION_IN_SECONDS = settings.duration || 10;
      
      console.log(`Using settings from JS file: fps=${FPS}, duration=${DURATION_IN_SECONDS}s`);
      
      return {
        width: settings.width || 1080,
        height: settings.height || 1920,
        fps: settings.fps || 60,
        duration: settings.duration || 10
      };
    }
    
    console.log(`Animation settings not found for ${templateName}, using defaults: fps=${FPS}, duration=${DURATION_IN_SECONDS}s`);
    return {
      width: 1080,
      height: 1920,
      fps: FPS,
      duration: DURATION_IN_SECONDS
    };
  } catch (error) {
    console.warn(`Error loading animation settings: ${error.message}`);
    return {
      width: 1080,
      height: 1920,
      fps: FPS,
      duration: DURATION_IN_SECONDS
    };
  }
};

async function renderVideo() {
  console.log(`Starting video rendering with template: ${TEMPLATE}`);
  console.log(`Quality setting: ${QUALITY}`);
  
  // Get animation dimensions and timing settings
  const animationSettings = getAnimationSettings(TEMPLATE);
  const WIDTH = animationSettings.width;
  const HEIGHT = animationSettings.height;
  
  // Use settings from animation file (they've already updated the global FPS and DURATION_IN_SECONDS)
  console.log(`Video dimensions: ${WIDTH}x${HEIGHT}`);
  console.log(`Animation timing: ${FPS}fps, ${DURATION_IN_SECONDS}s duration`);

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
        templateName: TEMPLATE
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
        templateName: TEMPLATE
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
    console.log(`Template: ${TEMPLATE}, Quality: ${QUALITY}, Dimensions: ${WIDTH}x${HEIGHT}`);
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
  const scriptArgs = process.argv.slice(2).filter(arg => {
    return !["--template", "-t", "--quality", "-q"].includes(arg) && 
           !["high", "medium", "low", "basic", "gsap", "gridOrbit"].includes(arg);
  });

  const spawn = require("child_process").spawn;
  const child = spawn(
    process.execPath,
    [...nodeArgs, __filename, ...scriptArgs, "--enable-gc", 
     "--template", TEMPLATE, "--quality", QUALITY],
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
