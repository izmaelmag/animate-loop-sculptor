import { AnimationSettings, P5AnimationFunction, FrameContext } from "@/types/animations";
import { Chain } from "./Chain";
import p5 from "p5";

const chainsAmount = 1;

class SceneController {
  public metadata = {
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
    return new p5.Vector(this.metadata.width / 2, this.metadata.height / 2);
  }

  draw: P5AnimationFunction = (p, _ctx) => {
    p.background(0);
    for (const chain of this.chains) {
      chain.draw();
    }
  };

  setup = (p: p5): void => {
    this.p = p;
    p.background(0);

    const angleToTop = Math.PI * -0.5;

    for (let i = 0; i < chainsAmount; i++) {
      const initialChain = new Chain(p, {
        center: new p5.Vector(this.center.x, this.metadata.height),
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

const sceneController = new SceneController();

export const settings: AnimationSettings = {
  ...sceneController.metadata,
  renderer: "p5",
  draw: sceneController.draw,
  setup: sceneController.setup,
};
