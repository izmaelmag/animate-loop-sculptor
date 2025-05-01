import p5 from "p5";
import { AnimationSettings, AnimationFunction } from "@/types/animations";
import { createNoise2D } from "simplex-noise";
import {
  Rectangle,
  Line,
  Point,
  Color,
  defaultRectangleRenderer,
  RectangleRenderFunction,
  RectangleMetadata,
} from "./Rectangle";
import { generateAlphabetTextures } from "../../utils/textureUtils";
import {
  config,
  getActiveColorScheme,
  ColorSchemeName,
  EasingFunctionName,
} from "./config";
import { AnimationScene } from './timeline';
import { easings } from "../../utils/easing";

// --- Font Loading ---
// Remove preload logic - rely on CSS loading via index.html
// let cascadiaFont: p5.Font;
// const CASCADIA_CODE_URL = '...';
// function preloadAnimation(p: p5) { ... }

// --- Color Definitions ---
// const DARK_PURPLE = "#6A0DAD";
// const LIME_GREEN = "#32CD32";
// const COLOR_PALETTE: string[] = [DARK_PURPLE, LIME_GREEN];

// Global variable to hold the generated textures
// let alphabetTextures: Record<string, p5.Graphics> = {};
// const CHARS_FOR_TEXTURES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Same chars as in generator

// --- Removed Constants (defined in config) ---
// const FPS = 60;
// const WIDTH = 1080;
// const HEIGHT = 1920;
// const DURATION = 30;
// export const columnsCount = 8;
// export const cellsCount = 8;
// const cellAmplitude = HEIGHT / cellsCount * 1; // Recalculate base amplitude inside setup
// const columnNoiseOffset = -20;
// const columnNoiseFrequency = 1.5;
// const columnNoiseSpeed = 25;
// const columnDisplacementFactor = 0.8;
// const gridInsetColumns = 0;
// const gridInsetRows = 0;
// const includeOuterEdges = true;
// const outerEdgePadding = 150;

// --- Use config values directly or recalculate based on config ---
const DURATION = config.durationInSeconds;
const FPS = config.fps;
let cellAmplitude: number; // This is also likely unused now

// --- State Variables for Point Grid, Timeline & Colors ---
let noise2D: ReturnType<typeof createNoise2D>;
let originalPoints: Point[][] = [];
let previousPoints: Point[][] = [];
let targetPoints: Point[][] = [];
let currentPoints: Point[][] = []; // Holds the interpolated points
let rectangles: Rectangle[] = [];
let alphabetTextures: Record<string, p5.Graphics> = {};
let activeColorScheme = getActiveColorScheme(config.colorSchemeName);

// Timeline state
let currentSceneIndex = -1;
let activeScene: AnimationScene | null = null; 
let allNeededChars = ""; // String containing all unique characters for textures

// Color state
let previousCellColors: p5.Color[][] = [];
let targetCellColors: p5.Color[][] = [];
let currentCellColors: p5.Color[][] = [];
let colorLerpProgress = 1; // NEW: Progress for color interpolation (0 to 1)

// --- Easing Functions ---
// REMOVED inline definitions
/*
const easingFunctions: Record<EasingFunctionName, (t: number) => number> = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};
*/

// Helper to get the active function from the imported object
function getActiveEasingFunction(): (t: number) => number {
  const functionName = config.easingFunctionName;
  // Check if the functionName is a valid key in the imported easings object
  if (Object.prototype.hasOwnProperty.call(easings, functionName)) {
    return easings[functionName as keyof typeof easings];
  }
  // If not found, log a warning and fallback to linear
  console.warn(
    `Easing function "${functionName}" not found in easings object. Falling back to linear.`
  );
  // Assume 'linear' function exists in the easings object for fallback
  // If 'linear' might be missing, add another check here.
  return easings["linear" as keyof typeof easings] || ((t: number) => t); // Fallback to identity if even linear is missing
}

// --- lerpPoint Helper ---
function lerpPoint(p: p5, p1: Point, p2: Point, t: number): Point {
    return {
        x: p.lerp(p1.x, p2.x, t),
        y: p.lerp(p1.y, p2.y, t),
    };
}

