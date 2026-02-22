export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(value, max));
};

export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

export const normalizeSegmentCount = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.max(1, Math.round(value));
};

export const normalizeGap = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, value);
};

export const normalizeMinSegmentLength = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.max(0, value);
};
