import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import p5 from "p5";
import { animationSettings, defaultAnimation } from "../animations";
import { P5AnimationFunction, FrameContext } from "../types/animations";

interface P5AnimationProps {
  templateId?: string;
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
  const drawFn = currentSettings.draw as P5AnimationFunction;
  const setupFn = currentSettings.setup as ((p: p5) => void) | undefined;
  const totalFrames = currentSettings.totalFrames || durationInFrames;

  // Store frame context in a ref for p5's draw callback
  const frameContextRef = useRef<FrameContext>({
    normalizedTime: 0,
    currentFrame: 0,
    totalFrames,
  });

  useEffect(() => {
    if (!containerRef.current || !drawFn) return;

    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
      p5InstanceRef.current = undefined;
    }

    const sketch = (p: p5) => {
      p.setup = () => {
        const width = currentSettings.width || 1080;
        const height = currentSettings.height || 1920;
        p.createCanvas(width, height);
        p.pixelDensity(1);

        if (setupFn) {
          setupFn(p);
        }

        p.noLoop();
      };

      p.draw = () => {
        if (!p5InstanceRef.current) return;
        drawFn(p, frameContextRef.current);
      };
    };

    p5InstanceRef.current = new p5(sketch, containerRef.current);

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = undefined;
      }
    };
  }, [templateId, drawFn, setupFn, totalFrames, currentSettings]);

  useEffect(() => {
    latestFrameRef.current = frame;
    const normalizedTime = totalFrames > 1 ? frame / (totalFrames - 1) : 0;
    frameContextRef.current = {
      normalizedTime,
      currentFrame: frame,
      totalFrames,
    };

    if (p5InstanceRef.current) {
      p5InstanceRef.current.redraw();
    }
  }, [frame, totalFrames]);

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
