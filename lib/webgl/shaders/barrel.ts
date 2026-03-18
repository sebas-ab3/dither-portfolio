// Barrel distortion post-process — renders ditherFBO → canvas (null framebuffer)
export const barrelFragSrc = `#version 300 es
precision mediump float;
uniform sampler2D uSource;
uniform float uDistortion;
in vec2 vUv;
out vec4 fragColor;
void main() {
  vec2 c = vUv - 0.5;
  float r2 = dot(c, c);
  vec2 d = vUv + c * r2 * uDistortion;
  if (d.x < 0.0 || d.x > 1.0 || d.y < 0.0 || d.y > 1.0) {
    fragColor = vec4(0.039, 0.039, 0.039, 1.0);
    return;
  }
  fragColor = texture(uSource, d);
}`;
