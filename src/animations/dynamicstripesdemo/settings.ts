export interface DynamicStripesParams extends Record<string, unknown> {
  edgeDivisions: number;
  segmentCount: number;
  segmentGap: number;
  lineThickness: number;
  speed: number;
  phaseDelta: number;
  amplitude: number;
}

export const defaultParams: DynamicStripesParams = {
  edgeDivisions: 8,
  segmentCount: 4,
  segmentGap: 24,
  lineThickness: 24,
  speed: 10,
  phaseDelta: 0.6,
  amplitude: 0.02,
};

const asNumber = (value: unknown, fallback: number): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

export const resolveDynamicStripesParams = (
  raw: Record<string, unknown>,
): DynamicStripesParams => {
  const edgeDivisions = Math.round(
    asNumber(raw.edgeDivisions, defaultParams.edgeDivisions),
  );
  const segmentCount = Math.round(
    asNumber(raw.segmentCount, defaultParams.segmentCount),
  );
  const segmentGap = asNumber(raw.segmentGap, defaultParams.segmentGap);
  const lineThickness = asNumber(raw.lineThickness, defaultParams.lineThickness);
  const speed = asNumber(raw.speed, defaultParams.speed);
  const phaseDelta = asNumber(raw.phaseDelta, defaultParams.phaseDelta);
  const amplitude = asNumber(raw.amplitude, defaultParams.amplitude);

  return {
    edgeDivisions: Math.max(1, Math.min(48, edgeDivisions)),
    segmentCount: Math.max(2, Math.min(24, segmentCount)),
    segmentGap: Math.max(0, Math.min(200, segmentGap)),
    lineThickness: Math.max(1, Math.min(64, lineThickness)),
    // Integer cycles-per-loop keeps the animation seamless on loop boundary.
    speed: Math.max(1, Math.min(20, Math.round(speed))),
    phaseDelta: Math.max(0, phaseDelta),
    amplitude: Math.max(0, Math.min(0.2, amplitude)),
  };
};
