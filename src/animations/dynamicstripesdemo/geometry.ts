import { Point } from "@/utils/DynamicSegments";

interface LineSeed {
  a: Point;
  b: Point;
  projectionTRBL: number;
}

export interface DiagonalLine {
  a: Point;
  b: Point;
  phaseOrder: number;
}

export const buildParallelLines = (
  width: number,
  height: number,
  lineCountInput: number,
  lineAngleDeg: number,
  margin: number,
  lineLengthPx: number,
): DiagonalLine[] => {
  const lineCount = Math.max(1, Math.round(lineCountInput));
  const angleRad = (lineAngleDeg * Math.PI) / 180;
  const dir: Point = [Math.cos(angleRad), Math.sin(angleRad)];
  const normal: Point = [-dir[1], dir[0]];
  const center: Point = [width / 2, height / 2];

  const projectionRadius =
    (Math.abs(normal[0]) * width + Math.abs(normal[1]) * height) / 2;
  const spanAlongNormal = Math.max(0, projectionRadius - margin);
  const lineLength = Math.max(1, lineLengthPx);
  const halfLength = lineLength / 2;
  const seeds: LineSeed[] = [];

  for (let index = 0; index < lineCount; index += 1) {
    const t = lineCount === 1 ? 0.5 : index / (lineCount - 1);
    const offsetAlongNormal = -spanAlongNormal + 2 * spanAlongNormal * t;
    const cx = center[0] + normal[0] * offsetAlongNormal;
    const cy = center[1] + normal[1] * offsetAlongNormal;

    const a: Point = [cx - dir[0] * halfLength, cy - dir[1] * halfLength];
    const b: Point = [cx + dir[0] * halfLength, cy + dir[1] * halfLength];
    // Global axis for stable wave direction semantics.
    const projectionTRBL = cy - cx;
    seeds.push({ a, b, projectionTRBL });
  }

  seeds.sort((left, right) => left.projectionTRBL - right.projectionTRBL);
  return seeds.map((seed, phaseOrder) => ({
    a: seed.a,
    b: seed.b,
    phaseOrder,
  }));
};
