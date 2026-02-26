import { usePlayback } from "../hooks/usePlayback";
import PlayerPanels from "./PlayerPanels";

const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1920;

const SketchView = () => {
  const { containerRef, settings } = usePlayback();
  const width = settings.width ?? DEFAULT_WIDTH;
  const height = settings.height ?? DEFAULT_HEIGHT;
  const aspectRatio = width / height;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative p-6">
      {/* Centered Canvas */}
      <div className="flex items-center justify-center">
        <div
          className="canvas-wrapper max-h-[80vh] max-w-[80vw] flex items-center justify-center relative rounded-md overflow-hidden shadow-lg"
          style={{ aspectRatio: `${width} / ${height}` }}
          ref={containerRef}
        />
      </div>

      {/* Playback Controls */}
      <PlayerPanels />
    </div>
  );
};

export default SketchView;
