import { Path2D } from "./Path2D";
import { clamp, lerp } from "./math";
import { Point } from "./types";

export class StraightLinePath implements Path2D {
  private _a: Point;
  private _b: Point;

  constructor(a: Point, b: Point) {
    this._a = [...a];
    this._b = [...b];
  }

  public setPoints(a: Point, b: Point): void {
    this._a = [...a];
    this._b = [...b];
  }

  public getPointAt(progress: number): Point {
    const t = clamp(progress, 0, 1);
    return [
      lerp(this._a[0], this._b[0], t),
      lerp(this._a[1], this._b[1], t),
    ];
  }

  public getLength(): number {
    const dx = this._b[0] - this._a[0];
    const dy = this._b[1] - this._a[1];
    return Math.hypot(dx, dy);
  }
}
