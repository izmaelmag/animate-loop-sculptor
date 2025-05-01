// Configuration for the unstableGrid2 animation (Point Grid based)

// --- Scene / Timeline Structures ---

// Описание стиля ячейки
export interface CellStyle {
  color: string; // Основной цвет
  // Можно добавить: fontWeight, fontStyle и т.д.
}

// Описание содержимого ячейки в макете
export interface LayoutCell {
  char: string;  // Отображаемый символ
  styleId: string; // Идентификатор стиля из stylePresets
}

// Описание одной сцены на таймлайне
export interface AnimationScene {
  startFrame: number;     // Кадр начала сцены
  durationFrames?: number; // Опциональная длительность (иначе до след. сцены)
  layoutGrid: (LayoutCell | null)[][]; // 2D массив макета [row][col], null = filler
  stylePresets: Record<string, CellStyle>; // Набор стилей для этой сцены
}

// --- Example Timeline ---
// Определим цвета заранее для примера (используем цвета из 'dark_blue_red')
const primaryColor = "#E94560";   
const primaryDarkerColor = "#B3364E"; 
const secondaryColor = "#0F3460"; 
const whiteColor = "#FFFFFF";
const bgColor = "#1A1A2E"; // Фон

const defaultTimeline: AnimationScene[] = [
  // --- SCENE 1: "GRID" --- 
  {
    startFrame: 0,
    durationFrames: 120, // 2 секунды
    stylePresets: {
      'gridText': { color: primaryColor }, 
      'filler': { color: secondaryColor } 
    },
    layoutGrid: [
      // Адаптируем под размер сетки, который вычислится позже
      // Пример для сетки ~5x5 (или больше)
      [ null, null, null, null, null, null ],
      [ null, { char: 'G', styleId: 'gridText' }, { char: 'R', styleId: 'gridText' }, { char: 'I', styleId: 'gridText' }, { char: 'D', styleId: 'gridText' }, null ],
      [ null, null, null, null, null, null ],
      [ null, null, null, null, null, null ],
      [ null, null, null, null, null, null ],
    ]
  },
  // --- SCENE 2: "MORPH" --- 
  {
    startFrame: 120,
    durationFrames: 180, // 3 секунды
     stylePresets: {
      'morphNormal': { color: primaryColor }, 
      'morphDarker': { color: primaryDarkerColor }, 
      'filler': { color: secondaryColor } // Стиль для фона можно переопределить или оставить
    },
     layoutGrid: [
      [ null, null, null, null, null, null, null ],
      [ null, null, null, null, null, null, null ],
      [ null, { char: 'M', styleId: 'morphNormal' }, { char: 'O', styleId: 'morphDarker' }, { char: 'R', styleId: 'morphNormal' }, { char: 'P', styleId: 'morphDarker' }, { char: 'H', styleId: 'morphNormal' }, null ],
      [ null, null, null, null, null, null, null ],
      [ null, null, null, null, null, null, null ],
    ]
  },
  // --- SCENE 3: "DONE!" --- 
  {
    startFrame: 300, // Начинается после второй (120 + 180)
    // durationFrames: не указано, длится до конца
     stylePresets: {
      'done': { color: whiteColor }, 
      'exclam': { color: primaryColor }, 
      'filler': { color: secondaryColor } // Можно использовать другой цвет фона
    },
     layoutGrid: [
      [ null, null, null, null, null, null, null ],
      [ null, null, null, null, null, null, null ],
      [ null, null, { char: 'D', styleId: 'done' }, { char: 'O', styleId: 'done' }, { char: 'N', styleId: 'done' }, { char: 'E', styleId: 'done' }, { char: '!', styleId: 'exclam' } ],
      [ null, null, null, null, null, null, null ],
      [ null, null, null, null, null, null, null ],
    ]
  }
];

// --- Цветовые Схемы ---
interface ColorScheme {
  background: string;
  primary: string;    // Раньше colorPalette.primary
  primary_darker: string; // Добавлено: Оттенок primary потемнее
  secondary: string;  // Раньше colorPalette.secondary
}

// Определяем доступные имена схем
export type ColorSchemeName = 'dark_purple_lime' | 'dark_blue_red' | 'bright_coral_aqua' | 'muted_gray_blue';

// Коллекция схем
const colorSchemes: Record<ColorSchemeName, ColorScheme> = {
  dark_purple_lime: { // Оригинальная
    background: "#000000", // Черный
    primary: "#32CD32",    // Lime Green
    primary_darker: "#228B22", // ForestGreen как более темный Lime
    secondary: "#6A0DAD",   // Dark Purple
  },
  dark_blue_red: {
    background: "#1A1A2E", // Очень темный сине-фиолетовый
    primary: "#E94560",    // Яркий розово-красный
    primary_darker: "#B3364E", // Более темный красно-розовый
    secondary: "#0F3460",   // Темно-синий
  },
  bright_coral_aqua: {
    background: "#F5F5F5", // Почти белый
    primary: "#FF6B6B",    // Яркий коралл
    primary_darker: "#CD5C5C", // IndianRed как более темный коралл
    secondary: "#4ECDC4",   // Бирюзовый
  },
  muted_gray_blue: {
    background: "#E0E0E0", // Светло-серый
    primary: "#A0AEC0",    // Серо-голубой
    primary_darker: "#718096", // SlateGray (тот же, что secondary) как темный серо-голубой
    secondary: "#718096",   // Шиферно-серый
  }
};

