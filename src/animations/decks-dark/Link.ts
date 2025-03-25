import p5 from "p5";

interface LinkConstructor {
  p: p5;
  parentLink: Link | undefined;
  childLink: Link | undefined;
  center: p5.Vector;
  direction: p5.Vector;
  size: number;
  phase?: number;
  debug?: boolean;
}

export class Link {
  private p: p5;
  private parentLink: Link | undefined;
  private childLink: Link | undefined;
  private center: p5.Vector;
  private direction: p5.Vector;
  private originalDirection: p5.Vector; // Store the original direction
  private size: number;
  private phase: number = 0;

  public isDebug: boolean = false;

  // Chain rotary motion
  private rotationFrequency: number = 4; // Complete 10 oscillations when dt goes from 0 to 1
  private rotationAmplitude: number = (Math.PI / 180) * 45; // 30 Degrees to rad conversion

  // Chain "breathing" oscillation (radius)
  private breathingFrequency: number = 1;

  private originalSize: number;

  get breathingAmplitude() {
    return this.originalSize * 0;
  }

  constructor(settings: LinkConstructor) {
    this.p = settings.p;
    this.parentLink = settings.parentLink;
    this.childLink = settings.childLink;
    this.center = settings.parentLink
      ? settings.parentLink.getDirectionPoint()
      : settings.center;
    this.direction = settings.direction;
    this.originalDirection = settings.direction.copy(); // Save a copy of the original direction
    this.size = settings.size;
    this.originalSize = settings.size;
    this.phase = settings.phase || 0;
    this.isDebug = settings.debug !== undefined ? settings.debug : false;
  }

  // Oscillates chain rotation between -30 and 30 degrees using vectors and radians
  update(dt: number = 0) {
    this.rotate(dt);
    this.breathe(dt);
  }

  private rotate(dt: number = 0) {
    const rotation =
      this.rotationAmplitude *
      Math.sin(2 * Math.PI * this.rotationFrequency * dt + this.phase);

    // Reset direction to original and then apply the rotation
    this.direction = this.originalDirection.copy().rotate(rotation);
  }

  private breathe(dt: number = 0) {
    const breathing =
      this.breathingAmplitude *
      Math.sin(2 * Math.PI * this.breathingFrequency * dt + this.phase);

    this.size = this.originalSize + breathing;
  }

  // Method to update the center position (used when parent link moves)
  updateCenter(newCenter: p5.Vector) {
    this.center = newCenter;
  }

  addChild(childLink: Link) {
    this.childLink = childLink;
  }

  addParent(parentLink: Link) {
    this.parentLink = parentLink;
  }

  // Getter for the center vector
  getCenter(): p5.Vector {
    return this.center;
  }

  // Setter for the center vector
  setCenter(newCenter: p5.Vector) {
    this.center = newCenter;
  }

  // Getter for the direction vector
  getDirection(): p5.Vector {
    return this.direction;
  }

  // Setter for the direction vector
  setDirection(newDirection: p5.Vector) {
    this.direction = newDirection;
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

    this.fillBody();
  }

  fillBody() {
    this.p.push();
    this.p.noStroke();
    this.p.fill(255);
    this.p.circle(this.center.x, this.center.y, this.size * 2);
    this.p.pop();
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
