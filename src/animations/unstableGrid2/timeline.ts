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

export const timeline: AnimationScene[] = [
  {
    startFrame: 0,
    layoutGrid: [
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 40,
  },
  {
    startFrame: 151,
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
          char: "S",
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
          char: "u",
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 191,
  },
  {
    startFrame: 191,
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
          char: "t",
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 20,
  },
  {
    startFrame: 211,
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
        {
          char: "s",
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 232,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 23,
  },
  {
    startFrame: 255,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 40,
  },
  {
    startFrame: 295,
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
          char: "i",
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 19,
  },
  {
    startFrame: 314,
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
          char: "t",
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 24,
  },
  {
    startFrame: 338,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 36,
  },
  {
    startFrame: 374,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 25,
  },
  {
    startFrame: 399,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 64,
  },
  {
    startFrame: 463,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 19,
  },
  {
    startFrame: 482,
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
          char: "i",
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 58,
  },
  {
    startFrame: 540,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 23,
  },
  {
    startFrame: 563,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
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
          char: "g",
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 66,
  },
  {
    startFrame: 629,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 650,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 20,
  },
  {
    startFrame: 670,
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
          char: "d",
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 55,
  },
  {
    startFrame: 725,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 93,
  },
  {
    startFrame: 818,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
        {
          char: "P",
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 53,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 22,
  },
  {
    startFrame: 893,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 914,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 42,
  },
  {
    startFrame: 956,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 977,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 20,
  },
  {
    startFrame: 997,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 45,
  },
  {
    startFrame: 1042,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 79,
  },
  {
    startFrame: 1121,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 1142,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 58,
  },
  {
    startFrame: 1200,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 22,
  },
  {
    startFrame: 1222,
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
        null,
        {
          char: "a",
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 1243,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 45,
  },
  {
    startFrame: 1288,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 18,
  },
  {
    startFrame: 1306,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 24,
  },
  {
    startFrame: 1330,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 38,
  },
  {
    startFrame: 1368,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 98,
  },
  {
    startFrame: 1466,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 53,
  },
  {
    startFrame: 1519,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 100,
  },
  {
    startFrame: 1619,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 1640,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 23,
  },
  {
    startFrame: 1663,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 19,
  },
  {
    startFrame: 1682,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 1703,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 1724,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 81,
  },
  {
    startFrame: 1805,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 103,
  },
  {
    startFrame: 1908,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 44,
  },
  {
    startFrame: 1952,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 19,
  },
  {
    startFrame: 1971,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 23,
  },
  {
    startFrame: 1994,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 18,
  },
  {
    startFrame: 2012,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 19,
  },
  {
    startFrame: 2031,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
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
        {
          char: "s",
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 84,
  },
  {
    startFrame: 2136,
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
          char: "!",
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 40,
  },
  {
    startFrame: 2176,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 2197,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 2218,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 2239,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 43,
  },
  {
    startFrame: 2282,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 2303,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 52,
  },
  {
    startFrame: 2355,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 111,
  },
  {
    startFrame: 2466,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 58,
  },
  {
    startFrame: 2524,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 91,
  },
  {
    startFrame: 2615,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 18,
  },
  {
    startFrame: 2633,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 2654,
    layoutGrid: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [
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
          char: "b",
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
          char: "t",
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
          char: "l",
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 61,
  },
  {
    startFrame: 2715,
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
          char: "n",
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 143,
  },
  {
    startFrame: 2858,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 14,
  },
  {
    startFrame: 2872,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 13,
  },
  {
    startFrame: 2885,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 116,
  },
  {
    startFrame: 3022,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 11,
  },
  {
    startFrame: 3033,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 13,
  },
  {
    startFrame: 3046,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 24,
  },
  {
    startFrame: 3070,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 113,
  },
  {
    startFrame: 3183,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 8,
  },
  {
    startFrame: 3191,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 12,
  },
  {
    startFrame: 3203,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 27,
  },
  {
    startFrame: 3230,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 119,
  },
  {
    startFrame: 3349,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 8,
  },
  {
    startFrame: 3357,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 3378,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 3399,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 119,
  },
  {
    startFrame: 3518,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 10,
  },
  {
    startFrame: 3528,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 8,
  },
  {
    startFrame: 3536,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 24,
  },
  {
    startFrame: 3560,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 124,
  },
  {
    startFrame: 3684,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 8,
  },
  {
    startFrame: 3692,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 3713,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 19,
  },
  {
    startFrame: 3732,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 111,
  },
  {
    startFrame: 3843,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 10,
  },
  {
    startFrame: 3853,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
  {
    startFrame: 3874,
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
    backgroundColor: "#282c34",
    secondaryColor: "#333",
    durationFrames: 21,
  },
];

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
