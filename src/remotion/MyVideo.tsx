import React from "react";
import { P5Animation } from "./P5Animation";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { AnimationName } from "../animations";

interface MyVideoProps {
  templateName?: AnimationName;
  dpiScale?: number;
}

export const MyVideo: React.FC<MyVideoProps> = ({
  templateName = "gridOrbit",
  dpiScale = 2,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  console.log("MyVideo rendering with template:", templateName);
  console.log("Using DPI scale:", dpiScale);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
      }}
    >
      <P5Animation templateName={templateName} dpiScale={dpiScale} />
    </div>
  );
};
