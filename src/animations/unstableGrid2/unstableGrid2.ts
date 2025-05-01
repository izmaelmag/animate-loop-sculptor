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
  DEFAULT_BG_COLOR,
  DEFAULT_SECONDARY_COLOR
} from "./config";
import { AnimationScene, timeline, LayoutCell, CellStyle } from './timeline';
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
let previousScene: AnimationScene | null = null;
let allNeededChars = ""; // String containing all unique characters for textures

// Color state
let previousCellColors: p5.Color[][] = [];
let targetCellColors: p5.Color[][] = [];
let currentCellColors: p5.Color[][] = [];

// NEW: Scene Color state
let previousBgColor: p5.Color | null = null;
let targetBgColor: p5.Color | null = null;
let currentBgColor: p5.Color | null = null; 
let previousSecondaryColor: p5.Color | null = null;
let targetSecondaryColor: p5.Color | null = null;
let currentSecondaryColor: p5.Color | null = null;

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

// --- Color Helpers ---
function parseColor(p: p5, hex: string | undefined, defaultHex: string): p5.Color {
    try {
        const validHex = hex || defaultHex;
        if (!/^#([0-9A-F]{3}){1,2}$/i.test(validHex)) {
            throw new Error("Invalid hex format");
        }
        return p.color(validHex);
    } catch (e) {
        console.warn(`Invalid hex color: "${hex}". Using default: "${defaultHex}".`, e);
        try {
            return p.color(defaultHex);
        } catch {
            return p.color(defaultHex === DEFAULT_BG_COLOR ? 0 : 128);
        }
    }
}

function interpolateColor(p: p5, c1: p5.Color, c2: p5.Color, factor: number): p5.Color {
  factor = p.constrain(factor, 0, 1);
  return p.lerpColor(c1, c2, factor);
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
  const halfW = gridW / 2;
  const halfH = gridH / 2;
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
      const x = i * cellWidth - halfW;
      const y = j * cellHeight - halfH;
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
  const gridW = config.width;
  const gridH = config.height;
  const halfW = gridW / 2;
  const halfH = gridH / 2;
  const cellWidth = gridW / cols;
  const cellHeight = gridH / rows;
  const maxDispX = cellWidth * config.pointDisplacementXFactor;
  const maxDispY = cellHeight * config.pointDisplacementYFactor;

  console.log(`[Frame ${p.frameCount}] Calculating new target points (WEBGL coords)...`);

  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      // Boundary points remain fixed relative to the *original* centered grid
      if (i === 0 || i === cols || j === 0 || j === rows) {
        // Ensure target points for boundaries use the calculated original centered points
        targetPoints[j][i] = { ...originalPoints[j][i] }; 
        continue; 
      }
      // Calculate random displacement for interior points
      const randomX = p.random(-1, 1);
      const randomY = p.random(-1, 1);
      const displacementX = randomX * maxDispX;
      const displacementY = randomY * maxDispY;

      // Add displacement to the original *centered* point
      targetPoints[j][i] = {
        x: originalPoints[j][i].x + displacementX,
        y: originalPoints[j][i].y + displacementY,
      };
      if (j === 1 && i === 1) console.log(`  Target[1][1] set to (WebGL):`, targetPoints[j][i]);
    }
  }
}

// --- Calculate Target Cell Colors (Reverted to use styleId) ---
function calculateTargetCellColors(p: p5, scene: AnimationScene, interpolatedSecondaryColor: p5.Color) {
    const rows = config.gridRows;
    const cols = config.gridColumns;
    const newTargetColors: p5.Color[][] = [];

    // Use the provided interpolated secondary color for null cells
    const secondaryColor = interpolatedSecondaryColor; 

    for (let r = 0; r < rows; r++) {
        newTargetColors[r] = [];
        for (let c = 0; c < cols; c++) {
            const layoutCell = scene.layoutGrid?.[r]?.[c];
            let targetHex: string | undefined;
            let styleId: string | undefined;

            if (layoutCell) {
                // Assuming LayoutCell is { char: string; styleId?: string; }
                styleId = layoutCell.styleId;
                if (!styleId) { // If no styleId, try finding a default preset? Or use primary?
                    // Let's prioritize finding a preset named after the character itself, then default
                    styleId = scene.stylePresets[layoutCell.char] ? layoutCell.char : config.defaultStyleId;
                }
            } else {
                // Null cell - use the secondary color directly, no preset needed
                newTargetColors[r][c] = secondaryColor;
                continue; // Skip preset lookup for null cells
            }

            // Find the color from the style preset
            const stylePreset = scene.stylePresets?.[styleId || config.defaultStyleId];
            targetHex = stylePreset?.color;
            
            // Fallback if preset or color is missing - use activeColorScheme.primary
            if (!targetHex) {
                 targetHex = activeColorScheme.primary;
            }

            // Final fallback to white if even primary is missing
            newTargetColors[r][c] = parseColor(p, targetHex, '#FFFFFF'); 
        }
    }
    targetCellColors = newTargetColors;
}

