import React from "react";
import { P5Animation } from "./P5Animation";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { AnimationName } from "../animations";
import { animationSettings } from "../animations";

interface MyVideoProps {
  templateName?: AnimationName;
}

export const MyVideo: React.FC<MyVideoProps> = ({
  templateName = "gridOrbit",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  console.log("MyVideo rendering with template:", templateName);

  // Get the current animation settings with fallback to default
  const currentSettings =
    animationSettings[templateName] || animationSettings.basic;

  if (!currentSettings) {
    console.error(`Animation not found: ${templateName}, using default`);
  }

  // Log animation settings being used
  console.log(
    `Using animation: ${currentSettings.name}, FPS: ${currentSettings.fps}, Total Frames: ${currentSettings.totalFrames}`
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
