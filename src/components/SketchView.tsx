import { usePlayback } from "@/hooks/usePlayback";
import PlayerPanels from "./PlayerPanels";

const SketchView = () => {
  const { containerRef, settings } = usePlayback();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative p-6">
      {/* Centered Canvas */}
      <div className="flex items-center justify-center">
        <div
          className="canvas-wrapper aspect-reels max-h-[80vh] max-w-[45vh] flex items-center justify-center relative"
          ref={containerRef}
        />
      </div>

      {/* Playback Controls */}
      <PlayerPanels />
    </div>
  );
};

export default SketchView;
