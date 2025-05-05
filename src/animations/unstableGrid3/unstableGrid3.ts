/* eslint-disable no-useless-catch */
import p5 from "p5";
import { AnimationSettings, AnimationFunction } from "@/types/animations";
import { createNoise3D } from "simplex-noise";
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
  DEFAULT_SECONDARY_COLOR,
} from "./config";
import { AnimationScene, timeline, LayoutCell, CellStyle } from "./timeline";
import { easings } from "../../utils/easing";
import { staticFile } from "remotion";

// --- Global Setup Guard ---
let isSetupComplete = false;

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
let noise3D: ReturnType<typeof createNoise3D>;
let originalPoints: Point[][] = [];
let targetPoints: Point[][] = [];
let currentPoints: Point[][] = []; // Holds the interpolated points
let rectangles: Rectangle[] = [];
let alphabetTextures: Record<string, p5.Image> = {};
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

// --- NEW: Transition State ---
let isTransitioning = false;
let transitionStartFrame = -1;

// --- Counter for Noise Time ---
let noiseTimeCounter = 0.0;

// Constants remain for configuring the boost shape
// const TRANSITION_BOOST_DURATION_FRAMES = 30; // REMOVED - Use config.colorTransitionFrames now
const TRANSITION_BOOST_SPEED_MULTIPLIER = 3.0; // How much faster noise evolves AT PEAK of boost (Increased for visibility)

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
  // console.warn(
  //   `Easing function "${functionName}" not found in easings object. Falling back to linear.`
  // );
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
function bilinearInterpolatePoint(
  p: p5,
  tl: Point,
  tr: Point,
  br: Point,
  bl: Point,
  u: number,
  v: number
): Point {
  const p1 = lerpPoint(p, tl, tr, u); // Interpolate top edge
  const p2 = lerpPoint(p, bl, br, u); // Interpolate bottom edge
  return lerpPoint(p, p1, p2, v); // Interpolate vertically
}

// --- Color Helpers ---
function parseColor(
  p: p5,
  hex: string | undefined,
  defaultHex: string
): p5.Color {
  try {
    const validHex = hex || defaultHex;
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(validHex)) {
      throw new Error("Invalid hex format");
    }
    return p.color(validHex);
  } catch (e) {
    // console.warn(
    //   `Invalid hex color: "${hex}". Using default: "${defaultHex}".`,
    //   e
    // );
    try {
      return p.color(defaultHex);
    } catch {
      return p.color(defaultHex === DEFAULT_BG_COLOR ? 0 : 128);
    }
  }
}

