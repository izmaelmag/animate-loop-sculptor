import p5 from "p5";
import { AnimationSettings, AnimationFunction } from "@/types/animations";
import { Column } from "./Columns";
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
import { generateAlphabetTextures } from "@/utils/textureUtils"; // Import the texture generator

// Global variable to hold the generated textures
let alphabetTextures: Record<string, p5.Graphics> = {};
const CHARS_FOR_TEXTURES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Same chars as in generator

const FPS = 60;
const WIDTH = 1080;
const HEIGHT = 1920;
const DURATION = 60;

const columnsCount = 6;
// Number of cells in each column
const cellsCount = 8;
// Amplitude of cell y-movement
const cellAmplitude = WIDTH / columnsCount;
// Noise offset between columns (0 = synchronized, higher = more different)
const columnNoiseOffset = 0.7;

// Noise control parameters
// Frequency for column positioning (lower = smoother transitions)
const columnNoiseFrequency = 0.3;
// Speed of column movement (lower = slower changes)
const columnNoiseSpeed = 10;
// Maximum displacement as a fraction of column width
const columnDisplacementFactor = 0.2;

// Inner grid settings
// Inset from edges in columns
const gridInsetColumns = 0;
// Inset from edges in rows
const gridInsetRows = 0;
// Add outer edge rectangles (за пределами видимой сетки)
const includeOuterEdges = true;
// Extra padding for outer points (pixels)
const outerEdgePadding = 150;

// Create a single noise generator for consistent values
const noise2D = createNoise2D();

// Store line positions
const linePositions: number[] = [];
const originalPositions: number[] = [];

// Store columns
const columns: Column[] = [];

// Store rectangles for inner grid
const rectangles: Rectangle[] = [];

// --- New Textured Rectangle Renderer ---
const renderTexturedRectangle: RectangleRenderFunction = (
  p: p5,
  _normalizedTime: number, // Not used directly here, but part of the signature
  _lines: Line[], // Not used directly here
  _intersection: Point | null, // Not used directly here
  vertices: Point[], // We need the vertices
  _color: Color, // Not used, we use the texture
  metadata: RectangleMetadata | null,
  rectIndex?: number // Pass rectangle index for texture selection
): void => {
  if (vertices.length !== 4 || !rectIndex) {
    return; // Need 4 vertices and index to draw a quad
  }

  // Select texture based on rectangle index
  const charIndex = rectIndex % CHARS_FOR_TEXTURES.length;
  const letter = CHARS_FOR_TEXTURES[charIndex];
  const texture = alphabetTextures[letter];

  if (texture) {
    p.push();
    p.textureMode(p.NORMAL); // Use normalized UV coords (0 to 1)
    p.texture(texture); 
    p.noStroke();

    // Begin drawing the shape
    p.beginShape();

    // Map vertices to UV coordinates (Counter-clockwise order)
    // Top-Left vertex -> UV (0, 0)
    p.vertex(vertices[0].x, vertices[0].y, 0, 0);
    // Top-Right vertex -> UV (1, 0)
    p.vertex(vertices[1].x, vertices[1].y, 1, 0);
    // Bottom-Right vertex -> UV (1, 1)
    p.vertex(vertices[2].x, vertices[2].y, 1, 1);
    // Bottom-Left vertex -> UV (0, 1)
    p.vertex(vertices[3].x, vertices[3].y, 0, 1);

    p.endShape(p.CLOSE);
    p.pop();
  } else {
    // Optional: Draw a placeholder if texture is missing
    // p.fill(255, 0, 0); // Red placeholder
    // p.noStroke();
    // p.quad(
    //   vertices[0].x, vertices[0].y,
    //   vertices[1].x, vertices[1].y,
    //   vertices[2].x, vertices[2].y,
    //   vertices[3].x, vertices[3].y
    // );
  }
};

