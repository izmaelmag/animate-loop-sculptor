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
    // Import the type for scene state
    AnimationScene 
} from "./config"; 
import { easings } from "../../utils/easing";

// --- Use config values directly --- 
const DURATION = config.durationInSeconds;
const FPS = config.fps;
let cellAmplitude: number; // Likely unused

// --- State Variables for Point Grid & Timeline ---
let noise2D: ReturnType<typeof createNoise2D>;
let originalPoints: Point[][] = [];
let previousPoints: Point[][] = [];
let targetPoints: Point[][] = [];
let currentPoints: Point[][] = []; 
let rectangles: Rectangle[] = [];
let alphabetTextures: Record<string, p5.Graphics> = {};
let activeColorScheme = getActiveColorScheme(config.colorSchemeName);

// Timeline state
let currentSceneIndex = -1;
let activeScene: AnimationScene | null = null; // Use imported type
let allNeededChars = ""; // String containing all unique characters for textures

// --- Easing Function --- 
function getActiveEasingFunction(): (t: number) => number {
    const functionName = config.easingFunctionName;
    if (Object.prototype.hasOwnProperty.call(easings, functionName)) {
        return easings[functionName as keyof typeof easings];
    }
    console.warn(`Easing function "${functionName}" not found. Falling back to linear.`);
    return easings['linear' as keyof typeof easings] || ((t: number) => t);
}

// --- lerpPoint Helper ---
function lerpPoint(p: p5, p1: Point, p2: Point, t: number): Point {
    return {
        x: p.lerp(p1.x, p2.x, t),
        y: p.lerp(p1.y, p2.y, t),
    };
}

// --- Textured Rectangle Renderer (Uses activeScene) ---
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
    const rectIndex = metadata?.rectIndex; // Keep for potential use in filler logic

    if (col === undefined || row === undefined || vertices.length !== 4 || rectIndex === undefined || !activeScene) return;

    let letter: string | null = null;
    let assignedColorHex: string | null = null;
    let styleId: string | null = null;
    
    // Try to get cell data from the active scene's layoutGrid
    const layoutCell = activeScene.layoutGrid?.[row]?.[col];

    if (layoutCell) { // Cell has defined content (char and styleId)
        letter = layoutCell.char;
        styleId = layoutCell.styleId;
    } else { // Cell is null or outside layoutGrid bounds -> treat as filler
        const charIndex = (rectIndex + col + row) % config.fillerChars.length;
        letter = config.fillerChars[charIndex];
        styleId = config.defaultStyleId; // Use default style ID for fillers
    }

    // Get color from the style preset defined in the active scene
    const stylePreset = activeScene.stylePresets?.[styleId || config.defaultStyleId];
    if (stylePreset) {
        assignedColorHex = stylePreset.color;
    } else {
        // Fallback if style ID is invalid or missing
        console.warn(`Style preset "${styleId || config.defaultStyleId}" not found in active scene. Using secondary color.`);
        assignedColorHex = activeColorScheme.secondary; // Fallback needed
    }

    // --- Rendering (Single Quad) --- 
    if (letter) {
        const texture = alphabetTextures[letter];
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
            // Avoid logging warnings every frame for potentially missing filler chars
            // Only log if it's expected to be a text character? Or log once.
            // console.warn(`Texture not found for letter: ${letter}`);
        }
    }
};

const renderRectangle: RectangleRenderFunction = renderTexturedRectangle;

// --- Setup Grid Points (No changes needed) --- 
function setupGridPoints(p: p5) { 
  // ... initialization code ...
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
    originalPoints[j] = [];
    previousPoints[j] = [];
    targetPoints[j] = [];
    currentPoints[j] = [];
    for (let i = 0; i <= cols; i++) { 
      const x = i * cellWidth;
      const y = j * cellHeight;
      const point = { x, y };
      originalPoints[j][i] = { ...point };
      previousPoints[j][i] = { ...point };
      targetPoints[j][i] = { ...point }; 
      currentPoints[j][i] = { ...point };
    }
  }
  setupRectangles(); 
}

// --- Setup Rectangles (No changes needed) ---
function setupRectangles() {
  // ... logic using currentPoints to create rectangles ...
    rectangles = [];
    const cols = config.gridColumns;
    const rows = config.gridRows;
    for (let j = 0; j < rows; j++) { 
      for (let i = 0; i < cols; i++) { 
          const topLeft = currentPoints[j][i];
          const topRight = currentPoints[j][i+1];
          const bottomRight = currentPoints[j+1][i+1];
          const bottomLeft = currentPoints[j+1][i];
          
          const rect = new Rectangle(topLeft, topRight, bottomRight, bottomLeft);
          rect.setMetadata({ 
            colTopLeft: i, 
            rowTopLeft: j, 
            colBottomRight: i + 1, 
            rowBottomRight: j + 1, 
          });
          rectangles.push(rect);
      }
    }
}

// --- Update Rectangles (No changes needed) ---
function updateRectangles() {
  // ... logic using currentPoints to update rectangle vertices ...
    let rectIndex = 0;
    const cols = config.gridColumns;
    const rows = config.gridRows;
    
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
          if (rectIndex < rectangles.length) { 
              const rect = rectangles[rectIndex];
              const topLeft = currentPoints[j][i];
              const topRight = currentPoints[j][i+1];
              const bottomRight = currentPoints[j+1][i+1];
              const bottomLeft = currentPoints[j+1][i];
              rect.setVertices(topLeft, topRight, bottomRight, bottomLeft);
          }
          rectIndex++;
      }
    }
}

