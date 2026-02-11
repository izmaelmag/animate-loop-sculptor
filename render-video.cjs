const path = require("path");
const {spawn} = require("child_process");
const {renderVideoCore, QUALITY_TO_CRF} = require("./server/remotion/render-video-core.cjs");

// Parse command line arguments
const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    template: "orbital",
    quality: "high",
    forceRebundle: false,
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
    } else if (args[i] === "--rebundle") {
      options.forceRebundle = true;
    }
  }

  return options;
};

const getPassThroughArgs = (args) => {
  const passthrough = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--template" || arg === "-t" || arg === "--quality" || arg === "-q") {
      i++;
      continue;
    }
    passthrough.push(arg);
  }
  return passthrough;
};

// Get command line options
const options = parseArgs();

// VIDEO SETTINGS
const QUALITY = options.quality;
const TEMPLATE = options.template;
const MEMORY_LIMIT = 4096 * 2;

async function renderVideo() {
  console.log(`Starting video rendering with template: ${TEMPLATE}`);
  console.log(`Quality setting: ${QUALITY}`);
  console.log(`Output directory: ${path.join(__dirname, "output")}`);

  const crf = QUALITY_TO_CRF[QUALITY];
  console.log(`Quality: ${QUALITY} (CRF: ${crf})`);

  try {
    const result = await renderVideoCore({
      templateId: TEMPLATE,
      quality: QUALITY,
      outputDir: path.join(__dirname, "output"),
      concurrency: 1,
      memoryLimitMb: MEMORY_LIMIT,
      forceRebundle: options.forceRebundle,
      onStart: ({fps, durationInFrames, concurrency}) => {
        console.log(`Using composition settings: ${fps}fps, ${durationInFrames} frames`);
        console.log(`Concurrency: ${concurrency}, Memory limit: ${MEMORY_LIMIT}MB`);
      },
      onProgress: ({progress}) => {
        const percent = Math.round(progress * 100);
        process.stdout.write(`\rProgress: ${percent}%`);
      },
    });

    console.log("\nRendering complete!");
    console.log(`Video saved to: ${result.outputPath}`);
    console.log(`Template: ${TEMPLATE}, Quality: ${QUALITY}`);
    process.exit(0);
  } catch (error) {
    console.error("Error during rendering:", error);
    process.exit(1);
  }
}

// Display help if requested
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
Render Video Script - Help
--------------------------
Options:
  --template, -t <name>      Animation template to use (default: orbital)
  --quality, -q <level>      Video quality: high, medium, or low (default: high)
  --rebundle                 Rebuild Remotion bundle even if cached
  --help, -h                 Show this help message

Examples:
  node render-video.cjs --template orbital --quality medium
  node render-video.cjs -t orbital -q high
  `);
  process.exit(0);
}

// Prepare arguments for Node.js to enable garbage collection
if (process.argv.indexOf("--enable-gc") === -1) {
  const nodeArgs = ["--expose-gc", "--max-old-space-size=" + MEMORY_LIMIT];

  // Filter out options that are re-injected explicitly.
  const scriptArgs = getPassThroughArgs(process.argv.slice(2));

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
