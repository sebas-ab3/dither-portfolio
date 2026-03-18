export const divergenceFragSrc = `#version 300 es
precision highp float;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
in vec2 vUv;
out vec4 fragColor;
void main() {
  float L = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
  float T = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
  float B = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
  if (vUv.x - uTexelSize.x < 0.0) L = -texture(uVelocity, vUv).x;
  if (vUv.x + uTexelSize.x > 1.0) R = -texture(uVelocity, vUv).x;
  if (vUv.y - uTexelSize.y < 0.0) B = -texture(uVelocity, vUv).y;
  if (vUv.y + uTexelSize.y > 1.0) T = -texture(uVelocity, vUv).y;
  fragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;
