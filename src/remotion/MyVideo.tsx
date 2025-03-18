import React from "react";
import { P5Animation } from "./P5Animation";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { AnimationName } from "../animations";
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

interface MyVideoProps {
  templateName?: AnimationName;
}

export const MyVideo: React.FC<MyVideoProps> = ({
  templateName = "gridOrbit",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  console.log("MyVideo rendering with template:", templateName);

  // Get the current animation settings
  const currentSettings =
    animationSettings[templateName as keyof typeof animationSettings] || basic;

  // Log actual animation settings being used
  console.log(
    `Using animation settings: ${currentSettings.name}, FPS: ${currentSettings.fps}, Duration: ${currentSettings.duration}s, Frames: ${currentSettings.totalFrames}`
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
        width: "100%",
        height: "100%",
      }}
    >
      <P5Animation templateName={templateName} />
    </div>
  );
};
