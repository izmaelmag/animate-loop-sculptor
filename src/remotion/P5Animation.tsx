import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import p5 from "p5";
import {
  animationSettings,
  defaultAnimation,
  AnimationName,
} from "../animations";

interface P5AnimationProps {
  templateId?: AnimationName;
}

export const P5Animation = ({
  templateId = defaultAnimation.id,
}: P5AnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5>();
  const frame = useCurrentFrame();
  const latestFrameRef = useRef(frame);
  const { durationInFrames } = useVideoConfig();

  const currentSettings = animationSettings[templateId] || defaultAnimation;
  const animationFunction = currentSettings.function;
  const onSetupFunction = currentSettings.onSetup;
  const totalFrames = currentSettings.totalFrames || durationInFrames;

  useEffect(() => {
    if (!containerRef.current || !animationFunction) return;

    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
      p5InstanceRef.current = undefined;
    }

    const sketch = (p: p5) => {
      p.setup = () => {
        const width = currentSettings.width || 1080;
        const height = currentSettings.height || 1920;
        p.createCanvas(width, height, p.WEBGL);
        p.pixelDensity(1);

        if (onSetupFunction) {
          onSetupFunction(p, 0, 0, totalFrames);
        }

        p.noLoop();
      };

      p.draw = () => {
        const currentFrameNum = latestFrameRef.current;
        if (!p5InstanceRef.current) return;

        const normalizedTime =
          totalFrames > 0 ? currentFrameNum / totalFrames : 0;

        animationFunction(p, normalizedTime, currentFrameNum, totalFrames);
      };
    };

    p5InstanceRef.current = new p5(sketch, containerRef.current);

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = undefined;
      }
    };
  }, [templateId, animationFunction, onSetupFunction, totalFrames, currentSettings]);

  useEffect(() => {
    latestFrameRef.current = frame;
    if (p5InstanceRef.current) {
      p5InstanceRef.current.redraw();
    }
  }, [frame]);

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
