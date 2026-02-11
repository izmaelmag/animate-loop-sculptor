import { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { animationSettings, defaultAnimation } from "../animations";
import { createRenderer, Renderer } from "../engine/createRenderer";

interface RendererAnimationProps {
  templateId?: string;
}

export const P5Animation = ({
  templateId = defaultAnimation.id,
}: RendererAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const currentSettings = animationSettings[templateId] || defaultAnimation;
  const totalFrames = currentSettings.totalFrames || durationInFrames;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (rendererRef.current) {
      rendererRef.current.destroy();
      rendererRef.current = null;
    }

    const renderer = createRenderer(currentSettings.renderer);
    renderer.initialize(container, currentSettings);
    rendererRef.current = renderer;

    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, [templateId, currentSettings]);

  useEffect(() => {
    const normalizedTime = totalFrames > 1 ? frame / (totalFrames - 1) : 0;

    if (rendererRef.current) {
      rendererRef.current.renderFrame({
        normalizedTime,
        currentFrame: frame,
        totalFrames,
      });
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
