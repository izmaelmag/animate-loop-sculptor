import React from "react";
import { P5Animation } from "./P5Animation";
import { AnimationName } from "../animations";
import { animationSettings, defaultAnimation } from "../animations";

interface MyVideoProps {
  templateId?: AnimationName;
}

export const MyVideo: React.FC<MyVideoProps> = ({
  templateId = defaultAnimation.id,
}) => {
  const currentSettings = animationSettings[templateId] || defaultAnimation;

  if (!currentSettings) {
    console.error(`Animation not found: ${templateId}, using default`);
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
