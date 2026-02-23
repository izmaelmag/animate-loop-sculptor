import { NormalizedSegment } from "../../utils/segmentation/types";
import { wrap01 } from "./motion";

const EPSILON = 1e-9;

export interface SegmentPiece {
  segment: NormalizedSegment;
  ownerIndex: number;
}

export const buildLogicalSegmentsFromPoints = (
  pointsUnwrapped: number[],
): NormalizedSegment[] => {
  const segments: NormalizedSegment[] = [];
  for (let index = 0; index < pointsUnwrapped.length - 1; index += 1) {
    const start = pointsUnwrapped[index];
    const end = pointsUnwrapped[index + 1];
    if (end - start <= EPSILON) {
      continue;
    }
    segments.push([start, end]);
  }
  return segments;
};

export const splitSegmentsToUnitInterval = (
  segmentsUnwrapped: NormalizedSegment[],
): NormalizedSegment[] => {
  return splitSegmentsToUnitIntervalWithOwners(segmentsUnwrapped).map(
    (piece) => piece.segment,
  );
};

export const splitSegmentsToUnitIntervalWithOwners = (
  segmentsUnwrapped: NormalizedSegment[],
): SegmentPiece[] => {
  const piecesWithOwners: SegmentPiece[] = [];

  for (let segmentIndex = 0; segmentIndex < segmentsUnwrapped.length; segmentIndex += 1) {
    const [startRaw, endRaw] = segmentsUnwrapped[segmentIndex];
    const start = Math.min(startRaw, endRaw);
    const end = Math.max(startRaw, endRaw);
    if (end - start <= EPSILON) {
      continue;
    }

    let cursor = start;
    while (cursor < end - EPSILON) {
      const windowIndex = Math.floor(cursor);
      const boundary = windowIndex + 1;
      const chunkEnd = Math.min(end, boundary);

      const drawStart = wrap01(cursor);
      const drawEnd = chunkEnd === boundary ? 1 : wrap01(chunkEnd);

      if (drawEnd - drawStart > EPSILON) {
        const segment: NormalizedSegment = [drawStart, drawEnd];
        piecesWithOwners.push({
          segment,
          ownerIndex: segmentIndex,
        });
      }

      cursor = chunkEnd;
    }
  }

  return piecesWithOwners;
};

export const wrapPointsForDebug = (pointsUnwrapped: number[]): number[] => {
  return pointsUnwrapped.map((point) => wrap01(point)).sort((a, b) => a - b);
};
