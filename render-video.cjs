const fs = require('fs');
const path = require('path');
const { bundle } = require('@remotion/bundler');
const { renderMedia, getCompositions } = require('@remotion/renderer');

// Настройки видео
const FPS = 60;
const DURATION_IN_SECONDS = 10;
const WIDTH = 1080;
const HEIGHT = 1920;
const QUALITY = 'high'; // 'high', 'medium', 'low'

// Путь к выходному файлу
const OUTPUT_DIR = path.join(__dirname, 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, `animation-${Date.now()}.mp4`);

// Путь к файлу со скетчем (создай этот файл с твоим P5 кодом)
const SKETCH_FILE = path.join(__dirname, 'sketch.js');

// Создаем директорию для выходного файла, если её нет
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function renderVideo() {
  console.log('Начинаю рендеринг видео...');
  
  // Читаем код P5.js из файла
  console.log(`Читаю код из файла: ${SKETCH_FILE}`);
  if (!fs.existsSync(SKETCH_FILE)) {
    console.error(`Ошибка: Файл ${SKETCH_FILE} не найден`);
    console.log('Создайте файл sketch.js с вашим P5.js кодом');
    return;
  }
  
  const sketchCode = fs.readFileSync(SKETCH_FILE, 'utf-8');
  console.log(`Код успешно прочитан, длина: ${sketchCode.length} символов`);
  
  // Настройка качества
  const crf = QUALITY === 'high' ? 18 : QUALITY === 'medium' ? 23 : 28;
  
  // Запускаем Remotion рендеринг
  try {
    // Собираем бандл
    console.log('Собираю бандл композиции...');
    const bundleLocation = await bundle(path.join(__dirname, 'src/remotion/index.tsx'));
    
    // Получаем композиции
    console.log('Получаю список композиций...');
    const compositions = await getCompositions(bundleLocation, {
      inputProps: { sketchCode }
    });
    
    // Находим нужную композицию
    const composition = compositions.find(c => c.id === 'MyVideo');
    
    if (!composition) {
      throw new Error('Композиция "MyVideo" не найдена');
    }
    
    // Настройки рендеринга
    const durationInFrames = FPS * DURATION_IN_SECONDS;
    
    console.log(`Начинаю рендеринг ${durationInFrames} кадров при ${FPS} FPS...`);
    console.log(`Размер видео: ${WIDTH}x${HEIGHT}`);
    console.log(`Качество: ${QUALITY} (CRF: ${crf})`);
    
    // Рендеринг видео
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
        process.stdout.write(`\rПрогресс: ${percent}%`);
      }
    });
    
    console.log('\nРендеринг завершен!');
    console.log(`Видео сохранено в: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('Ошибка при рендеринге:', error);
  }
}

renderVideo(); 