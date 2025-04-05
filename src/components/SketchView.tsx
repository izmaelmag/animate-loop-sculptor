import { useEffect, useRef, useState } from "react";
import { useAnimation } from "@/contexts";
import PlayerPanels from "./PlayerPanels";

const SketchView = () => {
  const { controller, currentAnimationId } = useAnimation();
  const sketchRef = useRef<HTMLDivElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Initialize P5 instance when component mounts or animation changes
  useEffect(() => {
    if (!sketchRef.current || !controller) return;

    console.log(`Initializing P5 for animation: ${currentAnimationId}`);
    
    // Initialize the controller with the sketch container
    controller.initializeP5(sketchRef.current);

    // Set initial state
    setCurrentFrame(controller.currentFrame);
    
    // Subscribe to frame changes to update local state
    const unsubscribe = controller.onFrameChanged((frame) => {
      setCurrentFrame(frame);
    });

    // Cleanup function to ensure the p5 instance is properly removed when unmounting
    return () => {
      unsubscribe();
      controller.destroy();
    };
  }, [controller, currentAnimationId]);

  if (!controller) {
    return <div>Loading sketch view...</div>;
  }

  return (
    <div className="flex flex-col justify-start items-center h-full p-0 md:p-6 pt-4 md:pt-6 relative gap-0 md:gap-2">
      <div className="mx-auto flex py-12 md:py-4 h-[100%] min-h-[0px] flex-shrink-1 flex-col relative">
        <div
          className="canvas-wrapper aspect-reels w-full flex items-center justify-center relative"
          ref={sketchRef}
        />
      </div>

      <PlayerPanels isPlayable={true} />
    </div>
  );
};

export default SketchView;
