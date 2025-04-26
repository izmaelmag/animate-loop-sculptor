export class Cell {
  constructor(
    public leftX: number,
    public rightX: number,
    public topY: number,
    public bottomY: number
  ) {}

  public resize(leftX: number, rightX: number, topY: number, bottomY: number) {
    this.leftX = leftX;
    this.rightX = rightX;
    this.topY = topY;
    this.bottomY = bottomY;
  }

  get width(): number {
    return this.rightX - this.leftX;
  }

  get height(): number {
    return this.bottomY - this.topY;
  }

  get centerX(): number {
    return this.leftX + this.width / 2;
  }

  get centerY(): number {
    return this.topY + this.height / 2;
  }

  get center(): { x: number; y: number } {
    return { x: this.centerX, y: this.centerY };
  }
}
