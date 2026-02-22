export interface DynamicStripesParams extends Record<string, unknown> {
  backgroundColor: string;
  segmentColor: string;
  margin: number;
  edgeDivisions: number;
  lineAngleDeg: number;
  lineLengthPx: number;
  minSegmentLengthPx: number;
  strictGap: boolean;
  debug: boolean;
  segmentCount: number;
  segmentGap: number;
  lineThickness: number;
  strokeCap: "round" | "square" | "project";
  speed: number;
  originCycles: number;
  originDirection: "forward" | "backward";
  waveDirection: "tr-bl" | "bl-tr";
  phaseDelta: number;
  amplitude: number;
}

export const defaultParams: DynamicStripesParams = {
  backgroundColor: "#000000",
  segmentColor: "#ffffff",
  margin: 108,
  edgeDivisions: 8,
  lineAngleDeg: 45,
  lineLengthPx: 2200,
  minSegmentLengthPx: 1,
  strictGap: false,
  debug: false,
  segmentCount: 4,
  segmentGap: 24,
  lineThickness: 24,
  strokeCap: "round",
  speed: 10,
  originCycles: 0,
  originDirection: "forward",
  waveDirection: "tr-bl",
  phaseDelta: 0.6,
  amplitude: 0.02,
};

const asNumber = (value: unknown, fallback: number): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const isHexColor = (value: unknown): value is string => {
  return (
    typeof value === "string" &&
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)
  );
};

export const resolveDynamicStripesParams = (
  raw: Record<string, unknown>,
): DynamicStripesParams => {
  const backgroundColor = isHexColor(raw.backgroundColor)
    ? raw.backgroundColor
    : defaultParams.backgroundColor;
  const segmentColor = isHexColor(raw.segmentColor)
    ? raw.segmentColor
    : defaultParams.segmentColor;
  const margin = asNumber(raw.margin, defaultParams.margin);
  const edgeDivisions = Math.round(
    asNumber(raw.edgeDivisions, defaultParams.edgeDivisions),
  );
  const lineAngleDeg = asNumber(raw.lineAngleDeg, defaultParams.lineAngleDeg);
  const lineLengthPx = asNumber(raw.lineLengthPx, defaultParams.lineLengthPx);
  const minSegmentLengthPx = asNumber(
    raw.minSegmentLengthPx,
    defaultParams.minSegmentLengthPx,
  );
  const strictGap = raw.strictGap === true;
  const debug = raw.debug === true;
  const segmentCount = Math.round(
    asNumber(raw.segmentCount, defaultParams.segmentCount),
  );
  const segmentGap = asNumber(raw.segmentGap, defaultParams.segmentGap);
  const lineThickness = asNumber(raw.lineThickness, defaultParams.lineThickness);
  const strokeCap =
    raw.strokeCap === "square" || raw.strokeCap === "project"
      ? raw.strokeCap
      : defaultParams.strokeCap;
  const speed = asNumber(raw.speed, defaultParams.speed);
  const originCycles = asNumber(raw.originCycles, defaultParams.originCycles);
  const originDirection =
    raw.originDirection === "backward" ? "backward" : defaultParams.originDirection;
  const waveDirection =
    raw.waveDirection === "bl-tr" ? "bl-tr" : defaultParams.waveDirection;
  const phaseDelta = asNumber(raw.phaseDelta, defaultParams.phaseDelta);
  const amplitude = asNumber(raw.amplitude, defaultParams.amplitude);

  return {
    backgroundColor,
    segmentColor,
    margin: Math.max(-1920, Math.min(2000, margin)),
    edgeDivisions: Math.max(1, Math.min(256, edgeDivisions)),
    lineAngleDeg: ((lineAngleDeg % 360) + 360) % 360,
    lineLengthPx: Math.max(50, Math.min(6000, lineLengthPx)),
    minSegmentLengthPx: Math.max(0, Math.min(256, minSegmentLengthPx)),
    strictGap,
    debug,
    segmentCount: Math.max(2, Math.min(24, segmentCount)),
    segmentGap: Math.max(0, Math.min(1024, segmentGap)),
    lineThickness: Math.max(1, Math.min(265, lineThickness)),
    strokeCap,
    // Integer cycles-per-loop keeps the animation seamless on loop boundary.
    speed: Math.max(1, Math.min(20, Math.round(speed))),
    // Integer full-length drifts per loop keeps drift loop-safe.
    originCycles: Math.max(0, Math.min(20, Math.round(originCycles))),
    originDirection,
    waveDirection,
    phaseDelta: Math.max(0, phaseDelta),
    amplitude: Math.max(0, Math.min(0.2, amplitude)),
  };
};
