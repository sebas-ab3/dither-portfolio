export const gradientFragSrc = `#version 300 es
precision highp float;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
in vec2 vUv;
out vec4 fragColor;
void main() {
  vec2 texelHalf = uTexelSize * 0.5;
  float L = texture(uPressure, max(vUv - vec2(uTexelSize.x, 0.0), texelHalf)).x;
  float R = texture(uPressure, min(vUv + vec2(uTexelSize.x, 0.0), 1.0 - texelHalf)).x;
  float T = texture(uPressure, min(vUv + vec2(0.0, uTexelSize.y), 1.0 - texelHalf)).x;
  float B = texture(uPressure, max(vUv - vec2(0.0, uTexelSize.y), texelHalf)).x;
  vec2 vel = texture(uVelocity, vUv).xy - vec2(R - L, T - B) * 0.5;
  fragColor = vec4(vel, 0.0, 1.0);
}`;
