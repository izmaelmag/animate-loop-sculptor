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

// CREATE OUTPUT DIRECTORY IF IT DOESN'T EXIST
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function renderVideo() {
  console.log('Starting video rendering...');
  
  // Setup quality
  const crf = QUALITY === 'high' ? 18 : QUALITY === 'medium' ? 23 : 28;
  
  // Start Remotion rendering
  try {
    // Bundle the composition
    console.log('Bundling the composition...');
    const bundleLocation = await bundle(path.join(__dirname, 'src/remotion/index.tsx'));
    
    // Get compositions
    console.log('Getting composition list...');
    const compositions = await getCompositions(bundleLocation, {
      inputProps: { sketchCode: '' }
    });
    
    // Find the target composition
    const composition = compositions.find(c => c.id === 'MyVideo');
    
    if (!composition) {
      throw new Error('Composition "MyVideo" not found');
    }
    
    // Rendering settings
    const durationInFrames = FPS * DURATION_IN_SECONDS;
    
    console.log(`Rendering ${durationInFrames} frames at ${FPS} FPS...`);
    console.log(`Video dimensions: ${WIDTH}x${HEIGHT}`);
    console.log(`Quality: ${QUALITY} (CRF: ${crf})`);
    
    // Render video
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: OUTPUT_FILE,
      inputProps: {
        sketchCode: ''
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
    
    console.log('\nRendering complete!');
    console.log(`Video saved to: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('Error during rendering:', error);
  }
}

renderVideo(); 