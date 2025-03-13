
# P5.js Animation Renderer

This application allows you to create, preview, and render videos from P5.js sketches.

## Requirements

- Node.js (v14 or later)
- npm or yarn

## Setup and Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn
   ```

3. Install server dependencies
   ```
   cd server
   npm install
   # or
   yarn
   ```

## Running the Application

1. Start the frontend application
   ```
   npm run dev
   # or
   yarn dev
   ```

2. Start the rendering server (in a separate terminal)
   ```
   cd server
   npm start
   # or
   yarn start
   ```

3. Open your browser and navigate to `http://localhost:8080`

## How to Use

1. Create your animation in the Sketch Editor tab
2. Preview and adjust your animation as needed
3. Navigate to the Render tab
4. Configure export settings (duration, FPS, quality)
5. Click "Export Video" to render your animation
6. Download the rendered video when complete

## Troubleshooting

- If the render server status shows "offline", make sure you've started the server with `cd server && npm start`
- For rendering issues, check the server console for detailed error messages
- Large or complex animations may take longer to render - be patient!

## Project Structure

- `src/` - Frontend application code
  - `components/` - React components
  - `remotion/` - Video rendering components
  - `utils/` - Utility functions
- `server/` - Backend rendering server

## Known Limitations

- For performance reasons, animations with heavy computations may render slower
- The P5 instance is recreated for each frame during rendering to ensure frame-perfect output
- The maximum rendering duration is limited to 5 minutes (can be adjusted in the server code)
