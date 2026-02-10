# Improvements and Maintainability

Ideas for recreating the studio with better architecture, cleaner solutions, and improved developer experience.

---

## 1. Architecture Improvements

### 1.1 Decouple Animation Engine from p5.js

**Current**: Animations are tightly coupled to the p5.js API. Every animation function receives a `p5` instance and uses p5-specific drawing commands.

**Recommendation**: Introduce a rendering abstraction layer.
- Define a `Renderer` interface with drawing primitives (`rect`, `circle`, `text`, `translate`, `background`, etc.)
- Implement `P5Renderer`, `CanvasRenderer`, `SVGRenderer` backends
- Animation functions receive a `Renderer` instead of `p5`
- This enables rendering to Canvas2D, SVG export, or future WebGPU without rewriting animations

### 1.2 Replace Observer Pattern with Reactive State

**Current**: `AnimationController` uses a hand-rolled observer pattern with callback arrays and manual unsubscribe functions.

**Recommendation**: Use a reactive library or Zustand signals.
- Move all animation state (currentFrame, isPlaying, fps, etc.) into a Zustand store
- Components subscribe to specific slices with selectors
- Eliminates manual subscribe/unsubscribe lifecycle management
- Simpler integration with React's rendering model

### 1.3 Separate AnimationController Concerns

**Current**: `AnimationController` handles p5 lifecycle, frame timing, playback state, and canvas management in one 415-line class.

**Recommendation**: Split into focused modules:
- `PlaybackEngine` - Frame timing, play/pause, requestAnimationFrame loop
- `CanvasManager` - p5 instance creation, destruction, resizing
- `AnimationRegistry` - Template loading and switching
- Each module becomes independently testable

### 1.4 Unify State Management

**Current**: Three separate persistence mechanisms:
- Zustand `persist` for animation selection and color palette
- React Context for controller instance
- Manual `localStorage.getItem/setItem` for TimelineEditor

**Recommendation**: Consolidate into a single Zustand store tree:
```
store/
  animation/   → selected template, playback state
  editor/      → scenes, grid, selection (with persist middleware)
  palette/     → colors
  settings/    → app preferences
```

### 1.5 Connect Timeline Editor to Live Preview

**Current**: TimelineEditor exports JSON that must be manually copy-pasted into `timeline.json`. No live preview of edits.

**Recommendation**:
- Load timeline data from the Zustand store instead of a static JSON import
- TimelineEditor writes scenes directly to the store
- Animation reads scenes from the store in real-time
- Changes are immediately visible in the preview canvas

---

## 2. Code Quality Improvements

### 2.1 Remove Unused Dependencies

These packages are installed but serve no purpose in the current Vite-based project:
- `next` (15.2.2) - This is not a Next.js project
- `next-themes` (0.3.0) - Depends on Next.js
- `cmdk` (1.0.0) - Command palette, unused
- `input-otp` (1.2.4) - OTP input, unused
- `react-day-picker` (8.10.1) - Date picker, unused
- `recharts` (2.12.7) - Charts, unused

Also consider consolidating `clsx` and `classnames` (pick one).

### 2.2 Remove Console Logging

The codebase contains extensive `console.log` calls used during development:
- `AnimationController`: logs setup phases, animation changes
- `SketchView`: logs initialization, cleanup
- `TimelineEditor`: logs every state save/load, cell updates
- `AnimationProvider`: logs animation changes

Replace with a structured logger that can be silenced in production (e.g., `loglevel` or a simple `DEBUG` flag).

### 2.3 TypeScript Strictness

**Current issues**:
- `AnimationName` is typed as `keyof typeof animations` which is `string` (loses type safety)
- `animationSettings` uses `Record<string, AnimationSettings>` instead of a union of known IDs
- TimelineEditor mutates state directly in some handlers (e.g., `handleCellCharacterInput` modifies scene arrays in place)

**Recommendation**:
- Use `as const` assertion for animation IDs to get literal types
- Define `AnimationId = "default" | "demo" | "orbital" | ...` as a union
- Enforce immutable state updates throughout (or use Immer)

### 2.4 Test Coverage

**Current**: Tests exist for utility classes (Point, Line, Color, Numset) but not for:
- AnimationController
- React components
- Animation functions
- Video pipeline

**Recommendation**:
- Unit test AnimationController (frame calculation, state transitions, observer notifications)
- Snapshot test animation output at specific frames
- Integration test the Remotion rendering pipeline
- Use React Testing Library for component interaction tests

### 2.5 TimelineEditor Refactoring