// Use the new textured renderer instead of the default one
const renderRectangle: RectangleRenderFunction = renderTexturedRectangle;

function setupLines() {
  // Clear any existing data
  linePositions.length = 0;
  originalPositions.length = 0;
  columns.length = 0;

  // Set up evenly spaced lines
  const spacing = WIDTH / columnsCount;

  // Create positions for all division lines (including left and right edge)
  for (let i = 0; i <= columnsCount; i++) {
    const xPos = i * spacing;
    linePositions.push(xPos);
    originalPositions.push(xPos); // Store original positions for reference
  }

  // Create columns between the lines
  for (let i = 0; i < columnsCount; i++) {
    const leftX = linePositions[i];
    const rightX = linePositions[i + 1];
    const column = new Column(leftX, rightX, cellsCount, i, 0);

    // Set amplitude and noise offset for cells
    column.setCellAmplitude(cellAmplitude);
    column.setNoiseOffset(columnNoiseOffset);

    // You can set additional cell noise parameters here
    column.setCellNoiseFrequency(0.3);
    column.setCellNoiseSpeed(10);

    columns.push(column);
  }

  // Create rectangles based on cell centers
  setupRectangles();
}

// Create rectangles connecting cell centers
function setupRectangles() {
  rectangles.length = 0;

  // Calculate limits with extra padding
  const minX = -outerEdgePadding;
  const maxX = WIDTH + outerEdgePadding;
  const minY = -outerEdgePadding;
  const maxY = HEIGHT + outerEdgePadding;

  // Process all cells including edges
  for (let i = 0; i <= columnsCount; i++) {
    for (let j = 0; j <= cellsCount; j++) {
      // Create virtual cell centers for outer edges if needed
      const createRect =
        includeOuterEdges || (i < columnsCount && j < cellsCount);

      if (createRect) {
        // Get or create cell centers
        let topLeft: Point;
        let topRight: Point;
        let bottomRight: Point;
        let bottomLeft: Point;

        // Top-left point
        if (i > 0 && j > 0) {
          topLeft = columns[i - 1].cells[j - 1].center;
        } else {
          // Create virtual point outside the grid
          const x =
            i === 0 ? minX : i > 0 ? columns[i - 1].cells[0].centerX : maxX;
          const y =
            j === 0 ? minY : j > 0 ? columns[0].cells[j - 1].centerY : maxY;
          topLeft = { x, y };
        }

        // Top-right point
        if (i < columnsCount && j > 0) {
          topRight = columns[i].cells[j - 1].center;
        } else {
          // Create virtual point
          const x =
            i >= columnsCount
              ? maxX
              : i < columnsCount
              ? columns[i].cells[0].centerX
              : minX;
          const y =
            j === 0 ? minY : j > 0 ? columns[0].cells[j - 1].centerY : maxY;
          topRight = { x, y };
        }

        // Bottom-right point
        if (i < columnsCount && j < cellsCount) {
          bottomRight = columns[i].cells[j].center;
        } else {
          // Create virtual point
          const x =
            i >= columnsCount
              ? maxX
              : i < columnsCount
              ? columns[i].cells[0].centerX
              : minX;
          const y =
            j >= cellsCount
              ? maxY
              : j < cellsCount
              ? columns[0].cells[j].centerY
              : minY;
          bottomRight = { x, y };
        }

        // Bottom-left point
        if (i > 0 && j < cellsCount) {
          bottomLeft = columns[i - 1].cells[j].center;
        } else {
          // Create virtual point
          const x =
            i === 0 ? minX : i > 0 ? columns[i - 1].cells[0].centerX : maxX;
          const y =
            j >= cellsCount
              ? maxY
              : j < cellsCount
              ? columns[0].cells[j].centerY
              : minY;
          bottomLeft = { x, y };
        }

        // Only create rectangle if all points are valid and within screen bounds
        const rect = new Rectangle(topLeft, topRight, bottomRight, bottomLeft);

        // Store cell indices for updating later
        rect.setMetadata({
          colTopLeft: i - 1,
          rowTopLeft: j - 1,
          colBottomRight: i,
          rowBottomRight: j,
          isEdgeRect:
            i === 0 || j === 0 || i === columnsCount || j === cellsCount,
        });

        rectangles.push(rect);
      }
    }
  }
}

