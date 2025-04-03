import { renderGrid, GridOptions } from "../../utils/renderGrid";
import p5 from "p5";

export function createGrid(
  p: p5,
  currentFrame: number,
  overrides: Partial<GridOptions> = {},
  SCALE: number,
  GRID_CENTER: number[]
): p5.Image {
  return renderGrid({
    p,
    scale: SCALE,
    invertY: true,
    invertX: false,
    center: {
      x: GRID_CENTER[0],
      y: GRID_CENTER[1],
    },

    showMain: true,
    mainColor: "#555",
    mainOpacity: 1,
    mainWidth: 2, // Increased line width for better visibility

    showSecondary: true,
    secondaryColor: "#333333",
    secondaryOpacity: 1,
    secondaryWidth: 2,

    showTicks: false,
    showUnits: false,
    textSize: 24, // Increased text size for better visibility

    subgrid: 2,
    subgridColor: "#222222",
    subgridOpacity: 1,
    subgridWidth: 1,

    animated: true,
    animationFramesLength: 30,
    currentGlobalFrame: currentFrame,
    stagger: 2,
    delay: 10,

    ...overrides,
  });
}