// Функция для получения текущей активной схемы
export function getActiveColorScheme(name: ColorSchemeName): ColorScheme {
    return colorSchemes[name] || colorSchemes.dark_purple_lime; // Возвращаем дефолтную, если имя некорректно
}

// --- Easing Function Types ---
// Используем ключи из импортированного объекта easings (если бы могли импортировать типы)
// Пока перечислим вручную основные или все.
export type EasingFunctionName =
  | 'linear'
  | 'easeInSine' | 'easeOutSine' | 'easeInOutSine'
  | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
  | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic'
  | 'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart'
  | 'easeInQuint' | 'easeOutQuint' | 'easeInOutQuint'
  | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo'
  | 'easeInCirc' | 'easeOutCirc' | 'easeInOutCirc'
  | 'easeInBack' | 'easeOutBack' | 'easeInOutBack'
  | 'easeInElastic' | 'easeOutElastic' | 'easeInOutElastic'
  | 'easeInBounce' | 'easeOutBounce' | 'easeInOutBounce';

// --- Обновленный Интерфейс Конфигурации ---
export interface UnstableGridConfig {
  // Canvas/Render Settings
  width: number;
  height: number;
  fps: number;
  durationInSeconds: number;

  // Grid Structure (Point Grid)
  gridColumns: number; // Number of columns in the point grid
  gridRows: number;    // Number of rows in the point grid
  includeOuterEdges: boolean;
  outerEdgePadding: number;

  // Colors (ColorSchemeName может больше не использоваться напрямую для текста)
  colorSchemeName: ColorSchemeName; // Оставляем для фона или defaultStyle

  // --- НОВАЯ СЕКЦИЯ: Таймлайн Текста ---
  animationTimeline: AnimationScene[]; // Массив сцен
  fillerChars: string; // Символы для заполнения пустых ячеек
  defaultStyleId: string; // ID стиля по умолчанию для fillerChars (из первой сцены?)

  // REMOVED: textLines
  
  // Font & Textures
  fontFamily: string; 
  fontUrl: string;         
  // REMOVED: charsForTexture 
  textureSizePreview: number; 
  textureSizeRender: number;  
  useHighResTextures: boolean; 
  textureUvEpsilon: number;

  // Animation Timing
  updateIntervalFrames: number; 
  easingFunctionName: EasingFunctionName; 
  colorTransitionFrames: number; // NEW: Duration for color lerp

  // Point Movement Target Range
  pointDisplacementXFactor: number; 
  pointDisplacementYFactor: number; 
}

// Helper to calculate grid dimensions (можно сделать умнее, смотря на max layoutGrid размеры)
function calculateGridColumnsFromTimeline(timeline: AnimationScene[]): number {
    if (!timeline || timeline.length === 0) return 5;
    let maxCols = 0;
    for (const scene of timeline) {
        if (scene.layoutGrid && scene.layoutGrid.length > 0) {
            const sceneMaxCols = Math.max(...scene.layoutGrid.map(row => row?.length || 0));
            maxCols = Math.max(maxCols, sceneMaxCols);
        }
    }
    return Math.max(2, maxCols); // Минимум 2 колонки
}

function calculateGridRowsFromTimeline(timeline: AnimationScene[]): number {
    if (!timeline || timeline.length === 0) return 5;
    let maxRows = 0;
    for (const scene of timeline) {
        if (scene.layoutGrid) {
            maxRows = Math.max(maxRows, scene.layoutGrid.length);
        }
    }
     return Math.max(3, maxRows); // Минимум 3 ряда
}

// --- Default Configuration Values ---
export const config: UnstableGridConfig = {
  // Canvas/Render Settings
  width: 1080,
  height: 1920,
  fps: 60,
  durationInSeconds: 30, 

  // Grid Structure
  gridColumns: calculateGridColumnsFromTimeline(defaultTimeline), 
  gridRows: calculateGridRowsFromTimeline(defaultTimeline),      
  includeOuterEdges: true,
  outerEdgePadding: 150,

  // Colors
  colorSchemeName: 'dark_blue_red', // Используется для фона и, возможно, для defaultStyleId
  
  // Text Content & Font
  animationTimeline: defaultTimeline,
  fillerChars: ".,:;*+=", // Обновленные символы фона
  defaultStyleId: 'filler', // Используем стиль 'filler' для фона (должен быть в первой сцене)
  fontFamily: "Cascadia Code", 
  fontUrl: "/CascadiaCode.ttf", 
  textureSizePreview: 256,  
  textureSizeRender: 512,   
  useHighResTextures: false, 
  textureUvEpsilon: 0.01, 

  // Animation Timing
  updateIntervalFrames: 60, 
  easingFunctionName: 'easeInOutCubic', 
  colorTransitionFrames: 30, // NEW: Color transition over 0.5 seconds (at 60fps)

  // Point Movement Target Range
  pointDisplacementXFactor: 0.8, 
  pointDisplacementYFactor: 0.6, 
}; 