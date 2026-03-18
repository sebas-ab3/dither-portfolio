export const advectionFragSrc = `#version 300 es
precision highp float;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uTexelSize;
uniform float uDt;
uniform float uDissipation;
in vec2 vUv;
out vec4 fragColor;
void main() {
  vec2 vel = texture(uVelocity, vUv).xy;
  vec2 coord = clamp(vUv - uDt * vel * uTexelSize, uTexelSize * 0.5, 1.0 - uTexelSize * 0.5);
  fragColor = vec4(texture(uSource, coord).xyz * uDissipation, 1.0);
}`;