// --- Bilinear Interpolation Helper for Points (NEW) ---
function bilinearInterpolatePoint(p: p5, tl: Point, tr: Point, br: Point, bl: Point, u: number, v: number): Point {
    const p1 = lerpPoint(p, tl, tr, u); // Interpolate top edge
    const p2 = lerpPoint(p, bl, br, u); // Interpolate bottom edge
    return lerpPoint(p, p1, p2, v);      // Interpolate vertically
}

// --- Helper to get color from hex string ---
function colorFromHex(p: p5, hex: string): p5.Color {
    try {
        return p.color(hex);
    } catch (e) {
        console.warn(`Invalid hex color string: "${hex}". Using black.`, e);
        return p.color(0); // Fallback to black
    }
}

// --- Textured Rectangle Renderer (Supports Subdivision) ---
const renderTexturedRectangle: RectangleRenderFunction = (
  p: p5,
  _normalizedTime: number,
  _lines: Line[],
  _intersection: Point | null,
  vertices: Point[], // Expecting [topLeft, topRight, bottomRight, bottomLeft]
  _color: Color, 
  metadata: RectangleMetadata | null
): void => {
  const col = metadata?.colTopLeft; 
  const row = metadata?.rowTopLeft; 
  const rectIndex = metadata?.rectIndex; 

  if (col === undefined || row === undefined || vertices.length !== 4 || rectIndex === undefined || !activeScene) return;
  
  let letter: string | null = null;
  const layoutCell = activeScene.layoutGrid?.[row]?.[col];
  if (layoutCell) { 
    letter = layoutCell.char;
  } else { 
    if (config.fillerChars && config.fillerChars.length > 0) {
        const charIndex = (rectIndex + col + row) % config.fillerChars.length;
        letter = config.fillerChars[charIndex];
    } else {
        letter = " "; 
    }
  }

  const interpolatedColor = currentCellColors?.[row]?.[col];
  if (!interpolatedColor) {
    return; 
  }
  
  if (letter) {
    const texture = alphabetTextures[letter];
    if (texture) {
      p.push();
      p.tint(interpolatedColor);
      p.textureMode(p.NORMAL); 
      p.textureWrap(p.CLAMP);
      p.texture(texture);
      p.noStroke();

      const N = Math.max(1, Math.floor(config.subdivisionLevel)); // Ensure N >= 1
      const UV_EPSILON = config.textureUvEpsilon;
      
      // Original corner vertices
      const [tl_v, tr_v, br_v, bl_v] = vertices;
      
      // Iterate through the sub-grid
      for (let j = 0; j < N; j++) { // Vertical subdivisions
        for (let i = 0; i < N; i++) { // Horizontal subdivisions
            // Calculate normalized u, v for the four corners of the sub-quad
            const u0 = i / N;
            const u1 = (i + 1) / N;
            const v0 = j / N;
            const v1 = (j + 1) / N;

            // Calculate vertex positions using bilinear interpolation
            const sub_tl = bilinearInterpolatePoint(p, tl_v, tr_v, br_v, bl_v, u0, v0);
            const sub_tr = bilinearInterpolatePoint(p, tl_v, tr_v, br_v, bl_v, u1, v0);
            const sub_br = bilinearInterpolatePoint(p, tl_v, tr_v, br_v, bl_v, u1, v1);
            const sub_bl = bilinearInterpolatePoint(p, tl_v, tr_v, br_v, bl_v, u0, v1);

            // Calculate UV coordinates with epsilon
            const uv_tl_u = p.lerp(UV_EPSILON, 1 - UV_EPSILON, u0);
            const uv_tl_v = p.lerp(UV_EPSILON, 1 - UV_EPSILON, v0);
            const uv_tr_u = p.lerp(UV_EPSILON, 1 - UV_EPSILON, u1);
            const uv_tr_v = p.lerp(UV_EPSILON, 1 - UV_EPSILON, v0);
            const uv_br_u = p.lerp(UV_EPSILON, 1 - UV_EPSILON, u1);
            const uv_br_v = p.lerp(UV_EPSILON, 1 - UV_EPSILON, v1);
            const uv_bl_u = p.lerp(UV_EPSILON, 1 - UV_EPSILON, u0);
            const uv_bl_v = p.lerp(UV_EPSILON, 1 - UV_EPSILON, v1);

            // Draw the sub-quad
            p.beginShape();
            p.vertex(sub_tl.x, sub_tl.y, uv_tl_u, uv_tl_v);
            p.vertex(sub_tr.x, sub_tr.y, uv_tr_u, uv_tr_v);
            p.vertex(sub_br.x, sub_br.y, uv_br_u, uv_br_v);
            p.vertex(sub_bl.x, sub_bl.y, uv_bl_u, uv_bl_v);
            p.endShape(p.CLOSE);
        }
      }
      
      p.noTint();
      p.pop();
    }
  }
};

