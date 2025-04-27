import p5 from "p5";

// --- Color Definitions ---
const DARK_PURPLE = "#6A0DAD";
const LIME_GREEN = "#32CD32";

/**
 * Configuration interface for the unstableGrid animation.
 */
export interface UnstableGridConfig {
  // Canvas and Timing
  WIDTH: number;
  HEIGHT: number;
  FPS: number;
  DURATION_SECONDS: number; // Renamed from DURATION

  // Grid Structure
  columnsCount: number;
  cellsCount: number;

  // Column Noise (Horizontal Lines Movement)
  columnNoiseFrequency: number;
  columnNoiseSpeed: number;
  columnDisplacementFactor: number; // Max displacement as fraction of base column width
  minColumnWidthPixels: number; // Renamed from the hardcoded 96

  // Cell Noise (Vertical Boundaries Movement)
  cellAmplitudeY: number; // Base amplitude (pixels or factor?) - Let\'s stick to factor based on cell height
  cellNoiseOffsetY: number; // Noise offset between columns
  cellNoiseFrequencyY: number;
  cellNoiseSpeedY: number;
  minCellHeightPixels: number; // Renamed from the hardcoded 5

  // Cell Noise (Horizontal Center Movement)
  cellAmplitudeXFactor: number; // Amplitude as a factor of cell height
  cellNoiseOffsetX: number; // Noise offset between columns (can differ from Y)
  cellNoiseFrequencyX: number;
  cellNoiseSpeedX: number;
  cellPaddingXPixels: number; // Renamed from the hardcoded 10

  // Outer Grid Behavior
  includeOuterEdges: boolean;
  outerEdgePadding: number;

  // Text Rendering
  targetWord: string;
  charsForTextures: string;
  textureSizePixels: number; // Renamed from finalTextureSize
  fontName: string; // Font family name used in CSS and p5

  // Colors
  colorPalette: string[];
  wordColor1: string;
  wordColor2: string;
  borderColor: string;
}

/**
 * Default configuration values for the unstableGrid animation.
 */
export const defaultConfig: UnstableGridConfig = {
  // Canvas and Timing
  WIDTH: 1080,
  HEIGHT: 1920,
  FPS: 60,
  DURATION_SECONDS: 30, // Updated duration

  // Grid Structure
  columnsCount: 8,
  cellsCount: 8,

  // Column Noise (Horizontal Lines Movement)
  columnNoiseFrequency: 1.5,
  columnNoiseSpeed: 25,
  columnDisplacementFactor: 0.8, 
  minColumnWidthPixels: 96, // From previous hardcoded value

  // Cell Noise (Vertical Boundaries Movement)
  // Calculate base amplitude relative to initial cell height
  cellAmplitudeY: (1920 / 8) * 0.6, // Base amplitude calculated from factor 0.6
  cellNoiseOffsetY: -20, 
  cellNoiseFrequencyY: 0.5,
  cellNoiseSpeedY: 15,
  minCellHeightPixels: 5, // From previous hardcoded value

  // Cell Noise (Horizontal Center Movement)
  cellAmplitudeXFactor: 0.8, // Keep as factor for now
  cellNoiseOffsetX: -20 + 0.5, // Use separate offset 
  cellNoiseFrequencyX: 0.6,
  cellNoiseSpeedX: 20,
  cellPaddingXPixels: 10, // From previous hardcoded value

  // Outer Grid Behavior
  includeOuterEdges: true,
  outerEdgePadding: 150,

  // Text Rendering
  targetWord: "PARADOX",
  charsForTextures: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 
  textureSizePixels: 256, 
  fontName: 'Cascadia Code',

  // Colors - Assign specific roles
  colorPalette: [DARK_PURPLE, LIME_GREEN], // Keep palette if needed elsewhere
  wordColor1: LIME_GREEN, // e.g., for even rows
  wordColor2: DARK_PURPLE, // e.g., for odd rows
  borderColor: DARK_PURPLE, // Color for border cells
}; 