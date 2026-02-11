# Render Server README (Agent-Oriented)

This document explains how the local render server works and what constraints to preserve when changing it.

Use this file as a source of truth when implementing tasks related to rendering, progress tracking, cancellation, and UI integration.

## Scope

The render server is local-only. No cloud queue, no persistence DB, no distributed workers.

It powers:
- render start from web UI
- render progress polling
- cancel requests
- serving output files from `output/`

## Current Architecture

Files:
- `server/index.cjs` - HTTP API entry point
- `server/render-jobs.cjs` - in-memory job manager + lifecycle
- `server/remotion/render-video-core.cjs` - shared Remotion render core
- `render-video.cjs` - CLI wrapper that calls shared core

Data flow:
1. UI calls `POST /api/renders`
2. Job manager creates a job (`queued`) and starts async render
3. Job becomes `running`, progress updates via Remotion `onProgress`
4. Job ends as `success` / `error` / `cancelled`
5. UI polls `GET /api/renders/:id`
6. On success, video is available at `/output/<file>.mp4`

## API Contract (must stay stable)

### `GET /api/health`
Returns:
```json
{"ok": true}
```

### `POST /api/renders`
Body:
```json
{"templateId":"orbital","quality":"high"}
```

Success (`201`):
```json
{"job": { "...": "job fields" }}
```

Error:
- `400` with `INVALID_TEMPLATE_ID` or `INVALID_QUALITY`
- `409` with `RENDER_IN_PROGRESS`

### `GET /api/renders/:id`
Success (`200`): returns `{ job }`
Not found (`404`): `RENDER_NOT_FOUND`

### `DELETE /api/renders/:id`
Success (`200`): returns updated `{ job }`
Not found (`404`): `RENDER_NOT_FOUND`

### `GET /output/:file`
Serves rendered files from `output/`

## Job State Machine (must stay stable)

Allowed statuses:
- `queued`
- `running`
- `success`
- `error`
- `cancelled`

Current policy:
- single active render at a time
- in-memory job map
- terminal jobs are cleaned by TTL

If you add queueing later, keep current status names to avoid UI breakage.

## Remotion Core Behavior

`render-video-core.cjs` must keep:
- `bundle -> selectComposition -> renderMedia`
- same `inputProps` for composition selection and render
- disk output via `outputLocation` (not in-memory buffer)
- progress callback passthrough
- cancel support via `cancelSignal`

Important current defaults:
- composition id: `MyVideo`
- renderer port: from `REMOTION_RENDER_PORT` or `3100`
- output dir: `<repo>/output`
- quality map: `high=18`, `medium=23`, `low=28` (CRF)

## Known Environment Issues

### `uv_interface_addresses` error
Observed on some environments during Remotion server setup.

Mitigations currently applied:
- explicit Remotion `port`
- recommendation to use Node LTS (`22.x`)

If this error appears in tasks:
1. ensure ports are free (`8080`, `3000`, `3100`)
2. run with `REMOTION_RENDER_PORT=3100`
3. verify Node version

## Dev Commands

- `npm run dev` - start web + render server
- `npm run dev:server` - start render server only
- `npm run kill:ports` - kill `8080`, `3000`, `3100`
- `npm run dev:clean` - kill ports, then start full dev
- `npm run remotion:render` - CLI render path

## Rules For Future Agents

When changing render server behavior:
1. Do not remove or rename API endpoints without updating UI client.
2. Do not rename status values unless UI is migrated together.
3. Preserve cancel support (`makeCancelSignal` path).
4. Keep `render-video.cjs` working (manual CLI workflow is required).
5. Prefer incremental changes over architectural rewrites.
6. Validate with:
   - `GET /api/health`
   - one `POST /api/renders`
   - polling `GET /api/renders/:id`
   - optional `DELETE /api/renders/:id`

## Safe Extension Points

Good places to add features:
- `server/render-jobs.cjs` for queue/history/retention policy
- `server/remotion/render-video-core.cjs` for render options and optimizations
- `server/index.cjs` for new endpoints

Avoid embedding UI logic in server files.
