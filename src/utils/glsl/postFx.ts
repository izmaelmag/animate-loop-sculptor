export interface GrainOverlaySettings {
  strength: number;
  scale: number;
}

export const defaultGrainOverlaySettings: GrainOverlaySettings = {
  // Subtle value that reduces banding without visible "noise look"
  strength: 0.024,
  scale: 1.0,
};

// Reusable GLSL chunk for a lightweight grain+dither post effect.
// Use: color = applyGrainOverlay(color, gl_FragCoord.xy, u_resolution, u_time, u_grainStrength, u_grainScale);
export const grainOverlayShaderChunk = `
float grainHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec3 applyGrainOverlay(
  vec3 color,
  vec2 fragCoord,
  vec2 resolution,
  float time,
  float strength,
  float scale
) {
  vec2 uv = fragCoord / max(resolution, vec2(1.0));
  vec2 grainUv = floor(uv * resolution * max(scale, 0.001));

  // Animated, very small amplitude grain to break color banding.
  float n = grainHash(grainUv + vec2(time * 173.0, time * 97.0));
  float d = (n - 0.5) * strength;

  return clamp(color + vec3(d), 0.0, 1.0);
}
`;
