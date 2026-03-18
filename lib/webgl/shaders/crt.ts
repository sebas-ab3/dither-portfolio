// CRT composite — PASS 2 in the post-process pipeline
// Applies scanlines, animated noise, and a light vignette to the dithered output.
// Post-process shader: mediump is fine here.
export const crtFragSrc = `#version 300 es
precision mediump float;

uniform sampler2D uSource;
uniform float uTime;

in vec2 vUv;
out vec4 fragColor;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec4 color = texture(uSource, vUv);

  // Scanlines: 6% darken on every other 2px band (4px total period)
  float sl = mod(gl_FragCoord.y, 4.0) < 2.0 ? 1.0 : 0.94;

  // Noise: very subtle time-animated grain
  float noise = rand(vUv + fract(uTime * 5.3)) * 0.025;

  // Vignette: light radial darkening (CSS overlay handles the heavier effect)
  vec2 c = vUv - 0.5;
  float vig = 1.0 - clamp(dot(c, c) * 1.2, 0.0, 0.25);

  vec3 result = color.rgb * sl;
  result += vec3(noise);
  result *= vig;

  fragColor = vec4(result, 1.0);
}`;
