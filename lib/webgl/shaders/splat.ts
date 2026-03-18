export const splatFragSrc = `#version 300 es
precision highp float;
uniform sampler2D uTarget;
uniform vec2 uTexelSize;
uniform vec2 uPoint;
uniform vec3 uColor;
uniform float uRadius;
in vec2 vUv;
out vec4 fragColor;
void main() {
  vec2 p = vUv - uPoint;
  p.x *= uTexelSize.y / uTexelSize.x;
  float g = exp(-dot(p, p) / uRadius);
  fragColor = vec4(texture(uTarget, vUv).xyz + g * uColor, 1.0);
}`;
