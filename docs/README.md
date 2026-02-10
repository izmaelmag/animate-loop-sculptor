# Animate Loop Sculptor - Documentation

A procedural animation studio for creating, previewing, and exporting looping visual animations to video. Built with React, p5.js, and Remotion.

This documentation is designed as a **blueprint** for recreating the project from scratch with improved architecture and tooling.

## Documentation Index

| Document | Description |
|---|---|
| [Tech Stack](./TECH_STACK.md) | Dependencies, frameworks, build tools, and their roles |
| [Architecture](./ARCHITECTURE.md) | System design, data flow, state management, and component wiring |
| [Features](./FEATURES.md) | Complete feature inventory with behavioral details |
| [Project Structure](./PROJECT_STRUCTURE.md) | File and folder layout with responsibilities |
| [Animation System](./ANIMATION_SYSTEM.md) | Core animation engine: templates, controller, p5.js integration |
| [Video Pipeline](./VIDEO_PIPELINE.md) | Remotion + FFmpeg rendering pipeline for MP4 export |
| [Improvements](./IMPROVEMENTS.md) | Architectural improvements, refactoring ideas, and maintainability |

## Quick Start

```bash
npm install
npm run dev          # Dev server on port 8080
npm run build        # Production build
npm test             # Run tests (Vitest)
npm run remotion:render -- --template unstableGrid2 --quality high  # Render to MP4
```

## Core Concept

The app lets users:
1. Select from multiple procedural animation templates (grid-based, orbital, etc.)
2. Preview animations in real-time using p5.js on a WebGL canvas
3. Edit scene timelines for grid-based animations (character placement, colors, timing)
4. Sync animations with audio via a rhythm tapping tool
5. Export final animations as MP4 video via Remotion's headless rendering
