
const express = require('express');
const cors = require('cors');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const { mkdirSync, existsSync } = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('output'));

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../output');
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Helper function to escape special characters in template literals
const escapeTemplateString = (str) => {
  if (!str) return '';
  return str
    .replace(/\${/g, '\\${') // Escape ${} template literals
    .replace(/`/g, '\\`')    // Escape backticks
    .replace(/\\/g, '\\\\'); // Escape backslashes
};

app.post('/render', async (req, res) => {
  try {
    const { sketchCode, duration, fps, quality, filename } = req.body;
    
    console.log('Received render request:', { duration, fps, quality, filename });
    console.log('Sketch code length:', sketchCode?.length || 0);
    
    if (!sketchCode) {
      return res.status(400).json({ error: 'Sketch code is required' });
    }
    
    // Create a temporary file with properly escaped sketch code
    const sketchFilePath = path.join(__dirname, 'temp-sketch.js');
    const escapedSketchCode = escapeTemplateString(sketchCode);
    
    const sketchFileContent = `
      // Generated sketch file at ${new Date().toISOString()}
      module.exports = function(p, normalizedTime, frameNumber, totalFrames) {
        try {
          // Set default values in case parameters are undefined
          frameNumber = typeof frameNumber === 'undefined' ? 0 : frameNumber;
          totalFrames = typeof totalFrames === 'undefined' ? 1 : totalFrames;
          
          // Log parameters to help debugging
          console.log('Rendering with:', { normalizedTime, frameNumber, totalFrames });
          
          ${escapedSketchCode}
        } catch (error) {
          console.error('Sketch execution error:', error);
          p.background(255, 0, 0);
          p.fill(255);
          p.textSize(24);
          p.textAlign(p.CENTER, p.CENTER);
          p.text('Error: ' + error.message, p.width/2, p.height/2);
        }
      };
    `;
    
    require('fs').writeFileSync(sketchFilePath, sketchFileContent);
    console.log('Sketch file written to:', sketchFilePath);
    
    // Configure Webpack with path aliases and React settings
    const webpackOverride = (config) => {
      return {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...config.resolve.alias,
            '@': path.resolve(__dirname, '../src')
          },
          fallback: {
            ...config.resolve.fallback,
            "path": false,
            "fs": false,
          }
        },
        module: {
          ...config.module,
          rules: [
            ...config.module.rules,
          ],
        },
        optimization: {
          ...config.optimization,
          minimizer: [],
        },
      };
    };
    
    // Bundle the video with webpack configuration
    console.log('Bundling video...');
    const bundleLocation = await bundle({
      entryPoint: path.join(__dirname, '../src/remotion/index.ts'),
      webpackOverride,
    });
    
    // Select the composition
    console.log('Selecting composition...');
    const compositionId = 'P5Animation';
    
    // Ensure sketch path is absolute
    const absoluteSketchPath = path.resolve(sketchFilePath);
    console.log('Using absolute sketch path:', absoluteSketchPath);
    
    // Clear require cache for the sketch file to ensure fresh reload
    delete require.cache[require.resolve(absoluteSketchPath)];
    
    // Load the sketch function
    const sketchFunction = require(absoluteSketchPath);
    console.log('Sketch function loaded:', typeof sketchFunction);
    
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: {
        sketch: sketchFunction,
        normalizedTime: 0,
      },
    });
    
    // Set output file path
    const outputFileName = `${filename || 'animation'}-${Date.now()}.mp4`;
    const outputFilePath = path.join(outputDir, outputFileName);
    
    console.log('Rendering to:', outputFilePath);
    
    // Set video quality
    let videoConfig = {
      width: 1080,
      height: 1920,
    };
    
    if (quality === 'low') {
      videoConfig = { width: 720, height: 1280 };
    } else if (quality === 'medium') {
      videoConfig = { width: 1080, height: 1920 };
    } else if (quality === 'high') {
      videoConfig = { width: 1440, height: 2560 };
    }
    
    // Calculate the correct number of frames
    const durationInFrames = Math.ceil((duration || 10) * (fps || 30));
    console.log(`Rendering ${durationInFrames} frames at ${fps || 30}fps`);
    
    // Render the video
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputFilePath,
      inputProps: {
        sketch: sketchFunction,
        normalizedTime: 0, // Initial value, will be overridden by the animation
      },
      timeoutInMilliseconds: 300000, // 5 minutes timeout
      fps: fps || 30,
      durationInFrames: durationInFrames,
      ...videoConfig,
      chromiumOptions: {
        ignoreDefaultArgs: ["--disable-extensions"],
        args: [
          "--disable-gpu", 
          "--no-sandbox", 
          "--disable-web-security", 
          "--disable-dev-shm-usage",
          "--js-flags=--max-old-space-size=4096" // Increase memory limit
        ]
      }
    });
    
    console.log('Rendering complete!');
    
    // Return download URL
    const downloadUrl = `/download/${outputFileName}`;
    res.json({ 
      success: true, 
      downloadUrl,
      message: 'Rendering complete! You can download your video now.'
    });
  } catch (error) {
    console.error('Render error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Error rendering video', 
      details: error.message,
      stack: error.stack
    });
  }
});

// Route to serve video files
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(outputDir, filename);
  
  if (existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Add a route for checking server status
app.get('/status', (req, res) => {
  res.json({ status: 'ok', message: 'Render server is running' });
});

app.listen(port, () => {
  console.log(`Render server listening at http://localhost:${port}`);
});
