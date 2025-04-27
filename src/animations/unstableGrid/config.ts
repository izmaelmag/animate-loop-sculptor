// Configuration for the unstableGrid animation

export const WORD = "PARADOX";

export interface UnstableGridConfig {
  // Canvas/Render Settings
  width: number;
  height: number;
  fps: number;
  durationInSeconds: number;

  // Grid Structure
  columnsCount: number;
  cellsCount: number;
  includeOuterEdges: boolean;
  outerEdgePadding: number;
  minColumnWidth: number;  
  minCellHeight: number;   

  // Colors
  colorPalette: {
    primary: string;   // Used for word letters on odd rows
    secondary: string; // Used for word letters on even rows & border chars
  };
  
  // Text Content & Font
  targetWord: string;
  fontFamily: string; 
  fontUrl: string;         // Path relative to project root for staticFile
  charsForTexture: string; // Characters for border textures
  textureSizePreview: number; // Size for browser preview
  textureSizeRender: number;  // Size for final render
  useHighResTextures: boolean; // Flag to choose render size
  textureUvEpsilon: number;// Inset for texture UVs to prevent edge bleeding (0 to 0.5)

  // Animation Timing
  updateIntervalFrames: number; // How often to calculate new random targets
  easingFactor: number;         // Controls the amount of ease-in-out (e.g., 1=linear, 2=quadratic)

  // Column Movement Target Range
  columnDisplacementFactor: number; // Max displacement fraction relative to original width

  // Cell Vertical Movement Target Range
  cellVerticalAmplitudeFactor: number; // Max displacement fraction relative to original cell height

  // Cell Horizontal Movement Target Range
  cellHorizontalAmplitudeFactor: number; // Max displacement fraction relative to original cell width
  cellPaddingX: number;               // Min padding from column edges for cell center X (px)
}

// --- Default Configuration Values ---
export const config: UnstableGridConfig = {
  // Canvas/Render Settings
  width: 1080,
  height: 1920,
  fps: 60,
  durationInSeconds: 5, // Increased duration

  // Grid Structure
  columnsCount: WORD.length + 1,
  cellsCount: Math.floor(1.6 * WORD.length) + 1,
  includeOuterEdges: true,
  outerEdgePadding: 150,
  minColumnWidth: 1, // Drastically reduced
  minCellHeight: 1,   // Drastically reduced

  // Colors
  colorPalette: {
    primary: "#32CD32",   // LIME_GREEN (for even rows of the word)
    secondary: "#6A0DAD", // DARK_PURPLE (for odd rows of the word and borders)
  },
  
  // Text Content & Font
  targetWord: WORD,
  fontFamily: "Cascadia Code", // Should match CSS/FontFace setup
  fontUrl: "/CascadiaCode.ttf", // Path used in MyVideo.tsx FontFace API
  charsForTexture: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  textureSizePreview: 64,  // Lower resolution for preview
  textureSizeRender: 512,   // Higher resolution for render
  useHighResTextures: false, // Default to preview quality
  textureUvEpsilon: 0.01, 

  // Animation Timing
  updateIntervalFrames: 60, // Update targets every second
  easingFactor: 2, // Quadratic ease-in-out by default

  // Column Movement Target Range
  columnDisplacementFactor: 1.2, // Increased > 1 to allow wider range

  // Cell Vertical Movement Target Range
  cellVerticalAmplitudeFactor: 0.8, // Increased

  // Cell Horizontal Movement Target Range
  cellHorizontalAmplitudeFactor: 1.0, // Increased
  cellPaddingX: 1, // Drastically reduced
}; 