// Update rectangle vertices based on current cell centers
function updateRectangles() {
  // Обновляем существующие прямоугольники вместо пересоздания
  for (const rect of rectangles) {
    const metadata = rect.getMetadata();

    if (metadata) {
      const {
        colTopLeft,
        rowTopLeft,
        colBottomRight,
        rowBottomRight,
        isEdgeRect,
      } = metadata;

      // Получаем актуальные центры ячеек или виртуальные точки
      let topLeft: Point;
      let topRight: Point;
      let bottomRight: Point;
      let bottomLeft: Point;

      // Обрабатываем случаи, когда нужны виртуальные точки за пределами сетки
      const minX = -outerEdgePadding;
      const maxX = WIDTH + outerEdgePadding;
      const minY = -outerEdgePadding;
      const maxY = HEIGHT + outerEdgePadding;

      // Top-left point
      if (
        colTopLeft >= 0 &&
        rowTopLeft >= 0 &&
        colTopLeft < columnsCount &&
        rowTopLeft < cellsCount
      ) {
        topLeft = columns[colTopLeft].cells[rowTopLeft].center;
      } else {
        // Virtual point
        const x =
          colTopLeft < 0
            ? minX
            : colTopLeft >= columnsCount
            ? maxX
            : columns[colTopLeft].cells[0].centerX;
        const y =
          rowTopLeft < 0
            ? minY
            : rowTopLeft >= cellsCount
            ? maxY
            : columns[0].cells[rowTopLeft].centerY;
        topLeft = { x, y };
      }

      // Top-right point
      if (
        colBottomRight >= 0 &&
        rowTopLeft >= 0 &&
        colBottomRight < columnsCount &&
        rowTopLeft < cellsCount
      ) {
        topRight = columns[colBottomRight].cells[rowTopLeft].center;
      } else {
        // Virtual point
        const x =
          colBottomRight < 0
            ? minX
            : colBottomRight >= columnsCount
            ? maxX
            : columns[colBottomRight].cells[0].centerX;
        const y =
          rowTopLeft < 0
            ? minY
            : rowTopLeft >= cellsCount
            ? maxY
            : columns[0].cells[rowTopLeft].centerY;
        topRight = { x, y };
      }

      // Bottom-right point
      if (
        colBottomRight >= 0 &&
        rowBottomRight >= 0 &&
        colBottomRight < columnsCount &&
        rowBottomRight < cellsCount
      ) {
        bottomRight = columns[colBottomRight].cells[rowBottomRight].center;
      } else {
        // Virtual point
        const x =
          colBottomRight < 0
            ? minX
            : colBottomRight >= columnsCount
            ? maxX
            : columns[colBottomRight].cells[0].centerX;
        const y =
          rowBottomRight < 0
            ? minY
            : rowBottomRight >= cellsCount
            ? maxY
            : columns[0].cells[rowBottomRight].centerY;
        bottomRight = { x, y };
      }

      // Bottom-left point
      if (
        colTopLeft >= 0 &&
        rowBottomRight >= 0 &&
        colTopLeft < columnsCount &&
        rowBottomRight < cellsCount
      ) {
        bottomLeft = columns[colTopLeft].cells[rowBottomRight].center;
      } else {
        // Virtual point
        const x =
          colTopLeft < 0
            ? minX
            : colTopLeft >= columnsCount
            ? maxX
            : columns[colTopLeft].cells[0].centerX;
        const y =
          rowBottomRight < 0
            ? minY
            : rowBottomRight >= cellsCount
            ? maxY
            : columns[0].cells[rowBottomRight].centerY;
        bottomLeft = { x, y };
      }

      // Обновляем только вершины, сохраняя тот же объект и его цвет
      rect.setVertices(topLeft, topRight, bottomRight, bottomLeft);
    }
  }
}