const renderRectangle: RectangleRenderFunction = renderTexturedRectangle;

// Easing function (easeInOut Quadratic)
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function easeInOutPower(t: number, power: number): number {
  t = Math.max(0, Math.min(1, t)); // Clamp t to [0, 1]
  if (t < 0.5) {
    return Math.pow(2, power - 1) * Math.pow(t, power);
  } else {
    return 1 - Math.pow(-2 * t + 2, power) / 2;
  }
}

// --- Setup Grid Points ---
function setupGridPoints(p: p5) {
  originalPoints = [];
  previousPoints = [];
  targetPoints = [];
  currentPoints = [];

  const gridW = config.width;
  const gridH = config.height;
  const cols = config.gridColumns;
  const rows = config.gridRows;
  const cellWidth = gridW / cols;
  const cellHeight = gridH / rows;

  for (let j = 0; j <= rows; j++) {
    // Iterate rows (Y)
    originalPoints[j] = [];
    previousPoints[j] = [];
    targetPoints[j] = [];
    currentPoints[j] = [];
    for (let i = 0; i <= cols; i++) {
      // Iterate columns (X)
      const x = i * cellWidth;
      const y = j * cellHeight;
      const point = { x, y };
      originalPoints[j][i] = { ...point };
      previousPoints[j][i] = { ...point };
      targetPoints[j][i] = { ...point }; // Initial target is original
      currentPoints[j][i] = { ...point };
    }
  }
  setupRectangles(); // Setup rectangles based on initial points
}

// --- Setup Rectangles (using Point Grid) ---
function setupRectangles() {
  rectangles = [];
  const cols = config.gridColumns;
  const rows = config.gridRows;

  // Add padding calculation if needed (maybe not if includeOuterEdges is false)
  const minX = config.includeOuterEdges ? -config.outerEdgePadding : 0;
  const maxX = config.includeOuterEdges
    ? config.width + config.outerEdgePadding
    : config.width;
  const minY = config.includeOuterEdges ? -config.outerEdgePadding : 0;
  const maxY = config.includeOuterEdges
    ? config.height + config.outerEdgePadding
    : config.height;

  // Iterate through the cells (not points) to create rectangles
  for (let j = 0; j < rows; j++) {
    // Cell rows
    for (let i = 0; i < cols; i++) {
      // Cell columns
      // Get the 4 corner points for this cell
      const topLeft = currentPoints[j][i];
      const topRight = currentPoints[j][i + 1];
      const bottomRight = currentPoints[j + 1][i + 1];
      const bottomLeft = currentPoints[j + 1][i];

      const rect = new Rectangle(topLeft, topRight, bottomRight, bottomLeft);
      rect.setMetadata({
        colTopLeft: i, // Grid cell column index
        rowTopLeft: j, // Grid cell row index
        colBottomRight: i + 1,
        rowBottomRight: j + 1,
      });
      rectangles.push(rect);

      // TODO: Add handling for outer edge rectangles if includeOuterEdges is true?
      // This might involve creating rectangles using points outside the main grid.
      // For now, focusing on the internal grid.
    }
  }
}

// --- Update Rectangles (using Point Grid) ---
function updateRectangles() {
  let rectIndex = 0;
  const cols = config.gridColumns;
  const rows = config.gridRows;

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      if (rectIndex < rectangles.length) {
        const rect = rectangles[rectIndex];
        // Get updated points from currentPoints
        const topLeft = currentPoints[j][i];
        const topRight = currentPoints[j][i + 1];
        const bottomRight = currentPoints[j + 1][i + 1];
        const bottomLeft = currentPoints[j + 1][i];
        rect.setVertices(topLeft, topRight, bottomRight, bottomLeft);
      }
      rectIndex++;
    }
  }
  // TODO: Update outer edge rectangles if implemented
}

