# Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        React App                             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Home Page    │  │ Timeline     │  │ Rhythm Tapper     │  │
│  │  (Workspace)  │  │ Editor       │  │ Page              │  │
│  └──────┬───────┘  └──────────────┘  └───────────────────┘  │
│         │                                                    │
│  ┌──────▼───────┐                                            │
│  │  SketchView   │◄──── AnimationContext (React Context)     │
│  │  (p5 canvas)  │              │                            │
│  └──────┬───────┘              │                            │
│         │              ┌───────▼──────────┐                  │
│         └──────────────│AnimationController│                  │
│                        │  (p5.js engine)   │                  │
│                        └───────┬──────────┘                  │
│                                │                             │
│                    ┌───────────▼───────────┐                 │
│                    │  Animation Templates   │                 │
│                    │  (7 registered fns)    │                 │
│                    └───────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Video Render Pipeline                      │
│  render-video.cjs → Remotion Bundle → P5Animation → FFmpeg  │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
BrowserRouter
└── App
    ├── QueryClientProvider
    │   └── TooltipProvider
    │       └── AnimationProvider          ← Context with AnimationController
    │           ├── Toaster (shadcn)
    │           ├── Sonner (toast)
    │           ├── Nav (fixed bottom-right)
    │           └── Routes
    │               ├── / → Index → Workspace
    │               │                  └── SketchView
    │               │                       ├── <canvas> (p5.js WEBGL)
    │               │                       ├── <audio>
    │               │                       └── PlayerPanels
    │               │                            ├── Timeline (play/pause/scrub)
    │               │                            └── SettingsPanel (template select, audio load)
    │               ├── /editor → TimelineEditor
    │               └── /tapper → RhythmTapperPage
```

## State Management

The app uses three layers of state:

### 1. Zustand Stores (persisted to localStorage)

**`useAnimationStore`** (`stores/animationStore.ts`)
- Stores: `selectedAnimation` (string ID)
- Persisted as `"animation-storage"` in localStorage
- Drives which animation template is active

**`useColorPaletteStore`** (`stores/colorPaletteStore.ts`)
- Stores: `colors` (array of 12 hex strings)
- Persisted as `"color-palette-storage"` in localStorage
- Used by the TimelineEditor's color palette

### 2. React Context (`AnimationContext`)

**`AnimationProvider`** wraps the entire app and provides:
- `controller`: the singleton `AnimationController` instance
- `currentAnimationId`: the active template ID (from Zustand)
- `setCurrentAnimationId`: setter (writes to Zustand)

When `selectedAnimation` changes in the store, the provider calls `controller.setAnimation(id)` to reinitialize the p5 instance with the new template.

### 3. Component-Local State

- **SketchView**: `currentFrame`, `audioSrc`, `localFps`
- **Timeline**: `totalFrames`, `fps` (synced via controller callbacks)
- **TimelineEditor**: Full editor state (scenes, grid, selection) persisted manually to localStorage under `"timelineEditorState"`

## Data Flow

### Interactive Playback

```
User selects template in SettingsPanel
  → useAnimationStore.setSelectedAnimation(id)
  → AnimationProvider detects change via useEffect
  → controller.setAnimation(id)
      → Loads AnimationSettings (fps, totalFrames, width, height, function)
      → Destroys old p5 instance
      → Creates new p5 instance with WEBGL renderer
      → Sets animation function
      → Notifies all subscribers (frame, playState, settings)
  → SketchView re-renders with new canvas
```

### Frame Update Loop

```
User clicks Play
  → controller.isPlaying = true
  → startAnimationLoop()
      → Records performance.now() as startTime
      → requestAnimationFrame(updateFrame)

updateFrame (on each rAF):
  → Calculate elapsed time since startTime
  → targetFrame = floor((elapsed / 1000) * fps)
  → targetFrame %= totalFrames  (loop)
  → Set controller.currentFrame = targetFrame
  → Notify frame subscribers
  → p5Instance.redraw()
      → p5.draw() calls animationFunction(p, normalizedTime, frame, totalFrames)
  → requestAnimationFrame(updateFrame)  (continue loop)
```

### Audio Synchronization

```
SketchView subscribes to controller.onFrameChanged
  → On each frame change, sync audio.currentTime = frame / fps
  → Tolerance: only adjust if drift > 0.1 seconds

SketchView subscribes to controller.onPlayStateChanged
  → isPlaying=true  → audio.play()
  → isPlaying=false → audio.pause()
```

## Observer Pattern (AnimationController)

The `AnimationController` implements a manual observer pattern with three event channels:

| Event | Callback Signature | Subscribers |
|---|---|---|
| `onFrameChanged` | `(frame: number, normalizedTime: number) => void` | SketchView, Timeline |
| `onPlayStateChanged` | `(isPlaying: boolean) => void` | SketchView (audio sync), Timeline |
| `onSettingsChanged` | `(fps, totalFrames, width, height) => void` | Timeline |

Each `on*` method returns an unsubscribe function, following the React cleanup pattern.

## Key Architectural Patterns

### Animation as Pure Functions

Each animation template is a pure function:
```typescript
type AnimationFunction = (
  p: p5,                    // p5 instance for drawing
  normalizedTime?: number,  // 0..1 progress through the loop
  currentFrameNum?: number, // current frame index
  totalFrames?: number,     // total frames in the loop
  props?: AnimationProps    // optional config (noise seed, etc.)
) => void;
```

This makes animations stateless and portable between the interactive viewer and headless Remotion renderer.

### Dual Rendering Paths

The same animation functions are consumed by two different rendering hosts:

1. **Interactive**: `AnimationController` → p5 instance in DOM → `requestAnimationFrame` loop
2. **Video Export**: Remotion `P5Animation` component → p5 instance in Remotion's DOM → frame-by-frame redraw triggered by Remotion

### Timeline Editor as Standalone Module

The TimelineEditor (`/editor` route) is a fully self-contained scene composition tool:
- Has its own localStorage persistence (`"timelineEditorState"`)
- Does not share state with the main animation viewer
- Exports JSON that gets pasted into `timeline.json` for the `unstableGrid2` animation
- This is a manual copy-paste workflow, not an automated pipeline

## Proxy Configuration

Vite proxies three paths to `localhost:3000` (Express backend):

| Path | Target |
|---|---|
| `/api/*` | `http://localhost:3000/api/*` |
| `/test` | `http://localhost:3000/test` |
| `/output` | `http://localhost:3000/output` |

The Express server handles video rendering requests and serves rendered output files.
