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

export const timeline: AnimationScene[] = [
  {
    startFrame: 111,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "S",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "O",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "U",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffa92c",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 67,
  },
  {
    startFrame: 178,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "S",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "O",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "U",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffa92c",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        null,
        null,
        {
          char: "I",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "T",
          style: {
            color: "#ffa92c",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 35,
  },
  {
    startFrame: 213,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "S",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "O",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "U",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffa92c",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        null,
        null,
        {
          char: "I",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "T",
          style: {
            color: "#ffa92c",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "K",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "E",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "E",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "P",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "S",
          style: {
            color: "#ffd145",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 27,
  },
  {
    startFrame: 240,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "S",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "O",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "U",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffa92c",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        null,
        null,
        {
          char: "I",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "T",
          style: {
            color: "#ffa92c",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "K",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "E",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "E",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "P",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "S",
          style: {
            color: "#ffd145",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "O",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 27,
  },
  {
    startFrame: 267,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "S",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "O",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "U",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffa92c",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        null,
        null,
        {
          char: "I",
          style: {
            color: "#ffa92c",
          },
        },
        {
          char: "T",
          style: {
            color: "#ffa92c",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "K",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "E",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "E",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "P",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "S",
          style: {
            color: "#ffd145",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "O",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "P",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "L",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "A",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "Y",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
      ],
      [
        null,
        null,
        null,
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "G",
          style: {
            color: "#ffd145",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 25,
  },
  {
    startFrame: 315,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "L",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
        null,
      ],
      [
        null,
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
        null,
      ],
      [
        null,
        {
          char: "K",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
        null,
      ],
      [
        null,
        {
          char: "E",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 4,
  },
  {
    startFrame: 319,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "L",
          style: {
            color: "#ffd145",
          },
        },
        null,
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "T",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "S",
          style: {
            color: "#ffd145",
          },
        },
        null,
      ],
      [
        null,
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
        null,
      ],
      [
        null,
        {
          char: "K",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
        null,
      ],
      [
        null,
        {
          char: "E",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 19,
  },
  {
    startFrame: 338,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "L",
          style: {
            color: "#ffd145",
          },
        },
        null,
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "T",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "S",
          style: {
            color: "#ffd145",
          },
        },
        null,
      ],
      [
        null,
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
        null,
      ],
      [
        null,
        {
          char: "K",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
        null,
      ],
      [
        null,
        {
          char: "E",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "O",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 52,
  },
  {
    startFrame: 390,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "L",
          style: {
            color: "#ffd145",
          },
        },
        null,
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "T",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "S",
          style: {
            color: "#ffd145",
          },
        },
        null,
      ],
      [
        null,
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
        null,
      ],
      [
        null,
        {
          char: "K",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
        null,
      ],
      [
        null,
        {
          char: "E",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "O",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        null,
        {
          char: "A",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffd145",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "O",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 57,
  },
  {
    startFrame: 447,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "A",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 36,
  },
  {
    startFrame: 483,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "A",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "M",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "U",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "S",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "C",
          style: {
            color: "#ffd145",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 61,
  },
  {
    startFrame: 544,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "A",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "M",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "U",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "S",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "C",
          style: {
            color: "#ffd145",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        null,
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
      ],
      [
        null,
        null,
        null,
        {
          char: "S",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 34,
  },
  {
    startFrame: 578,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "A",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "M",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "U",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "S",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "C",
          style: {
            color: "#ffd145",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        null,
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
      ],
      [
        null,
        null,
        null,
        {
          char: "S",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "R",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "E",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "L",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
      ],
      [
        null,
        null,
        {
          char: "G",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "O",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 50,
  },
  {
    startFrame: 660,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "A",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 16,
  },
  {
    startFrame: 676,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "A",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
      ],
      [
        null,
        null,
        {
          char: "T",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "H",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "E",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
      ],
      [
        null,
        null,
        {
          char: "G",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "O",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 35,
  },
  {
    startFrame: 711,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "A",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
      ],
      [
        null,
        null,
        {
          char: "T",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "H",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "E",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
      ],
      [
        null,
        null,
        {
          char: "G",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "O",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
      ],
      [
        null,
        null,
        null,
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
      ],
      [
        null,
        null,
        null,
        {
          char: "S",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 29,
  },
  {
    startFrame: 740,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "A",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
      ],
      [
        null,
        null,
        {
          char: "T",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "H",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "E",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
      ],
      [
        null,
        null,
        {
          char: "G",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "O",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "D",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
      ],
      [
        null,
        null,
        null,
        {
          char: "I",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
      ],
      [
        null,
        null,
        null,
        {
          char: "S",
          style: {
            color: "#ffd145",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "S",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "O",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "N",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "G",
          style: {
            color: "#ffd145",
          },
        },
        {
          char: "!",
          style: {
            color: "#ffd145",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 49,
  },
  {
    startFrame: 789,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "T",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "h",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 25,
  },
  {
    startFrame: 814,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        {
          char: "p",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "p",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "l",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 57,
  },
  {
    startFrame: 871,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "k",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "p",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 42,
  },
  {
    startFrame: 913,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 20,
  },
  {
    startFrame: 933,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        {
          char: "m",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "v",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "i",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "g",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: ",",
          style: {
            color: "#FFFFFF",
          },
        },
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 23,
  },
  {
    startFrame: 970,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "t",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "h",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "y",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 20,
  },
  {
    startFrame: 990,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "s",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "i",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "g",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 58,
  },
  {
    startFrame: 1048,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "l",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "g",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 65,
  },
  {
    startFrame: 1113,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "T",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "h",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "i",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "s",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 42,
  },
  {
    startFrame: 1155,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        {
          char: "f",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "l",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "i",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "g",
          style: {
            color: "#FFFFFF",
          },
        },
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 52,
  },
  {
    startFrame: 1207,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "i",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "s",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 35,
  },
  {
    startFrame: 1242,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "t",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "h",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 15,
  },
  {
    startFrame: 1257,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        {
          char: "h",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "v",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 29,
  },
  {
    startFrame: 1286,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "t",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "h",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "t",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 25,
  },
  {
    startFrame: 1311,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "w",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 36,
  },
  {
    startFrame: 1347,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "l",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "l",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 31,
  },
  {
    startFrame: 1378,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        {
          char: "b",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "l",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "g",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 51,
  },
  {
    startFrame: 1429,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        {
          char: "F",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "r",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "g",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "t",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 83,
  },
  {
    startFrame: 1512,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        {
          char: "d",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "i",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "s",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "c",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "r",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "i",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "m",
          style: {
            color: "#FFFFFF",
          },
        },
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 97,
  },
  {
    startFrame: 1618,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "c",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "u",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "s",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 26,
  },
  {
    startFrame: 1644,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "w",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "'",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "r",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 39,
  },
  {
    startFrame: 1683,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "m",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "d",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 13,
  },
  {
    startFrame: 1696,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "f",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 17,
  },
  {
    startFrame: 1713,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "t",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "h",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 27,
  },
  {
    startFrame: 1740,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "s",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "m",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 51,
  },
  {
    startFrame: 1791,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        {
          char: "E",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "v",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "r",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "y",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "b",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 135,
  },
  {
    startFrame: 1926,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        {
          char: "l",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "v",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "i",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "g",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: ",",
          style: {
            color: "#FFFFFF",
          },
        },
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 30,
  },
  {
    startFrame: 1972,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "i",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "'",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "t",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 16,
  },
  {
    startFrame: 1988,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 17,
  },
  {
    startFrame: 2005,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "t",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "i",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "m",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 20,
  },
  {
    startFrame: 2025,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "d",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 18,
  },
  {
    startFrame: 2043,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 9,
  },
  {
    startFrame: 2052,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "p",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "l",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "c",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 55,
  },
  {
    startFrame: 2107,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "O",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "h",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: ",",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 74,
  },
  {
    startFrame: 2184,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "w",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 21,
  },
  {
    startFrame: 2205,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "g",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "t",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 19,
  },
  {
    startFrame: 2224,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "t",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "h",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 27,
  },
  {
    startFrame: 2251,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        {
          char: "f",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "l",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "i",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "g",
          style: {
            color: "#FFFFFF",
          },
        },
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 33,
  },
  {
    startFrame: 2284,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "f",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 33,
  },
  {
    startFrame: 2317,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        {
          char: "f",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "r",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "v",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "r",
          style: {
            color: "#FFFFFF",
          },
        },
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 54,
  },
  {
    startFrame: 2371,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "d",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 30,
  },
  {
    startFrame: 2401,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "d",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "y",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 44,
  },
  {
    startFrame: 2445,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        {
          char: "F",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "l",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "y",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "i",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "g",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 87,
  },
  {
    startFrame: 2532,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "l",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "l",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 21,
  },
  {
    startFrame: 2553,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        {
          char: "t",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "g",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "t",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "h",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 61,
  },
  {
    startFrame: 2614,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 28,
  },
  {
    startFrame: 2642,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 31,
  },
  {
    startFrame: 2673,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "v",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "r",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 29,
  },
  {
    startFrame: 2702,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "t",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "h",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 23,
  },
  {
    startFrame: 2725,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "p",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "l",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "i",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 41,
  },
  {
    startFrame: 2766,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "W",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 108,
  },
  {
    startFrame: 2874,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "w",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 9,
  },
  {
    startFrame: 2883,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "m",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "k",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 23,
  },
  {
    startFrame: 2906,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "l",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "v",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: ",",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 84,
  },
  {
    startFrame: 3026,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "w",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 14,
  },
  {
    startFrame: 3040,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "w",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 9,
  },
  {
    startFrame: 3049,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "g",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "t",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 35,
  },
  {
    startFrame: 3084,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "h",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "i",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "g",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "h",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 80,
  },
  {
    startFrame: 3164,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "W",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 37,
  },
  {
    startFrame: 3201,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "w",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 13,
  },
  {
    startFrame: 3214,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "m",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "k",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 26,
  },
  {
    startFrame: 3240,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "l",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "o",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "v",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: ",",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 79,
  },
  {
    startFrame: 3354,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "w",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 16,
  },
  {
    startFrame: 3370,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "w",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "n",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "a",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 11,
  },
  {
    startFrame: 3381,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        null,
        {
          char: "g",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "e",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "t",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 33,
  },
  {
    startFrame: 3414,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        null,
        {
          char: "h",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "i",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "g",
          style: {
            color: "#FFFFFF",
          },
        },
        {
          char: "h",
          style: {
            color: "#FFFFFF",
          },
        },
        null,
        null,
      ],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
    ],
    stylePresets: {
      filler: {
        color: "#333",
      },
      default: {
        color: "#FFFFFF",
      },
    },
    backgroundColor: "#000000",
    secondaryColor: "#222a32",
    durationFrames: 79,
  },
];
// export const timeline: AnimationScene[] = [
//   // --- SCENE 1: "GRID" --- (Uses default colors implicitly)
//   {
//     startFrame: 0,
//     durationFrames: 120,
//     backgroundColor: bgColorScene1,
//     secondaryColor: secondaryColor,
//     stylePresets: {
//       filler: { color: secondaryColor } // Keep filler preset
//     },
//     layoutGrid: [
//       [null, null, null, null, null, null],
//       [
//         null,
//         { char: "G" }, // No style = use default (primaryColor)
//         { char: "R" },
//         { char: "I" },
//         { char: "D" },
//         null,
//       ],
//       [null, null, null, null, null, null],
//       [null, null, null, null, null, null],
//       [null, null, null, null, null, null],
//     ],
//   },
//   // --- SCENE 2: "MORPH" --- (Mixing default and specific style)
//   {
//     startFrame: 120,
//     durationFrames: 180,
//     backgroundColor: bgColorScene2,
//     secondaryColor: secondaryColor,
//     stylePresets: {
//       filler: { color: secondaryColor }
//     },
//     layoutGrid: [
//       [null, null, null, null, null, null, null],
//       [null, null, null, null, null, null, null],
//       [
//         null,
//         { char: "M" }, // Default color
//         { char: "O", style: { color: primaryDarkerColor } }, // Specific color
//         { char: "R" }, // Default color
//         { char: "P", style: { color: primaryDarkerColor } }, // Specific color
//         { char: "H" }, // Default color
//         null,
//       ],
//       [null, null, null, null, null, null, null],
//       [null, null, null, null, null, null, null],
//     ],
//   },
//   // --- SCENE 3: "DONE!" --- (All specific styles)
//   {
//     startFrame: 300,
//     secondaryColor: secondaryColorScene3,
//     stylePresets: {
//       filler: { color: secondaryColorScene3 },
//     },
//     layoutGrid: [
//       [null, null, null, null, null, null, null],
//       [null, null, null, null, null, null, null],
//       [
//         null,
//         null,
//         { char: "D", style: { color: whiteColor } },
//         { char: "O", style: { color: whiteColor } },
//         { char: "N", style: { color: whiteColor } },
//         { char: "E", style: { color: whiteColor } },
//         { char: "!", style: { color: primaryColor } }, // Different color
//       ],
//       [null, null, null, null, null, null, null],
//       [null, null, null, null, null, null, null],
//     ],
//   },
// ];

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
