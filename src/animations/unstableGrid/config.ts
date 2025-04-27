// Configuration for the unstableGrid animation

// Example Text Lines
const defaultTextLines = [
  "COLOR",
  "SCHEMES",
  "", // Добавляем пустую строку для отступа
  "ARE",
  "COOL"
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

  // Grid Structure
  columnsCount: number; // Now calculated based on textLines
  cellsCount: number;   // Number of rows (can be more/less than textLines.length)
  includeOuterEdges: boolean;
  outerEdgePadding: number;
  minColumnWidth: number;  
  minCellHeight: number;   

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
  textLines: string[];       // Array of strings for vertical text
  fontFamily: string; 
  fontUrl: string;         // Path relative to project root for staticFile
  charsForTexture: string; // Characters for border textures
  textureSizePreview: number; // Size for browser preview
  textureSizeRender: number;  // Size for final render
  useHighResTextures: boolean; // Flag to choose render size
  textureUvEpsilon: number;// Inset for texture UVs to prevent edge bleeding (0 to 0.5)

  // Animation Timing
  updateIntervalFrames: number; // How often to calculate new random targets
  easingFunctionName: EasingFunctionName; // Имя выбранной easing-функции

  // Column Movement Target Range
  columnDisplacementFactor: number; // Max displacement fraction relative to original width

  // Cell Vertical Movement Target Range
  cellVerticalAmplitudeFactor: number; // Max displacement fraction relative to original cell height

  // Cell Horizontal Movement Target Range
  cellHorizontalAmplitudeFactor: number; // Max displacement fraction relative to original cell width
  cellPaddingX: number;               // Min padding from column edges for cell center X (px)
}

// Helper to calculate column count based on text lines
function calculateColumnsCount(lines: string[]): number {
    if (!lines || lines.length === 0) return 2; // Default minimum
    const maxLength = Math.max(...lines.map(line => line.length));
    return Math.max(2, maxLength + 1); // Ensure at least 2 columns, add 1 for potential spacing
}

// --- Default Configuration Values ---
export const config: UnstableGridConfig = {
  // Canvas/Render Settings
  width: 1080,
  height: 1920,
  fps: 60,
  durationInSeconds: 30, // Increased duration

  // Grid Structure
  columnsCount: calculateColumnsCount(defaultTextLines), // Calculate based on default lines
  cellsCount: 12, // USER CHANGE - Keep user's change, can be adjusted
  includeOuterEdges: true,
  outerEdgePadding: 0,
  minColumnWidth: 32, // Increased minimum width
  minCellHeight: 32,   // Increased minimum height

  // Colors
  colorSchemeName: 'dark_blue_red', // USER CHANGE
  
  // Text Content & Font
  textLines: defaultTextLines, // Use the example lines
  fontFamily: "Cascadia Code", 
  fontUrl: "/CascadiaCode.ttf", 
  charsForTexture: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*+-%", // Added some symbols
  textureSizePreview: 256,  // USER CHANGE
  textureSizeRender: 512,   
  useHighResTextures: false, 
  textureUvEpsilon: 0.01, 

  // Animation Timing
  updateIntervalFrames: 60, // Update targets every second
  easingFunctionName: 'easeInOutCubic', // Сменим дефолт для примера

  // Column Movement Target Range
  columnDisplacementFactor: 1.2, // Increased > 1 to allow wider range

  // Cell Vertical Movement Target Range
  cellVerticalAmplitudeFactor: 0.8, // Increased

  // Cell Horizontal Movement Target Range
  cellHorizontalAmplitudeFactor: 1.0, // Increased
  cellPaddingX: 1, // Drastically reduced
}; 