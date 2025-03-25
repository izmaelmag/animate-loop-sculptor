import p5 from "p5";

export class LinkRenderer {
  constructor(public p: p5) {}

  fillBody(point: p5.Vector, size: number) {
    this.p.push();
    this.p.noStroke();
    this.p.fill(255);
    this.p.circle(point.x, point.y, size);
    this.p.pop();
  }

  drawDirectionPoint(point: p5.Vector, size: number) {
    this.p.push();
    this.p.noStroke();
    this.p.fill(0);
    this.p.circle(point.x, point.y, size);
    this.p.pop();
  }

  drawLeftSidePoint(point: p5.Vector, size: number) {
    this.p.push();
    this.p.noStroke();
    this.p.fill(0, 0, 255);
    this.p.circle(point.x, point.y, size);
    this.p.pop();
  }

  drawRightSidePoint(point: p5.Vector, size: number) {
    this.p.push();
    this.p.noStroke();
    this.p.fill(0, 0, 255);
    this.p.circle(point.x, point.y, size);
    this.p.pop();
  }

  drawCenterPoint(point: p5.Vector, size: number) {
    this.p.push();
    this.p.noStroke();
    this.p.fill(255, 0, 0);
    this.p.circle(point.x, point.y, size);
    this.p.pop();
  }

  drawConnectionTriangle(p1: p5.Vector, p2: p5.Vector, p3: p5.Vector) {
    this.p.push();
    this.p.stroke(0, 255, 0);
    this.p.strokeWeight(4);
    this.p.noFill();
    this.p.triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    this.p.pop();
  }
}
