import { clamp, normalizeSegmentCount } from "./math";

export class SplitPointsModel {
  private _splitPoints: number[] = [];
  private _segmentCount = 1;

  constructor(splitPointsOrSegmentCount: number[] | number = []) {
    if (Array.isArray(splitPointsOrSegmentCount)) {
      this._splitPoints = this._normalizeSplitPoints(splitPointsOrSegmentCount);
      this._segmentCount = this._splitPoints.length + 1;
      return;
    }

    this._segmentCount = normalizeSegmentCount(splitPointsOrSegmentCount);
    this._splitPoints = this._buildEvenSplitPoints(this._segmentCount);
  }

  get splitPoints(): number[] {
    return [...this._splitPoints];
  }

  get segmentCount(): number {
    return this._segmentCount;
  }

  get allPoints(): number[] {
    return [0, ...this._splitPoints, 1];
  }

  public setSplitPoints(points: number[]): void {
    this._splitPoints = this._normalizeSplitPoints(points);
    this._segmentCount = this._splitPoints.length + 1;
  }

  public setSegmentCount(segmentCount: number): void {
    this._segmentCount = normalizeSegmentCount(segmentCount);
    this._splitPoints = this._buildEvenSplitPoints(this._segmentCount);
  }

  public updateSplitPoints(deltas: number[]): void {
    this._splitPoints = this._splitPoints.map((point, index) => {
      const delta = deltas[index] ?? 0;
      return clamp(point + delta, 0, 1);
    });
  }

  public replaceSplitPoints(points: number[]): void {
    this._splitPoints = this._normalizeSplitPoints(points);
    this._segmentCount = this._splitPoints.length + 1;
  }

  private _normalizeSplitPoints(points: number[]): number[] {
    return points.map((point) => clamp(point, 0, 1));
  }

  private _buildEvenSplitPoints(segmentCount: number): number[] {
    if (segmentCount <= 1) {
      return [];
    }
    return Array.from(
      { length: segmentCount - 1 },
      (_, index) => (index + 1) / segmentCount,
    );
  }
}
