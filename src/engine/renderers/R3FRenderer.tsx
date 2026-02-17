import { Canvas } from "@react-three/fiber";
import type {
  AnimationSettings,
  FrameContext,
  R3FAnimationFunction,
  R3FSceneProps,
} from "@/types/animations";
import { createRoot, Root } from "react-dom/client";
import { flushSync } from "react-dom";

type SceneComponent = R3FAnimationFunction;

/**
 * Manages a react-three-fiber canvas lifecycle.
 */
export class R3FRenderer {
  private mountNode: HTMLDivElement | null = null;
  private root: Root | null = null;
  private scene: SceneComponent | null = null;
  private cleanupFn: (() => void) | null = null;
  private settings: AnimationSettings | null = null;
  private frameContext: FrameContext = {
    normalizedTime: 0,
    currentFrame: 0,
    totalFrames: 1,
    params: {},
  };

  initialize(container: HTMLElement, settings: AnimationSettings) {
    this.destroy();

    this.settings = settings;
    this.scene = settings.draw as SceneComponent;
    this.cleanupFn = settings.cleanup || null;

    const setupFn = settings.setup as ((container: HTMLElement) => void) | undefined;

    this.mountNode = document.createElement("div");
    this.mountNode.style.width = "100%";
    this.mountNode.style.height = "100%";
    container.appendChild(this.mountNode);

    if (setupFn) {
      setupFn(container);
    }

    this.root = createRoot(this.mountNode);
    this.renderRoot();
  }

  renderFrame(ctx: FrameContext) {
    this.frameContext = ctx;
    this.renderRoot();
  }

  destroy() {
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }

    if (this.root) {
      this.root.unmount();
      this.root = null;
    }

    if (this.mountNode && this.mountNode.parentNode) {
      this.mountNode.parentNode.removeChild(this.mountNode);
    }

    this.mountNode = null;
    this.scene = null;
    this.settings = null;
  }

  private renderRoot() {
    if (!this.root || !this.scene || !this.settings) {
      return;
    }

    const Scene = this.scene;
    const ctx: R3FSceneProps["ctx"] = this.frameContext;

    flushSync(() => {
      this.root?.render(
        <Canvas
          frameloop="always"
          camera={{ position: [0, 0, 3], fov: 50 }}
          gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
          style={{ width: "100%", height: "100%" }}
        >
          <Scene ctx={ctx} />
        </Canvas>
      );
    });
  }
}
