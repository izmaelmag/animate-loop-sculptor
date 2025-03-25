import p5 from "p5";
import { Chain } from "./Chain";

interface TentacleConstructionSettings {
  p: p5;
  origin: p5.Vector;
  chain: {
    minRadius: number;
    maxRadius: number;
  };
}

// This class represents a "thinking center" of a tentacle, controlling its movement and parameters
// Chain is a collection of segments that make up the tentacle
// Chain and Link are in a parent/child relationship
// Chain and Link are controlled by the Tentacle class and stands as a "dumb" object
export class Tentacle {
  private chain: Chain;
  private p: p5;
  private origin: p5.Vector;

  constructor(settings: TentacleConstructionSettings) {
    this.p = settings.p;
    this.origin = settings.origin;
    this.createChain();
  }

  createChain() {
    this.chain = new Chain(this.p, {
      center: this.origin,
      angle: 0,
      chain: {
        minRadius: 10,
        maxRadius: 50,
        amount: 10,
      },
    });
  }
}
