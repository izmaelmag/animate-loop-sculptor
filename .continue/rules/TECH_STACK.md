# Tech Stack

## Core Framework

| Tool | Version | Role |
|---|---|---|
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.8.2 | Static typing |
| **Vite** | 5.4.1 | Build tool + dev server (port 8080), uses `@vitejs/plugin-react-swc` for fast compilation |

## Animation & Creative Coding

| Library | Version | Role |
|---|---|---|
| **p5.js** | 1.9.0 | Canvas-based creative coding library. All animations render through p5 in WEBGL mode |
| **@types/p5** | 1.7.6 | TypeScript definitions for p5.js |
| **simplex-noise** | 4.0.3 | Procedural noise generation for organic point movement in grid animations |
| **GSAP** | 3.12.5 | Animation library (used in some templates, also available via `@gsap/react`) |
| **colord** | 2.9.3 | Color manipulation and conversion |

## Video Rendering

| Library | Version | Role |
|---|---|---|
| **remotion** | 4.0.133 | React-based video rendering framework |
| **@remotion/cli** | 4.0.133 | CLI tools for Remotion |
| **@remotion/renderer** | 4.0.133 | Headless rendering engine (bundles compositions, renders frames, encodes) |
| **@remotion/player** | 4.0.133 | In-browser video player component |
| **@remotion/fonts** | 4.0.291 | Font loading utilities for Remotion |
| **fluent-ffmpeg** | 2.1.3 | FFmpeg wrapper (devDependency, used in render pipeline) |
| **canvas** | 3.1.0 | Server-side canvas for headless rendering |

## State Management

| Library | Version | Role |
|---|---|---|
| **Zustand** | 5.0.4 | Lightweight state management with `persist` middleware for localStorage |
| **React Context** | (built-in) | Provides `AnimationController` instance to the component tree |
| **@tanstack/react-query** | 5.56.2 | Server state management (available but lightly used) |

## UI & Styling

| Library | Version | Role |
|---|---|---|
| **Tailwind CSS** | 3.4.11 | Utility-first CSS framework |
| **tailwind-merge** | 2.5.2 | Merges conflicting Tailwind classes |
| **tailwindcss-animate** | 1.0.7 | CSS animation utilities |
| **Radix UI** | various | Accessible headless UI primitives (30+ components: dialog, dropdown, slider, tabs, etc.) |
| **shadcn/ui** | (pattern) | Pre-built component library built on Radix UI + Tailwind |
| **Lucide React** | 0.462.0 | Icon library |
| **react-colorful** | 5.6.1 | Lightweight color picker component |
| **embla-carousel-react** | 8.3.0 | Carousel for mobile panel navigation |
| **class-variance-authority** | 0.7.1 | Variant-based component styling |
| **clsx** / **classnames** | 2.1.1 / 2.5.1 | Conditional className utilities |

## Routing & Forms

| Library | Version | Role |
|---|---|---|
| **react-router-dom** | 6.30.0 | Client-side routing (3 routes: /, /editor, /tapper) |
| **react-hook-form** | 7.53.0 | Form state management |
| **@hookform/resolvers** | 3.9.0 | Form validation integration |
| **zod** | 3.23.8 | Schema validation |

## Server & API

| Library | Version | Role |
|---|---|---|
| **express** | 4.21.2 | Backend server (serves API endpoints and rendered output) |
| **body-parser** | 1.20.3 | Request body parsing middleware |
| **cors** | 2.8.5 | Cross-origin resource sharing |
| **axios** | 1.8.3 | HTTP client |

The Vite dev server proxies `/api`, `/test`, and `/output` to `localhost:3000` (Express).

## Testing

| Library | Version | Role |
|---|---|---|
| **Vitest** | 3.0.9 | Unit test runner (primary, via `npm test`) |
| **Jest** | 29.7.0 | Testing framework (secondary/legacy) |
| **ts-jest** | 29.2.6 | TypeScript Jest transformer |

## Utilities

| Library | Version | Role |
|---|---|---|
| **uuid** | 11.1.0 | Unique ID generation |
| **date-fns** | 3.6.0 | Date formatting |
| **react-popper** | 2.3.0 | Popover/tooltip positioning (used in TimelineEditor) |
| **react-resizable-panels** | 2.1.3 | Resizable panel layouts |
| **sonner** | 1.5.0 | Toast notification library |
| **vaul** | 0.9.3 | Drawer component |
| **recharts** | 2.12.7 | Charting library (available, lightly used) |

## Unused / Legacy Dependencies

These are installed but appear unused or vestigial:

| Library | Notes |
|---|---|
| **next** (15.2.2) | Not used - this is a Vite project, not Next.js |
| **next-themes** (0.3.0) | Paired with Next.js, not functional in this setup |
| **cmdk** (1.0.0) | Command palette library, no evidence of use |
| **input-otp** (1.2.4) | OTP input component, unused |
| **react-day-picker** (8.10.1) | Date picker, unused |

## Build Scripts

```bash
npm run dev              # Vite dev server (port 8080)
npm run build            # Production build
npm run build:dev        # Development build (--mode development)
npm run lint             # ESLint
npm run preview          # Preview production build
npm run test             # Vitest (run mode)
npm run remotion:render  # Render video via Remotion
npm run fonts:render     # Generate font texture assets
```
