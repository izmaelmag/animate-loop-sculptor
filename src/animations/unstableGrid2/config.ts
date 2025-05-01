// Configuration for the unstableGrid2 animation (Point Grid based)

// Example Text Lines
const defaultTextLines = [
  "POINT",
  "GRID",
  "", // Пустая строка для отступа
  "FREEDOM"
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

  // Colors (New Structure)
  colorSchemeName: ColorSchemeName; // Имя выбранной схемы

  // REMOVED: colorPalette
  /*
  colorPalette: {
    primary: string;   // Used for word letters on odd rows
    secondary: string; // Used for word letters on even rows & border chars
  };
  */
  
  // Text Content & Font
  textLines: string[];       
  fontFamily: string; 
  fontUrl: string;         
  charsForTexture: string; 
  textureSizePreview: number; 
  textureSizeRender: number;  
  useHighResTextures: boolean; 
  textureUvEpsilon: number;

  // Animation Timing
  updateIntervalFrames: number; // How often to calculate new random targets
  easingFunctionName: EasingFunctionName; // Имя выбранной easing-функции

  // Point Movement Target Range (Replaces Column/Cell factors)
  pointDisplacementXFactor: number; // Max displacement fraction relative to original grid cell width
  pointDisplacementYFactor: number; // Max displacement fraction relative to original grid cell height
}

// Helper to calculate grid columns based on text lines
function calculateGridColumns(lines: string[]): number {
    if (!lines || lines.length === 0) return 2; 
    const maxLength = Math.max(...lines.map(line => line.length));
    return Math.max(2, maxLength); // Grid columns should match max text length
}

// Helper to calculate grid rows (can be independent or based on text)
function calculateGridRows(lines: string[]): number {
    // Example: at least number of lines + 1 for spacing, minimum 3 rows
    return Math.max(3, lines.length + 1); 
}

// --- Default Configuration Values ---
export const config: UnstableGridConfig = {
  // Canvas/Render Settings
  width: 1080,
  height: 1920,
  fps: 60,
  durationInSeconds: 30, 

  // Grid Structure
  gridColumns: calculateGridColumns(defaultTextLines), // Calculate based on default lines
  gridRows: calculateGridRows(defaultTextLines),       // Calculate based on default lines
  includeOuterEdges: true,
  outerEdgePadding: 150,

  // Colors
  colorSchemeName: 'dark_blue_red', 
  
  // Text Content & Font
  textLines: defaultTextLines, 
  fontFamily: "Cascadia Code", 
  fontUrl: "/CascadiaCode.ttf", 
  charsForTexture: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*+-%", 
  textureSizePreview: 256,  
  textureSizeRender: 512,   
  useHighResTextures: false, 
  textureUvEpsilon: 0.01, 

  // Animation Timing
  updateIntervalFrames: 60, 
  easingFunctionName: 'easeInOutCubic', 

  // Point Movement Target Range
  pointDisplacementXFactor: 0.8, // Example value
  pointDisplacementYFactor: 0.6, // Example value
}; 