// --- Calculate New Target Points ---
function calculateNewTargetPoints(p: p5) {
  const cols = config.gridColumns;
  const rows = config.gridRows;
  const cellWidth = config.width / cols;
  const cellHeight = config.height / rows;
  const maxDispX = cellWidth * config.pointDisplacementXFactor;
  const maxDispY = cellHeight * config.pointDisplacementYFactor;

  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      // Keep boundary points fixed (or allow limited movement later)
      if (i === 0 || i === cols || j === 0 || j === rows) {
        targetPoints[j][i] = { ...originalPoints[j][i] };
        continue; // Skip inner logic for boundary points
      }

      // Calculate random displacement for interior points
      const randomX = p.random(-1, 1);
      const randomY = p.random(-1, 1);

      const displacementX = randomX * maxDispX;
      const displacementY = randomY * maxDispY;

      // TODO: Add collision avoidance or stricter limits?
      // For now, just apply displacement to original position.
      // Could limit displacement based on distance to original neighbors.

      targetPoints[j][i] = {
        x: originalPoints[j][i].x + displacementX,
        y: originalPoints[j][i].y + displacementY,
      };
    }
  }
}

// --- Calculate Target Cell Colors (NEW) ---
function calculateTargetCellColors(p: p5) {
    if (!activeScene) return; // Need an active scene

    const rows = config.gridRows;
    const cols = config.gridColumns;
    const fallbackColor = colorFromHex(p, activeColorScheme.secondary); // Fallback color

    for (let r = 0; r < rows; r++) {
        if (!targetCellColors[r]) targetCellColors[r] = []; // Initialize row if needed
        for (let c = 0; c < cols; c++) {
            let targetHex: string | null = null;
            let styleId: string | null = null;
            const layoutCell = activeScene.layoutGrid?.[r]?.[c];

            if (layoutCell) { 
                styleId = layoutCell.styleId;
            } else { 
                styleId = config.defaultStyleId; 
            }

            const stylePreset = activeScene.stylePresets?.[styleId || config.defaultStyleId];
            if (stylePreset && stylePreset.color) {
                targetHex = stylePreset.color;
            } 
            
            // Store p5.Color object
            targetCellColors[r][c] = targetHex ? colorFromHex(p, targetHex) : fallbackColor;
        }
    }
}

// --- Initialize Cell Colors (NEW) ---
function initializeCellColors(p: p5) {
    const rows = config.gridRows;
    const cols = config.gridColumns;
    previousCellColors = [];
    targetCellColors = [];
    currentCellColors = [];
    
    // Determine initial active scene (assuming scene 0 starts at frame 0)
    activeScene = config.animationTimeline.find(scene => scene.startFrame === 0) || config.animationTimeline[0] || null;
    
    if (!activeScene) {
        console.error("Cannot initialize colors: No initial scene found (startFrame 0)!");
        // Initialize with a default color if no scene
        const defaultColor = colorFromHex(p, activeColorScheme.background); 
        for (let r = 0; r < rows; r++) {
            previousCellColors[r] = new Array(cols).fill(defaultColor);
            targetCellColors[r] = new Array(cols).fill(defaultColor);
            currentCellColors[r] = new Array(cols).fill(defaultColor);
        }
        activeScene = null; // Ensure activeScene is null if initialization failed partially
        return;
    }
    
    currentSceneIndex = config.animationTimeline.indexOf(activeScene);
    console.log(`Initializing colors based on scene ${currentSceneIndex}`);

    // Calculate initial target colors using the initial active scene
    calculateTargetCellColors(p);

    // Initialize all arrays with the initial target colors
    for (let r = 0; r < rows; r++) {
        previousCellColors[r] = [...targetCellColors[r]]; 
        currentCellColors[r] = [...targetCellColors[r]]; 
    }
    colorLerpProgress = 1; // Start fully transitioned
}

