# CRT Effects Skill

## When to Use
Apply this skill when working on ANY file in `components/crt/`, any component that applies CRT visual effects (scanlines, barrel distortion, vignette, glow, noise), the `GlossyReflection` component, the `CRTFrame` or `CRTScreen` components, or any CSS/styles related to the CRT monitor aesthetic. Also apply when choosing colors, since the entire site uses the red phosphor palette defined here.

## Project Context
The entire site is wrapped in a CRT monitor frame — a visible dark bezel with rounded screen area. All content renders inside this "screen" and is affected by CRT visual effects. The aesthetic goal is: a real retro computer monitor displaying a terminal interface with red phosphor text.

## Color Palette — Red Phosphor CRT

IMPORTANT: These are the ONLY colors used on this site. Do not introduce other hues.

```css
:root {
  /* Backgrounds */
  --crt-bg-deep:        #050505;   /* Deepest black, bezel shadow areas */
  --crt-bg-base:        #0a0a0a;   /* Main screen background */
  --crt-bg-subtle:      #111111;   /* Slightly lifted background for cards/surfaces */

  /* Red phosphor text hierarchy */
  --crt-red-bright:     #ff2020;   /* Headings, emphasis, active nav items */
  --crt-red-medium:     #cc1a1a;   /* Body text, primary content */
  --crt-red-dim:        #801010;   /* Secondary text, descriptions, inactive items */
  --crt-red-muted:      #401010;   /* Borders, dividers, subtle UI elements */
  --crt-red-ghost:      #200808;   /* Barely visible, hover states on dark surfaces */

  /* Glow effects */
  --crt-glow-heading:   0 0 12px rgba(255, 32, 32, 0.6);   /* Bright heading glow */
  --crt-glow-text:      0 0 6px rgba(204, 26, 26, 0.3);    /* Subtle body text glow */
  --crt-glow-strong:    0 0 20px rgba(255, 32, 32, 0.8);    /* Emphasis, hover, ASCII art */

  /* Bezel */
  --bezel-dark:         #1a1a1a;   /* Main bezel surface */
  --bezel-edge:         #2a2a2a;   /* Bezel edge highlight */
  --bezel-shadow:       #000000;   /* Outer bezel shadow */

  /* Screen overlay */
  --scanline-opacity:   0.08;      /* Scanline darkness */
  --vignette-strength:  0.4;       /* Edge darkening intensity */
  --noise-opacity:      0.03;      /* Static noise overlay */
}
```

### Color Usage Rules
- NEVER use white text. The brightest element on screen is `--crt-red-bright` with a glow.
- The glossy reflection overlay is the ONLY element that uses a white/light tone, and it's very low opacity (~0.06-0.12).
- Visited links, focus states, and selection highlights all use reds from the palette.
- Error states use `--crt-red-bright` with `--crt-glow-strong` (brighter than normal, not a different color).
- The "Enter" button and navbar items glow brighter on hover using `--crt-glow-strong`.

## Typography

- **Font:** VT323 (Google Fonts), loaded via `next/font/google`
- **Fallback stack:** `'VT323', 'Courier New', monospace`
- **Base size:** 18px body text
- **Scale:** Headings at 2x–4x base depending on hierarchy
- **Letter spacing:** `0.05em` on body, `0.08em` on headings for terminal feel
- **Line height:** 1.6 for body, 1.2 for headings
- **ALL text gets a subtle text-shadow glow:**
```css
.crt-text {
  font-family: var(--font-vt323);
  color: var(--crt-red-medium);
  text-shadow: var(--crt-glow-text);
}

.crt-heading {
  color: var(--crt-red-bright);
  text-shadow: var(--crt-glow-heading);
  letter-spacing: 0.08em;
}
```

## CRT Frame Component — `CRTFrame.tsx`

