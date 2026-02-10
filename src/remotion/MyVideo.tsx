import React from "react";
import { P5Animation } from "./P5Animation";
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
      <P5Animation templateId={templateId} />
    </div>
  );
};
