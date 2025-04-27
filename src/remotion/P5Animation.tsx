import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import p5 from "p5";
import { animationSettings, defaultAnimation, AnimationName } from "../animations";

declare global {
  interface Global {
    gc?: () => void;
  }
}

export const P5Animation = ({
  templateId = defaultAnimation.id,
}: {
  templateId?: AnimationName;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5>(); // Renamed for clarity
  const frame = useCurrentFrame();
  const { durationInFrames, fps: remotionFps } = useVideoConfig();

  const currentSettings = animationSettings[templateId] || defaultAnimation;
  const animationFunction = currentSettings.function;
  const onSetupFunction = currentSettings.onSetup;
  const totalFrames = currentSettings.totalFrames || durationInFrames;

  // --- Effect for creating and cleaning up p5 instance based on templateId ---
  useEffect(() => {
    console.log(`Effect for templateId: ${templateId} running.`);
    if (!containerRef.current || !animationFunction) {
        console.log("Skipping p5 instance creation: no container or animation function.");
        return;
      }

    // If an instance already exists, remove it first (ensures cleanup)
    if (p5InstanceRef.current) {
        console.log("Removing previous p5 instance before creating new one.");
        p5InstanceRef.current.remove();
        p5InstanceRef.current = undefined;
    }
    
    console.log(`Creating new p5 instance for template: ${templateId}`);
    const sketch = (p: p5) => {
      p.setup = () => {
      const width = currentSettings.width || 1080;
      const height = currentSettings.height || 1920;
        try {
            p.createCanvas(width, height, p.WEBGL);
        } catch(e) {
            console.error("Error creating WebGL canvas:", e);
            throw e; // Re-throw to make it visible in Remotion errors
        }
            p.pixelDensity(1);
        console.log(`p5 setup running for ${templateId}`);
        if (onSetupFunction) {
          try {
              onSetupFunction(p, 0, 0, totalFrames);
          } catch(e) {
              console.error("Error running onSetupFunction:", e);
          }
        }
          p.noLoop();
        };

      p.draw = () => {
        if (!p5InstanceRef.current) return; // Safety check
        const currentT = frame / totalFrames; // Use Remotion frame for time
        const currentFrameNum = frame; // Use Remotion frame number
        // console.log(`p5 draw triggered for frame ${currentFrameNum}, template ${templateId}`);
        try {
          p.background(0); 
          // Apply coordinate fix every frame because origin is center in WebGL
          p.translate(-p.width / 2, -p.height / 2); 
          animationFunction(p, currentT, currentFrameNum, totalFrames);
        } catch(e) {
          console.error(`Error during p5 draw for frame ${currentFrameNum}:`, e);
        }
      };
    };

    // Create the new instance
    p5InstanceRef.current = new p5(sketch, containerRef.current);
    console.log(`p5 instance created for ${templateId}`);

    // Cleanup function for when templateId changes OR component unmounts
    return () => {
      console.log(`Cleanup effect for templateId: ${templateId}. Removing instance.`);
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = undefined;
      }
    };
  }, [templateId, animationFunction, onSetupFunction, totalFrames, currentSettings]); // Dependencies that necessitate a *new* p5 instance

  // --- Effect for redrawing the correct frame --- 
  useEffect(() => {
    if (p5InstanceRef.current) {
      // Update p5's internal frameCount to match Remotion's frame
      // This might be needed if animation logic relies on p.frameCount
      // p5InstanceRef.current.frameCount = frame;
      
      // console.log(`Requesting redraw for frame ${frame}`);
      p5InstanceRef.current.redraw(); // Tell p5 to execute the draw function once for the current frame
    } else {
      console.log(`Skipping redraw for frame ${frame}: p5 instance not available.`);
    }
    
    // Optional: Force GC periodically during render
    if (frame % 100 === 0 && typeof global.gc === "function") {
        // console.log(`Forcing GC at frame ${frame}`);
        // global.gc();
    }

  }, [frame]); // Only depends on the frame number

  // Get dimensions for the container div
  const width = currentSettings.width || 1080;
  const height = currentSettings.height || 1920;

  return (
    <div
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        overflow: "hidden",
        margin: "0 auto",
      }}
    />
  );
};
