# Animation Conventions Skill

## When to Use
Apply this skill when creating or modifying any animation, transition, or motion effect. This includes the scramble text effect, CRT power transition, section blur transitions, hover effects, the boot sequence, screen flicker, or any use of Framer Motion. Also apply when adjusting timing values or easing curves.

## Project Context
All animations serve the CRT retro aesthetic. They should feel mechanical, slightly imperfect, and reminiscent of old hardware — not smooth and modern. Prefer stepped/snappy timing over fluid easing where it reinforces the retro feel.

## Animation Library
- **Framer Motion** — page transitions, blur effects, layout animations, mount/unmount
- **CSS transitions** — simple hover states, blur filter, opacity changes
- **CSS keyframes** — looping effects (flicker, noise)
- **requestAnimationFrame** — WebGL render loop only (fluid sim, shaders)
- **setInterval** — scramble text character cycling (deliberate stepped feel)

Do NOT mix animation approaches for the same effect. Pick one and commit.

## Global Timing Variables

All timing values are defined as CSS variables in `globals.css`. Reference these, do not hardcode durations in components:

```css
--scramble-duration: 1200ms;   /* Total time for scramble to resolve */
--blur-transition: 500ms;      /* Section blur in/out */
--power-off-total: 950ms;      /* CRT power-off full sequence */
--power-on-total: 1100ms;      /* CRT power-on full sequence */
--flicker-duration: 4s;        /* Screen flicker loop period */
```

When using these in TypeScript/Framer Motion, read them or mirror as constants:

```typescript
// config/animation.ts
export const ANIMATION = {
  scramble: {
    duration: 1200,           // ms — total scramble resolve time
    charInterval: 30,         // ms — how often characters re-randomize
    staggerMax: 400,          // ms — max random delay before a character locks in
    charset: ' !@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  },
  blur: {
    duration: 500,            // ms
    amount: '4px',            // CSS blur filter value
    easing: 'ease-out',
  },
  powerOff: {
    flash: 100,               // ms — brightness spike
    collapseVertical: 200,    // ms — screen to horizontal line
    collapseHorizontal: 150,  // ms — line to dot
    dotFade: 200,             // ms — dot + phosphor afterglow
    blackHold: 300,           // ms — black screen pause
  },
  powerOn: {
    blackHold: 300,           // ms — initial black
    dotAppear: 100,           // ms — center dot with glow
    expandHorizontal: 150,    // ms — dot to line
    expandVertical: 250,      // ms — line to full screen + flicker
    staticBurst: 100,         // ms — noise flash
    contentFade: 200,         // ms — content appears
  },
  boot: {
    lineDelay: 150,           // ms — delay between boot command lines
    typeSpeed: 20,            // ms — per character type speed
    holdAfterComplete: 1000,  // ms — pause after boot finishes before fading
  },
  titleCycle: {
    displayDuration: 2500,    // ms — how long each "Hello X" phrase shows
    scrambleResolve: 400,     // ms — scramble transition between phrases
  },
  hover: {
    glowTransition: 200,      // ms — hover glow ramp up
  },
} as const;
```

## Scramble Text Animation

### Behavior
- All characters start randomized simultaneously
- Each character cycles through random chars from the charset at `charInterval` speed
- Each character has an independent random "lock time" between 0 and `staggerMax`
- After a character's lock time passes, it stops randomizing and shows the final character
- The overall effect: all characters churning, then settling left-ish to right-ish (but not perfectly sequential)

### Implementation Pattern
```typescript
function useScrambleText({ text, duration, charInterval, staggerMax, charset }: ScrambleConfig) {
  // 1. On trigger, generate a random lock time for each character
  // 2. Start an interval that runs every charInterval ms
  // 3. Each tick: for each character, if elapsed < lockTime, show random char; else show final char
  // 4. When all characters locked, clear interval
  // 5. Return displayText string and isAnimating boolean
}
```

