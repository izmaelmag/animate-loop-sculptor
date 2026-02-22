import p5 from "p5";
import { Point, Segment } from "@/utils/DynamicSegments";

interface DebugDrawInput {
  p: p5;
  pointsPx: Point[];
  drawableSegments: Segment[];
  lineThickness: number;
  segmentGap: number;
}

export const drawDebugSegments = ({
  p,
  pointsPx,
  drawableSegments,
  lineThickness,
  segmentGap,
}: DebugDrawInput): void => {
  const debugPoints = pointsPx;
  const internalPoints = pointsPx;

  p.push();
  p.noFill();
  p.stroke(255, 64, 64, 200);
  p.strokeWeight(Math.max(1, lineThickness * 0.2));
  for (let segmentIndex = 0; segmentIndex < drawableSegments.length; segmentIndex += 1) {
    const [[x1, y1], [x2, y2]] = drawableSegments[segmentIndex];
    p.line(x1, y1, x2, y2);
  }
  p.pop();

  p.push();
  p.stroke(0, 200, 255, 220);
  p.strokeWeight(1);
  p.fill(0, 200, 255, 220);
  for (let pointIndex = 0; pointIndex < debugPoints.length; pointIndex += 1) {
    const [px, py] = debugPoints[pointIndex];
    p.circle(px, py, 5);
  }
  p.pop();

  p.push();
  p.noStroke();
  p.fill(80, 160, 255, 110);
  for (let pointIndex = 0; pointIndex < internalPoints.length; pointIndex += 1) {
    const [px, py] = internalPoints[pointIndex];
    p.circle(px, py, segmentGap);
  }
  p.pop();

  p.push();
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(10);
  p.fill(255, 150, 150, 220);
  p.noStroke();
  for (let segmentIndex = 0; segmentIndex < drawableSegments.length; segmentIndex += 1) {
    const [[x1, y1], [x2, y2]] = drawableSegments[segmentIndex];
    const length = Math.hypot(x2 - x1, y2 - y1);
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    p.text(`${Math.round(length)}`, cx, cy);
  }
  p.pop();
};
