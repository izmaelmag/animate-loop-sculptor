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

// MEMORY MANAGEMENT SETTINGS
const CONCURRENCY = 4; // Количество параллельных процессов рендеринга
const MEMORY_LIMIT = 4096; // Ограничение памяти в МБ (4GB)

// OUTPUT FILE PATH
const OUTPUT_DIR = path.join(__dirname, 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, `animation-${Date.now()}.mp4`);

// CREATE OUTPUT DIRECTORY IF IT DOESN'T EXIST
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Функция для управления памятью
function forceGarbageCollection() {
  if (global.gc) {
    global.gc();
    console.log('Forced garbage collection');
  }
}

async function renderVideo() {
  console.log('Starting video rendering...');
  
  // Setup quality
  const crf = QUALITY === 'high' ? 18 : QUALITY === 'medium' ? 23 : 28;
  
  // Start Remotion rendering
  try {
    // Запускаем сборщик мусора перед началом рендеринга
    forceGarbageCollection();
    
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
    console.log(`Concurrency: ${CONCURRENCY}, Memory limit: ${MEMORY_LIMIT}MB`);
    
    // Инициализируем счетчики для отслеживания памяти
    let completedFrames = 0;
    let lastGcFrame = 0;
    
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
      concurrency: CONCURRENCY,
      frameRange: undefined,
      chromiumOptions: {
        disableWebSecurity: true,
        headless: true,
        enableGPU: false
      },
      browserExecutable: undefined,
      envVariables: {
        MEMORY_LIMIT: MEMORY_LIMIT.toString()
      },
      onProgress: ({ progress, renderedFrames }) => {
        const percent = Math.round(progress * 100);
        process.stdout.write(`\rProgress: ${percent}%`);
        
        // Прогресс рендеринга для отслеживания использования памяти
        if (renderedFrames) {
          const currentFrame = renderedFrames.length;
          completedFrames = currentFrame;
          
          // Каждые 100 кадров запускаем принудительную сборку мусора
          if (currentFrame - lastGcFrame >= 100) {
            forceGarbageCollection();
            lastGcFrame = currentFrame;
          }
        }
      }
    });
    
    // Последний запуск сборщика мусора после завершения
    forceGarbageCollection();
    
    console.log('\nRendering complete!');
    console.log(`Video saved to: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('Error during rendering:', error);
  }
}

// Подготавливаем аргументы для Node.js, чтобы включить сборку мусора
if (process.argv.indexOf('--enable-gc') === -1) {
  const nodeArgs = ['--expose-gc', '--max-old-space-size=' + MEMORY_LIMIT];
  const scriptArgs = process.argv.slice(2);
  
  const spawn = require('child_process').spawn;
  const child = spawn(process.execPath, [...nodeArgs, __filename, ...scriptArgs], {
    stdio: 'inherit'
  });
  
  child.on('exit', code => {
    process.exit(code);
  });
} else {
  renderVideo();
} 