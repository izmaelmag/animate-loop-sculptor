// Configuration for the unstableGrid2 animation (Point Grid based)

// Import timeline types and data
import { AnimationScene, timeline } from "./timeline";

// --- Цветовые Схемы (для фона и дефолтных стилей) ---
interface ColorScheme {
  background: string;
  primary: string;
  primary_darker: string;
  secondary: string;
}

export type ColorSchemeName =
  | "dark_purple_lime"
  | "dark_blue_red"
  | "bright_coral_aqua"
  | "muted_gray_blue";

const colorSchemes: Record<ColorSchemeName, ColorScheme> = {
  dark_purple_lime: {
    background: "#000000",
    primary: "#32CD32",
    primary_darker: "#228B22",
    secondary: "#6A0DAD",
  },
  dark_blue_red: {
    background: "#1A1A2E",
    primary: "#E94560",
    primary_darker: "#B3364E",
    secondary: "#0F3460",
  },
  bright_coral_aqua: {
    background: "#F5F5F5",
    primary: "#FF6B6B",
    primary_darker: "#CD5C5C",
    secondary: "#4ECDC4",
  },
  muted_gray_blue: {
    background: "#E0E0E0",
    primary: "#A0AEC0",
    primary_darker: "#718096",
    secondary: "#718096",
  },
};

export function getActiveColorScheme(name: ColorSchemeName): ColorScheme {
  return colorSchemes[name] || colorSchemes.dark_blue_red;
}

// --- Easing Function Types ---
// ... (EasingFunctionName definition remains here) ...
export type EasingFunctionName =
  | "linear"
  | "easeInSine"
  | "easeOutSine"
  | "easeInOutSine"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "easeInQuart"
  | "easeOutQuart"
  | "easeInOutQuart"
  | "easeInQuint"
  | "easeOutQuint"
  | "easeInOutQuint"
  | "easeInExpo"
  | "easeOutExpo"
  | "easeInOutExpo"
  | "easeInCirc"
  | "easeOutCirc"
  | "easeInOutCirc"
  | "easeInBack"
  | "easeOutBack"
  | "easeInOutBack"
  | "easeInElastic"
  | "easeOutElastic"
  | "easeInOutElastic"
  | "easeInBounce"
  | "easeOutBounce"
  | "easeInOutBounce";

// --- Основной Интерфейс Конфигурации ---
export interface UnstableGridConfig {
  // Canvas/Render Settings
  width: number;
  height: number;
  fps: number;
  durationInSeconds: number;

  // Grid Structure
  gridColumns: number;
  gridRows: number;
  includeOuterEdges: boolean;
  outerEdgePadding: number;

  // Colors
  colorSchemeName: ColorSchemeName;

  // --- Таймлайн Текста ---
  animationTimeline: AnimationScene[]; // Используем импортированный тип
  fillerChars: string;
  defaultStyleId: string; // ID стиля по умолчанию для fillerChars (из первой сцены таймлайна)

  // Font & Textures
  fontFamily: string;
  fontUrl: string;
  textureSizePreview: number;
  textureSizeRender: number;
  useHighResTextures: boolean;
  textureUvEpsilon: number;
  subdivisionLevel: number;

  // Animation Timing
  easingFunctionName: EasingFunctionName;
  colorTransitionFrames: number;

  // Point Movement (Noise Based)
  noiseSpeed: number;
  noiseFrequencyX: number;
  noiseFrequencyY: number;
  noiseAmplitudeX: number; // Max displacement based on noise
  noiseAmplitudeY: number;
  pointFollowFactor: number; // Smoothing factor (0-1)
}

// --- Хелперы для Размеров Сетки ---
// Теперь принимают импортированный тип AnimationScene[]
function calculateGridColumnsFromTimeline(timeline: AnimationScene[]): number {
  if (!timeline || timeline.length === 0) return 5;
  let maxCols = 0;
  for (const scene of timeline) {
    if (scene.layoutGrid && scene.layoutGrid.length > 0) {
      const sceneMaxCols = Math.max(
        ...scene.layoutGrid.map((row) => row?.length || 0)
      );
      maxCols = Math.max(maxCols, sceneMaxCols);
    }
  }
  return Math.max(2, maxCols);
}

function calculateGridRowsFromTimeline(timeline: AnimationScene[]): number {
  if (!timeline || timeline.length === 0) return 5;
  let maxRows = 0;
  for (const scene of timeline) {
    if (scene.layoutGrid) {
      maxRows = Math.max(maxRows, scene.layoutGrid.length);
    }
  }
  return Math.max(3, maxRows);
}

// Default colors (added export)
export const DEFAULT_BG_COLOR = "#282c34";
export const DEFAULT_SECONDARY_COLOR = "#555555";

// --- Default Configuration Values ---
export const config: UnstableGridConfig = {
  // Canvas/Render Settings
  width: 1080,
  height: 1920, // User changed
  fps: 60,
  durationInSeconds: 15, // User changed

  // Grid Structure
  // Используем импортированный timeline
  gridColumns: calculateGridColumnsFromTimeline(timeline), // REMOVE
  gridRows: calculateGridRowsFromTimeline(timeline), // REMOVE
  includeOuterEdges: true,
  outerEdgePadding: 150,

  // Colors
  colorSchemeName: "dark_blue_red",

  // Text Content
  // Используем импортированный timeline
  animationTimeline: timeline,
  fillerChars:
    "@$^%@$%&^*^#!*&%$#@@#$%^&*@$^%@$%&^*^#!*&%$#@@#$%^&*@$^%@$%&^*^#!*&%$#@#$%^&*",
  defaultStyleId: "filler",

  // Font & Textures
  fontFamily: "Cascadia Code",
  fontUrl: "/CascadiaCode.ttf",
  textureSizePreview: 128,
  textureSizeRender: 1024,
  useHighResTextures: true,
  textureUvEpsilon: 0.01,
  subdivisionLevel: 8,

  // Animation Timing
  easingFunctionName: "easeInOutElastic",
  colorTransitionFrames: 45,

  // Point Movement (Noise Based)
  noiseSpeed: 0.05,
  noiseFrequencyX: 0.5,
  noiseFrequencyY: 0.5,
  noiseAmplitudeX: 50, // Example: Max 50px displacement
  noiseAmplitudeY: 50,
  pointFollowFactor: 0.5, // Example: 8% towards target each frame
};
