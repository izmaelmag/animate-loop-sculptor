import React from "react";
import { P5Animation } from "./P5Animation";
import { useCurrentFrame, useVideoConfig } from "remotion";

interface MyVideoProps {
  templateName?: string;
}

export const MyVideo: React.FC<MyVideoProps> = ({
  templateName = "default",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

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
      <P5Animation templateName={templateName} />
    </div>
  );
};
