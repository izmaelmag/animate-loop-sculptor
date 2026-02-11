import React from "react";
import { RendererAnimation } from "./RendererAnimation";
import { defaultAnimation } from "../animations";

interface MyVideoProps {
  templateId?: string;
}

export const MyVideo: React.FC<MyVideoProps> = ({
  templateId = defaultAnimation.id,
}) => {
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
      <RendererAnimation templateId={templateId} />
    </div>
  );
};
