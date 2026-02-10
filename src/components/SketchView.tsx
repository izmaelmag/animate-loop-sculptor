import { usePlayback } from "@/hooks/usePlayback";
import PlayerPanels from "./PlayerPanels";

const SketchView = () => {
  const { containerRef, settings } = usePlayback();

  return (
    <div className="flex flex-col justify-start items-center h-full p-0 md:p-6 pt-4 md:pt-6 relative gap-0 md:gap-2">
      <div className="mx-auto flex py-4 md:py-4 h-[auto] min-h-[0px] flex-shrink-1 flex-col relative w-full">
        <div
          className="canvas-wrapper aspect-reels w-full flex items-center justify-center relative"
          ref={containerRef}
        />
      </div>

      <PlayerPanels />
    </div>
  );
};

export default SketchView;
