const fs = require('fs');
const path = require('path');
const { bundle } = require('@remotion/bundler');
const { renderMedia, getCompositions } = require('@remotion/renderer');

// VIDEO SETTINGS
const FPS = 60;
const DURATION_IN_SECONDS = 10;
const WIDTH = 1080;
const HEIGHT = 1920;
const QUALITY = 'high'; // 'high', 'medium', 'low'

// OUTPUT FILE PATH
const OUTPUT_DIR = path.join(__dirname, 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, `animation-${Date.now()}.mp4`);

// PATH TO SKETCH FILE (create this file with your P5 code)
const SKETCH_FILE = path.join(__dirname, 'sketch.js');

// CREATE OUTPUT DIRECTORY IF IT DOESN'T EXIST
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function renderVideo() {
  console.log('Starting video rendering...');
  
  // Read P5.js code from file
  console.log(`Reading code from file: ${SKETCH_FILE}`);
  if (!fs.existsSync(SKETCH_FILE)) {
    console.error(`Error: File ${SKETCH_FILE} not found`);
    console.log('Create a sketch.js file with your P5.js code');
    return;
  }
  
  const sketchCode = fs.readFileSync(SKETCH_FILE, 'utf-8');
  console.log(`Code successfully read, length: ${sketchCode.length} characters`);
  
  // Set quality
  const crf = QUALITY === 'high' ? 18 : QUALITY === 'medium' ? 23 : 28;
  
  // Start Remotion rendering
  try {
    // Build bundle
    console.log('Building bundle...');
    const bundleLocation = await bundle(path.join(__dirname, 'src/remotion/index.tsx'));
    
    // Get compositions
    console.log('Getting compositions...');
    const compositions = await getCompositions(bundleLocation, {
      inputProps: { sketchCode }
    });
    
    // Find needed composition
    const composition = compositions.find(c => c.id === 'MyVideo');
    
    if (!composition) {
      throw new Error('Composition "MyVideo" not found');
    }
    
    // Rendering settings
    const durationInFrames = FPS * DURATION_IN_SECONDS;
    
    console.log(`Starting rendering ${durationInFrames} frames at ${FPS} FPS...`);
    console.log(`Video size: ${WIDTH}x${HEIGHT}`);
    console.log(`Quality: ${QUALITY} (CRF: ${crf})`);
    
    // Rendering video
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: OUTPUT_FILE,
      inputProps: {
        sketchCode
      },
      imageFormat: 'jpeg',
      fps: FPS,
      durationInFrames,
      crf,
      onProgress: ({ progress }) => {
        const percent = Math.round(progress * 100);
        process.stdout.write(`\rProgress: ${percent}%`);
      }
    });
    
    console.log('\nRendering completed!');
    console.log(`Video saved to: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('Error during rendering:', error);
  }
}

renderVideo(); 