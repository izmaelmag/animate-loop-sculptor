import { AnimationFunction, AnimationSettings } from "@/types/animations";
import { Chain } from "./Chain";
import p5 from "p5";

const chainsAmount = 36;

class SceneController {
  public settings: Omit<AnimationSettings, "function" | "onSetup"> = {
    name: "Decks Dark",
    id: "decks-dark",
    fps: 60,
    totalFrames: 60 * 15,
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
    this.dt = dt; // Use normalized time (0-1) here instead of deltaTime

    // Clear the main canvas
    p.background(0); // Solid black background

    // Define layers of chromatic aberration
    const layers = [
      { timeOffset: -0.0005, color: [255, 0, 0, 120] }, // Red - past
      { timeOffset: -0.001, color: [0, 255, 0, 120] }, // Green - more recent past
      { timeOffset: 0, color: [255, 255, 255, 255] }, // White - current position
    ];

    // Draw each layer for all chains before moving to the next layer
    // This prevents overlapping issues between chains
    // for (const layer of layers) {
    //   // Update all chains to time position of current layer
    //   for (const chain of this.chains) {
    //   }
    // }

    // Draw the chains
    for (const layer of layers) {
      for (const chain of this.chains) {
        chain.drawColorLayer(dt, layer.timeOffset, layer.color);
      }
    }
  };

  setup: AnimationFunction = (p, t, frame, totalFrames) => {
    this.p = p;

    p.background(0); // Solid black

    for (let i = 0; i < chainsAmount; i++) {
      const initialChain = new Chain(p, {
        center: this.center,
        angle: ((Math.PI * 2) / chainsAmount) * i,
        chain: {
          minRadius: 0,
          maxRadius: 10,
          amount: 120,
        },
        debug: false, // Set to true to see the underlying link structure
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
