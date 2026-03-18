# WebGL/GLSL Shader Skill

## When to Use
Apply this skill when working on ANY file in `components/fluid/shaders/`, `components/crt/shaders/`, `lib/webgl/`, or any `.glsl` file. Also apply when working on `FluidSimulation.tsx`, `DitherPostProcess.tsx`, or any component that creates/manages WebGL contexts.

## Project Context
This is a CRT-aesthetic portfolio site. All WebGL work serves one of two purposes:
1. **Fluid simulation** — Navier-Stokes solver on the Start Page background, reacts to mouse input
2. **Post-processing** — Dithering, scanlines, barrel distortion, vignette applied as fragment shader passes

## Render Pipeline Order
IMPORTANT: The pipeline is multi-pass and order matters. Never rearrange without understanding dependencies.

```
Mouse/Touch Input
  → Splat shader (inject velocity + dye at cursor position)
  → Advection shader (move fluid quantities along velocity field)
  → Divergence shader (compute velocity divergence)
  → Pressure shader (iterative Jacobi solver, 20-30 iterations)
  → Gradient Subtraction shader (make velocity divergence-free)
  → Fluid density texture output (smooth RGB)
  → PASS 1: Dither shader (Bayer 8x8 ordered dithering)
  → PASS 2: CRT composite shader (scanlines + noise + vignette)
  → PASS 3: Barrel distortion shader (applied last, warps everything)
  → Final framebuffer → canvas
```

## Framebuffer Management
- Use **ping-pong FBOs** for the fluid sim — two framebuffers that alternate as read/write targets each step
- Each sim quantity (velocity, pressure, dye/density) needs its own FBO pair
- Post-processing passes use a **linear chain** — output of one pass feeds as input texture to the next
- ALWAYS use `gl.FLOAT` or `gl.HALF_FLOAT` textures for sim FBOs (need negative values for velocity)
- Post-process FBOs can use `gl.UNSIGNED_BYTE` if precision isn't critical
- Check for `EXT_color_buffer_float` extension support — required for rendering to float textures

```typescript
// Ping-pong FBO pattern
interface DoubleFBO {
  read: WebGLFramebuffer;
  write: WebGLFramebuffer;
  readTexture: WebGLTexture;
  writeTexture: WebGLTexture;
}

function swapFBO(fbo: DoubleFBO): void {
  const temp = fbo.read;
  const tempTex = fbo.readTexture;
  fbo.read = fbo.write;
  fbo.readTexture = fbo.writeTexture;
  fbo.write = temp;
  fbo.writeTexture = tempTex;
}
```

## GLSL Conventions

### File Naming
- Sim shaders: `advection.glsl`, `divergence.glsl`, `pressure.glsl`, `gradient.glsl`, `splat.glsl`
- Post-process shaders: `dither.glsl`, `scanlines.glsl`, `vignette.glsl`, `barrel.glsl`
- Shared: `vertex.glsl` (single fullscreen quad vertex shader reused by all passes)

### Precision
- Use `precision highp float;` in all fragment shaders for the fluid sim
- Post-process shaders can use `precision mediump float;` for mobile compat
- ALWAYS declare precision at the top of every fragment shader

### Uniform Naming
Prefix all uniforms with `u` to distinguish from varyings and locals:
```glsl
uniform sampler2D uVelocity;
uniform sampler2D uPressure;
uniform sampler2D uDye;
uniform sampler2D uSource;       // input texture for post-process passes
uniform vec2 uResolution;        // canvas resolution in pixels
uniform vec2 uSimResolution;     // fluid sim resolution (1/4 of canvas)
uniform vec2 uTexelSize;         // 1.0 / resolution
uniform float uDt;               // delta time
uniform float uDissipation;      // fluid dissipation factor
uniform vec2 uSplatPoint;        // mouse position (normalized 0-1)
uniform vec3 uSplatColor;        // dye color to inject
uniform float uSplatRadius;      // splat radius
uniform float uDitherScale;      // dither pixel size multiplier
uniform float uTime;             // elapsed time for animated effects
```

### Varying Naming
```glsl
varying vec2 vUv;                // texture coordinates (0-1)
```

### Fullscreen Quad Vertex Shader
Every pass uses this same vertex shader. Do NOT create per-pass vertex shaders:
```glsl
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
```

