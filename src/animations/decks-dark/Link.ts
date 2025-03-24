import p5 from "p5";
import { NonUndefined } from "react-hook-form";

interface LinkConstructor {
  p: p5;
  parentLink: Link | undefined;
  childLink: Link | undefined;
  center: p5.Vector;
  direction: p5.Vector;
  size: number;
}

export class Link {
  private p: p5;
  private parentLink: Link | undefined;
  private childLink: Link | undefined;
  private center: p5.Vector;
  private direction: p5.Vector;
  private originalDirection: p5.Vector; // Store the original direction
  private size: number;

  public isDebug: boolean = true;

  // Chain rotary motion
  private rotationFrequency: number = 2; // Complete 10 oscillations when dt goes from 0 to 1
  private rotationAmplitude: number = (Math.PI / 180) * 30; // 30 Degrees to rad conversion

  constructor(settings: LinkConstructor) {
    this.p = settings.p;
    this.parentLink = settings.parentLink;
    this.childLink = settings.childLink;
    this.center = settings.center;
    this.direction = settings.direction;
    this.originalDirection = settings.direction.copy(); // Save a copy of the original direction
    this.size = settings.size;
  }

  // Oscillates chain rotation between -30 and 30 degrees using vectors and radians
  update(dt: number = 0) {
    this.rotate(dt);
  }

  private rotate(dt: number = 0) {
    const rotation =
      this.rotationAmplitude *
      Math.sin(2 * Math.PI * this.rotationFrequency * dt);

    // Reset direction to original and then apply the rotation
    this.direction = this.originalDirection.copy().rotate(rotation);
  }

  addChild(childLink: Link) {
    this.childLink = childLink;
  }

  addParent(parentLink: Link) {
    this.parentLink = parentLink;
  }

  // Calculates position from center towards angle on distance of size
  getDirectionPoint(): p5.Vector {
    return p5.Vector.add(this.center, this.direction.copy().mult(this.size));
  }

  // Returns the point on a 90 degrees to the left from direction vector
  getLeftSidePoint() {
    return p5.Vector.add(
      this.center,
      this.direction
        .copy()
        .mult(this.size)
        .rotate(Math.PI * -0.5)
    );
  }

  // creates a new vector from the direction vector and rotates it 90 degrees to the right
  getRightSidePoint(): p5.Vector {
    return p5.Vector.add(
      this.center,
      this.direction
        .copy()
        .mult(this.size)
        .rotate(Math.PI * 0.5)
    );
  }
  // Draw methods

  draw() {
    if (this.isDebug) {
      this.drawConnectionTriangle();
      this.drawCircumference();

      this.drawDirectionPoint();
      this.drawLeftSidePoint();
      this.drawRightSidePoint();
      this.drawCenterPoint();
    }
  }

  drawDirectionPoint() {
    this.p.push();
    this.p.noStroke();
    this.p.fill(0);
    this.p.circle(
      this.getDirectionPoint().x,
      this.getDirectionPoint().y,
      this.size * 0.2
    );
    this.p.pop();
  }

  drawLeftSidePoint() {
    this.p.push();
    this.p.noStroke();
    this.p.fill(0, 0, 255);
    this.p.circle(
      this.getLeftSidePoint().x,
      this.getLeftSidePoint().y,
      this.size * 0.15
    );
    this.p.pop();
  }

  drawRightSidePoint() {
    this.p.push();
    this.p.noStroke();
    this.p.fill(0, 0, 255);
    this.p.circle(
      this.getRightSidePoint().x,
      this.getRightSidePoint().y,
      this.size * 0.15
    );
    this.p.pop();
  }

  drawCenterPoint() {
    this.p.push();
    this.p.noStroke();
    this.p.fill(255, 0, 0);
    this.p.circle(this.center.x, this.center.y, this.size * 0.25);
    this.p.pop();
  }

  drawConnectionTriangle() {
    this.p.push();
    this.p.stroke(0, 255, 0);
    this.p.strokeWeight(4);
    this.p.noFill();
    this.p.triangle(
      this.getDirectionPoint().x,
      this.getDirectionPoint().y,
      this.getLeftSidePoint().x,
      this.getLeftSidePoint().y,
      this.getRightSidePoint().x,
      this.getRightSidePoint().y
    );
    this.p.pop();
  }

  drawCircumference() {
    this.p.push();
    this.p.stroke(0);
    this.p.strokeWeight(4);
    this.p.noFill();
    this.p.circle(this.center.x, this.center.y, this.size * 2);
    this.p.pop();
  }
}
