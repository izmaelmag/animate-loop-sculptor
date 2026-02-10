import React, { useEffect, useRef } from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  continueRender,
  delayRender,
} from "remotion";
import p5 from "p5";
import {
  animationSettings,
  defaultAnimation,
  AnimationName,
} from "../animations";

// --- NEW: Define Props Interface ---
interface P5AnimationProps {
  templateId?: AnimationName;
  animationConfig?: {
    // Optional config object
    noiseSeedPhrase?: string;
    // ... potentially other config overrides ...
  };
}

declare global {
  interface Global {
    gc?: () => void;
  }
}

export const P5Animation = ({
  templateId = defaultAnimation.id,
  animationConfig, // Destructure the new prop
}: P5AnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5>(); // Renamed for clarity
  const frame = useCurrentFrame();
  const latestFrameRef = useRef(frame); // Ref to store the latest frame
  const { durationInFrames, fps: remotionFps } = useVideoConfig();

  const currentSettings = animationSettings[templateId] || defaultAnimation;
  const animationFunction = currentSettings.function;
  const onSetupFunction = currentSettings.onSetup;
  const totalFrames = currentSettings.totalFrames || durationInFrames;

  // --- Effect for creating and cleaning up p5 instance based on templateId ---
  useEffect(() => {
    if (!containerRef.current || !animationFunction) {
      return;
    }
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
      p5InstanceRef.current = undefined;
    }
    const sketch = (p: p5) => {
      p.setup = () => {
        const width = currentSettings.width || 1080;
        const height = currentSettings.height || 1920;
        try {
          p.createCanvas(width, height, p.WEBGL);
        } catch (e) {
          console.error("Error creating WebGL canvas:", e);
          throw e;
        }
        p.pixelDensity(1);
        if (onSetupFunction) {
          try {
            // Pass animationConfig (props) to the setup function
            onSetupFunction(p, 0, 0, totalFrames, animationConfig);
          } catch (e) {
            console.error("Error running onSetupFunction:", e);
          }
        }
        p.noLoop();
      };

      p.draw = () => {
        const currentFrameFromRef = latestFrameRef.current;
        if (!p5InstanceRef.current) return;
        const currentT =
          totalFrames > 0 ? currentFrameFromRef / totalFrames : 0;
        const currentFrameNum = currentFrameFromRef;
        try {
          animationFunction(p, currentT, currentFrameNum, totalFrames);
        } catch (e) {
          console.error(
            `Frame ${currentFrameNum}: Error during animationFunction:`,
            e
          );
        }
      };
    };
    p5InstanceRef.current = new p5(sketch, containerRef.current);
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = undefined;
      }
    };
  }, [
    templateId,
    animationFunction,
    onSetupFunction,
    totalFrames,
    currentSettings,
    animationConfig,
  ]);

  // --- Effect for redrawing the correct frame ---
  useEffect(() => {
    latestFrameRef.current = frame;
    if (p5InstanceRef.current) {
      p5InstanceRef.current.redraw();
    }
  }, [frame]);

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