// --- Animation Loop (Integrate Color Lerp) --- 
const animation: AnimationFunction = (p: p5, normalizedTime: number, currentFrameNum: number): void => {
  // Log current frame number at the very beginning (first 200 frames)
  if (currentFrameNum < 200) {
      console.log(`[Animation Entry] Frame: ${currentFrameNum}`);
  }

  p.background(activeColorScheme.background);
  p.translate(-config.width / 2, -config.height / 2);

  // --- Find Active Scene --- 
  let newSceneIndex = -1;
  // Log entering the loop on specific frames for debugging
  if (currentFrameNum === 0 || currentFrameNum === 119 || currentFrameNum === 120 || currentFrameNum === 299 || currentFrameNum === 300) {
      console.log(`[Scene Search] Frame ${currentFrameNum}: Searching for scene...`);
  }
  for (let i = config.animationTimeline.length - 1; i >= 0; i--) {
      const scene = config.animationTimeline[i];
      const check = currentFrameNum >= scene.startFrame;
      // Log check results on specific frames
      if (currentFrameNum === 0 || currentFrameNum === 119 || currentFrameNum === 120 || currentFrameNum === 299 || currentFrameNum === 300) {
          console.log(`[Scene Search]   Checking scene ${i} (start: ${scene.startFrame}): ${currentFrameNum} >= ${scene.startFrame} is ${check}`);
      }
      if (check) {
          newSceneIndex = i;
          // Log when found on specific frames
          if (currentFrameNum === 0 || currentFrameNum === 119 || currentFrameNum === 120 || currentFrameNum === 299 || currentFrameNum === 300) {
              console.log(`[Scene Search]   Found potential scene: ${i}`);
          }
          break; // Found the latest applicable scene
      }
  }
  // Log the final result for specific frames
  if (currentFrameNum === 0 || currentFrameNum === 119 || currentFrameNum === 120 || currentFrameNum === 299 || currentFrameNum === 300) {
      console.log(`[Scene Search] Frame ${currentFrameNum}: Final newSceneIndex = ${newSceneIndex}`);
  }

  const sceneChanged = newSceneIndex !== currentSceneIndex;
  if (sceneChanged) {
      currentSceneIndex = newSceneIndex;
      if (currentSceneIndex !== -1) {
          const newActiveScene = config.animationTimeline[currentSceneIndex];
          if (newActiveScene) {
              // --- Scene Change: Update Color Targets --- 
              // 1. Store current colors as previous
              previousCellColors = currentCellColors.map(row => [...row]);
              // 2. Set new active scene
              activeScene = newActiveScene;
              // 3. Calculate new target colors based on the *new* scene
              calculateTargetCellColors(p);
              colorLerpProgress = 0; // RESET color lerp progress on scene change
              console.log(`[Animation Loop] Switched to scene ${currentSceneIndex} at frame ${currentFrameNum}. Updated target colors.`);
          } else {
              activeScene = null; // Scene index valid but scene data missing?
          }
      } else {
          // --- No Scene Active --- 
          // Optionally set previous/target colors to background?
          previousCellColors = currentCellColors.map(row => [...row]); // Keep last color as prev
          const bgColor = colorFromHex(p, activeColorScheme.background);
          targetCellColors = previousCellColors.map(row => new Array(row.length).fill(bgColor)); // Target is background
          activeScene = null; 
          console.log(`[Animation Loop] No scene active at frame ${currentFrameNum}`);
      }
  } else if (currentSceneIndex === -1 && newSceneIndex === -1) {
       // Handle case where no scene is active initially or becomes inactive
       // Optionally reset color lerp progress here too if needed
  }

  // Log active scene status AFTER potential update
  if (currentFrameNum === 0 || sceneChanged) { 
      console.log(`[Animation Loop Status] Frame ${currentFrameNum}, Active Scene Index: ${currentSceneIndex}, Active Scene Exists: ${!!activeScene}`);
  }

  // --- Update Point Targets & Interpolate Points ---
  const updateInterval = config.updateIntervalFrames;
  const isUpdateFrame = currentFrameNum % updateInterval === 0;
  
  if (isUpdateFrame || currentFrameNum === 0) { 
      previousPoints = currentPoints.map(row => row.map(pt => ({...pt})));
      calculateNewTargetPoints(p); 
      // Log target vs previous point on update frame
      if (currentPoints.length > 1 && currentPoints[1].length > 1) { // Check array bounds
        console.log(`[Update Frame ${currentFrameNum}] PrevPt[1][1]:`, previousPoints[1][1], `TargetPt[1][1]:`, targetPoints[1][1]);
      }
  }

  const progressInInterval = (currentFrameNum % updateInterval) / updateInterval;
  const activeEase = getActiveEasingFunction();
  const positionLerpFactor = activeEase(progressInInterval); // Factor for points

  for (let j = 0; j < currentPoints.length; j++) {
      for (let i = 0; i < currentPoints[j].length; i++) {
          currentPoints[j][i] = lerpPoint(p, previousPoints[j][i], targetPoints[j][i], positionLerpFactor);
      }
  }

  // --- Interpolate Colors (Using dedicated progress) --- 
  if (colorLerpProgress < 1) {
      colorLerpProgress = Math.min(1, colorLerpProgress + 1 / config.colorTransitionFrames);
  }
  const colorLerpFactor = activeEase(colorLerpProgress); // Use the same easing for color

  if (previousCellColors.length === config.gridRows && targetCellColors.length === config.gridRows) {
      for (let r = 0; r < config.gridRows; r++) {
          if (!currentCellColors[r]) currentCellColors[r] = []; // Ensure row exists
          for (let c = 0; c < config.gridColumns; c++) {
              if (previousCellColors[r]?.[c] && targetCellColors[r]?.[c]) { 
                  currentCellColors[r][c] = p.lerpColor(previousCellColors[r][c], targetCellColors[r][c], colorLerpFactor);
              } else if (!currentCellColors[r]?.[c]) {
                  // Initialize if missing, perhaps with background
                  currentCellColors[r][c] = colorFromHex(p, activeColorScheme.background); 
              }
          }
      }
  } else {
      // console.warn("Color array dimension mismatch, skipping color lerp");
  }

  // --- Update Geometry & Render --- 
  updateRectangles(); 

  if (activeScene) { 
      rectangles.forEach((rect, index) => {
        const metadata = rect.getMetadata();
        if (metadata && metadata.rowTopLeft < currentCellColors.length && metadata.colTopLeft < currentCellColors[metadata.rowTopLeft]?.length) { // Check bounds
            metadata.rectIndex = index; 
            renderRectangle(p, normalizedTime, rect.getLines(), rect.getDiagonalIntersection(), rect.getVertices(), rect.getColor(), metadata);
        } 
      });
  } 
};

