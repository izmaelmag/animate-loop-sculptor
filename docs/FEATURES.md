# Features

## 1. Animation Preview (Home Page - `/`)

The primary interface. A full-screen canvas displays the selected animation with playback controls.

### Components
- **Workspace** (`components/Workspace.tsx`): Layout wrapper with "Sculptor" branding
- **SketchView** (`components/SketchView.tsx`): Hosts the p5.js canvas and audio element
- **Timeline** (`components/Timeline.tsx`): Playback controls and frame scrubber
- **SettingsPanel** (`components/SettingsPanel.tsx`): Template selector and audio loader

### Behavior
- Canvas renders at the animation's native resolution (default 1080x1920 / 9:16 portrait)
- p5.js runs in WEBGL mode with `pixelDensity(1)` for exact pixel matching
- Frame loop driven by `requestAnimationFrame` with time-based frame calculation
- Normalized time (`0..1`) represents progress through the animation loop
- Play/Pause, Reset, Step Forward/Back controls
- Frame counter display: `Frame: 042/120 (35.00% at 60 fps)`

### Animation Templates (7 registered)

| ID | Description |
|---|---|
| `default` | Simple starter animation |
| `demo` | Demo/showcase animation |
| `decksDark` | Dark-themed card deck animation |
| `orbital` | Orbital motion patterns |
| `unstableGrid` | Grid-based animation v1 |
| `unstableGrid2` | Advanced grid with timeline scenes, noise-driven point movement, character textures |
| `unstableGrid3` | Grid-based animation v3 |

Templates are registered in `animations/index.ts` as `Record<string, AnimationFunction>` and `Record<string, AnimationSettings>`.

## 2. Audio Synchronization

### How it works
- User loads an audio file via SettingsPanel ("Load Audio for Sync")
- Audio plays/pauses in sync with the animation controller
- Frame changes trigger audio time correction (drift threshold: 100ms)
- Audio is loaded as a Blob URL from the local file

### Limitations
- One-way sync: animation drives audio, not vice versa
- No waveform visualization
- No BPM detection or automatic beat mapping

## 3. Timeline Editor (`/editor`)

A standalone scene composition tool for grid-based animations (specifically `unstableGrid2`).

### Scene Management
- Add, duplicate, delete scenes
- Each scene has: `startFrame`, `durationFrames`, `backgroundColor`, `secondaryColor`, `backgroundChars`
- Scenes are displayed in a scrollable list with frame timing info
- Modifying timing on a scene auto-adjusts subsequent scenes

### Grid Editor
- Configurable grid dimensions (rows x columns, applied globally)
- Click cells to select, type characters to fill
- Auto-advance cursor after character input
- Per-cell text color via color picker or palette
- Copy grid from previous scene
- Reset grid to empty

### Color System
- 12-color palette (persisted via Zustand store)
- HexColorPicker (react-colorful) for custom colors
- "Last used color" auto-applies to new characters
- Background and secondary colors configurable per scene
- Changing Scene 0 colors propagates to all scenes

### Import/Export
- **Import Words JSON**: Load a `[{word, frame_start, frame_end}]` JSON file to auto-generate scenes (one scene per word, characters centered on middle row)
- **Export Timeline JSON**: Generate `AnimationScene[]` JSON for pasting into `timeline.json`
- Copy JSON to clipboard

### Persistence
- Full editor state (scenes, grid dimensions, selection, last color) saved to localStorage under `"timelineEditorState"`
- Loads on mount, saves on every state change

## 4. Rhythm Tapper (`/tapper`)

A utility for mapping text/lyrics to audio beats by tapping along.

### Workflow
1. Load an audio file
2. Paste lyrics/text into the text area
3. Click "Play from Start"
4. Press SPACEBAR at the start of each word
5. Click "Generate Word Timings JSON"

### Output
Generates a JSON array:
```json
[
  { "word": "hello", "frame_start": 60, "frame_end": 120 },
  { "word": "world", "frame_start": 120, "frame_end": 180 }
]
```

This output can be imported into the Timeline Editor via "Import Words JSON".

### Text Processing
- Strips punctuation: `.,!?;:"""'`
- Splits by whitespace
- Maps N words to N-1 intervals (tap count - 1)
- Warns if word count doesn't match interval count

## 5. Video Export (CLI)

Headless MP4 rendering via `render-video.cjs`.

```bash
node render-video.cjs --template unstableGrid2 --quality high
```

### Options
| Flag | Values | Default |
|---|---|---|
| `--template`, `-t` | Any animation ID | `gridOrbit` |
| `--quality`, `-q` | `high`, `medium`, `low` | `high` |

### Quality Settings
| Quality | CRF Value |
|---|---|
| high | 18 |
| medium | 23 |
| low | 28 |

Output: `output/animation--{template}-{quality}-{timestamp}.mp4`

See [VIDEO_PIPELINE.md](./VIDEO_PIPELINE.md) for detailed rendering architecture.

## 6. Responsive Design

- **Desktop**: Fixed settings panels in top-right corner, full canvas view
- **Mobile**: Carousel-based panel navigation (swipe between Timeline and Settings)
- Mobile detection via `useIsMobile` hook (media query based)
- Tailwind responsive classes (`md:` breakpoint) throughout

## 7. Developer Tooling

- Path alias: `@/` maps to `./src/` (configured in `vite.config.ts` and `tsconfig.json`)
- Hot module replacement via Vite
- Unit tests for utility classes (Point, Line, Color, Numset, animation helpers)
- ESLint with React Hooks and React Refresh plugins