At 1492 lines, `TimelineEditor.tsx` is the largest and most complex component. It contains:
- 15+ state variables
- 3 popper instances with manual positioning
- Grid rendering logic
- Scene CRUD operations
- Import/export logic
- Audio handling
- Color picking logic

**Recommendation**: Break into composable pieces:
```
TimelineEditor/
  index.tsx              → Layout + routing between sub-views
  SceneList.tsx          → Scene sidebar (add, duplicate, delete, select)
  SceneSettings.tsx      → Frame timing, colors, background chars
  GridEditor.tsx         → Grid display + cell interaction
  CellSettings.tsx       → Selected cell editing (char, color)
  ExportPanel.tsx        → JSON generation + copy
  useEditorState.ts      → Custom hook for all editor state + persistence
  useGridOperations.ts   → Grid manipulation logic (copy, reset, resize)
```

---

## 3. Feature Improvements

### 3.1 Live Preview in Timeline Editor

Show a small p5 canvas rendering the current scene in the editor. This would let users see their grid layout rendered with the actual animation effects (noise, textures, colors).

### 3.2 Undo/Redo

The TimelineEditor has no undo support. Implementing an undo stack would significantly improve the editing experience. Options:
- Use `zustand/middleware` with a history middleware
- Implement a simple command pattern with state snapshots
- Use a library like `use-undo`

### 3.3 Animation Parameter GUI

Currently, animation parameters (noise amplitude, easing function, grid padding, etc.) are hardcoded in `config.ts`. Expose these as sliders/controls in the UI:
- Add a dynamic settings panel that reads the animation's config schema
- Changes update in real-time on the canvas
- Export settings alongside the animation for reproducible renders

### 3.4 Waveform Visualization for Audio Sync

Replace the basic audio player with a waveform display:
- Show audio waveform with playhead
- Overlay scene markers on the waveform
- Drag-and-drop scene timing on the waveform
- Visualize beat taps from the RhythmTapper

### 3.5 WebCodecs API for Faster Rendering

The Remotion pipeline (Chromium per frame) is heavy. Consider using the WebCodecs API:
- Render frames directly to an OffscreenCanvas
- Encode using VideoEncoder (H.264/VP9)
- Eliminates Chromium overhead for supported browsers
- Could enable in-browser video export without a server

### 3.6 Animation Template SDK

Create a formal template SDK with:
- Type-safe parameter definitions with UI hints (range, color, select)
- Automatic settings panel generation from parameter schema
- Template validation and testing utilities
- Hot-reloading of template code during development

---

## 4. Maintainability Improvements

### 4.1 Monorepo Structure

Split the project into focused packages:
```
packages/
  @studio/core        → AnimationController, types, easing, utilities
  @studio/templates   → Animation template library
  @studio/editor      → Timeline editor (could be standalone)
  @studio/renderer    → Remotion pipeline, video export
  @studio/web         → React app (consumes all above)
```

Benefits: independent versioning, clear boundaries, parallel development.

### 4.2 Configuration Management

**Current**: Hardcoded values scattered across files (port 8080, canvas 1080x1920, FPS 60, font paths).

**Recommendation**:
- Single config file with environment-aware overrides
- Use Vite's `import.meta.env` for build-time config
- Runtime config for animation defaults loaded from a central source

### 4.3 Error Handling

**Current**: Errors in animation functions are caught and displayed as red screens on the canvas. No error boundaries for React components.

**Recommendation**:
- Add React Error Boundaries around key component trees
- Structured error reporting for animation function failures
- Graceful degradation when WebGL is unavailable
- User-friendly error messages instead of raw stack traces

### 4.4 Performance Monitoring

- Track frame timing to detect drops below target FPS
- Profile memory usage during long animation playback
- Add performance budget for animation functions (warn if draw exceeds frame budget)
- Consider `OffscreenCanvas` for animation rendering to avoid blocking the main thread

### 4.5 Documentation as Code

- Generate animation parameter documentation from TypeScript types
- Auto-generate template catalog from the animation registry
- Use Storybook or similar for UI component documentation
- Include visual regression tests for animation output

---

## 5. Migration Checklist

When recreating the studio in a new repo, prioritize in this order:

1. **Core engine**: `Renderer` interface + `PlaybackEngine` + `AnimationRegistry`
2. **State management**: Single Zustand store with slices
3. **Basic UI**: Canvas viewer + playback controls + template selector
4. **First animation**: Port one template (e.g., `unstableGrid2`) to validate the engine
5. **Timeline editor**: Rebuild as connected components (not standalone)
6. **Video pipeline**: Evaluate WebCodecs vs Remotion based on target platform
7. **Audio sync**: Implement with waveform visualization from the start
8. **Polish**: Undo/redo, parameter GUI, error handling, testing