## Fluid Simulation Details

### Resolution
- Run the sim at **1/4 canvas resolution** (e.g., 480x270 for a 1920x1080 canvas)
- This is set via `uSimResolution` and the sim FBO dimensions
- The dye/density output is upsampled when read by the dither pass via bilinear filtering

### Splat Injection
- On mouse down/drag, inject both **velocity** and **dye** at the cursor position
- Velocity direction = mouse movement delta, scaled by a strength factor
- Dye color = red palette tint (`vec3(0.8, 0.1, 0.05)` base, vary slightly for visual interest)
- Splat radius should be ~0.25% of screen width
- Use a Gaussian falloff in the splat shader, not a hard circle

### Pressure Solver
- Jacobi iteration, 20-30 iterations per frame
- More iterations = more accurate but more expensive
- Start with 20, increase if you see visual artifacts (fluid not looking incompressible)

### Dissipation
- Velocity dissipation: ~0.98 (slight drag, fluid slows over time)
- Dye dissipation: ~0.97 (dye fades, prevents screen from filling up solid)
- These are multiplied each frame, so 0.97 means 3% fade per frame

### Boundary Conditions
- Use **no-slip boundaries** at screen edges (velocity = 0)
- In the pressure solver, clamp texture reads at edges rather than wrapping

## Dither Shader Specifics

### Bayer Matrix
Use an 8x8 Bayer ordered dithering matrix. Encode as a constant array in the shader:
```glsl
// 8x8 Bayer matrix normalized to 0-1 range
float bayer8x8(vec2 pos) {
  int x = int(mod(pos.x, 8.0));
  int y = int(mod(pos.y, 8.0));
  // Full 8x8 matrix (row-major, values 0-63 normalized to 0.0-1.0)
  int index = x + y * 8;
  // Use integer lookup or encode as texture for performance
  // ... (full matrix values here during implementation)
  return float(value) / 64.0;
}
```

### Dither Application
```glsl
// Convert fluid density to brightness
float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));

// Scale pixel coords by dither scale (larger = bigger dither pixels = more retro)
vec2 ditherCoord = gl_FragCoord.xy / uDitherScale;

// Compare brightness against Bayer threshold
float threshold = bayer8x8(ditherCoord);
float dithered = step(threshold, brightness);

// Output as red-tinted monochrome
gl_FragColor = vec4(dithered * uRedColor, 1.0);
```

### Dither Scale
- `uDitherScale` controls the "pixel size" of the dither pattern
- Value of 1.0 = 1:1 with screen pixels (very fine)
- Value of 2.0-4.0 = chunkier, more retro CRT feel
- Start with 3.0 and adjust visually

## WebGL Utility Patterns

### Shader Compilation
```typescript
function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info}`);
  }
  return shader;
}
```
ALWAYS check compile status and throw with the info log. Silent failures waste hours.

### Program Linking
```typescript
function createProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram {
  const vert = createShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = createShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  const program = gl.createProgram()!;
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    throw new Error(`Program link error: ${info}`);
  }
  return program;
}
```

### Uniform Caching
Cache uniform locations at program creation time, not per frame:
```typescript
interface ShaderProgram {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation>;
}
```

## Common Pitfalls

1. **Texture coordinate flipping** — WebGL textures have origin at bottom-left, DOM/canvas has origin at top-left. When reading mouse position, flip Y: `y = 1.0 - (mouseY / canvasHeight)`
2. **Lost context** — Handle `webglcontextlost` and `webglcontextrestored` events. Re-create all resources on restore.
3. **Float texture support** — Not all devices support rendering to float textures. Check `EXT_color_buffer_float` and fall back to `HALF_FLOAT` or bail to static background on mobile.
4. **Resize handling** — On window resize, recreate ALL framebuffers at new dimensions. Do not try to reuse them.
5. **Memory leaks** — Delete textures, framebuffers, and programs in cleanup. Use a React `useEffect` return function for teardown.
6. **requestAnimationFrame** — Use a single rAF loop for the entire sim, not separate ones per pass. Store the frame ID and cancel on unmount.
7. **Viewport** — Call `gl.viewport(0, 0, width, height)` before EVERY pass if the pass renders to a different resolution FBO.