### Structure
```
┌─────────────────────────────────────────────┐
│  Bezel (dark plastic frame)                 │
│  ┌───────────────────────────────────────┐  │
│  │  Screen area (rounded corners)        │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  Content (children)             │  │  │
│  │  │                                 │  │  │
│  │  │                                 │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │  [Scanline overlay - CSS]             │  │
│  │  [Vignette overlay - CSS]             │  │
│  │  [Noise overlay - CSS animated]       │  │
│  │  [Glossy reflection - positioned]     │  │
│  └───────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### Bezel Specifications
- Outer bezel: ~40px on desktop (all sides), with rounded corners `border-radius: 20px`
- Bezel surface: `--bezel-dark` with a subtle inner shadow and `--bezel-edge` highlight on top edge
- Screen inset: additional ~8px dark border between bezel and screen content, `border-radius: 12px`
- The screen area has `overflow: hidden` to clip content to the rounded shape
- **Mobile:** Bezel shrinks to ~12px, `border-radius: 8px`

### Bezel CSS Pattern
```css
.crt-bezel {
  background: var(--bezel-dark);
  border-radius: 20px;
  padding: 40px;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.05),  /* Top edge highlight */
    inset 0 -2px 4px rgba(0, 0, 0, 0.8),         /* Bottom shadow */
    0 0 60px rgba(0, 0, 0, 0.9),                  /* Outer shadow */
    0 0 120px rgba(0, 0, 0, 0.6);                 /* Ambient shadow */
}

.crt-screen {
  background: var(--crt-bg-base);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}
```

## Scanline Overlay

CSS-based, layered on top of screen content with `pointer-events: none`.

```css
.crt-scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, var(--scanline-opacity)) 2px,
    rgba(0, 0, 0, var(--scanline-opacity)) 4px
  );
}
```

- Line thickness: 2px transparent + 2px dark = 4px repeat
- Opacity: `--scanline-opacity` (0.08) — visible but not distracting
- MUST have `pointer-events: none` so it doesn't block clicks
- z-index above content but below glossy reflection

## Vignette Overlay

Darkens edges of the screen to simulate CRT tube light falloff.

```css
.crt-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 11;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(0, 0, 0, var(--vignette-strength)) 100%
  );
}
```

- Strength: 0.4 — noticeable darkening at corners and edges
- Ellipse shape to account for non-square screens
- z-index above scanlines

## Static Noise Overlay

Animated grain/static for the CRT feel. Use CSS animation with a tiling noise texture or generated via a small canvas.

```css
.crt-noise {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 9;
  opacity: var(--noise-opacity);
  background-image: url('/textures/noise.png'); /* 128x128 tiling noise */
  background-repeat: repeat;
  animation: noiseShift 0.1s steps(4) infinite;
}

@keyframes noiseShift {
  0%   { background-position: 0 0; }
  25%  { background-position: -32px -32px; }
  50%  { background-position: 16px -48px; }
  75%  { background-position: -48px 16px; }
  100% { background-position: 0 0; }
}
```

- Very low opacity (0.03) — barely perceptible, adds texture
- Steps animation for jittery, non-smooth movement
- Alternatively, generate noise on a small canvas and use as CSS background

## Glossy Reflection — `GlossyReflection.tsx`

### Static Base Layer
A fixed white gradient arc across the top-left area of the screen, simulating light reflecting off curved glass.

```css
.crt-gloss-static {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 20; /* Above all other overlays */
  background: radial-gradient(
    ellipse at 30% 20%,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.03) 30%,
    transparent 60%
  );
  border-radius: inherit;
}
```

### Mouse-Reactive Layer
A second, subtler reflection that shifts position based on mouse movement. Uses the `useMouseParallax` hook.

```typescript
// useMouseParallax hook returns normalized offset
// Mouse at center = (0, 0), top-left = (-1, -1), bottom-right = (1, 1)
const { offsetX, offsetY } = useMouseParallax({ sensitivity: 0.03 });
```

```css
/* Applied via inline style with transform */
.crt-gloss-reactive {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 21;
  background: radial-gradient(
    ellipse at 35% 25%,
    rgba(255, 255, 255, 0.06) 0%,
    transparent 50%
  );
  /* Transform applied via JS based on mouse position */
  /* translate shifts by ~20-30px max in any direction */
  transition: transform 0.15s ease-out;
}
```

- Sensitivity: 0.03 — subtle movement, not dramatic
- Max translation: ~30px in any direction
- Smooth transition (150ms ease-out) so it doesn't feel jittery
- The reactive layer is LESS opaque than the static layer

## Barrel Distortion

Simulates the curved glass of a CRT tube. Applied as a GLSL shader or CSS approximation.

### GLSL Approach (preferred for Start Page where WebGL is already active)
```glsl
uniform sampler2D uSource;
uniform vec2 uResolution;
uniform float uDistortion;    // 0.0 = none, 0.15 = subtle, 0.3 = strong

varying vec2 vUv;