const animation: AnimationFunction = (p: p5, normalizedTime: number): void => {
  p.background(0); // Clear background each frame

  // --- BEGIN WEBGL Coordinate System Adjustment ---
  // Translate the coordinate system so (0,0) is the top-left corner
  p.translate(-p.width / 2, -p.height / 2);
  // --- END WEBGL Coordinate System Adjustment ---

  // Reduce delay to start animation almost immediately
  const isActive = normalizedTime > 0.001;

  // Update line positions based on noise
  // Keep first and last positions fixed (edges of screen)
  for (let i = 1; i < linePositions.length - 1; i++) {
    if (isActive) {
      // Use noise to get a value between -1 and 1
      const noiseValue =
        noise2D(i * columnNoiseFrequency, normalizedTime * columnNoiseSpeed) *
          2 -
        1;

      // Maximum displacement amount (% of the original spacing)
      const maxDisplacement = (WIDTH / columnsCount) * columnDisplacementFactor;

      // Calculate new position with displacement
      let newPosition = originalPositions[i] + noiseValue * maxDisplacement;

      // Ensure minimum column width (16px)
      const minLeftX = linePositions[i - 1] + 96; // minimum 96px from previous line
      const maxRightX =
        i < linePositions.length - 1
          ? linePositions[i + 1] - 96 // minimum 96px from next line
          : WIDTH; // or right edge

      // Clamp the new position to maintain minimum width
      newPosition = p.max(minLeftX, p.min(maxRightX, newPosition)); // Use p.max/p.min

      linePositions[i] = newPosition;
    } else {
      // Reset to original position for start of animation
      linePositions[i] = originalPositions[i];
    }
  }

  // Update columns based on line positions
  for (let i = 0; i < columns.length; i++) {
    const leftX = linePositions[i];
    const rightX = linePositions[i + 1];

    columns[i].setBounds(leftX, rightX);
    columns[i].setGlobalProgress(normalizedTime);
    columns[i].update();
  }

  // Update rectangles based on current cell centers
  updateRectangles();

  // Рендеринг всех четырехугольников с использованием renderRectangle (который теперь renderTexturedRectangle)
  rectangles.forEach((rect, index) => {
    const metadata = rect.getMetadata();
    if (metadata) {
      renderRectangle(
        p, // Инстанс p5
        normalizedTime, // Прогресс анимации
        rect.getLines(), // Линии четырехугольника
        rect.getDiagonalIntersection(), // Точка пересечения диагоналей
        rect.getVertices(), // Вершины четырехугольника
        rect.getColor(), // Цвет четырехугольника (не используется в textured renderer)
        metadata, // Метаданные с индексами
        index // Передаем индекс для выбора текстуры
      );
    }
  });
};

const setupAnimation: AnimationFunction = (p: p5): void => {
  p.background(0);
  p.frameRate(FPS);

  // Generate alphabet textures ONCE during setup
  // Assuming the p5 instance 'p' is already in WEBGL mode here
  alphabetTextures = generateAlphabetTextures(p, 256); // Generate 256x256 textures

  setupLines(); // This now also calls setupRectangles internally

  console.log("Setup complete. Textures generated:", Object.keys(alphabetTextures).length);
  console.log("Rectangles created:", rectangles.length);
};

// Now declare the settings after animation is defined
export const settings: AnimationSettings = {
  id: "unstableGrid",
  name: "unstableGrid",

  fps: FPS,
  width: WIDTH,
  height: HEIGHT,
  totalFrames: DURATION * FPS,

  function: animation,
  onSetup: setupAnimation, // Ensure this setup function is used
};
