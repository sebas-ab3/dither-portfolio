// Bayer 8×8 ordered dithering — renders to ditherFBO at full canvas resolution
export const ditherFragSrc = `#version 300 es
precision mediump float;
uniform sampler2D uSource;
uniform float uDitherScale;
in vec2 vUv;
out vec4 fragColor;

int bayer8x8(ivec2 pos) {
  int x = pos.x & 7;
  int y = pos.y & 7;
  int idx = x + y * 8;
  int bayer[64] = int[64](
     0, 32,  8, 40,  2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44,  4, 36, 14, 46,  6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
     3, 35, 11, 43,  1, 33,  9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47,  7, 39, 13, 45,  5, 37,
    63, 31, 55, 23, 61, 29, 53, 21
  );
  return bayer[idx];
}

void main() {
  vec3 color = texture(uSource, vUv).rgb;
  float brightness = dot(color, vec3(0.299, 0.587, 0.114));
  ivec2 ditherCoord = ivec2(floor(gl_FragCoord.xy / uDitherScale));
  float threshold = float(bayer8x8(ditherCoord)) / 64.0;
  float d = step(threshold, brightness);
  vec3 on  = vec3(0.8, 0.1, 0.05);
  vec3 off = vec3(0.039, 0.039, 0.039);
  fragColor = vec4(mix(off, on, d), 1.0);
}`;
