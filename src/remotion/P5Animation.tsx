import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import p5 from "p5";
import { animations, AnimationName, getAnimationByName } from "../animations";
import { settings as basic } from "../animations/basic-template";
import { settings as gsap } from "../animations/gsap-sequence";
import { settings as gridOrbit } from "../animations/grid-orbit";
import { settings as multilayered } from "../animations/multilayered";
import { settings as waitExample } from "../animations/wait-example";

// Map of animation settings by name - include all animations
const animationSettings = {
  basic,
  gsap,
  gridOrbit,
  multilayered,
  waitExample
};

declare global {
  interface Global {
    gc?: () => void;
  }
}

// Helper function to get pixel ratio from environment
const getPixelRatio = (): number => {
  if (
    typeof process !== "undefined" &&
    process.env &&
    process.env.DEVICE_PIXEL_RATIO
  ) {
    const ratio = parseFloat(process.env.DEVICE_PIXEL_RATIO);
    if (!isNaN(ratio) && ratio > 0) {
      console.log("P5Animation: Using pixel ratio from environment:", ratio);
      return ratio;
    }
  }

  if (typeof window !== "undefined" && window.devicePixelRatio) {
    console.log(
      "P5Animation: Using window.devicePixelRatio:",
      window.devicePixelRatio
    );
    return window.devicePixelRatio;
  }

  console.log("P5Animation: Using default pixel ratio: 2");
  return 2;
};

export const P5Animation = ({
  templateName = "basic",
}: {
  templateName?: AnimationName;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5>();
  const setupDoneRef = useRef<boolean>(false);
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const isMountedRef = useRef<boolean>(true);

  console.log("Animation template:", templateName);

  // Get the current animation settings
  const currentSettings =
    animationSettings[templateName as keyof typeof animationSettings] || basic;

  // Main hook for setting up and cleaning up p5 instance
  // Runs only when mounting/unmounting
  useEffect(() => {
    isMountedRef.current = true;
    setupDoneRef.current = false;

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;

      if (p5Ref.current) {
        p5Ref.current.remove();
        p5Ref.current = undefined;
      }
    };
  }, [templateName]); // Reset when template changes

  // Effect for updating and rendering each frame
  useEffect(() => {
    if (!containerRef.current || !isMountedRef.current) return;

    // Function for rendering current frame
    const renderCurrentFrame = () => {
      // Prevent unnecessary actions if component is unmounted
      if (!isMountedRef.current) return;

      // Animation parameters
      const totalFrames = currentSettings.totalFrames || durationInFrames;
      const t = frame / totalFrames;
      const frameNumber = frame;

      // Get animation dimensions from settings - use exact dimensions
      const width = currentSettings.width || 1080;
      const height = currentSettings.height || 1920;

      const animationFunction = currentSettings.function;

      // If we already have a p5 instance, work with it
      if (p5Ref.current && animationFunction) {
        p5Ref.current.clear();
        p5Ref.current.background(0);

        // Use the selected animation function directly
        animationFunction(p5Ref.current, t, frameNumber, totalFrames);
      } else {
        // If p5 instance doesn't exist, create it
        const sketchFunc = (p: p5) => {
          p.setup = () => {
            // Create canvas with EXACT dimensions from animation settings
            p.createCanvas(width, height);
            p.background(0);

            // Force pixel density to 1 for exact pixel matching
            p.pixelDensity(1);
            console.log(
              `P5Animation: Created canvas with EXACT dimensions ${width}x${height}`
            );

            // Run onSetup function if it exists
            if (currentSettings.onSetup && !setupDoneRef.current) {
              console.log(`Running onSetup for ${templateName}`);
              currentSettings.onSetup(p, t, frameNumber, totalFrames);
              setupDoneRef.current = true;
            }

            // Draw first frame immediately
            animationFunction(p, t, frameNumber, totalFrames);
          };

          // Disable built-in p5.js loop, since we're rendering each frame separately
          p.draw = () => {};
          p.noLoop();
        };

        // Create new p5 instance
        if (isMountedRef.current && containerRef.current) {
          p5Ref.current = new p5(sketchFunc, containerRef.current);
        }
      }
    };

    renderCurrentFrame();

    // Force garbage collection every 100 frames
    if (frame % 100 === 0 && typeof global.gc === "function") {
      global.gc();
    }
  }, [frame, templateName, durationInFrames, fps, currentSettings]);

  // Get animation dimensions from settings
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
