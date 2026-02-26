# Animation System

## Overview

The animation system has three core parts:
1. **AnimationSettings** - Declarative configuration for each animation template
2. **AnimationController** - Engine that manages p5.js lifecycle and frame timing
3. **Animation functions** - Pure render functions called each frame

## AnimationSettings Interface

Defined in `src/types/animations.ts`:

```typescript
interface AnimationSettings {
  name: string;           // Display name for UI
  id: string;             // Unique identifier (used as registry key)
  fps: number;            // Target frames per second
  totalFrames: number;    // Total frames in the loop
  width?: number;         // Canvas width in pixels (default: 1080)
  height?: number;        // Canvas height in pixels (default: 1920)
  function: AnimationFunction;     // Main draw function (called every frame)
  preload?: AnimationFunction;     // p5 preload phase (currently unused)
  onSetup?: AnimationFunction;     // Called once during p5 setup
  onUpdate?: AnimationFunction;    // Per-frame update logic (optional)
}
```

## AnimationFunction Signature

```typescript
type AnimationFunction = (
  p: p5,                              // p5 instance
  normalizedTime?: number,            // 0..1 progress through the loop
  currentFrameNum?: number,           // Absolute frame index
  totalFrames?: number,               // Total frames in the loop
  props?: { [key: string]: unknown }  // Optional config (e.g., noiseSeedPhrase)
) => void;
```

Key characteristics:
- **Stateless**: No side effects outside of p5 drawing commands
- **Normalized time**: `currentFrame / (totalFrames - 1)`, ranges 0 to 1
- **Looping**: When `currentFrame` reaches `totalFrames`, it wraps to 0
- **WEBGL context**: All animations render in p5's WEBGL mode (origin at center)

## Animation Registry

`src/animations/index.ts` maintains two parallel maps:

```typescript
// Function lookup: id → render function
export const animations: Record<string, AnimationFunction> = {
  [defaultAnimation.id]: defaultAnimation.function,
  [demo.id]: demo.function,
  // ... 7 total
};

// Settings lookup: id → full settings object
export const animationSettings: Record<string, AnimationSettings> = {
  [defaultAnimation.id]: defaultAnimation,
  // ...
};

export const animationNames: string[] = Object.keys(animations);
```

### Adding a New Animation Template

1. Create a directory under `src/animations/myAnimation/`
2. Export a `settings` object conforming to `AnimationSettings`
3. Register in `src/animations/index.ts`:
   ```typescript
   import { settings as myAnimation } from "./myAnimation";
   // Add to both maps:
   animations[myAnimation.id] = myAnimation.function;
   animationSettings[myAnimation.id] = myAnimation;
   ```

## AnimationController

`src/utils/AnimationController.ts` - The central engine class.

### Responsibilities
- Creates and manages the p5.js instance
- Owns the animation frame loop (`requestAnimationFrame`)
- Tracks current frame, play state, and settings
- Notifies subscribers of state changes (observer pattern)

### Lifecycle

```
constructor(animationId)
  → Loads initial settings (fps, totalFrames, width, height)

initializeP5(containerElement)
  → Destroys previous p5 instance if any
  → Creates new p5 instance in instance mode: new p5(sketch, container)
  → p5.setup():
      → createCanvas(width, height, WEBGL)
      → pixelDensity(1)
      → Calls animation's onSetup() if defined
      → noLoop() (manual frame control)
  → p5.draw():
      → Calls animationFunction(p, normalizedTime, currentFrame, totalFrames)

setAnimation(id)
  → Updates settings (fps, totalFrames, width, height)
  → Loads new animation function
  → Destroys and reinitializes p5 instance
  → Resets to frame 0, stops playback
  → Notifies all subscribers

destroy()
  → Stops animation loop
  → Removes p5 instance
  → Clears all subscriber callbacks
```

### Frame Loop

The loop uses time-based frame calculation (not frame counting):

```typescript
private updateFrame = (): void => {
  const elapsed = performance.now() - this.startTime;
  let targetFrame = Math.floor((elapsed / 1000) * this.fps);
  targetFrame %= this.totalFrames;  // Loop
  this.currentFrame = targetFrame;  // Setter notifies subscribers
  this.redraw();                    // Trigger p5.draw()
  requestAnimationFrame(this.updateFrame);
};
```