// --- Setup Function (Update Texture Generation) ---
const setupAnimation: AnimationFunction = (p: p5): void => {
  activeColorScheme = getActiveColorScheme(config.colorSchemeName);
  console.log(`Using color scheme: ${config.colorSchemeName}`);
  p.background(activeColorScheme.background);
  p.frameRate(config.fps);
  noise2D = createNoise2D();

  // --- Collect all unique characters needed for textures ---
  const chars = config.fillerChars || " ";
  const charSet = new Set<string>(chars.split(''));
  
  config.animationTimeline.forEach(scene => {
    if (scene.layoutGrid) {
      scene.layoutGrid.forEach(row => {
        if (row) {
          row.forEach(cell => {
            if (cell && cell.char) {
              charSet.add(cell.char);
            }
          });
        }
      });
    }
  });
  allNeededChars = Array.from(charSet).join('');
  
  if (typeof allNeededChars !== 'string' || allNeededChars.length === 0) {
    console.warn("No valid characters found for textures, using fallback space.")
    allNeededChars = " ";
  }
  console.log("Characters needed for textures:", allNeededChars);

  // --- Generate textures ---
  const selectedTextureSize = config.useHighResTextures ? config.textureSizeRender : config.textureSizePreview;
  console.log(`Using texture size: ${selectedTextureSize}x${selectedTextureSize}`);
  
  if (typeof allNeededChars === 'string') {
    // Use the collected allNeededChars string here
    alphabetTextures = generateAlphabetTextures(p, selectedTextureSize, config.fontFamily, allNeededChars);
  } else {
    console.error("Critical error: allNeededChars is not a string before generating textures!");
    alphabetTextures = generateAlphabetTextures(p, selectedTextureSize, config.fontFamily, "? ");
  }
  
  // ... Initialize Grid & Scene ...
  setupGridPoints(p);
  currentSceneIndex = -1;
  activeScene = null;

  console.log("Setup complete using config (Timeline). Textures generated:", Object.keys(alphabetTextures).length);
  console.log("Rectangles created:", rectangles.length);

  // Initialize cell colors
  initializeCellColors(p);
};

// Now declare the settings after animation is defined
export const settings: AnimationSettings = {
  id: "unstableGrid2",
  name: "unstableGrid2",

  fps: config.fps,
  width: config.width,
  height: config.height,
  totalFrames: config.durationInSeconds * config.fps,

  function: animation,
  onSetup: setupAnimation,
};
