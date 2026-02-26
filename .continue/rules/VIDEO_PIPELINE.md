# Video Rendering Pipeline

## Overview

The video export pipeline converts procedural p5.js animations into MP4 files using Remotion as the orchestrator and FFmpeg for encoding.

```
render-video.cjs (CLI entry)
  → Remotion @remotion/bundler bundles src/remotion/index.tsx
  → Remotion @remotion/renderer discovers compositions
  → For each frame:
      → Chromium renders the React component (MyVideo → P5Animation)
      → P5Animation creates a p5 instance, draws the frame, captures it
  → FFmpeg encodes captured frames into H.264 MP4
  → Output saved to output/ directory
```

## Entry Point: `render-video.cjs`

CommonJS script that bootstraps the rendering process.

### CLI Interface

```bash
node render-video.cjs --template <name> --quality <level>
node render-video.cjs -t unstableGrid2 -q high
```

| Option | Values | Default |
|---|---|---|
| `--template`, `-t` | Any animation ID | `gridOrbit` |
| `--quality`, `-q` | `high` (CRF 18), `medium` (CRF 23), `low` (CRF 28) | `high` |

### Memory Management

The script self-relaunches with Node.js flags for memory control:
- `--expose-gc`: Enables `global.gc()` for manual garbage collection
- `--max-old-space-size=8192`: 8GB heap limit
- Forces GC every 100 frames during rendering
- Concurrency set to 1 to limit memory usage

### Output

Files are saved as: `output/animation--{template}-{quality}-{timestamp}.mp4`

## Remotion Composition

### Registration (`src/remotion/index.tsx`)

```typescript
registerRoot(RemotionVideo);

// Single composition registered:
<Composition
  id="MyVideo"
  component={MyVideo}
  calculateMetadata={calculateMetaData}  // Dynamic metadata from animation settings
/>
```

`calculateMetadata` reads the `templateId` from input props and returns:
- `durationInFrames`: from `AnimationSettings.totalFrames`
- `fps`: from `AnimationSettings.fps`
- `width`: from `AnimationSettings.width` (default 1080)
- `height`: from `AnimationSettings.height` (default 1920)

### MyVideo Component (`src/remotion/MyVideo.tsx`)

Wrapper that:
1. Loads custom fonts via `FontFace` API (currently hardcoded to Cascadia Code for unstableGrid2)
2. Uses `delayRender` / `continueRender` to wait for font loading
3. Renders `P5Animation` with the selected template

### P5Animation Component (`src/remotion/P5Animation.tsx`)

Bridges p5.js into Remotion's frame-by-frame rendering:

```
For each Remotion frame:
  1. useCurrentFrame() returns the current frame number
  2. latestFrameRef.current = frame
  3. p5Instance.redraw() triggers p5.draw()
  4. p5.draw() reads latestFrameRef.current
  5. Calls animationFunction(p, normalizedTime, frame, totalFrames)
  6. Remotion captures the DOM as an image
```

Key differences from interactive mode:
- p5 runs in `noLoop()` mode (no animation loop)
- Each frame is explicitly triggered by Remotion via `redraw()`
- The component re-renders on every frame change (Remotion's `useCurrentFrame`)
- p5 instance is recreated when `templateId` changes

### Props Flow

```
render-video.cjs
  → inputProps: { templateId: "unstableGrid2" }
  → Remotion passes to MyVideo
  → MyVideo passes to P5Animation
  → P5Animation reads animationSettings[templateId]
  → Calls animation function with correct settings
```

### Chromium Configuration

```javascript
chromiumOptions: {
  chromeMode: "chrome-for-testing",
  disableWebSecurity: true,
  headless: true,
  enableGPU: true,     // GPU acceleration for WebGL
  gl: "angle",         // ANGLE for GPU rendering
}
```

## Rendering Flow (Step by Step)

1. **Parse CLI args**: template ID and quality level
2. **Bundle**: `@remotion/bundler.bundle()` compiles `src/remotion/index.tsx` into a static bundle
3. **Discover compositions**: `getCompositions(bundleLocation, { inputProps })` returns available compositions
4. **Find target**: Looks for composition with `id === "MyVideo"`
5. **Calculate metadata**: `calculateMetadata` returns fps, duration, dimensions based on template
6. **Render**: `renderMedia()` with:
   - Codec: H.264
   - Image format: JPEG (for frame capture)
   - CRF: Based on quality setting
   - Concurrency: 1 (sequential frames)
   - Progress callback: Updates stdout with percentage
7. **Output**: MP4 file written to `output/` directory

## Font Handling in Video Mode

The `MyVideo` component loads fonts differently from the browser:
- Uses `FontFace` API to load from `staticFile()` (Remotion's static asset serving)
- Currently hardcoded to load `CascadiaCode.ttf` with the `unstableGridConfig.fontFamily` name
- Uses `delayRender` to block rendering until font is loaded
- Falls back gracefully if font loading fails (continues rendering)

## Limitations and Known Issues

1. **Font hardcoding**: `MyVideo.tsx` always loads the unstableGrid2 font, even for other templates
2. **No progress bar**: Only percentage output to stdout
3. **Single composition**: All animations render through the same "MyVideo" composition
4. **Memory intensive**: WebGL + Chromium per frame can consume significant RAM
5. **No preview**: No way to preview a single frame before full render
6. **Template ID mismatch**: CLI default is `gridOrbit` but this ID may not exist in the registry