void main() {
  vec2 centered = vUv - 0.5;
  float dist = dot(centered, centered);
  vec2 distorted = vUv + centered * dist * uDistortion;

  // Darken pixels outside the distorted bounds (corners)
  if (distorted.x < 0.0 || distorted.x > 1.0 || distorted.y < 0.0 || distorted.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  gl_FragColor = texture2D(uSource, distorted);
}
```

- `uDistortion` value: 0.12–0.18 for a noticeable but not extreme curve
- Applied as the LAST shader pass (after dither and CRT effects)
- Corners get clipped to black, which reinforces the rounded screen shape

### CSS Approximation (for Home Page where WebGL may not be active)
```css
.crt-barrel-css {
  /* Not a true barrel distortion but sells the effect */
  border-radius: 12px;
  /* Slight perspective tilt for a subtle curvature illusion */
  transform: perspective(1200px) rotateX(0.3deg);
  /* Inner shadow to fake edge darkening from curvature */
  box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.3);
}
```
This is a compromise — it won't warp content but visually suggests curvature. Use the GLSL version anywhere WebGL is already running.

## CRT Power Transition — `CRTPowerTransition.tsx`

### Power-Off Sequence (leaving a page)
```
Frame 0-100ms:    Brightness flash (screen goes slightly white/bright)
Frame 100-300ms:  Vertical collapse (height shrinks to ~2px horizontal line)
Frame 300-450ms:  Horizontal collapse (line shrinks to center dot)
Frame 450-650ms:  Dot fades with phosphor afterglow (dot shrinks + glow lingers)
Frame 650-950ms:  Black screen hold
```

### Power-On Sequence (entering a page)
```
Frame 0-300ms:    Black screen hold
Frame 300-400ms:  Center dot appears with glow bloom
Frame 400-550ms:  Dot expands to horizontal line
Frame 550-800ms:  Line expands to full screen with 1-2 flickers
Frame 800-900ms:  Brief static/noise burst
Frame 900-1100ms: Content fades in
```

### Implementation Approach
Use Framer Motion with `animate` sequences. The collapse/expand is a CSS clip-path or scale transform on the screen content container.

```typescript
// Power-off animation variants
const powerOff = {
  flash: { filter: 'brightness(2)', transition: { duration: 0.1 } },
  collapse: {
    clipPath: 'inset(49.5% 0% 49.5% 0%)',  // Horizontal line
    transition: { duration: 0.2, ease: 'easeIn' }
  },
  dot: {
    clipPath: 'inset(49.5% 49.5% 49.5% 49.5%)',  // Center dot
    transition: { duration: 0.15 }
  },
  off: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};
```

### Phosphor Afterglow
After the dot shrinks, render a small radial gradient glow at center that fades over ~200ms. This mimics the phosphor persistence of a real CRT.
```css
.phosphor-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, var(--crt-red-bright) 0%, transparent 70%);
  opacity: 0;
  /* Animated in JS during power-off */
}
```

## Screen Flicker Effect

Used during boot sequence and ASCII title transitions on the Start Page.

```css
@keyframes screenFlicker {
  0%    { opacity: 1; }
  3%    { opacity: 0.85; }
  6%    { opacity: 1; }
  45%   { opacity: 1; }
  48%   { opacity: 0.9; }
  50%   { opacity: 1; }
  92%   { opacity: 1; }
  95%   { opacity: 0.88; }
  100%  { opacity: 1; }
}

.crt-flicker {
  animation: screenFlicker 4s infinite;
}
```

- Subtle — most of the time it's at full opacity
- Random-feeling dips that are actually on a loop
- Apply to the screen container, not individual elements
- Can be disabled with `prefers-reduced-motion` media query

## Accessibility

IMPORTANT: Always respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  .crt-scanlines { display: none; }
  .crt-noise { animation: none; }
  .crt-flicker { animation: none; }
  /* Keep vignette and glossy — they're static */
  /* Skip barrel distortion animation */
  /* Skip power on/off transition — use instant cut */
}
```

## Mobile Behavior
- Bezel: 12px padding, `border-radius: 8px`
- Scanlines: Hidden (too fine for small screens)
- Barrel distortion: Disabled
- Noise: Disabled
- Vignette: Reduced strength (0.2)
- Glossy reflection: Static only, no mouse reactivity (no hover on touch)
- Power transition: Simplified — quick fade instead of full collapse sequence
- Flicker: Disabled