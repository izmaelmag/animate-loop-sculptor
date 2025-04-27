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

  // Column Noise (Horizontal movement of vertical division lines)
  columnNoiseOffset: number;    // Base noise offset between columns
  columnNoiseFrequency: number; // Frequency/scale of column noise pattern
  columnNoiseSpeed: number;     // Speed of column noise evolution over time
  columnDisplacementFactor: number; // Max displacement fraction of original column width

  // Cell Noise - Vertical (Y movement of horizontal division lines)
  cellVerticalAmplitudeFactor: number; // Multiplier for base vertical cell amplitude
  cellNoiseOffsetY: number;           // Noise offset for vertical cell movement
  cellNoiseFrequencyY: number;      // Frequency/scale of vertical cell noise
  cellNoiseSpeedY: number;          // Speed of vertical cell noise evolution

  // Cell Noise - Horizontal (X movement of cell centers within columns)
  cellHorizontalAmplitudeFactor: number; // Multiplier for base horizontal cell amplitude
  cellNoiseOffsetX: number;           // Noise offset for horizontal cell movement
  cellNoiseFrequencyX: number;      // Frequency/scale of horizontal cell noise
  cellNoiseSpeedX: number;          // Speed of horizontal cell noise evolution
  cellPaddingX: number;               // Min padding from column edges for cell center X (px)
}

// --- Default Configuration Values ---
export const config: UnstableGridConfig = {
  // Canvas/Render Settings
  width: 1080,
  height: 1920,
  fps: 60,
  durationInSeconds: 30, // Increased duration

  // Grid Structure
  columnsCount: WORD.length + 1,
  cellsCount: Math.floor(1.6 * WORD.length) + 1,
  includeOuterEdges: true,
  outerEdgePadding: 150,
  minColumnWidth: 32, // Previously hardcoded in unstableGrid.ts animation fn
  minCellHeight: 5,   // Previously hardcoded in Columns.ts update fn

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

  // Column Noise (Horizontal movement of vertical division lines)
  columnNoiseOffset: -20,     // Base offset affecting both cell X/Y noise as well? Check usage.
  columnNoiseFrequency: 1.5,  // Controls "waviness" of column lines
  columnNoiseSpeed: 25,       // How fast column lines change shape
  columnDisplacementFactor: 0.8, // How far column lines can move horizontally

  // Cell Noise - Vertical (Y movement of horizontal division lines)
  cellVerticalAmplitudeFactor: 0.6, // How much vertical stretch/squish
  cellNoiseOffsetY: -20,            // Offset specifically for Y noise (currently same as column offset)
  cellNoiseFrequencyY: 0.5,       // Controls "waviness" of horizontal cell lines
  cellNoiseSpeedY: 15,            // How fast horizontal cell lines change shape

  // Cell Noise - Horizontal (X movement of cell centers within columns)
  cellHorizontalAmplitudeFactor: 0.8, // How much cells move side-to-side
  cellNoiseOffsetX: -20 + 0.5,        // Offset specifically for X noise (currently based on column offset)
  cellNoiseFrequencyX: 0.6,         // Controls "waviness" of horizontal cell movement
  cellNoiseSpeedX: 20,              // How fast cells move side-to-side
  cellPaddingX: 10,                 // Previously hardcoded in Columns.ts update fn
}; 