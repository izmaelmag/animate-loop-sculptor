import { useState, useEffect, useRef } from "react";
import Timeline from "./Timeline";
import { defaultSketch, gsapSequenceSketch } from "@/utils/templates";
import { useAnimation } from "@/contexts/AnimationContext";

const SketchView = () => {
  const { controller } = useAnimation();
  const sketchRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("default");

  // Initialize P5 instance when component mounts
  useEffect(() => {
    if (!sketchRef.current || !controller) return;

    // Initialize the controller with the sketch container
    controller.initializeP5(sketchRef.current);

    // Subscribe to frame changes
    return controller.onFrameChanged((frame, normalized) => {});
  }, [controller]);

  // Update sketch code when template changes
  useEffect(() => {
    if (!controller) return;

    const newSketchCode =
      selectedTemplate === "default" ? defaultSketch : gsapSequenceSketch;
    controller.sketchCode = newSketchCode;
  }, [selectedTemplate, controller]);

  const handleTimeUpdate = (_time: number, normalized: number) => {
    // This is now handled by the controller
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
  };

  if (!controller) {
    return <div>Loading sketch view...</div>;
  }

  return (
    <div className="flex flex-col justify-start items-center h-full p-6 relative gap-2">
      <div className="w-full content-area flex h-[100%] min-h-[0px] flex-shrink-1 flex-col">
        <div
          className="w-full h-full flex items-center justify-center"
          ref={sketchRef}
        />
      </div>

      <div className="w-full flex justify-center">
        <Timeline onTimeUpdate={handleTimeUpdate} />
      </div>
    </div>
  );
};

export default SketchView;
