import { AnimationFunction, AnimationSettings } from "@/types/animations";
import { Chain } from "./Chain";
import p5 from "p5";

const chainsAmount = 1;

class SceneController {
  public settings: Omit<AnimationSettings, "function" | "onSetup"> = {
    name: "Decks Dark",
    id: "decks-dark",
    fps: 60,
    totalFrames: 60 * 15,
    width: 1080,
    height: 1080,
  };

  private p: p5;
  private chains: Chain[] = [];

  get center() {
    return new p5.Vector(this.settings.width / 2, this.settings.height / 2);
  }

  constructor() {}

  animation: AnimationFunction = (p, dt, frame, totalFrames) => {
    // Clear the main canvas
    p.background(0); // Solid black background

    // Draw the chains
    for (const chain of this.chains) {
      chain.draw();
    }
  };

  setup: AnimationFunction = (p, t, frame, totalFrames) => {
    this.p = p;

    p.background(0); // Solid black

    const angleToTop = Math.PI * -0.5;

    for (let i = 0; i < chainsAmount; i++) {
      const initialChain = new Chain(p, {
        center: new p5.Vector(this.center.x, this.settings.height),
        angle: angleToTop + ((Math.PI * 2) / chainsAmount) * i,
        chain: {
          minRadius: 10,
          maxRadius: 80,
          amount: 10,
        },
        debug: true,
      });

      this.chains.push(initialChain);
    }
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
