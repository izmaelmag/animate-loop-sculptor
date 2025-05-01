// Timeline configuration for unstableGrid2 animation

// --- Interfaces ---

/** Cell style definition */
export interface CellStyle {
  /** Primary color */
  color: string;
}

/** Cell content definition in the layout */
export interface LayoutCell {
  /** Displayed character */
  char: string;
  /** Style identifier from stylePresets */
  styleId: string;
}

/** Single scene definition for the timeline */
export interface AnimationScene {
  /** Scene start frame */
  startFrame: number;
  /** Optional duration in frames (otherwise lasts until the next scene) */
  durationFrames?: number;
  /** Optional background color for this scene */
  backgroundColor?: string;
  /** Optional secondary/filler color for this scene */
  secondaryColor?: string;
  /** 2D layout array [row][col], null = filler */
  layoutGrid: (LayoutCell | null)[][];
  /** Style presets for this scene */
  stylePresets: Record<string, CellStyle>;
}

// --- Default Timeline Data ---

// Define colors beforehand for the example (using colors from 'dark_blue_red')
const primaryColor = "#E94560";
const primaryDarkerColor = "#B3364E";
const secondaryColor = "#0F3460";
const whiteColor = "#FFFFFF";
const bgColorScene1 = "#1A1A2E"; // Example background for scene 1
const bgColorScene2 = "#2A2A4E"; // Slightly different background for scene 2
const secondaryColorScene3 = "#406080"; // Different secondary for scene 3

export const timeline: AnimationScene[] = [
  // --- SCENE 1: "GRID" ---
  {
    startFrame: 0,
    durationFrames: 120, // 2 seconds
    backgroundColor: bgColorScene1,
    secondaryColor: secondaryColor, // Use the default secondary
    stylePresets: {
      gridText: { color: primaryColor },
      filler: { color: secondaryColor },
    },
    layoutGrid: [
      [null, null, null, null, null, null],
      [
        null,
        { char: "G", styleId: "gridText" },
        { char: "R", styleId: "gridText" },
        { char: "I", styleId: "gridText" },
        { char: "D", styleId: "gridText" },
        null,
      ],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
    ],
  },
  // --- SCENE 2: "MORPH" ---
  {
    startFrame: 120,
    durationFrames: 180, // 3 seconds
    backgroundColor: bgColorScene2, // Changed background
    secondaryColor: secondaryColor, // Same secondary
    stylePresets: {
      morphNormal: { color: primaryColor },
      morphDarker: { color: primaryDarkerColor },
      filler: { color: secondaryColor },
    },
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        { char: "M", styleId: "morphNormal" },
        { char: "O", styleId: "morphDarker" },
        { char: "R", styleId: "morphNormal" },
        { char: "P", styleId: "morphDarker" },
        { char: "H", styleId: "morphNormal" },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
  },
  // --- SCENE 3: "DONE!" ---
  {
    startFrame: 300, // Starts after the second scene (120 + 180)
    // backgroundColor: undefined, // Will use previous or default
    secondaryColor: secondaryColorScene3, // Changed secondary
    stylePresets: {
      done: { color: whiteColor },
      exclam: { color: primaryColor },
      filler: { color: secondaryColorScene3 }, // Use the new secondary for filler here too
    },
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        { char: "D", styleId: "done" },
        { char: "O", styleId: "done" },
        { char: "N", styleId: "done" },
        { char: "E", styleId: "done" },
        { char: "!", styleId: "exclam" },
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
  },
];

// --- Timeline Processing Function ---

/**
 * Processes the animation timeline.
 * (Currently returns the input timeline unmodified. Future logic can be added here).
 *
 * @param inputTimeline - The raw animation timeline data.
 * @returns The processed animation timeline.
 */
export function processTimeline(
  inputTimeline: AnimationScene[]
): AnimationScene[] {
  console.log("Processing timeline data...");

  // --- Future Logic Placeholder ---
  // TODO: Calculate end frames for scenes without duration?
  // TODO: Validate style IDs against presets?
  // TODO: Merge global default styles?
  // TODO: Sort scenes by startFrame?

  // For now, just perform a basic validation and return the input
  if (!Array.isArray(inputTimeline)) {
    console.error("Invalid timeline input: expected an array.");
    return []; // Return empty on error
  }

  // Example: Ensure scenes are sorted by startFrame (optional but good practice)
  const sortedTimeline = [...inputTimeline].sort(
    (a, b) => a.startFrame - b.startFrame
  );

  console.log(
    `Timeline processing complete. ${sortedTimeline.length} scenes processed.`
  );
  return sortedTimeline;
}

// Example of how it *could* be used (optional, typically done where timeline is consumed)
// const processedDefaultTimeline = processTimeline(defaultTimeline);
