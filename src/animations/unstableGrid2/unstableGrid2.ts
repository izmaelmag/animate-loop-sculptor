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

// --- NEW: Transition State ---
let isTransitioning = false;
let transitionStartFrame = -1;

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
    console.warn(
      `Invalid hex color: "${hex}". Using default: "${defaultHex}".`,
      e
    );
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
  metadata: RectangleMetadata | null
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
    console.warn("noise3D function not initialized!");
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
      if (j === 1 && i === 1 && frame % 30 === 0) {
        console.log(
          `[Frame ${frame}] Noise Disp[1][1]: dx=${displacementX.toFixed(
            2
          )}, dy=${displacementY.toFixed(2)}`
        );
      }

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
  const frame = currentFrameNum;

  // --- State needed for transitions ---
  // let sceneTransitionProgress = 1; // REMOVED - Now managed by isTransitioning
  const sceneTransitionIncrement =
    1 / Math.max(1, config.colorTransitionFrames); // Keep for calculation

  // 1. Determine Active Scene and Previous Scene
  let newSceneIndex = -1;
  // Log entering the loop on specific frames for debugging
  if (
    currentFrameNum === 0 ||
    currentFrameNum === 119 ||
    currentFrameNum === 120 ||
    currentFrameNum === 299 ||
    currentFrameNum === 300
  ) {
    console.log(
      `[Scene Search] Frame ${currentFrameNum}: Searching for scene...`
    );
  }
  for (let i = timeline.length - 1; i >= 0; i--) {
    const scene = timeline[i];
    const check = currentFrameNum >= scene.startFrame;
    // Log check results on specific frames
    if (
      currentFrameNum === 0 ||
      currentFrameNum === 119 ||
      currentFrameNum === 120 ||
      currentFrameNum === 299 ||
      currentFrameNum === 300
    ) {
      console.log(
        `[Scene Search]   Checking scene ${i} (start: ${scene.startFrame}): ${currentFrameNum} >= ${scene.startFrame} is ${check}`
      );
    }
    if (check) {
      newSceneIndex = i;
      // Log when found on specific frames
      if (
        currentFrameNum === 0 ||
        currentFrameNum === 119 ||
        currentFrameNum === 120 ||
        currentFrameNum === 299 ||
        currentFrameNum === 300
      ) {
        console.log(`[Scene Search]   Found potential scene: ${i}`);
      }
      break; // Found the latest applicable scene
    }
  }
  // Log the final result for specific frames
  if (
    currentFrameNum === 0 ||
    currentFrameNum === 119 ||
    currentFrameNum === 120 ||
    currentFrameNum === 299 ||
    currentFrameNum === 300
  ) {
    console.log(
      `[Scene Search] Frame ${currentFrameNum}: Final newSceneIndex = ${newSceneIndex}`
    );
  }

  // --- Handle cases where no new scene is found ---
  // If newSceneIndex is still -1 after the loop, it means we are past the startFrame
  // of the last defined scene. In this case, we should continue using the
  // *last known valid scene* index (currentSceneIndex).
  if (newSceneIndex === -1) {
    if (currentSceneIndex !== -1) {
      // We had a valid scene before, keep using it.
      newSceneIndex = currentSceneIndex;
      // console.log(`[Frame ${currentFrameNum}] No new scene found. Re-using last active scene index: ${newSceneIndex}`);
    } else {
      // This case should ideally not happen if timeline is not empty and setup worked,
      // but as a fallback, handle the error gracefully.
      console.error(
        `[Frame ${currentFrameNum}] CRITICAL ERROR: No active scene found and no previous scene index available! Timeline might be empty or setup failed.`
      );
      // Optionally draw a default background and return to prevent further errors
      p.background(parseColor(p, undefined, DEFAULT_BG_COLOR));
      return;
    }
  }

  // Now, newSceneIndex is guaranteed to be a valid index (or we returned early)
  const sceneChanged = currentSceneIndex !== newSceneIndex;
  // Store the previous scene's actual data if it exists
  const actualPreviousScene =
    currentSceneIndex >= 0 && currentSceneIndex < timeline.length
      ? timeline[currentSceneIndex]
      : null;
  // previousScene = activeScene; // REMOVED - Use actualPreviousScene
  currentSceneIndex = newSceneIndex;
  activeScene = timeline[currentSceneIndex];

  // If the scene changes, START a new transition
  if (sceneChanged) {
    console.log(
      `[Frame ${currentFrameNum}] SCENE CHANGED! From ${
        actualPreviousScene?.startFrame ?? "N/A"
      } to ${activeScene.startFrame}. Starting transition...`
    );
    isTransitioning = true;
    transitionStartFrame = currentFrameNum;

    // Store the CURRENT rendered colors as the starting point for the transition
    previousCellColors = currentCellColors.map((row) => row.map((c) => c)); // Deep copy current colors
    previousBgColor = currentBgColor
      ? p.color(currentBgColor.toString())
      : null; // Clone current color
    previousSecondaryColor = currentSecondaryColor
      ? p.color(currentSecondaryColor.toString())
      : null;

    // Calculate NEW target scene colors based on the NEW active scene
    targetBgColor = parseColor(
      p,
      activeScene.backgroundColor,
      activeColorScheme.background
    );
    targetSecondaryColor = parseColor(
      p,
      activeScene.secondaryColor,
      activeColorScheme.primary_darker
    );

    // Calculate NEW target cell colors based on the NEW active scene and its target secondary color
    calculateTargetCellColors(p, activeScene, targetSecondaryColor);

    // sceneTransitionProgress = 0; // REMOVED

    // Update target points only when scene changes
    calculateNewTargetPoints(p, currentFrameNum);
  } // End of sceneChanged block

  // --- Calculate Transition Progress ---
  let sceneTransitionProgress = 1.0;
  if (isTransitioning) {
    const framesSinceStart = currentFrameNum - transitionStartFrame;
    sceneTransitionProgress = Math.min(
      1.0,
      framesSinceStart / config.colorTransitionFrames
    );

    // Log progress during transition
    if (currentFrameNum % 5 === 0) {
      console.log(
        `[Frame ${currentFrameNum}] Transition Progress: ${sceneTransitionProgress.toFixed(
          3
        )} (Frames elapsed: ${framesSinceStart})`
      );
    }

    if (sceneTransitionProgress >= 1.0) {
      isTransitioning = false; // End transition
      console.log(`[Frame ${currentFrameNum}] Transition Finished.`);
      // Ensure final colors match target precisely
      previousBgColor = targetBgColor;
      previousSecondaryColor = targetSecondaryColor;
      previousCellColors = targetCellColors;
    }
  }

  // Apply easing to the progress if desired (optional)
  // const easedTransitionProgress = easeInOutQuad(sceneTransitionProgress); // Example
  const finalTransitionProgress = sceneTransitionProgress; // Use linear for now

  // --- Interpolate Colors ---
  currentBgColor = interpolateColor(
    p,
    previousBgColor!,
    targetBgColor!,
    finalTransitionProgress // Use the calculated progress
  );
  currentSecondaryColor = interpolateColor(
    p,
    previousSecondaryColor!,
    targetSecondaryColor!,
    finalTransitionProgress // Use the calculated progress
  );

  // Log interpolated BgColor during transition
  if (isTransitioning && currentFrameNum % 5 === 0) {
    console.log(
      `[Frame ${currentFrameNum}] BgColor Lerp: Prev=${previousBgColor?.toString()}, Target=${targetBgColor?.toString()}, Current=${currentBgColor?.toString()}, T=${finalTransitionProgress.toFixed(
        3
      )}`
    );
  }

  // Interpolate individual cell colors using the same progress
  for (let r = 0; r < config.gridRows; r++) {
    for (let c = 0; c < config.gridColumns; c++) {
      if (previousCellColors[r]?.[c] && targetCellColors[r]?.[c]) {
        currentCellColors[r][c] = interpolateColor(
          p,
          previousCellColors[r][c],
          targetCellColors[r][c],
          finalTransitionProgress // Use the calculated progress
        );
        // --- Fix Linter and Log for Cell[0][0] Color ---
        if (
          r === 0 &&
          c === 0 &&
          isTransitioning &&
          currentFrameNum % 5 === 0
        ) {
          const prevHex = previousCellColors[r][c].toString("#rrggbb");
          const targetHex = targetCellColors[r][c].toString("#rrggbb");
          const currentHex = currentCellColors[r][c].toString("#rrggbb");
          console.log(
            `[Frame ${currentFrameNum}] Cell[0][0] Lerp: Prev=${prevHex}, Target=${targetHex}, Current=${currentHex}, T=${finalTransitionProgress.toFixed(
              3
            )}`
          );
        }
      } else if (targetCellColors[r]?.[c]) {
        // Fallback if previous doesn't exist (e.g., grid resize?)
        currentCellColors[r][c] = targetCellColors[r][c];
      } else {
        // Fallback if target is somehow missing
        currentCellColors[r][c] = currentSecondaryColor ?? p.color(128); // Use interpolated secondary or gray
      }
    }
  }

  // --- Recalculate Target Cell Colors based on INTERPOLATED secondary color ---
  // This is important if filler cells should fade with the secondary color transition
  // If filler cells should snap to the new scene's secondary color, calculate targetCellColors
  // ONLY during sceneChanged block.
  // Let's assume fillers should transition smoothly:
  calculateTargetCellColors(p, activeScene, currentSecondaryColor!);
  // Re-apply target colors to the currentCellColors where the original layout was null
  // (This ensures filler cells update during the transition)
  for (let r = 0; r < config.gridRows; r++) {
    for (let c = 0; c < config.gridColumns; c++) {
      if (!activeScene.layoutGrid?.[r]?.[c]) {
        // If it's a filler cell in the *target* layout
        if (targetCellColors[r]?.[c]) {
          currentCellColors[r][c] = targetCellColors[r][c]; // Update filler cell to the calculated target (based on interpolated secondary)
        }
      }
    }
  }

  // --- Always Update Point Positions ---
  const easingFunc = getActiveEasingFunction();
  const timeParam = (currentFrameNum % FPS) / FPS; // Example: simple cyclical time, adjust as needed
  const easedTime = easingFunc(timeParam); // Apply easing if desired for interpolation

  // Interpolate points towards their target using pointFollowFactor
  const followFactor = config.pointFollowFactor; // How quickly points move to target
  for (let r = 0; r < currentPoints.length; r++) {
    for (let c = 0; c < currentPoints[r].length; c++) {
      const current = currentPoints[r][c];
      const target = targetPoints[r][c];

      // Noise displacement calculation (moved from calculateNewTargetPoints)
      const noiseValX = noise3D(
        target.x * config.noiseFrequencyX * 0.01, // Scale frequency
        target.y * config.noiseFrequencyX * 0.01,
        currentFrameNum * config.noiseSpeed * 0.1 // Scale speed
      );
      const noiseValY = noise3D(
        target.x * config.noiseFrequencyY * 0.01 + 1000, // Offset Y noise
        target.y * config.noiseFrequencyY * 0.01 + 1000,
        currentFrameNum * config.noiseSpeed * 0.1
      );

      // Map noise from [-1, 1] to displacement range
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

      // Apply noise to the target position
      const noisyTargetX = target.x + displacementX;
      const noisyTargetY = target.y + displacementY;

      // Debug log for specific point (optional)
      // if (r === 1 && c === 1) {
      //   console.log(`[Frame ${currentFrameNum}] Noise Disp[${r}][${c}]: dx=${displacementX.toFixed(2)}, dy=${displacementY.toFixed(2)}`);
      // }

      // Lerp towards the *noisy* target
      const newX = p.lerp(current.x, noisyTargetX, followFactor);
      const newY = p.lerp(current.y, noisyTargetY, followFactor);

      // Debug log for lerp (optional)
      // if (r === 1 && c === 1) {
      //    console.log(`[Frame ${currentFrameNum}] Lerp[${r}][${c}]: Curr=(${current.x.toFixed(1)}, ${current.y.toFixed(1)}) Target=(${noisyTargetX.toFixed(1)}, ${noisyTargetY.toFixed(1)}) New=(${newX.toFixed(1)}, ${newY.toFixed(1)}) Factor=${followFactor}`);
      // }

      currentPoints[r][c] = { x: newX, y: newY };
    }
  }

  // Update rectangle vertices based on interpolated points
  updateRectangles();

  // 6. Render
  p.background(currentBgColor);

  // --- NEW: Render Background Characters ---
  if (
    activeScene &&
    activeScene.backgroundChars &&
    activeScene.backgroundChars.length > 0
  ) {
    const chars = activeScene.backgroundChars;
    const charLength = chars.length;
    const fontSize = config.textureSizePreview * 0.6; // Adjust font size as needed
    p.textSize(fontSize);
    p.textAlign(p.CENTER, p.CENTER);

    // Determine background character color (e.g., slightly darker/lighter than bg or low alpha secondary)
    // REMOVED calculation based on primary background
    // const bgColorR = p.red(currentBgColor!); // Assumes currentBgColor is not null
    // const bgColorG = p.green(currentBgColor!);
    // const bgColorB = p.blue(currentBgColor!);
    // Example: Make slightly lighter or darker based on brightness, with low alpha
    // const brightness = (bgColorR * 0.299 + bgColorG * 0.587 + bgColorB * 0.114);
    // const delta = brightness > 128 ? -30 : 30; // Adjust contrast amount
    // const bgCharColor = p.color(bgColorR + delta, bgColorG + delta, bgColorB + delta, 30); // Low alpha (adjust 30)

    // Use the interpolated secondary color directly
    if (!currentSecondaryColor) {
      console.warn(
        "currentSecondaryColor is null, cannot draw background chars"
      );
      // Handle the case where color is null, maybe skip drawing or use a default
    } else {
      p.fill(currentSecondaryColor); // Use the secondary color directly
      p.noStroke();

      // Get cell dimensions (assuming uniform grid for simplicity)
      const cellWidth = config.width / config.gridColumns;
      const cellHeight = config.height / config.gridRows;
      const offsetX = cellWidth / 2;
      const offsetY = cellHeight / 2 + fontSize * 0.3; // Adjust vertical offset

      // Loop through grid cells and draw background characters
      for (let r = 0; r < config.gridRows; r++) {
        for (let c = 0; c < config.gridColumns; c++) {
          const charIndex = (r * config.gridColumns + c) % charLength;
          const charToDraw = chars[charIndex];
          const x = c * cellWidth + offsetX;
          const y = r * cellHeight + offsetY;
          p.text(charToDraw, x, y);
        }
      }
    }
  }

  // --- Render Main Rectangles (using existing texture renderer) ---
  rectangles.forEach((rect, index) => {
    const metadata = rect.getMetadata();
    // Ensure metadata exists and row/col indices are valid before rendering
    if (
      metadata &&
      metadata.rowTopLeft < currentCellColors.length &&
      metadata.colTopLeft < currentCellColors[metadata.rowTopLeft]?.length
    ) {
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
const setupAnimation: AnimationFunction = (
  p: p5,
  _normalizedTime?: number, // Made optional
  _currentFrameNum?: number, // Made optional
  _totalFrames?: number, // Made optional
  props?: { noiseSeedPhrase?: string } // Added optional props argument
): void => {
  // Declare initialSceneIndex at the top level of the function
  let initialSceneIndex = 0;

  activeColorScheme = getActiveColorScheme(config.colorSchemeName);
  console.log(`Using color scheme: ${config.colorSchemeName}`);
  p.background(activeColorScheme.background);
  p.frameRate(config.fps);

  // --- Initialize Noise with Seed ---
  // PRIORITIZE seed from props if provided
  const seedPhraseToUse = props?.noiseSeedPhrase ?? config.noiseSeedPhrase;
  const seedNumber = stringToSeed(seedPhraseToUse);
  const seededPrng = mulberry32(seedNumber);
  noise3D = createNoise3D(seededPrng); // Pass the seeded PRNG
  console.log(
    `Initialized noise with seed phrase: "${seedPhraseToUse}" (numeric: ${seedNumber})`
  );

  // --- Collect all unique characters needed for textures ---
  const chars = config.fillerChars || " ";
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
  });
  allNeededChars = Array.from(charSet).join("");

  if (typeof allNeededChars !== "string" || allNeededChars.length === 0) {
    console.warn(
      "No valid characters found for textures, using fallback space."
    );
    allNeededChars = " ";
  }
  console.log("Characters needed for textures:", allNeededChars);

  // --- Generate textures ---
  const selectedTextureSize = config.useHighResTextures
    ? config.textureSizeRender
    : config.textureSizePreview;
  console.log(
    `Using texture size: ${selectedTextureSize}x${selectedTextureSize}`
  );

  if (typeof allNeededChars === "string") {
    // Use the collected allNeededChars string here
    alphabetTextures = generateAlphabetTextures(
      p,
      selectedTextureSize,
      config.fontFamily,
      allNeededChars
    );
  } else {
    console.error(
      "Critical error: allNeededChars is not a string before generating textures!"
    );
    alphabetTextures = generateAlphabetTextures(
      p,
      selectedTextureSize,
      config.fontFamily,
      "? "
    );
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

  if (!activeScene) {
    // Check if activeScene is null after finding index
    // Accessing initialSceneIndex here is now safe
    console.error(
      `Failed to find active scene with index ${initialSceneIndex}. Initializing with defaults.`
    );
    // Initialize colors with defaults if no active scene
    targetBgColor = parseColor(p, undefined, DEFAULT_BG_COLOR);
    targetSecondaryColor = parseColor(p, undefined, DEFAULT_SECONDARY_COLOR);
  } else {
    // Initialize Color State using the found activeScene
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

  // Initialize current/previous colors
  previousBgColor = targetBgColor;
  previousSecondaryColor = targetSecondaryColor;
  currentBgColor = targetBgColor;
  currentSecondaryColor = targetSecondaryColor; // Use the parsed target color initially

  // Calculate initial target points based on the first active scene
  if (activeScene) {
    calculateNewTargetPoints(p, 0); // Initial calculation for targetPoints at frame 0
    // Parse the initial secondary color *before* passing to initializeCellColors
    const initialSecondaryParsed = parseColor(
      p,
      activeScene.secondaryColor,
      DEFAULT_SECONDARY_COLOR
    );
    initializeCellColors(p, activeScene, initialSecondaryParsed);
  } else {
    // No active scene, initialize target points to original
    targetPoints = originalPoints.map((row) => row.map((pt) => ({ ...pt })));
    // ... (initialize cell colors with defaults)
  }

  // Initialize current points to the *original* points, not the first target
  currentPoints = originalPoints.map((row) => row.map((pt) => ({ ...pt })));

  updateRectangles(); // Initial update based on starting points (original)

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
