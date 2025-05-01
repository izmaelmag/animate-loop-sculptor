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
  AnimationScene,
} from "./config";
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

// --- State Variables for Point Grid & Timeline ---
let noise2D: ReturnType<typeof createNoise2D>;
let originalPoints: Point[][] = [];
let previousPoints: Point[][] = [];
let targetPoints: Point[][] = [];
let currentPoints: Point[][] = []; // Holds the interpolated points
let rectangles: Rectangle[] = [];
let alphabetTextures: Record<string, p5.Graphics> = {};

// Timeline state (Declarations were missing)
let currentSceneIndex = -1;
let activeScene: AnimationScene | null = null; 
let allNeededChars = ""; // String containing all unique characters for textures

// --- Глобальная переменная для активной схемы ---
let activeColorScheme = getActiveColorScheme(config.colorSchemeName);

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

// --- Textured Rectangle Renderer (Restored Logic) ---
const renderTexturedRectangle: RectangleRenderFunction = (
  p: p5,
  _normalizedTime: number,
  _lines: Line[],
  _intersection: Point | null,
  vertices: Point[], 
  _color: Color, 
  metadata: RectangleMetadata | null
): void => {
  const col = metadata?.colTopLeft; 
  const row = metadata?.rowTopLeft; 
  const rectIndex = metadata?.rectIndex; 

  // Original entry log (keep commented unless needed)
  // console.log(`[Render] rectIndex: ${rectIndex}, col: ${col}, row: ${row}, vertices:`, vertices);

  if (col === undefined || row === undefined || vertices.length !== 4 || rectIndex === undefined || !activeScene) return;
  
  let letter: string | null = null;
  let assignedColorHex: string | null = null;
  // let isTextCell = false; // This flag seems unused now
  let styleId: string | null = null;

  // Check if this cell corresponds to a character in the active scene's layoutGrid
  const layoutCell = activeScene.layoutGrid?.[row]?.[col];

  if (layoutCell) { 
    letter = layoutCell.char;
    styleId = layoutCell.styleId;
    // isTextCell = true; 
  } else { 
    const charIndex = (rectIndex + col + row) % config.fillerChars.length;
    letter = config.fillerChars[charIndex];
    styleId = config.defaultStyleId; 
  }

  const stylePreset = activeScene.stylePresets?.[styleId || config.defaultStyleId];
  if (stylePreset) {
    assignedColorHex = stylePreset.color;
  } else {
    console.warn(`Style preset "${styleId || config.defaultStyleId}" not found. Using secondary color.`);
    assignedColorHex = activeColorScheme.secondary; 
  }

  // Original log for determined values (keep commented unless needed)
  // console.log(`[Render] Letter: ${letter}, StyleID: ${styleId}, Color: ${assignedColorHex}`);

  // --- Rendering (Single Quad) --- 
  if (letter) {
    const texture = alphabetTextures[letter];
    // Original log for texture status (keep commented unless needed)
    // console.log(`[Render] Texture for '${letter}': ${texture ? 'Found' : 'NOT FOUND'}`);
    if (texture) {
      p.push();
      if (assignedColorHex) { p.tint(assignedColorHex); } else { p.tint(255); }
      p.textureMode(p.NORMAL); 
      p.textureWrap(p.CLAMP);
      p.texture(texture);
      p.noStroke();
      
      const UV_EPSILON = config.textureUvEpsilon; 
      const uv00 = { u: UV_EPSILON, v: UV_EPSILON };       
      const uv10 = { u: 1 - UV_EPSILON, v: UV_EPSILON };    
      const uv11 = { u: 1 - UV_EPSILON, v: 1 - UV_EPSILON };
      const uv01 = { u: UV_EPSILON, v: 1 - UV_EPSILON };    

      p.beginShape();
      p.vertex(vertices[0].x, vertices[0].y, uv00.u, uv00.v); 
      p.vertex(vertices[1].x, vertices[1].y, uv10.u, uv10.v); 
      p.vertex(vertices[2].x, vertices[2].y, uv11.u, uv11.v); 
      p.vertex(vertices[3].x, vertices[3].y, uv01.u, uv01.v); 
      p.endShape(p.CLOSE);
      
      p.noTint();
      p.pop();
    } else {
       // console.warn(`Texture not found for letter: ${letter}`);
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

// --- Animation Loop (Update Scene Logic) --- 
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

  // Check if scene changed or if it's the first frame
  const sceneChanged = newSceneIndex !== currentSceneIndex;
  if (sceneChanged) {
      currentSceneIndex = newSceneIndex;
      if (currentSceneIndex !== -1) {
          activeScene = config.animationTimeline[currentSceneIndex];
          console.log(`[Animation Loop] Switched to scene ${currentSceneIndex} at frame ${currentFrameNum}`);
      } else {
          activeScene = null; // No scene active
          console.log(`[Animation Loop] No scene active at frame ${currentFrameNum}`);
      }
  }

  // Log active scene status AFTER potential update
  if (currentFrameNum === 0 || sceneChanged) { // Log on first frame or change
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
  const lerpFactor = activeEase(progressInInterval);
  // Log lerpFactor periodically
  if (currentFrameNum % 15 === 0) { // Log every 15 frames
      console.log(`[Frame ${currentFrameNum}] Lerp Factor: ${lerpFactor.toFixed(3)} (Progress: ${progressInInterval.toFixed(3)})`);
  }

  for (let j = 0; j < currentPoints.length; j++) {
      for (let i = 0; i < currentPoints[j].length; i++) {
          // Log point update periodically for a sample point
          // if (j === 1 && i === 1 && currentFrameNum % 15 === 0) {
          //     console.log(`[Frame ${currentFrameNum}] Interpolating Pt[1][1]:`, previousPoints[j][i], `->`, targetPoints[j][i], ` Result:`, currentPoints[j][i]);
          // }
          currentPoints[j][i] = lerpPoint(p, previousPoints[j][i], targetPoints[j][i], lerpFactor);
      }
  }

  // --- Update Geometry & Render --- 
  updateRectangles(); 

  if (activeScene) { 
      rectangles.forEach((rect, index) => {
        const metadata = rect.getMetadata();
        if (metadata) {
          metadata.rectIndex = index; 
          // Log right before calling render function (Remove this debug log)
          // console.log(`[Loop] Calling render for index ${index}, col ${metadata.colTopLeft}, row ${metadata.rowTopLeft}`);
          renderRectangle(p, normalizedTime, rect.getLines(), rect.getDiagonalIntersection(), rect.getVertices(), rect.getColor(), metadata);
        } else {
           // console.warn(`[Animation Loop] Rectangle ${index} has no metadata.`);
        }
      });
  } else {
       // console.log(`[Animation Loop] Frame ${currentFrameNum}: No active scene, skipping render.`);
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
