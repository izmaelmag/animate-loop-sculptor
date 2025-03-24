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
}

export class Chain {
  private p: p5;
  private settings: ChainConstructorSettings;
  private links: Link[] = [];

  constructor(p: p5, settings: ChainConstructorSettings) {
    this.p = p;
    this.settings = settings;

    this.createLinks();
  }

  getPointOnCircle(center: Point, radius: number, angle: number) {
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);
    return { x, y };
  }

  private createLinks() {
    const initialLink = new Link({
      p: this.p,
      center: this.settings.center,
      direction: p5.Vector.fromAngle(this.settings.angle),
      size: this.settings.chain.maxRadius,
      parentLink: undefined,
      childLink: undefined,
    });

    this.links.push(initialLink);
  }

  draw(dt: number = 0) {
    this.links.forEach((link) => {
      link.update(dt);
      link.draw();
    });
  }
}
