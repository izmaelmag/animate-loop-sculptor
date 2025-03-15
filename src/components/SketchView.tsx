import { useEffect, useRef, useState } from "react";
import { useAnimation } from "@/contexts/AnimationContext";
import { animations } from "@/animations";
import PlayerPanels from "./PlayerPanels";

const SketchView = () => {
  const { controller } = useAnimation();
  const sketchRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [normalizedTime, setNormalizedTime] = useState(0);

  // Initialize P5 instance when component mounts
  useEffect(() => {
    if (!sketchRef.current || !controller) return;

    // Initialize the controller with the sketch container
    controller.initializeP5(sketchRef.current);
  }, [controller]);

  // Update sketch code when template changes
  useEffect(() => {
    if (!controller) return;
    controller.setAnimationFunction(animations.basic);
  }, [controller]);

  // Handle time updates from the Timeline
  const handleTimeUpdate = (time: number, normalized: number) => {
    setCurrentTime(time);
    setNormalizedTime(normalized);
    
    // Additional logic for time updates can be added here
    // For example, updating other components or triggering events
  };

  if (!controller) {
    return <div>Loading sketch view...</div>;
  }

  return (
    <div className="flex flex-col justify-start items-center h-full p-0 md:p-6 pt-4 md:pt-6 relative gap-0 md:gap-2">
      <div className="w-full content-area flex h-[100%] min-h-[0px] flex-shrink-1 flex-col">
        <div
          className="w-full h-full flex items-center justify-center"
          ref={sketchRef}
        />
      </div>

      <PlayerPanels 
        onTimeUpdate={handleTimeUpdate}
        isPlayable={true}
      />
    </div>
  );
};

export default SketchView;
