import { useEffect, useRef, useCallback } from "react";
import { useAnimationStore } from "@/stores/animationStore";
import { PlaybackEngine } from "@/engine/PlaybackEngine";
import { createRenderer, Renderer } from "@/engine/createRenderer";
import { animationSettings, defaultAnimation } from "@/animations";

/**
 * Hook that wires the PlaybackEngine and Renderer to the Zustand store.
 * Returns a ref callback to attach to the container element.
 */
export function usePlayback() {
  const engineRef = useRef<PlaybackEngine>(new PlaybackEngine());
  const rendererRef = useRef<Renderer | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const selectedAnimationId = useAnimationStore((s) => s.selectedAnimationId);
  const isPlaying = useAnimationStore((s) => s.isPlaying);
  const currentFrame = useAnimationStore((s) => s.currentFrame);
  const setCurrentFrame = useAnimationStore((s) => s.setCurrentFrame);

  const settings =
    animationSettings[selectedAnimationId] || defaultAnimation;

  // Ref callback to store container reference
  const setContainerRef = useCallback((container: HTMLElement | null) => {
    containerRef.current = container;
  }, []);

  // Initialize renderer when animation changes or container is set
  useEffect(() => {
    const container = containerRef.current;

    // Clean up existing renderer
    if (rendererRef.current) {
      rendererRef.current.destroy();
      rendererRef.current = null;
    }

    if (!container) return;

    // Create and initialize new renderer
    const renderer = createRenderer(settings.renderer);
    renderer.initialize(container, settings);
    rendererRef.current = renderer;

    // Draw initial frame
    const totalFrames = settings.totalFrames;
    const normalizedTime =
      totalFrames > 1 ? currentFrame / (totalFrames - 1) : 0;
    renderer.renderFrame({ normalizedTime, currentFrame, totalFrames });
  }, [selectedAnimationId, settings, currentFrame]);

  // Redraw when frame changes (scrubbing or playback)
  useEffect(() => {
    if (!rendererRef.current) return;
    const totalFrames = settings.totalFrames;
    const normalizedTime =
      totalFrames > 1 ? currentFrame / (totalFrames - 1) : 0;
    rendererRef.current.renderFrame({
      normalizedTime,
      currentFrame,
      totalFrames,
    });
  }, [currentFrame, settings]);

  // Start/stop playback engine
  useEffect(() => {
    const engine = engineRef.current;

    if (isPlaying) {
      engine.configure(settings.fps, settings.totalFrames);
      engine.start((frame) => {
        setCurrentFrame(frame);
      });
    } else {
      engine.stop();
    }

    return () => engine.stop();
  }, [isPlaying, settings.fps, settings.totalFrames, setCurrentFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      engineRef.current.stop();
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, []);

  return { containerRef: setContainerRef, settings };
}
