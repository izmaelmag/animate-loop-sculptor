export const wrap01 = (value: number): number => {
  return ((value % 1) + 1) % 1;
};

const MIN_INTERVAL = 1e-4;

interface MovingPointsInput {
  pointCount: number;
  baseTimePhase: number;
  phaseDelta: number;
  directionSign: number;
  phaseOrder: number;
  linePhaseStep: number;
  originOffset: number;
  amplitude: number;
}

export const buildOscillatingPointPositions = ({
  pointCount,
  baseTimePhase,
  phaseDelta,
  directionSign,
  phaseOrder,
  linePhaseStep,
  originOffset,
  amplitude,
}: MovingPointsInput): number[] => {
  const segmentCount = Math.max(1, pointCount - 1);
  const baseStep = 1 / segmentCount;
  const maxOscillation = Math.max(0, baseStep * 0.49);
  const oscillationAmplitude = Math.min(Math.max(0, amplitude), maxOscillation);
  const oscillatingPoints: number[] = [];

  // Build N oscillating points, then append seam duplicate (+1 turn) as point N+1.
  for (let pointIndex = 0; pointIndex < segmentCount; pointIndex += 1) {
    const parentPoint = originOffset + pointIndex * baseStep;
    const phase =
      baseTimePhase +
      pointIndex * phaseDelta +
      directionSign * phaseOrder * linePhaseStep;
    const childPoint = parentPoint + Math.sin(phase) * oscillationAmplitude;
    oscillatingPoints.push(childPoint);
  }

  // Keep points ordered with minimum spacing.
  const constrainedPoints: number[] = [oscillatingPoints[0]];
  for (let index = 1; index < oscillatingPoints.length; index += 1) {
    constrainedPoints[index] = Math.max(
      oscillatingPoints[index],
      constrainedPoints[index - 1] + MIN_INTERVAL,
    );
  }

  const firstPoint = constrainedPoints[0];
  const points: number[] = [...constrainedPoints, firstPoint + 1];
  return points;
};
