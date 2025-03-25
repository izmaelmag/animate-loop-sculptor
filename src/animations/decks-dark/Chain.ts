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
    return (
      this.settings.chain.maxRadius -
      (index *
        (this.settings.chain.maxRadius - this.settings.chain.minRadius)) /
        this.settings.chain.amount
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
        phase: i * -(Math.PI / this.settings.chain.amount),
        debug: this.debug,
      });

      previousLink.addChild(link);
      this.links.push(link);
    }
  }

  updateLinks(dt: number = 0) {
    // Update links in sequence from parent to child
    for (let i = 0; i < this.links.length; i++) {
      const link = this.links[i];

      // First update the link's own rotation
      link.update(dt);

      // Then update the position of its child based on the updated direction
      if (i < this.links.length - 1) {
        const childLink = this.links[i + 1];
        // Update child link's center to match parent's current direction point
        childLink.updateCenter(link.getDirectionPoint());
      }
    }
  }

  // Draw the shape that hugs the chain
  drawHuggingShape(dt: number = 0) {
    if (this.links.length === 0) return;

    // Define time offsets and colors for the trails - SMALLER OFFSETS
    const timeShifts = [
      { timeOffset: 0, color: [255, 0, 0, 20] }, // Red - past
      { timeOffset: 0.001, color: [0, 255, 0, 20] }, // Green - more recent past
      { timeOffset: 0, color: [255, 255, 255, 255] }, // White - current position
    ];

    // Store original link positions to restore later
    const originalPositions = this.links.map((link) => ({
      center: link.getCenter().copy(),
      direction: link.getDirection().copy(),
    }));

    // Draw each time-shifted trail
    for (const [index, shift] of timeShifts.entries()) {
      // Only draw the time-shifted versions (not current) if we have enough time passed
      if (dt < Math.abs(shift.timeOffset) && shift.timeOffset < 0) {
        // continue;
      }

      // Calculate the shifted time
      const shiftedTime = dt + shift.timeOffset - index * 0.0001;

      // Only draw the trail if it's in the valid time range (0 to 1)
      if (shiftedTime >= 0 && shiftedTime <= 1) {
        // If this is not the current time (timeOffset != 0), update chain to that time
        if (shift.timeOffset !== 0) {
          // Update chain to the shifted time position
          this.updateLinks(shiftedTime);
        }

        // Draw the shape with the current color
        this.drawShapeWithColor(shift.color);
      }
    }

    // If we modified the chain positions for trails, restore original positions
    if (timeShifts.some((shift) => shift.timeOffset !== 0)) {
      // Restore original positions
      for (let i = 0; i < this.links.length; i++) {
        this.links[i].setCenter(originalPositions[i].center);
        this.links[i].setDirection(originalPositions[i].direction);
      }

      // Update to current time
      this.updateLinks(dt);
    }
  }

  // Helper method to draw the shape with a specific color
  private drawShapeWithColor(color: number[]) {
    if (this.links.length === 0) return;

    const firstLink = this.links[0];
    const lastLink = this.links[this.links.length - 1];

    this.p.push();
    this.p.fill(color);
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

  // Method to expose the current color layer to the scene controller
  drawColorLayer(dt: number, timeOffset: number, color: number[]) {
    if (this.links.length === 0) return;

    // Store original link positions
    const originalPositions = this.links.map((link) => ({
      center: link.getCenter().copy(),
      direction: link.getDirection().copy(),
    }));

    // Calculate the shifted time
    const shiftedTime = dt + timeOffset;

    // Only draw if it's in the valid time range and we have enough time passed
    if (
      shiftedTime >= 0 &&
      shiftedTime <= 1 &&
      !(dt < Math.abs(timeOffset) && timeOffset < 0)
    ) {
      // If not current time, update chain to that time
      if (timeOffset !== 0) {
        this.updateLinks(shiftedTime);
      }

      // Draw shape with specified color
      this.drawShapeWithColor(color);

      // Restore original positions
      for (let i = 0; i < this.links.length; i++) {
        this.links[i].setCenter(originalPositions[i].center);
        this.links[i].setDirection(originalPositions[i].direction);
      }

      // Update to current time
      this.updateLinks(dt);
    }

    this.draw(dt);
  }

  draw(dt: number = 0) {
    // First update all links' positions in sequence
    this.updateLinks(dt);

    // Draw the hugging shape (in standalone mode)
    // Note: This is only used if we're not using the layered drawing from SceneController
    // this.drawHuggingShape(dt);

    // Then draw them
    this.links.forEach((link) => {
      link.update(dt);
      link.draw();
    });
    // if (this.debug) {
    // }
  }
}
