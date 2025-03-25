import p5 from "p5";
import { createNoise3D } from "simplex-noise";
import { LinkRenderer } from "./LinkRenderer";

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
  protected p: p5;
  private parentLink: Link | undefined;
  private childLink: Link | undefined;
  private center: p5.Vector;
  private direction: p5.Vector;
  private originalDirection: p5.Vector; // Store the original direction
  private size: number;
  private phase: number = 0;
  private renderer: LinkRenderer;
  private positionFactor: number = 0;
  private noise: ReturnType<typeof createNoise3D>;

  public isDebug: boolean = false;
  // Chain rotary motion
  private rotationFrequency: number = 3;
  private baseRotationAmplitude: number = Math.PI * 0.1; // 54 degrees max rotation

  private originalSize: number;

  get breathingAmplitude() {
    return this.originalSize * 0;
  }

  constructor(settings: LinkConstructor) {
    this.p = settings.p;
    this.renderer = new LinkRenderer(settings.p);
    this.parentLink = settings.parentLink;
    this.childLink = settings.childLink;
    this.center = settings.parentLink
      ? settings.parentLink.getDirectionPoint()
      : settings.center;
    this.direction = settings.direction;
    this.originalDirection = settings.direction.copy();
    this.size = settings.size;
    this.originalSize = settings.size;
    this.phase = settings.phase || 0;
    this.isDebug = settings.debug !== undefined ? settings.debug : false;
    this.positionFactor = settings.phase || 0;
    this.noise = createNoise3D();
  }

  // Oscillates chain rotation between -30 and 30 degrees using vectors and radians
  update(dt: number = 0) {
    this.rotate(dt);
  }

  private rotate(dt: number = 0) {
    // Simple sine wave with phase offset for propagation
    const wave = Math.sin(
      dt * this.rotationFrequency * Math.PI * 2 + this.phase * 3
    );
    const rotation = wave * this.baseRotationAmplitude;

    // Just rotate the direction
    this.direction = this.originalDirection.copy().rotate(rotation);
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

  draw() {
    if (this.isDebug) {
      this.renderer.drawConnectionTriangle(
        this.getDirectionPoint(),
        this.getLeftSidePoint(),
        this.getRightSidePoint()
      );
      this.renderer.drawDirectionPoint(
        this.getDirectionPoint(),
        this.size * 0.2
      );
      this.renderer.drawLeftSidePoint(
        this.getLeftSidePoint(),
        this.size * 0.15
      );
      this.renderer.drawRightSidePoint(
        this.getRightSidePoint(),
        this.size * 0.15
      );
      this.renderer.drawCenterPoint(this.center, this.size * 0.25);
    } else {
      this.renderer.fillBody(this.center, this.size * 2);
    }
  }
}
