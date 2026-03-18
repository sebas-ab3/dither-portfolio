export const gradientFragSrc = `#version 300 es
precision highp float;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
in vec2 vUv;
out vec4 fragColor;
void main() {
  float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  vec2 vel = texture(uVelocity, vUv).xy - vec2(R - L, T - B) * 0.5;
  fragColor = vec4(vel, 0.0, 1.0);
}`;
