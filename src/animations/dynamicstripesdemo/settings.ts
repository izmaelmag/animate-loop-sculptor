export interface DynamicStripesParams extends Record<string, unknown> {
  segmentCount: number;
  segmentGap: number;
  speed: number;
  phaseDelta: number;
}

export const defaultParams: DynamicStripesParams = {
  segmentCount: 18,
  segmentGap: 0.24,
  speed: 1,
  phaseDelta: 0.6,
};

const asNumber = (value: unknown, fallback: number): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

export const resolveDynamicStripesParams = (
  raw: Record<string, unknown>,
): DynamicStripesParams => {
  const segmentCount = Math.round(
    asNumber(raw.segmentCount, defaultParams.segmentCount),
  );
  const segmentGap = asNumber(raw.segmentGap, defaultParams.segmentGap);
  const speed = asNumber(raw.speed, defaultParams.speed);
  const phaseDelta = asNumber(raw.phaseDelta, defaultParams.phaseDelta);

  return {
    segmentCount: Math.max(2, Math.min(120, segmentCount)),
    segmentGap: Math.max(0, Math.min(0.95, segmentGap)),
    speed: Math.max(0, speed),
    phaseDelta: Math.max(0, phaseDelta),
  };
};
