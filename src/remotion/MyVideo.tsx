import React from "react";
import { P5Animation } from "./P5Animation";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { AnimationName } from "../animations";
import { animationSettings, defaultAnimation } from "../animations";

interface MyVideoProps {
  templateId?: AnimationName;
}

export const MyVideo: React.FC<MyVideoProps> = ({
  templateId = defaultAnimation.id,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Get the current animation settings with fallback to default
  const currentSettings = animationSettings[templateId] || defaultAnimation;

  if (!currentSettings) {
    console.error(`Animation not found: ${templateId}, using default`);
    // This case should ideally not happen if default is always available
  }

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
      <P5Animation templateId={templateId} />
    </div>
  );
};