// --- Initialize Cell Colors (NEW) ---
function initializeCellColors(p: p5, scene: AnimationScene, initialSecondaryColor: p5.Color) {
    const rows = config.gridRows;
    const cols = config.gridColumns;
    previousCellColors = [];
    currentCellColors = [];

    // Calculate initial target colors using the provided secondary color
    calculateTargetCellColors(p, scene, initialSecondaryColor); 

    // Initialize previous and current colors to the initial target colors
    for (let r = 0; r < rows; r++) {
        previousCellColors[r] = [];
        currentCellColors[r] = [];
        for (let c = 0; c < cols; c++) {
            const initialColor = targetCellColors[r][c]; 
            previousCellColors[r][c] = initialColor;
            currentCellColors[r][c] = initialColor;
        }
    }
}

// --- Animation Loop (Integrate Color Lerp) --- 
const animation: AnimationFunction = (p: p5, _normalizedTime: number, currentFrameNum: number): void => {
  const frame = currentFrameNum;

  // 1. Determine Active Scene and Previous Scene
  let newSceneIndex = -1;
  // Log entering the loop on specific frames for debugging
  if (currentFrameNum === 0 || currentFrameNum === 119 || currentFrameNum === 120 || currentFrameNum === 299 || currentFrameNum === 300) {
      console.log(`[Scene Search] Frame ${currentFrameNum}: Searching for scene...`);
  }
  for (let i = timeline.length - 1; i >= 0; i--) {
      const scene = timeline[i];
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
  // Store previous index *before* updating current
  const previousSceneIndex = currentSceneIndex; 
  currentSceneIndex = newSceneIndex;

  activeScene = currentSceneIndex !== -1 ? timeline[currentSceneIndex] : null;
  // Use the stored previous index to get the previous scene
  previousScene = previousSceneIndex !== -1 ? timeline[previousSceneIndex] : null; 

   if (!activeScene) {
      // Handle case with no active scene
      console.log(`[Frame ${frame}] No active scene found (index ${currentSceneIndex}).`);
      const fallbackBg = currentBgColor || parseColor(p, undefined, DEFAULT_BG_COLOR);
      p.background(fallbackBg);
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("No active scene", p.width / 2, p.height / 2);
      return; // Exit animation loop if no scene
   }

  // Declare sceneStartTime ONCE here
  const sceneStartTime = activeScene.startFrame;

  // 2. Calculate Scene Color Transition
  const timeIntoSceneTransition = Math.max(0, frame - sceneStartTime);
  const colorTransitionDuration = Math.max(1, config.colorTransitionFrames); 
  const colorTransitionT = p.constrain(timeIntoSceneTransition / colorTransitionDuration, 0, 1);

  // Determine target colors (from current scene)
  targetBgColor = parseColor(p, activeScene.backgroundColor, DEFAULT_BG_COLOR);
  targetSecondaryColor = parseColor(p, activeScene.secondaryColor, DEFAULT_SECONDARY_COLOR);

  // Determine previous colors (from previous scene, or defaults if first scene)
  if (sceneChanged) {
      previousBgColor = previousScene ? parseColor(p, previousScene.backgroundColor, DEFAULT_BG_COLOR) : targetBgColor; 
      previousSecondaryColor = previousScene ? parseColor(p, previousScene.secondaryColor, DEFAULT_SECONDARY_COLOR) : targetSecondaryColor;
      previousCellColors = currentCellColors; // Start cell lerp from current colors
      console.log(`[Scene Change ${frame}] PrevBG: ${previousBgColor?.toString()}, TargetBG: ${targetBgColor?.toString()}`);
      console.log(`[Scene Change ${frame}] PrevSec: ${previousSecondaryColor?.toString()}, TargetSec: ${targetSecondaryColor?.toString()}`);
  } else if (!previousBgColor || !previousSecondaryColor) {
      // Initialize previous colors if they are null (e.g., on first frame of animation)
      previousBgColor = targetBgColor; // Start fully at target
      previousSecondaryColor = targetSecondaryColor;
      console.log(`[Frame ${frame}] Initializing previous scene colors.`);
  }

  // Interpolate scene colors (with guards)
  currentBgColor = previousBgColor && targetBgColor ? 
                   interpolateColor(p, previousBgColor, targetBgColor, colorTransitionT) :
                   (targetBgColor || parseColor(p, undefined, DEFAULT_BG_COLOR)); // Fallback
                   
  currentSecondaryColor = previousSecondaryColor && targetSecondaryColor ? 
                         interpolateColor(p, previousSecondaryColor, targetSecondaryColor, colorTransitionT) :
                         (targetSecondaryColor || parseColor(p, undefined, DEFAULT_SECONDARY_COLOR)); // Fallback

   // Log interpolation values for debugging
   if (frame >= sceneStartTime && frame < sceneStartTime + colorTransitionDuration + 5) { // Log during and slightly after transition
       console.log(`[Frame ${frame}] Scene ${currentSceneIndex} | ColorT: ${colorTransitionT.toFixed(2)} | currentBg: ${currentBgColor?.toString()}`);
   }

  // --- Point Update Logic (Periodic) --- 
  const updateInterval = Math.max(1, config.updateIntervalFrames);
  const isUpdateFrame = (frame % updateInterval === 0) || (frame === 0); // Update on frame 0 too

  if (isUpdateFrame) {
      console.log(`[Frame ${frame}] Point Update Triggered (Interval: ${updateInterval})`);
      // Capture current points as previous *before* calculating new targets
      previousPoints = currentPoints.map(row => row.map(pt => ({...pt}))); 
      if (previousPoints.length > 1 && previousPoints[0].length > 1) console.log(`  Prev[1][1] captured for update:`, previousPoints[1][1]);
      // Calculate new targets 
      calculateNewTargetPoints(p);
  } else if (!previousPoints || previousPoints.length === 0) {
      // Initialize previous points if it's somehow empty 
      previousPoints = currentPoints.map(row => row.map(pt => ({...pt})));
      console.warn(`[Frame ${frame}] Initialized missing previousPoints during non-update frame.`);
  }

  // 4. Interpolate Grid Points (Always runs, interpolates towards the latest target)
  const POINT_TRANSITION_FRAMES = updateInterval; // Transition duration = update interval
  const timeSinceLastUpdate = frame % POINT_TRANSITION_FRAMES;
  const pointT = p.constrain(timeSinceLastUpdate / POINT_TRANSITION_FRAMES, 0, 1);
  const easedPointT = getActiveEasingFunction()(pointT); 
  console.log(`[Frame ${frame}] PointT: ${pointT.toFixed(3)}, EasedPointT: ${easedPointT.toFixed(3)}`); 

  // Interpolate points using the updated previousPoints and potentially updated targetPoints
  if (previousPoints && previousPoints.length === config.gridRows + 1) { 
       for (let r = 0; r <= config.gridRows; r++) {
           for (let c = 0; c <= config.gridColumns; c++) {
               // Check if points exist before lerping
               const prevPt = previousPoints[r]?.[c];
               const targetPt = targetPoints[r]?.[c];
               
               if (prevPt && targetPt) {
                   // Log one point before lerp
                   if (r === 1 && c === 1 && frame % 10 === 0) { // Log every 10 frames for one point
                        console.log(`  Lerping[1][1] | Prev: ${JSON.stringify(prevPt)} | Target: ${JSON.stringify(targetPt)} | T: ${easedPointT.toFixed(3)}`);
                   }
                   currentPoints[r][c] = lerpPoint(p, prevPt, targetPt, easedPointT);
               } else {
                   // Fallback if points are missing
                   currentPoints[r][c] = targetPt || originalPoints[r]?.[c] || { x: c * (p.width / config.gridColumns), y: r * (p.height / config.gridRows) };
                   if (!prevPt) console.warn(`[Point Lerp] Missing previousPoint at [${r},${c}] frame ${frame}.`);
                   if (!targetPt) console.warn(`[Point Lerp] Missing targetPoint at [${r},${c}] frame ${frame}. Using original.`);
               }
           }
       }
       updateRectangles(); // Update rectangle vertices based on currentPoints
  } else {
       console.warn(`[Frame ${frame}] Skipping point interpolation due to missing or invalid previousPoints.`);
       // If points are missing, maybe just set current to target or original?
       currentPoints = targetPoints.length > 0 ? targetPoints : originalPoints;
       updateRectangles();
  }

  // 5. Interpolate Cell Colors
  const easedColorT = colorTransitionT; // Use the same T for cell colors
  if (currentCellColors.length === config.gridRows) {
      for (let r = 0; r < config.gridRows; r++) {
          if (!currentCellColors[r]) currentCellColors[r] = []; // Ensure row exists
          // Ensure row has correct number of columns
          if (currentCellColors[r].length !== config.gridColumns) {
              // Adjust row length if needed, filling with default secondary
              const defaultSecondary = currentSecondaryColor || parseColor(p, undefined, DEFAULT_SECONDARY_COLOR);
              currentCellColors[r] = Array(config.gridColumns).fill(defaultSecondary).map((_, c) => currentCellColors[r][c] || defaultSecondary);
          }

          for (let c = 0; c < config.gridColumns; c++) {
              const prevColor = previousCellColors[r]?.[c];
              const targetColor = targetCellColors[r]?.[c];

              if (prevColor && targetColor) { 
                  // Both colors exist, interpolate normally
                  currentCellColors[r][c] = interpolateColor(p, prevColor, targetColor, easedColorT);
              } else {
                  // Handle missing color(s)
                  // Prioritize target color if available, otherwise use current secondary
                  const fallbackColor = targetColor || currentSecondaryColor || parseColor(p, undefined, DEFAULT_SECONDARY_COLOR);
                  currentCellColors[r][c] = fallbackColor; 

                  // Log the issue for debugging
                  if (!prevColor) console.warn(`[Color Lerp] Missing previousCellColor at [${r},${c}] frame ${currentFrameNum}. Using fallback.`);
                  if (!targetColor) console.warn(`[Color Lerp] Missing targetCellColor at [${r},${c}] frame ${currentFrameNum}. Using fallback.`);
              }
          }
      }
  } else if (config.gridRows > 0 && config.gridColumns > 0) {
       // Initialize the whole currentCellColors if it's completely missing/wrong size
       console.warn("currentCellColors dimensions incorrect, re-initializing.");
       const defaultSecondary = currentSecondaryColor || parseColor(p, undefined, DEFAULT_SECONDARY_COLOR);
       currentCellColors = Array(config.gridRows).fill(0).map(() => Array(config.gridColumns).fill(defaultSecondary));
       // Also might need to re-init previousCellColors and targetCellColors here
       previousCellColors = currentCellColors.map(row => [...row]);
       if (activeScene) calculateTargetCellColors(p, activeScene, defaultSecondary);
       else targetCellColors = currentCellColors.map(row => [...row]);
       currentCellColors = previousCellColors.map(row => [...row]);
  }

  // 6. Render
  p.background(currentBgColor); 

  // Draw Rectangles using the renderTexturedRectangle function
  rectangles.forEach((rect, index) => {
      const metadata = rect.getMetadata();
      // Ensure metadata exists and row/col indices are valid before rendering
      if (metadata && metadata.rowTopLeft < currentCellColors.length && metadata.colTopLeft < currentCellColors[metadata.rowTopLeft]?.length) { 
          // Assign rectIndex to metadata for potential use inside renderer
          metadata.rectIndex = index; 
          // Call the specific renderer function
          renderTexturedRectangle(
              p, 
              _normalizedTime, 
              rect.getLines(), 
              rect.getDiagonalIntersection(), 
              rect.getVertices(), 
              rect.getColor(), // Pass color from rect, though renderer might ignore it for texture tint
              metadata
          );
      } else {
          // Optional: Log if a rectangle is skipped due to invalid metadata or color index
          // console.warn(`Skipping render for rect index ${index} due to invalid metadata or color index.`);
      }
  });

  // --- Draw Debug Info ---
  // ... (debug info logic)
};

// --- Setup Function (Update Texture Generation) ---
const setupAnimation: AnimationFunction = (p: p5): void => {
  // Declare initialSceneIndex at the top level of the function
  let initialSceneIndex = 0; 

  activeColorScheme = getActiveColorScheme(config.colorSchemeName);
  console.log(`Using color scheme: ${config.colorSchemeName}`);
  p.background(activeColorScheme.background);
  p.frameRate(config.fps);
  noise2D = createNoise2D();

  // --- Collect all unique characters needed for textures ---
  const chars = config.fillerChars || " ";
  const charSet = new Set<string>(chars.split(''));
  
  timeline.forEach(scene => {
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
  
  // Initialize Grid & Scene
  setupGridPoints(p); 
  currentSceneIndex = -1; // Reset before finding the first scene
  activeScene = null;
  // initialSceneIndex is already declared above
   if (timeline.length === 0) {
       console.error("Timeline is empty. Cannot initialize animation.");
       return; 
   }
   // Find the scene active at frame 0 or the first scene
   for (let i = timeline.length - 1; i >= 0; i--) {
       if (0 >= timeline[i].startFrame) {
           initialSceneIndex = i;
           break;
       }
   }
   currentSceneIndex = initialSceneIndex;
   activeScene = timeline[currentSceneIndex];
   previousScene = null; // No previous scene on setup

   if (!activeScene) { // Check if activeScene is null after finding index
       // Accessing initialSceneIndex here is now safe
       console.error(`Failed to find active scene with index ${initialSceneIndex}. Initializing with defaults.`);
       // Initialize colors with defaults if no active scene
       targetBgColor = parseColor(p, undefined, DEFAULT_BG_COLOR);
       targetSecondaryColor = parseColor(p, undefined, DEFAULT_SECONDARY_COLOR);
   } else {
       // Initialize Color State using the found activeScene
       targetBgColor = parseColor(p, activeScene.backgroundColor, DEFAULT_BG_COLOR);
       targetSecondaryColor = parseColor(p, activeScene.secondaryColor, DEFAULT_SECONDARY_COLOR);
   }
   
   // Initialize current/previous colors
   previousBgColor = targetBgColor; 
   previousSecondaryColor = targetSecondaryColor;
   currentBgColor = targetBgColor;
   currentSecondaryColor = targetSecondaryColor; // Use the parsed target color initially
   
   // Calculate initial target points and initialize cell colors
   if (activeScene) {
       calculateNewTargetPoints(p); 
       // Parse the initial secondary color *before* passing to initializeCellColors
       const initialSecondaryParsed = parseColor(p, activeScene.secondaryColor, DEFAULT_SECONDARY_COLOR);
       initializeCellColors(p, activeScene, initialSecondaryParsed); 
   } else {
       // No active scene, initialize points/colors to default state
       targetPoints = originalPoints.map(row => row.map(pt => ({...pt})));
       const defaultSecondaryParsed = parseColor(p, undefined, DEFAULT_SECONDARY_COLOR);
       targetCellColors = Array(config.gridRows).fill(0).map(() => Array(config.gridColumns).fill(defaultSecondaryParsed));
       // Pass the parsed default secondary color
       initializeCellColors(p, { startFrame: 0, layoutGrid: [], stylePresets: {} }, defaultSecondaryParsed); 
   }
   
   // Initialize current/previous points
   currentPoints = targetPoints.map(row => row.map(pt => ({...pt})));
   previousPoints = targetPoints.map(row => row.map(pt => ({...pt})));
   
   updateRectangles(); // Initial update based on starting points
   
   console.log("Animation Setup Complete.");
   // Removed non-existent fontStyle from log
   console.log(`Using font: ${config.fontFamily}`); 
   console.log(`Initial Scene Index: ${currentSceneIndex}`);
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
