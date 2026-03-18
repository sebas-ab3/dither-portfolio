export const pressureFragSrc = `#version 300 es
precision highp float;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexelSize;
in vec2 vUv;
out vec4 fragColor;
void main() {
  float L = texture(uPressure, max(vUv - vec2(uTexelSize.x, 0.0), uTexelSize * 0.5)).x;
  float R = texture(uPressure, min(vUv + vec2(uTexelSize.x, 0.0), 1.0 - uTexelSize * 0.5)).x;
  float T = texture(uPressure, min(vUv + vec2(0.0, uTexelSize.y), 1.0 - uTexelSize * 0.5)).x;
  float B = texture(uPressure, max(vUv - vec2(0.0, uTexelSize.y), uTexelSize * 0.5)).x;
  float div = texture(uDivergence, vUv).x;
  fragColor = vec4((L + R + T + B - div) * 0.25, 0.0, 0.0, 1.0);
}`;