This ensures smooth playback even if frames are dropped.

### Observer API

```typescript
// Subscribe to frame changes
const unsub = controller.onFrameChanged((frame, normalizedTime) => { ... });

// Subscribe to play state changes
const unsub = controller.onPlayStateChanged((isPlaying) => { ... });

// Subscribe to settings changes (template switch)
const unsub = controller.onSettingsChanged((fps, totalFrames, width, height) => { ... });

// Each returns an unsubscribe function
unsub();
```

### Properties

| Property | Type | Description |
|---|---|---|
| `currentFrame` | `number` | Get/set current frame (clamped to 0..totalFrames-1) |
| `normalizedTime` | `number` (readonly) | `currentFrame / (totalFrames - 1)`, range 0..1 |
| `isPlaying` | `boolean` | Get/set playback state (auto-starts/stops loop) |
| `fps` | `number` | Frames per second |
| `totalFrames` | `number` | Total frames in the loop |
| `width` / `height` | `number` | Canvas dimensions |

## unstableGrid2: Advanced Animation Deep Dive

The most complex animation template. Uses a scene-based timeline with grid layouts, character textures, and noise-driven point movement.

### Configuration (`config.ts`)

```typescript
interface UnstableGridConfig {
  // Canvas
  width: number;                    // 1080
  height: number;                   // 1920
  fps: number;                      // 60
  durationInSeconds: number;        // 68

  // Grid
  gridColumns: number;              // Derived from timeline
  gridRows: number;                 // Derived from timeline
  includeOuterEdges: boolean;       // true
  outerEdgePadding: number;         // 150px

  // Colors
  colorSchemeName: ColorSchemeName; // "dark_blue_red"

  // Timeline
  animationTimeline: AnimationScene[];
  fillerChars: string;              // Random chars for empty cells
  defaultStyleId: string;           // "filler"

  // Font & Textures
  fontFamily: string;               // "Cascadia Code"
  fontUrl: string;                  // "/CascadiaCode.ttf"
  textureSizePreview: number;       // 512
  textureSizeRender: number;        // 512
  subdivisionLevel: number;         // 8

  // Easing
  easingFunctionName: EasingFunctionName;  // "easeInOutElastic"
  colorTransitionFrames: number;           // 25

  // Noise
  noiseSpeed: number;               // 0.005
  noiseFrequencyX/Y: number;        // 0.5
  noiseAmplitudeX/Y: number;        // 50px max displacement
  pointFollowFactor: number;        // 0.5 (smoothing)
  noiseSeedPhrase: string;          // Deterministic seed
}
```

### Scene Timeline (`timeline.ts`)

Scenes are defined in `timeline.json` and typed as:

```typescript
interface AnimationScene {
  startFrame: number;
  durationFrames?: number;
  backgroundColor?: string;
  secondaryColor?: string;
  backgroundChars?: string;
  layoutGrid: (LayoutCell | null)[][];  // [row][col], null = filler char
  stylePresets: Record<string, CellStyle>;
}

interface LayoutCell {
  char: string;
  style?: { color: string };
}
```

The animation reads the current frame, finds the active scene, and renders the grid with character textures, interpolating colors during transitions.

### Color Schemes

Four predefined schemes:
- `dark_purple_lime`: Black bg, lime green primary, purple secondary
- `dark_blue_red`: Dark blue bg, coral red primary, navy secondary
- `bright_coral_aqua`: Light bg, coral primary, teal secondary
- `muted_gray_blue`: Light gray bg, muted blue tones

### Easing Functions (`utils/easing.ts`)

30 easing functions available, organized by curve family:
- Sine, Quad, Cubic, Quart, Quint, Expo, Circ, Back, Elastic, Bounce
- Each has In, Out, InOut variants
- Used for color transitions and movement interpolation

## Utility Classes

### Point (`utils/Point/`)
Geometry class for 2D coordinates. Used for grid point positions and noise-based displacement.

### Line (`utils/Line/`)
Line segment geometry between two Points.

### Color (`utils/Color/`)
Color manipulation: hex conversion, RGB interpolation, brightness calculations.

### Numset (`utils/Numset/`)
Number range/set utility for managing frame ranges and intervals.
