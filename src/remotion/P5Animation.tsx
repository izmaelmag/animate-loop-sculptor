import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import p5 from "p5";
import { animation as defaultAnimation } from "../animation";

interface P5AnimationProps {
  sketch?: string;
}

// Extend global to include gc
declare global {
  interface Global {
    gc?: () => void;
  }
}

export const P5Animation: React.FC<P5AnimationProps> = ({ sketch = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5>();
  const frame = useCurrentFrame();
  const { durationInFrames, fps, width, height } = useVideoConfig();
  const isMountedRef = useRef<boolean>(true);

  // Main hook for setting up and cleaning up p5 instance
  // Runs only when mounting/unmounting
  useEffect(() => {
    isMountedRef.current = true;

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (p5Ref.current) {
        p5Ref.current.remove();
        p5Ref.current = undefined;
      }
    };
  }, []);

  // Effect for updating and rendering each frame
  useEffect(() => {
    if (!containerRef.current || !isMountedRef.current) return;

    // Function for rendering current frame
    const renderCurrentFrame = () => {
      // Prevent unnecessary actions if component is unmounted
      if (!isMountedRef.current) return;

      // Animation parameters
      const t = frame / durationInFrames;
      const frameNumber = frame;
      const totalFrames = durationInFrames;

      // If we already have a p5 instance, work with it
      if (p5Ref.current) {
        try {
          // Clean canvas using p5 methods instead of direct canvas access
          p5Ref.current.clear();
          p5Ref.current.background(0);

          if (sketch && sketch.trim().length > 0) {
            // If sketch string is provided, use it
            const sketchFunction = new Function(
              "p",
              "frame",
              "frameNumber",
              "totalFrames",
              "t",
              sketch
            );
            sketchFunction(p5Ref.current, frame, frameNumber, totalFrames, t);
          } else {
            // Otherwise use imported animation
            defaultAnimation(p5Ref.current, t, frameNumber, totalFrames);
          }
        } catch (error) {
          console.error("Animation error:", error);
          p5Ref.current.background(0);
          p5Ref.current.fill(255, 0, 0);
          p5Ref.current.textSize(20);
          p5Ref.current.text("Animation error: " + error, 20, 50);
        }
        return;
      }

      // If p5 instance doesn't exist, create it
      const sketchFunc = (p: p5) => {
        p.setup = () => {
          p.createCanvas(width, height);

          // Draw first frame immediately
          p.background(0);
          try {
            if (sketch && sketch.trim().length > 0) {
              const sketchFunction = new Function(
                "p",
                "frame",
                "frameNumber",
                "totalFrames",
                "t",
                sketch
              );
              sketchFunction(p, frame, frameNumber, totalFrames, t);
            } else {
              defaultAnimation(p, t, frameNumber, totalFrames);
            }
          } catch (error) {
            console.error("Animation error:", error);
            p.background(0);
            p.fill(255, 0, 0);
            p.textSize(20);
            p.text("Animation error: " + error, 20, 50);
          }
        };

        // Disable built-in p5.js loop, since we're rendering each frame separately
        p.draw = () => {};
        p.noLoop();
      };

      // Create new p5 instance
      if (isMountedRef.current && containerRef.current) {
        p5Ref.current = new p5(sketchFunc, containerRef.current);
      }
    };

    renderCurrentFrame();

    // Force garbage collection every 100 frames
    if (frame % 100 === 0 && typeof global.gc === "function") {
      global.gc();
    }
  }, [frame, sketch, durationInFrames, width, height]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
};