### Rules
- Scramble ONLY triggers once per scroll-in — do not retrigger on fast back-and-forth scrolling
- Use a ref to track whether the animation has played for the current "entrance"
- The scramble should work on any text length — scale lock times proportionally if text is very long
- Spaces in the target text should resolve immediately (don't scramble spaces)

## Section Blur Transition

### Behavior
- When a section scrolls out of majority view, apply `filter: blur(4px)` over 500ms
- When it scrolls back into majority view, remove blur over 500ms
- Use CSS transitions, NOT Framer Motion, for blur — CSS `filter` transitions are GPU-accelerated

### Implementation
```css
.section-content {
  transition: filter var(--blur-transition) ease-out;
}

.section-content.blurred {
  filter: blur(4px);
}
```

- Toggle the `.blurred` class based on the Intersection Observer state
- Do NOT animate blur with Framer Motion's `animate` prop — it forces repaints through JS

## CRT Power Transition

### Power-Off (leaving a page)
Implemented as a Framer Motion `animate` sequence on the screen content wrapper:

```typescript
const powerOffSequence = async (controls: AnimationControls) => {
  // Step 1: Flash
  await controls.start({ filter: 'brightness(2)', transition: { duration: 0.1 } });

  // Step 2: Vertical collapse to line
  await controls.start({
    scaleY: 0.002,
    transition: { duration: 0.2, ease: 'easeIn' }
  });

  // Step 3: Horizontal collapse to dot
  await controls.start({
    scaleX: 0.005,
    transition: { duration: 0.15 }
  });

  // Step 4: Fade dot with afterglow
  await controls.start({
    opacity: 0,
    transition: { duration: 0.2 }
  });

  // Step 5: Hold black (handled by parent, not animated)
};
```

### Power-On (entering a page)
Reverse of power-off with added flicker:

```typescript
const powerOnSequence = async (controls: AnimationControls) => {
  // Start from dot state
  controls.set({ scaleX: 0.005, scaleY: 0.002, opacity: 1 });

  // Step 1: Expand to line
  await controls.start({
    scaleX: 1,
    transition: { duration: 0.15 }
  });

  // Step 2: Expand to full + flicker
  await controls.start({
    scaleY: 1,
    transition: { duration: 0.25, ease: 'easeOut' }
  });

  // Step 3: Brief static burst (toggle noise overlay opacity)
  // Step 4: Content fades in
  await controls.start({
    filter: 'brightness(1)',
    transition: { duration: 0.2 }
  });
};
```

### Rules
- The power transition wraps the ENTIRE screen content, not individual elements
- The CRT bezel/frame stays static during the transition — only the screen content animates
- Use `transform: scale()` for the collapse, NOT `height/width` changes (scale is GPU-composited)
- The phosphor afterglow is a separate absolutely-positioned element that fades independently

## Boot Sequence Animation

### Behavior
- Lines appear one at a time with a typewriter effect (characters appear left to right)
- Each line has a `lineDelay` pause before it starts typing
- After all lines complete, hold for `holdAfterComplete` ms, then fade to lower opacity
- Plays ONCE on initial page load — track with a ref or sessionStorage

### Rules
- Use `setInterval` for the typewriter, not CSS animations (need per-character control)
- Clear the interval on unmount
- Lines are positioned top-left with fixed positioning, above the fluid sim but below the glossy reflection

## Easing Reference

| Effect | Easing | Why |
|--------|--------|-----|
| Blur in/out | `ease-out` | Quick start, gentle settle |
| Power-off collapse | `easeIn` | Accelerates, feels like suction |
| Power-on expand | `easeOut` | Decelerates, feels like stabilizing |
| Hover glow | `ease` | Smooth, not mechanical |
| Scramble char cycling | None (stepped via setInterval) | Deliberately stepped, digital feel |
| Noise shift | `steps(4)` | Jittery, non-smooth |
| Flicker | Linear within keyframes | Irregular opacity dips |

## Performance Rules

1. NEVER animate `filter: blur()` with JavaScript frame-by-frame — use CSS transitions
2. NEVER animate `width` or `height` — use `transform: scale()` instead
3. Use `will-change: transform` on elements that will be animated with scale (power transition)
4. Use `will-change: filter` on section wrappers that will blur
5. Remove `will-change` after animation completes to free GPU memory
6. The WebGL render loop (fluid sim) must be a SINGLE `requestAnimationFrame` callback — never multiple competing loops
7. All CSS animations should be pausable via `animation-play-state` for reduced motion support