// --- Calculate New Target Points (No changes needed) --- 
function calculateNewTargetPoints(p: p5) {
   // ... logic for calculating target points for inner grid nodes ...
    const cols = config.gridColumns;
    const rows = config.gridRows;
    const cellWidth = config.width / cols;
    const cellHeight = config.height / rows;
    const maxDispX = cellWidth * config.pointDisplacementXFactor;
    const maxDispY = cellHeight * config.pointDisplacementYFactor;

    for (let j = 0; j <= rows; j++) {
        for (let i = 0; i <= cols; i++) {
            if (i === 0 || i === cols || j === 0 || j === rows) {
                targetPoints[j][i] = { ...originalPoints[j][i] }; 
                continue; 
            }
            const randomX = p.random(-1, 1);
            const randomY = p.random(-1, 1);
            const displacementX = randomX * maxDispX;
            const displacementY = randomY * maxDispY;
            targetPoints[j][i] = {
                x: originalPoints[j][i].x + displacementX,
                y: originalPoints[j][i].y + displacementY,
            };
        }
    }
}


// --- Animation Loop (Update Scene Logic) --- 
const animation: AnimationFunction = (p: p5, normalizedTime: number, currentFrameNum: number): void => {
  p.background(activeColorScheme.background);
  p.translate(-config.width / 2, -config.height / 2);

  // --- Find Active Scene --- 
  let newSceneIndex = -1;
  for (let i = config.animationTimeline.length - 1; i >= 0; i--) {
      if (currentFrameNum >= config.animationTimeline[i].startFrame) {
          newSceneIndex = i;
          break;
      }
  }

  // Check if scene changed or if it's the first frame
  if (newSceneIndex !== currentSceneIndex) {
      currentSceneIndex = newSceneIndex;
      if (currentSceneIndex !== -1) {
          activeScene = config.animationTimeline[currentSceneIndex];
          console.log(`Switched to scene ${currentSceneIndex} at frame ${currentFrameNum}`);
          // TODO: Handle transitions? For now, it's instant.
      } else {
          activeScene = null; // No scene active (e.g., before first scene starts)
      }
  }

  // --- Update Point Targets --- 
  const updateInterval = config.updateIntervalFrames;
  const isUpdateFrame = currentFrameNum % updateInterval === 0;
  if (isUpdateFrame || currentFrameNum === 0) { 
      previousPoints = currentPoints.map(row => row.map(pt => ({...pt})));
      calculateNewTargetPoints(p); 
  }

  // --- Interpolate Points --- 
  const progressInInterval = (currentFrameNum % updateInterval) / updateInterval;
  const activeEase = getActiveEasingFunction();
  const lerpFactor = activeEase(progressInInterval);

  for (let j = 0; j < currentPoints.length; j++) {
      for (let i = 0; i < currentPoints[j].length; i++) {
          currentPoints[j][i] = lerpPoint(p, previousPoints[j][i], targetPoints[j][i], lerpFactor);
      }
  }

  // --- Update Geometry & Render --- 
  updateRectangles(); 

  if (activeScene) { // Only render if a scene is active
      rectangles.forEach((rect, index) => {
        const metadata = rect.getMetadata();
        if (metadata) {
          metadata.rectIndex = index; 
          // Pass activeScene implicitly or explicitly if needed by renderer implementation
          renderRectangle(p, normalizedTime, rect.getLines(), rect.getDiagonalIntersection(), rect.getVertices(), rect.getColor(), metadata);
        }
      });
  } else {
      // Optional: Render something else if no scene is active (e.g., just background)
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
  const chars = config.fillerChars || " "; // Use const, ensure fallback
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
  
  // Explicit check and fallback *before* logging and calling
  if (typeof allNeededChars !== 'string' || allNeededChars.length === 0) {
      console.warn("No valid characters found for textures, using fallback space.")
      allNeededChars = " "; 
  }
  console.log("Characters needed for textures:", allNeededChars);

  // --- Generate textures --- 
  const selectedTextureSize = config.useHighResTextures ? config.textureSizeRender : config.textureSizePreview;
  console.log(`Using texture size: ${selectedTextureSize}x${selectedTextureSize}`);
  
  // Ensure allNeededChars is definitely a string before passing
  if (typeof allNeededChars === 'string') {
      alphabetTextures = generateAlphabetTextures(p, selectedTextureSize, config.fontFamily, allNeededChars);
  } else {
      console.error("Critical error: allNeededChars is not a string before generating textures!");
      // Potentially generate with a fallback character to avoid crashing?
      alphabetTextures = generateAlphabetTextures(p, selectedTextureSize, config.fontFamily, "? "); 
  }
  
  // --- Initialize Grid & Scene --- 
  setupGridPoints(p); 
  currentSceneIndex = -1; // Reset scene index
  activeScene = null;

  console.log("Setup complete using config (Timeline). Textures generated:", Object.keys(alphabetTextures).length);
  console.log("Rectangles created:", rectangles.length);
};

// --- Settings Export --- 
export const settings: AnimationSettings = {
  id: "unstableGrid2", 
  name: "unstableGrid2", 
  // ... fps, width, height, totalFrames ...
  fps: config.fps,
  width: config.width,
  height: config.height,
  totalFrames: config.durationInSeconds * config.fps,
  function: animation,
  onSetup: setupAnimation,
}; 