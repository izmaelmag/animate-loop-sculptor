# Project Structure

## Root

```
animate-loop-sculptor/
├── index.html                    # HTML entry point (loads src/main.tsx)
├── package.json                  # Dependencies and scripts
├── vite.config.ts                # Vite config (proxy, aliases, SWC plugin)
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind CSS config
├── postcss.config.js             # PostCSS (Tailwind + Autoprefixer)
├── eslint.config.js              # ESLint config
├── render-video.cjs              # CLI video rendering script (Remotion + FFmpeg)
├── sketch.js                     # Standalone p5.js sketch example
├── components.json               # shadcn/ui component registry config
├── docs/                         # This documentation
├── output/                       # Rendered video output (gitignored)
├── public/                       # Static assets (fonts, etc.)
│   └── CascadiaCode.ttf          # Font used by unstableGrid2
└── src/                          # Application source
```

## `src/` Directory

### Entry Points

```
src/
├── main.tsx                      # React DOM root, wraps App in BrowserRouter
├── App.tsx                       # Root component: providers, routing, nav
├── index.css                     # Global styles (Tailwind directives)
└── vite-env.d.ts                 # Vite type declarations
```

### Pages

```
src/pages/
├── Index.tsx                     # Home page → renders Workspace
├── RhythmTapperPage.tsx          # Audio beat tapping tool for word-to-frame mapping
└── NotFound.tsx                  # 404 page
```

### Components

```
src/components/
├── Workspace.tsx                 # Main workspace layout (branding + SketchView)
├── SketchView.tsx                # Core: p5.js canvas, audio sync, frame tracking
├── PlayerPanels.tsx              # Container for Timeline + SettingsPanel (responsive)
├── Timeline.tsx                  # Playback controls: play/pause, scrubber, frame counter
├── SettingsPanel.tsx             # Template selector dropdown, audio loader
├── TimelineEditor.tsx            # Full scene editor (standalone page component at /editor)
└── ui/                           # shadcn/ui component library (30+ components)
    ├── button.tsx
    ├── slider.tsx
    ├── select.tsx
    ├── dialog.tsx
    ├── panel.tsx                  # Custom panel wrapper for controls
    ├── ColorPalette.tsx           # Color swatch grid with Zustand persistence
    ├── carousel.tsx               # Embla-based carousel for mobile panels
    ├── toast.tsx / toaster.tsx    # Toast notifications
    └── ... (accordion, avatar, badge, card, checkbox, etc.)
```

### Animation Templates

```
src/animations/
├── index.ts                      # Registry: exports animations{}, animationSettings{}, animationNames[]
├── default/                      # Simple starter animation
│   └── index.ts                  # exports { settings }
├── demo/                         # Demo animation
│   └── index.ts
├── orbital/                      # Orbital motion animation
│   └── index.ts
├── decks-dark/                   # Dark-themed animation
│   └── animation.ts
├── unstableGrid/                 # Grid animation v1
│   └── index.ts
├── unstableGrid2/                # Advanced grid animation (most complex)
│   ├── index.ts                  # Re-exports
│   ├── unstableGrid2.ts          # Main animation function + setup
│   ├── config.ts                 # UnstableGridConfig interface + defaults
│   ├── timeline.ts               # AnimationScene types + timeline data loader
│   ├── timeline.json             # Scene data (frame timings, grid layouts, colors)
│   ├── Cell.ts                   # Cell class (character rendering, textures)
│   ├── Rectangle.ts              # Rectangle geometry for grid cells
│   ├── Columns.ts                # Column layout calculations
│   └── utils.ts                  # Grid-specific utilities
└── unstableGrid3/                # Grid animation v3
    ├── index.ts
    └── unstableGrid3.ts
```

### State Management

```
src/stores/
├── animationStore.ts             # Zustand: selectedAnimation (persisted)
└── colorPaletteStore.ts          # Zustand: color palette array (persisted)

src/contexts/
├── index.ts                      # Re-exports AnimationProvider, useAnimation, constants
├── AnimationContext.tsx           # React.createContext definition
├── AnimationProvider.tsx          # Provider: creates AnimationController, syncs with store
├── useAnimation.ts               # useContext hook for consuming animation context
├── types.ts                      # AnimationContextType, AnimationProviderProps
└── constants.ts                  # DEFAULT_ANIMATION, DEFAULT_SETTINGS
```

### Core Utilities

```
src/utils/
├── AnimationController.ts        # Central class: p5 lifecycle, frame loop, observer pattern
├── renderGrid.ts                 # Grid rendering helpers
├── animation.ts                  # Animation utility functions
├── easing.ts                     # 30 easing functions (sine, quad, cubic, etc.)
├── colorUtils.ts                 # Color manipulation (hex, rgb, interpolation)
├── textureUtils.ts               # Texture generation for character rendering
├── Point/                        # Point geometry class (with tests)
├── Line/                         # Line geometry class (with tests)
├── Color/                        # Color utility class (with tests)
├── Numset/                       # Number set/range utility (with tests)
└── Text/                         # Text rendering utility
```

### Type Definitions

```
src/types/
├── animations.ts                 # AnimationFunction, AnimationSettings, AnimationProps
└── geometry.ts                   # Point type definition
```

### Remotion (Video Export)

```
src/remotion/
├── index.tsx                     # Composition registration (registerRoot, calculateMetadata)
├── MyVideo.tsx                   # Main video composition (font loading, P5Animation wrapper)
└── P5Animation.tsx               # Bridges p5.js into Remotion (frame-by-frame rendering)
```

### Hooks

```
src/hooks/
├── use-toast.ts                  # Toast notification hook
└── use-mobile.tsx                # Mobile detection hook (media query)
```

### Other

```
src/lib/
└── utils.ts                      # cn() helper (clsx + tailwind-merge)

scripts/
└── generate_unstableGrid2_textures.mjs  # Font texture generation script
```

## Key File Relationships

```
SettingsPanel ──selects──▶ useAnimationStore ──persists──▶ localStorage
                                  │
                                  ▼
                          AnimationProvider ──creates──▶ AnimationController
                                  │                            │
                                  ▼                            ▼
                          AnimationContext             p5.js instance
                                  │                            │
                                  ▼                            ▼
                            SketchView ◄────────────── canvas element
                                  │
                                  ▼
                          Timeline + PlayerPanels

TimelineEditor ──exports JSON──▶ timeline.json ──imported by──▶ unstableGrid2/config.ts
RhythmTapperPage ──exports JSON──▶ (manual import into TimelineEditor)
```
