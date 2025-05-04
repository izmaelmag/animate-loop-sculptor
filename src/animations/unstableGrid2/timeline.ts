// Timeline configuration for unstableGrid2 animation

// Import the timeline data from the JSON file
import timelineData from "./timeline.json";

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
  /** Optional direct style for this cell */
  style?: CellStyle;
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
  /** Optional background character string */
  backgroundChars?: string;
  /** 2D layout array [row][col], null = filler */
  layoutGrid: (LayoutCell | null)[][];
  /** Style presets for this scene (maybe less used now, keep for filler?) */
  stylePresets: Record<string, CellStyle>;
}

// --- Default Timeline Data (Updated format) ---

// Define colors beforehand for the example (using colors from 'dark_blue_red')
const primaryColor = "#E94560";
const primaryDarkerColor = "#B3364E";
const secondaryColor = "#0F3460";
const whiteColor = "#FFFFFF";
const bgColorScene1 = "#1A1A2E";
const bgColorScene2 = "#2A2A4E";
const secondaryColorScene3 = "#406080";

// Assign the imported data to the timeline constant with the correct type
export const timeline: AnimationScene[] = timelineData;

// --- Timeline Processing Function --
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