function interpolateColor(
  p: p5,
  c1: p5.Color,
  c2: p5.Color,
  factor: number
): p5.Color {
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
  metadata: RectangleMetadata | null,
  currentFrameNum: number
): void => {
  const col = metadata?.colTopLeft;
  const row = metadata?.rowTopLeft;
  const rectIndex = metadata?.rectIndex;

  if (
    col === undefined ||
    row === undefined ||
    vertices.length !== 4 ||
    rectIndex === undefined ||
    !activeScene
  )
    return;

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
      for (let j = 0; j < N; j++) {
        // Vertical subdivisions
        for (let i = 0; i < N; i++) {
          // Horizontal subdivisions
          // Calculate normalized u, v for the four corners of the sub-quad
          const u0 = i / N;
          const u1 = (i + 1) / N;
          const v0 = j / N;
          const v1 = (j + 1) / N;

          // Calculate vertex positions using bilinear interpolation
          const sub_tl = bilinearInterpolatePoint(
            p,
            tl_v,
            tr_v,
            br_v,
            bl_v,
            u0,
            v0
          );
          const sub_tr = bilinearInterpolatePoint(
            p,
            tl_v,
            tr_v,
            br_v,
            bl_v,
            u1,
            v0
          );
          const sub_br = bilinearInterpolatePoint(
            p,
            tl_v,
            tr_v,
            br_v,
            bl_v,
            u1,
            v1
          );
          const sub_bl = bilinearInterpolatePoint(
            p,
            tl_v,
            tr_v,
            br_v,
            bl_v,
            u0,
            v1
          );

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

// --- NEW: Solid Color Rectangle Renderer ---
const renderSolidRectangle: RectangleRenderFunction = (
  p: p5,
  _normalizedTime: number,
  _lines: Line[],
  _intersection: Point | null,
  vertices: Point[], // Expecting [topLeft, topRight, bottomRight, bottomLeft]
  _color: Color,
  metadata: RectangleMetadata | null
): void => {
  if (vertices.length !== 4) return;

  p.push();
  p.noFill(); // Use no fill for wireframe
  p.stroke(255); // Use white stroke
  p.strokeWeight(1); // Set a thin stroke weight (optional)

  const [tl_v, tr_v, br_v, bl_v] = vertices;

  p.beginShape();
  p.vertex(tl_v.x, tl_v.y);
  p.vertex(tr_v.x, tr_v.y);
  p.vertex(br_v.x, br_v.y);
  p.vertex(bl_v.x, bl_v.y);
  p.endShape(p.CLOSE);

  p.pop();
};

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
    targetPoints[j] = [];
    currentPoints[j] = [];
    for (let i = 0; i <= cols; i++) {
      // Iterate columns (X)
      const x = i * cellWidth - halfW;
      const y = j * cellHeight - halfH;
      const point = { x, y };
      originalPoints[j][i] = { ...point };
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

// --- Calculate New Target Points (Uses Noise) ---
function calculateNewTargetPoints(p: p5, frame: number) {
  const cols = config.gridColumns;
  const rows = config.gridRows;
  const gridW = config.width;
  const gridH = config.height;
  const halfW = gridW / 2;
  const halfH = gridH / 2;

  // Noise parameters from config
  const freqX = config.noiseFrequencyX;
  const freqY = config.noiseFrequencyY;
  const speed = config.noiseSpeed;
  const ampX = config.noiseAmplitudeX;
  const ampY = config.noiseAmplitudeY;

  // Use the specific noise3D function
  const noiseFn = noise3D; // Use our initialized 3D noise function
  if (!noiseFn) {
    // console.warn("noise3D function not initialized!");
    return; // Exit if noise isn't ready
  }

  // console.log(`[Frame ${frame}] Calculating noise target points...`);

  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      if (i === 0 || i === cols || j === 0 || j === rows) {
        targetPoints[j][i] = { ...originalPoints[j][i] };
        continue;
      }

      const noiseValX = noiseFn(i * freqX, j * freqY, frame * speed) * 2 - 1;
      const noiseValY =
        noiseFn(i * freqX + 100, j * freqY + 100, frame * speed) * 2 - 1;
      const displacementX = noiseValX * ampX;
      const displacementY = noiseValY * ampY;

      // Log displacement for one point
      /* // COMMENTED OUT - Too much noise
      if (j === 1 && i === 1 && frame % 30 === 0) {
        console.log(
          `[Frame ${frame}] Noise Disp[1][1]: dx=${displacementX.toFixed(
            2
          )}, dy=${displacementY.toFixed(2)}`
        );
      }
      */

      targetPoints[j][i] = {
        x: originalPoints[j][i].x + displacementX,
        y: originalPoints[j][i].y + displacementY,
      };
    }
  }
}

// --- Calculate Target Cell Colors (Uses direct style.color) ---
function calculateTargetCellColors(
  p: p5,
  scene: AnimationScene,
  interpolatedSecondaryColor: p5.Color
) {
  const rows = config.gridRows;
  const cols = config.gridColumns;
  const newTargetColors: p5.Color[][] = [];

  // Default color from the active scheme (get the string)
  const defaultPrimaryHexString = activeColorScheme.primary || "#FFFFFF";
  const defaultPrimaryColor = parseColor(p, defaultPrimaryHexString, "#FFFFFF"); // Parse default once
  // Use the provided interpolated secondary color for null cells
  const secondaryColor = interpolatedSecondaryColor;

  for (let r = 0; r < rows; r++) {
    newTargetColors[r] = [];
    for (let c = 0; c < cols; c++) {
      const layoutCell = scene.layoutGrid?.[r]?.[c];
      let targetColor: p5.Color;

      if (layoutCell) {
        // Check for direct style color first
        if (layoutCell.style?.color) {
          // Parse the cell's color, falling back to default hex string
          targetColor = parseColor(
            p,
            layoutCell.style.color,
            defaultPrimaryHexString
          );
        } else {
          // No direct style, use the pre-parsed default primary color
          targetColor = defaultPrimaryColor;
        }
      } else {
        // Null cell - use the secondary color
        targetColor = secondaryColor;
      }
      newTargetColors[r][c] = targetColor;
    }
  }
  targetCellColors = newTargetColors;
}

// --- Initialize Cell Colors (NEW) ---
function initializeCellColors(
  p: p5,
  scene: AnimationScene,
  initialSecondaryColor: p5.Color
) {
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

// --- Animation Loop ---
const animation: AnimationFunction = (
  p: p5,
  _normalizedTime: number,
  currentFrameNum: number
): void => {
  // --- DEBUG: Log incoming frame number ---
  console.log(`[Animation] Frame: ${currentFrameNum}`);
  // --- END DEBUG ---

  // --- Wait for map and textures (using isSetupComplete flag now) ---
  // Also ensure setup function has run at least once before checking map
  if (!isSetupComplete || !textureMap) {
    p.background(activeColorScheme.background); // Show background while loading/setup
    // --- REMOVED Loading Text / Wait Logs ---
    return; // Skip drawing until setup is complete and map is loaded
  }

  // --- DEBUG: Log that animation function is running (Only if setup is complete) ---
  /* // REMOVED DEBUG LOG
  if (currentFrameNum === 0) { // Log only once for the first frame
      console.info(`[Frame ${currentFrameNum}] Animation function running. Setup is complete. Rectangles count: ${rectangles.length}`); 
  }
  */
  // --- END DEBUG ---

  // --- ASSETS LOADED / SETUP COMPLETE ---
  // Re-enabled core drawing logic

  // 1. Determine Active Scene and Colors
  let newSceneIndex = -1;
  for (let i = timeline.length - 1; i >= 0; i--) {
    if (currentFrameNum >= timeline[i].startFrame) {
      newSceneIndex = i;
      break;
    }
  }
  if (newSceneIndex === -1) {
    if (currentSceneIndex !== -1) {
      newSceneIndex = currentSceneIndex;
    } else {
      console.error(
        `[Frame ${currentFrameNum}] CRITICAL ERROR: No active scene found!`
      );
      p.background(parseColor(p, undefined, DEFAULT_BG_COLOR));
      return;
    }
  }
  const sceneChanged = currentSceneIndex !== newSceneIndex;
  const actualPreviousScene =
    currentSceneIndex >= 0 && currentSceneIndex < timeline.length
      ? timeline[currentSceneIndex]
      : null;
  currentSceneIndex = newSceneIndex;
  activeScene = timeline[currentSceneIndex];

  if (sceneChanged) {
    isTransitioning = true;
    transitionStartFrame = currentFrameNum;

    // Store previous colors
    previousBgColor = currentBgColor
      ? p.color(currentBgColor.toString())
      : parseColor(p, undefined, DEFAULT_BG_COLOR);
    previousSecondaryColor = currentSecondaryColor
      ? p.color(currentSecondaryColor.toString())
      : parseColor(p, undefined, DEFAULT_SECONDARY_COLOR);
    previousCellColors = currentCellColors.map((row) => row.map((c) => c));

    // Calculate new target colors
    targetBgColor = parseColor(
      p,
      activeScene.backgroundColor,
      DEFAULT_BG_COLOR
    );
    targetSecondaryColor = parseColor(
      p,
      activeScene.secondaryColor,
      DEFAULT_SECONDARY_COLOR
    );
    calculateTargetCellColors(p, activeScene, targetSecondaryColor);
  }

  let sceneTransitionProgress = 1.0;
  if (isTransitioning) {
    const framesSinceStart = currentFrameNum - transitionStartFrame;
    sceneTransitionProgress = Math.min(
      1.0,
      framesSinceStart / config.colorTransitionFrames
    );
    if (sceneTransitionProgress >= 1.0) {
      isTransitioning = false;
      // Ensure final colors match target precisely
      previousBgColor = targetBgColor;
      previousSecondaryColor = targetSecondaryColor;
      previousCellColors = targetCellColors;
    }
  }

  // Interpolate Colors
  currentBgColor = interpolateColor(
    p,
    previousBgColor!,
    targetBgColor!,
    sceneTransitionProgress
  );
  currentSecondaryColor = interpolateColor(
    p,
    previousSecondaryColor!,
    targetSecondaryColor!,
    sceneTransitionProgress
  );
  for (let r = 0; r < config.gridRows; r++) {
    for (let c = 0; c < config.gridColumns; c++) {
      if (previousCellColors[r]?.[c] && targetCellColors[r]?.[c]) {
        currentCellColors[r][c] = interpolateColor(
          p,
          previousCellColors[r][c],
          targetCellColors[r][c],
          sceneTransitionProgress
        );
      } else if (targetCellColors[r]?.[c]) {
        currentCellColors[r][c] = targetCellColors[r][c];
      } else {
        currentCellColors[r][c] = currentSecondaryColor ?? p.color(128);
      }
    }
  }
  // Recalculate target cell colors based on interpolated secondary for filler cells
  calculateTargetCellColors(p, activeScene, currentSecondaryColor!);
  for (let r = 0; r < config.gridRows; r++) {
    for (let c = 0; c < config.gridColumns; c++) {
      if (!activeScene.layoutGrid?.[r]?.[c]) {
        // If it's a filler cell
        if (targetCellColors[r]?.[c]) {
          currentCellColors[r][c] = targetCellColors[r][c];
        }
      }
    }
  }

  // --- Calculate Noise Speed Multiplier and Increment Counter ---
  let currentFrameMultiplier = 1.0;
  if (isTransitioning) {
    // Use boost duration for progress calculation
    const framesSinceTransitionStart = currentFrameNum - transitionStartFrame;
    // Calculate progress (0 to 1) over the transition duration
    const boostProgress = Math.min(1.0, framesSinceTransitionStart / config.colorTransitionFrames);
    
    // Calculate pulse (0 -> 1 -> 0) using the linear triangle wave formula
    const pulseValue = Math.max(0, 1.0 - Math.abs(2.0 * boostProgress - 1.0));
    
    currentFrameMultiplier = 1.0 + (TRANSITION_BOOST_SPEED_MULTIPLIER - 1.0) * pulseValue;

    // Also check if the transition *duration* is complete to stop isTransitioning
    if (framesSinceTransitionStart >= config.colorTransitionFrames) {
      // Use color transition duration here
      isTransitioning = false;
    }
  }

  const noiseIncrement = config.noiseSpeed * currentFrameMultiplier;
  noiseTimeCounter += noiseIncrement;
  // --- End Noise Speed Calculation ---

  // Update Point Positions (RE-ENABLED)
  const easingFunc = getActiveEasingFunction(); // Assuming this doesn't need font
  const followFactor = config.pointFollowFactor;

  for (let r = 0; r < currentPoints.length; r++) {
    for (let c = 0; c < currentPoints[r].length; c++) {
      const current = currentPoints[r][c];
      const target = targetPoints[r][c];

      // Calculate noise displacement based on the *target* point and noise counter
      // --- Use noiseTimeCounter directly ---
      const noiseTime = noiseTimeCounter; // Use the incremented counter

      const noiseValX = noise3D(
        target.x * config.noiseFrequencyX * 0.01,
        target.y * config.noiseFrequencyX * 0.01,
        noiseTime // Use boosted time
      );
      const noiseValY = noise3D(
        target.x * config.noiseFrequencyY * 0.01 + 1000,
        target.y * config.noiseFrequencyY * 0.01 + 1000,
        noiseTime // Use boosted time
      );
      // --- End Apply Noise Boost ---

      const displacementX = p.map(
        noiseValX,
        -1,
        1,
        -config.noiseAmplitudeX,
        config.noiseAmplitudeX
      );
      const displacementY = p.map(
        noiseValY,
        -1,
        1,
        -config.noiseAmplitudeY,
        config.noiseAmplitudeY
      );

      const noisyTargetX = target.x + displacementX;
      const noisyTargetY = target.y + displacementY;

      const newX = p.lerp(current.x, noisyTargetX, followFactor);
      const newY = p.lerp(current.y, noisyTargetY, followFactor);

      currentPoints[r][c] = { x: newX, y: newY };
    }
  }

  // Update rectangle vertices based on interpolated points
  updateRectangles(); // RE-ENABLED

  // Render Background
  p.background(currentBgColor);

  // --- Render Main Rectangles (using TEXTURED renderer again) ---
  rectangles.forEach((rect, index) => {
    const metadata = rect.getMetadata();
    if (metadata) {
      metadata.rectIndex = index;

      // --- DEBUG: Log render call and vertices for the first rectangle --- (REMOVED)
      /*
          if (index === 0 && currentFrameNum % 60 === 0) { // Log every 60 frames
            const vertices = rect.getVertices();
            console.info(`[Frame ${currentFrameNum}] Calling renderSolidRectangle for index 0. Vertices:`, JSON.stringify(vertices)); // Use console.info
          }
          */
      // --- END DEBUG ---

      // Use the TEXTURED renderer again
      renderTexturedRectangle(
        p,
        _normalizedTime,
        rect.getLines(),
        rect.getDiagonalIntersection(),
        rect.getVertices(),
        rect.getColor(),
        metadata,
        currentFrameNum // Pass currentFrameNum
      );
    }
  });

  /* // --- Background Chars DISABLED --- 
  // ...
  */

  /* // --- Debug Info DISABLED --- 
  // ... 
  */

  currentPoints = originalPoints.map((row) => row.map((pt) => ({ ...pt })));
  updateRectangles();

  // --- DEBUG: Log rectangles length after setup ---
  console.info(
    `[Setup Complete] Rectangles initialized. Count: ${rectangles.length}`
  );
  // --- END DEBUG ---

  // --- Set Setup Complete Flag ---
  isSetupComplete = true;
  // console.info("[Setup] Setup complete flag set."); // REMOVED DEBUG LOG
  // --- End Set Setup Complete Flag ---
};

// --- Seeded PRNG (Mulberry32) and String-to-Seed Helpers ---

/** Simple string hashing function (like DJB2) to get a number seed */
function stringToSeed(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // Ensure positive integer
}

/** Mulberry32 PRNG */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

// --- Setup Function ---

// Keep track of loading state
let textureLoadingPromise: Promise<void> | null = null;
let textureMap: Record<string, string> | null = null; // Variable to hold the loaded map
// let loadedFont: p5.Font | null = null; // REMOVED Font variable
// let fontLoadingPromise: Promise<void> | null = null; // REMOVED Font promise

const setupAnimation: AnimationFunction = (
  p: p5,
  _normalizedTime?: number,
  _currentFrameNum?: number,
  _totalFrames?: number,
  props?: { noiseSeedPhrase?: string }
): void => {
  // --- Setup Guard ---
  if (isSetupComplete) {
    // console.info("[Setup] Skipping setup, already complete.");
    return;
  }
  console.info("[Setup] Running setup...");
  // --- End Setup Guard ---

  let initialSceneIndex = 0;

  activeColorScheme = getActiveColorScheme(config.colorSchemeName);
  p.background(activeColorScheme.background);
  p.frameRate(config.fps);

  // Initialize Noise
  const seedPhraseToUse = props?.noiseSeedPhrase ?? config.noiseSeedPhrase;
  const seedNumber = stringToSeed(seedPhraseToUse);
  const seededPrng = mulberry32(seedNumber);
  noise3D = createNoise3D(seededPrng);

  // --- Load Font --- (REMOVED)

  // --- Collect Characters (Still needed for texture map keys) ---
  const chars = config.fillerChars || " "; // Keep collecting chars
  const charSet = new Set<string>(chars.split(""));
  timeline.forEach((scene) => {
    if (scene.layoutGrid) {
      scene.layoutGrid.forEach((row) => {
        if (row) {
          row.forEach((cell) => {
            if (cell && cell.char) {
              charSet.add(cell.char);
            }
          });
        }
      });
    }
    // Collect background characters as well
    if (scene.backgroundChars) {
      // This part is not strictly needed if background chars are disabled
      for (const char of scene.backgroundChars) {
        charSet.add(char);
      }
    }
  });
  allNeededChars = Array.from(charSet).join("");
  if (typeof allNeededChars !== "string" || allNeededChars.length === 0) {
    allNeededChars = " ";
  }

  // --- Load Map and Textures (Keep this logic, even if textures aren't used yet) ---
  console.info(`[Setup] Loading texture map and ${charSet.size} textures...`); // Changed log prefix
  alphabetTextures = {};
  textureMap = null;

  // Re-assign promise only if setup is running for the first time
  textureLoadingPromise = new Promise<Record<string, string>>(
    (resolve, reject) => {
      p.loadJSON(
        staticFile("/animations/unstableGrid3/textures/map.json"),
        (loadedMap: Record<string, string>) => {
          console.info("[Setup] Texture map loaded successfully."); // Changed log prefix
          textureMap = loadedMap;
          resolve(loadedMap);
        },
        (err) => {
          console.error("[Setup] Failed to load texture map (map.json):", err); // Changed log prefix
          reject(new Error("Failed to load map.json"));
        }
      );
    }
  )
    .then((loadedMap) => {
      const charsToLoad = Array.from(charSet);
      const loadTexturesSequentially = async () => {
        console.info(
          `[Setup] Sequentially loading ${charsToLoad.length} textures...`
        ); // Changed log prefix
        for (const char of charsToLoad) {
          const filename = loadedMap[char];
          if (!filename) {
            if (char === " ") {
              // console.info("[Setup] Skipping space character texture (likely not generated)."); // Optional log
            } else {
              console.warn(
                `[Setup] Character '${char}' not found in texture map. Skipping.` // Changed log prefix
              );
            }
            continue;
          }
          const texturePath = staticFile(
            `/animations/unstableGrid3/textures/${filename}`
          );
          const img = await new Promise<p5.Image>((resolve, reject) => {
            p.loadImage(
              texturePath,
              (loadedImg) => resolve(loadedImg),
              (err) => {
                console.error(
                  `[Setup] Failed to load texture for character '${char}' from ${texturePath}:`,
                  err
                ); // Changed log prefix
                reject(new Error(`Failed loading ${texturePath}`));
              }
            );
          });
          alphabetTextures[char] = img;
        }
        console.info("[Setup] Finished sequential texture loading."); // Changed log prefix
      };
      return loadTexturesSequentially();
    })
    .then(() => {
      console.info("[Setup] All textures loaded successfully."); // Changed log prefix
      textureLoadingPromise = null; // Set promise to null on success
    })
    .catch((error) => {
      console.error(
        "[Setup] Error during texture map or image loading:",
        error
      ); // Changed log prefix
      textureLoadingPromise = null; // Also set to null on error
      textureMap = null; // Clear map on error too
    });
  // REMOVED .finally() block as redundant now promise is cleared in then/catch

  // Initialize Grid & Scene
  setupGridPoints(p);
  currentSceneIndex = -1;
  activeScene = null;
  if (timeline.length === 0) {
    console.error("Timeline is empty. Cannot initialize animation.");
    return;
  }
  for (let i = timeline.length - 1; i >= 0; i--) {
    if (0 >= timeline[i].startFrame) {
      initialSceneIndex = i;
      break;
    }
  }
  currentSceneIndex = initialSceneIndex;
  activeScene = timeline[currentSceneIndex];
  previousScene = null;

  if (!activeScene) {
    console.error(
      `Failed to find active scene with index ${initialSceneIndex}. Initializing with defaults.`
    );
    targetBgColor = parseColor(p, undefined, DEFAULT_BG_COLOR);
    targetSecondaryColor = parseColor(p, undefined, DEFAULT_SECONDARY_COLOR);
  } else {
    targetBgColor = parseColor(
      p,
      activeScene.backgroundColor,
      DEFAULT_BG_COLOR
    );
    targetSecondaryColor = parseColor(
      p,
      activeScene.secondaryColor,
      DEFAULT_SECONDARY_COLOR
    );
  }

  previousBgColor = targetBgColor;
  previousSecondaryColor = targetSecondaryColor;
  currentBgColor = targetBgColor;
  currentSecondaryColor = targetSecondaryColor;

  if (activeScene) {
    calculateNewTargetPoints(p, 0);
    const initialSecondaryParsed = parseColor(
      p,
      activeScene.secondaryColor,
      DEFAULT_SECONDARY_COLOR
    );
    initializeCellColors(p, activeScene, initialSecondaryParsed);
  } else {
    targetPoints = originalPoints.map((row) => row.map((pt) => ({ ...pt })));
    // Initialize cell colors with defaults if no active scene
    const defaultSecondary = parseColor(p, undefined, DEFAULT_SECONDARY_COLOR);
    initializeCellColors(p, {} as AnimationScene, defaultSecondary); // Pass dummy scene
  }

  currentPoints = originalPoints.map((row) => row.map((pt) => ({ ...pt })));
  updateRectangles();

  // --- DEBUG: Log rectangles length after setup ---
  console.info(`[Setup] Rectangles initialized. Count: ${rectangles.length}`); // Changed log prefix
  // --- END DEBUG ---

  // --- Set Setup Complete Flag ---
  isSetupComplete = true;
  // console.info("[Setup] Setup complete flag set."); // REMOVED DEBUG LOG
  // --- End Set Setup Complete Flag ---
};

// Now declare the settings after animation is defined
export const settings: AnimationSettings = {
  id: "unstableGrid3",
  name: "unstableGrid3",

  fps: config.fps,
  width: config.width,
  height: config.height,
  totalFrames: config.durationInSeconds * config.fps,

  function: animation,
  onSetup: setupAnimation,
};
