import { AnimationFunction, AnimationSettings } from "@/types/animations";
import { Chain } from "./Chain";
import p5 from "p5";

class SceneController {
  public settings: Omit<AnimationSettings, "function" | "onSetup"> = {
    name: "Decks Dark",
    id: "decks-dark",
    fps: 60,
    totalFrames: 60 * 10,
    width: 1080,
    height: 1920,
  };

  private p: p5;
  private chains: Chain[] = [];
  private dt: number = 0;

  get center() {
    return new p5.Vector(this.settings.width / 2, this.settings.height / 2);
  }

  constructor() {}

  animation: AnimationFunction = (p, dt, frame, totalFrames) => {
    // Update internal information
    this.dt = p.deltaTime;

    // Clear the main canvas
    p.background(255);

    for (const chain of this.chains) {
      chain.draw(dt);
    }
  };

  setup: AnimationFunction = (p, t, frame, totalFrames) => {
    this.p = p;
    const initialChain = new Chain(p, {
      center: this.center,
      angle: 0,
      chain: {
        minRadius: 10,
        maxRadius: 100,
        amount: 10,
      },
    });

    this.chains.push(initialChain);
  };
}

export const sceneController = new SceneController();

/**
 * Animation function
 *
 * @param {object} p - p5 instance
 * @param {number} t - normalized total time from 0 to 1
 * @param {number} frame - current frame number
 * @param {number} totalFrames - total number of frames in the video
 */
export const animation = sceneController.animation;
export const setup = sceneController.setup;

export const settings: AnimationSettings = {
  ...sceneController.settings,
  function: animation,
  onSetup: setup,
};
