import { Point } from "./types";

export interface Path2D {
  getPointAt(progress: number): Point;
  getLength(): number;
}
