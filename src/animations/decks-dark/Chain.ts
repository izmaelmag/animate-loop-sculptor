import p5 from "p5";
import { Link } from "./Link";

type Point = {
  x: number;
  y: number;
};

interface ChainConstructorSettings {
  center: p5.Vector;
  angle: number;
  chain: {
    minRadius: number;
    maxRadius: number;
    amount: number;
  };
  debug?: boolean;
}

export class Chain {
  private p: p5;
  private settings: ChainConstructorSettings;
  private links: Link[] = [];
  private debug: boolean;

  constructor(p: p5, settings: ChainConstructorSettings) {
    this.p = p;
    this.settings = settings;
    this.debug = settings.debug !== undefined ? settings.debug : false;

    this.createLinks();
  }

  getPointOnCircle(center: Point, radius: number, angle: number) {
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);
    return { x, y };
  }

  // Returns new link's radius by its index
  // Radius must evenly decrease from chain max to chain min
  getRadiusByIndex(index: number): number {
    const t = index / this.settings.chain.amount;
    return (
      this.settings.chain.maxRadius * (1 - t) +
      this.settings.chain.minRadius * t
    );
  }

  private createLinks() {
    const directionVector = p5.Vector.fromAngle(this.settings.angle);

    const initialLink = new Link({
      p: this.p,
      center: this.settings.center,
      direction: directionVector,
      size: this.getRadiusByIndex(0),
      parentLink: undefined,
      childLink: undefined,
      debug: this.debug,
    });

    this.links.push(initialLink);

    // Create the rest of the links chained all together by the previous link's direction vector as a center
    for (let i = 1; i < this.settings.chain.amount; i++) {
      const previousLink = this.links[i - 1] || initialLink;
      const newCenter = previousLink.getDirectionPoint();

      const link = new Link({
        p: this.p,
        center: newCenter,
        direction: directionVector,
        size: this.getRadiusByIndex(i),
        parentLink: previousLink,
        childLink: undefined,
        debug: this.debug,
      });

      previousLink.addChild(link);
      this.links.push(link);
    }
  }

  draw() {
    // Draw the hugging shape
    this.drawHuggingShape();
    
    // Draw debug visuals if needed
    if (this.debug) {
      this.links.forEach(link => link.draw());
    }
  }

  // Draw the shape that hugs the chain
  private drawHuggingShape() {
    if (this.links.length === 0) return;

    const firstLink = this.links[0];
    const lastLink = this.links[this.links.length - 1];

    this.p.push();
    this.p.fill(255);
    this.p.noStroke();
    this.p.beginShape();

    // Start with the first link's right point
    const rightPoint = firstLink.getRightSidePoint();
    this.p.vertex(rightPoint.x, rightPoint.y);

    // Connect all links' left points (from first to last)
    for (const link of this.links) {
      const leftPoint = link.getLeftSidePoint();
      this.p.vertex(leftPoint.x, leftPoint.y);
    }

    // Connect to the last link's direction point
    const lastDirectionPoint = lastLink.getDirectionPoint();
    this.p.vertex(lastDirectionPoint.x, lastDirectionPoint.y);

    // Connect all links' right points (from last to first)
    for (let i = this.links.length - 1; i >= 0; i--) {
      const link = this.links[i];
      const rightPoint = link.getRightSidePoint();
      this.p.vertex(rightPoint.x, rightPoint.y);
    }

    this.p.endShape(this.p.CLOSE);
    this.p.pop();
  }
}
