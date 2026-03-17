# CRT Portfolio — Architecture & Build Plan

## Project Summary

A portfolio website with a retro CRT computer aesthetic featuring ASCII/dither visuals, a WebGL fluid simulation with dithering post-process shader, simultaneous scramble text animations, and a full CRT monitor frame with barrel distortion. Built with Next.js and deployed on Vercel.

---

## Design Specifications

### Visual Identity
- **Aesthetic:** Retro CRT monitor, ASCII/dither, terminal command-line
- **Background:** Dark/black (`#0a0a0a` base)
- **Text Colors (Red Phosphor Palette):**
  - Headings/emphasis: `#ff2020` (bright red) with `0 0 12px` glow
  - Body text: `#cc1a1a` (medium red)
  - Dim/secondary: `#801010` (muted red)
  - Subtle UI/borders: `#401010` (dark red)
- **Font:** VT323 (Google Fonts) — monospace, pixelated retro terminal feel
- **CRT Effects:** Scanlines, barrel distortion, vignette, static noise, phosphor glow

### CRT Monitor Frame
- Full visible bezel surrounding the viewport — dark gray/black plastic frame with subtle highlights
- Content renders inside the "screen" area with rounded corners
- Barrel distortion shader applied to all content within the screen
- Static glossy reflection overlay (soft white arc, top-left) + subtle parallax shift on mouse movement
- **Desktop:** Prominent bezel with visible frame edges
- **Mobile:** Simplified — subtle border, no barrel distortion, no fluid sim

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | **Next.js 14** (App Router) | Routing, SSR/SSG, structure |
| Language | **TypeScript** | Type safety, project config typing |
| Styling | **Tailwind CSS** + CSS modules for CRT effects | Utility classes + scoped shader overlays |
| Font | **VT323** via `next/font/google` | Retro terminal typography |
| Fluid Sim | **WebGL 2.0** (custom, based on Pavel Dobryakov's implementation) | Navier-Stokes fluid dynamics on GPU |
| Dither Shader | **GLSL fragment shader** (Bayer matrix ordered dithering) | Post-process CRT dither effect |
| CRT Effects | **GLSL fragment shaders** | Barrel distortion, scanlines, vignette, glow |
| Scroll Detection | **Intersection Observer API** | Section visibility tracking for scramble/blur triggers |
| Animations | **Framer Motion** | Page transitions, blur effects, UI animations |
| Media | **Looping video** (mp4/webm) | Project card previews |
| Data | **TypeScript config file** (`projects.ts`) | Dynamic project data |
| Deployment | **Vercel** | Hosting, CI/CD, edge functions |

---

## Site Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout — CRT frame wrapper, fonts
│   ├── page.tsx                # Start Page (fluid sim + ASCII hello)
│   ├── home/
│   │   └── page.tsx            # Home Page (all sections)
│   └── projects/
│       └── [slug]/
│           └── page.tsx        # Individual project detail page
│
├── components/
│   ├── crt/
│   │   ├── CRTFrame.tsx        # Bezel frame + glossy overlay + barrel distortion wrapper
│   │   ├── CRTScreen.tsx       # Inner screen area with scanlines + vignette
│   │   ├── GlossyReflection.tsx # Static arc + mouse-reactive parallax reflection
│   │   └── shaders/
│   │       ├── barrel.glsl     # Barrel distortion fragment shader
│   │       ├── scanlines.glsl  # Scanline overlay
│   │       └── vignette.glsl   # Edge darkening
│   │
│   ├── fluid/
│   │   ├── FluidSimulation.tsx # WebGL Navier-Stokes fluid sim canvas
│   │   ├── DitherPostProcess.tsx # Bayer dithering shader applied to fluid output
│   │   └── shaders/
│   │       ├── advection.glsl
│   │       ├── divergence.glsl
│   │       ├── pressure.glsl
│   │       ├── gradient.glsl
│   │       ├── splat.glsl      # Mouse interaction injection
│   │       └── dither.glsl     # Ordered dithering post-process
│   │
│   ├── text/
│   │   ├── ScrambleText.tsx    # Simultaneous character scramble animation
│   │   ├── ASCIITitle.tsx      # Large ASCII art text (Hello World/User/Seb/etc.)
│   │   └── BootSequence.tsx    # Terminal bootup command flicker
│   │
│   ├── sections/
│   │   ├── SectionWrapper.tsx  # Scroll-triggered scramble + blur logic
│   │   ├── HeroSection.tsx
│   │   ├── SkillsSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── EducationSection.tsx
│   │   └── ContactSection.tsx  # No scramble/blur
│   │
│   ├── projects/
│   │   ├── ProjectCard.tsx     # Card: title, video, description, tech tags
│   │   └── ProjectGrid.tsx     # Grid/layout of project cards
│   │
│   ├── nav/
│   │   └── Navbar.tsx          # Top nav: Exit button + section links
│   │
│   └── transitions/
│       └── CRTPowerTransition.tsx # Power on/off effect between pages
│
├── config/
│   └── projects.ts             # Project data (typed config)
│
├── hooks/
│   ├── useFluidSim.ts          # WebGL fluid simulation hook
│   ├── useScrambleText.ts      # Text scramble animation hook
│   ├── useSectionObserver.ts   # Intersection Observer for scroll detection
│   ├── useMouseParallax.ts     # Mouse position tracking for glossy reflection
│   └── useCRTTransition.ts     # Power on/off transition state
│
├── lib/
│   ├── webgl/
│   │   ├── createProgram.ts    # WebGL shader compilation utilities
│   │   ├── framebuffer.ts      # FBO management for multi-pass rendering
│   │   └── textures.ts         # Texture creation helpers
│   └── ascii.ts                # ASCII art text generation utilities
│
├── types/
│   └── project.ts              # Project interface definition
│
└── styles/
    ├── globals.css              # Base styles, CRT CSS variables
    └── crt.module.css           # Scoped CRT overlay effects (scanlines, noise)
```

---

## Page Breakdown

### 1. Start Page (`/`)

**Layout:**
- Full CRT frame wrapping the viewport
- Fluid simulation canvas filling the entire screen background
- Dither post-process shader applied to fluid output
- Content layered on top (not affected by fluid):
  - Boot sequence text (top-left corner, plays once on initial load)
  - Large ASCII art text (centered, cycles: "Hello World" → "Hello User" → "Hello Seb" → "Hello Employer" → "Hello ___")
  - "Enter" button below ASCII text

**Fluid Simulation Details:**
- WebGL 2.0 Navier-Stokes solver running at 1/4 resolution for performance
- Mouse/touch interaction: click + drag injects velocity and dye into the simulation
- Color: red-tinted dye matching the site palette
- Dither post-process: Bayer 8x8 ordered dithering applied as a fragment shader pass
- Additional CRT passes: scanlines, noise, subtle barrel distortion
- **Mobile fallback:** Static dithered background image or CSS-based noise pattern (no WebGL fluid)

**Boot Sequence:**
- Flickers through terminal-style boot commands (e.g., `> LOADING SYSTEM...`, `> INITIALIZING DISPLAY...`, `> CHECKING MEMORY... OK`, `> READY_`)
- Plays once on first visit, then settles
- Monospaced VT323 text, dim red, top-left aligned

**ASCII Title Cycling:**
- Large ASCII art rendered with a library or pre-built text blocks
- Cycles with a brief scramble transition between each phrase
- Timing: ~2.5s per phrase, scramble resolves in ~0.4s

### 2. Home Page (`/home`)

**Transition In:**
- CRT power-off effect on Start Page (screen shrinks to horizontal line, then dot, then black)
- Brief black pause (~300ms)
- CRT power-on effect on Home Page (dot expands to line, line expands to full screen with slight flicker)

**Navbar (fixed top):**
- Left: "Exit" button → navigates back to Start Page (triggers power-off/on transition)
- Center/Right: Section links — Hero, Skills, Projects, Education, Contact
- Clicking a section link scrolls to that section and triggers its scramble animation

**Scroll Behavior:**
- Each section fills at least 100vh
- Intersection Observer tracks which section occupies >50% of viewport
- When a new section enters majority view:
  1. That section's text runs the simultaneous scramble animation (~1–1.5s)
  2. The previous section blurs out with a CSS `filter: blur()` transition (~0.5s)
- Contact section is exempt — renders normally, no scramble, no blur applied to it

**Section: Hero**
- Large name/title with scramble-in animation
- Brief tagline or intro statement
- Subtle animated element (could reuse a small dithered graphic or ASCII art)

**Section: Skills**
- Skill categories with scramble-in text
- Could be organized as columns or a grid of skill tags
- All text scrambles in when section becomes active

**Section: Projects**
- Section title scrambles in
- Grid of `ProjectCard` components
- Each card contains:
  - Project title (top)
  - Looping video preview in a "window" frame (mp4/webm, muted, autoplay)
  - Brief description text
  - Horizontal list of tech/tool tags
- Clicking a card → navigates to `/projects/[slug]`

**Section: Education/Experience**
- Timeline or card-based layout
- Scramble-in animation on scroll

**Section: Contact**
- No scramble/blur effect
- Contact links, email, social links
- Potentially a simple form or just direct links

### 3. Project Detail Page (`/projects/[slug]`)

- Loaded from TypeScript config based on URL slug
- Detailed project info: full description, multiple images/videos, tech stack, links
- Navigation back to Home Page (Projects section)
- Shares the CRT frame aesthetic
- To be designed in detail after core pages are built

---

## Key Component Specifications

### FluidSimulation + DitherPostProcess

**Render Pipeline:**
```
Mouse Input → Splat (inject velocity/dye)
    → Advection → Divergence → Pressure Solve → Gradient Subtract
    → Fluid Density Texture (smooth)
    → PASS 1: Dither Fragment Shader (Bayer 8x8 ordered dithering)
    → PASS 2: CRT Effects (scanlines + noise + barrel distortion)
    → Final Output to Canvas
```

**Performance Targets:**
- Fluid sim resolution: 1/4 of screen resolution (e.g., 480x270 for 1920x1080)
- Target: 60fps on mid-range GPU
- Pressure solver iterations: 20-30
- All passes run on GPU via WebGL fragment shaders

**Dither Shader Approach:**
```glsl
// Simplified concept — Bayer 8x8 ordered dithering
uniform sampler2D uFluidTexture;
uniform float uDitherScale;

const int bayer8[64] = int[]( /* 8x8 Bayer matrix values */ );

void main() {
    vec4 color = texture(uFluidTexture, vUv);
    float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    int x = int(mod(gl_FragCoord.x / uDitherScale, 8.0));
    int y = int(mod(gl_FragCoord.y / uDitherScale, 8.0));
    float threshold = float(bayer8[y * 8 + x]) / 64.0;
    float dithered = step(threshold, brightness);
    gl_FragColor = vec4(vec3(dithered) * uRedTint, 1.0);
}
```

### ScrambleText

**Behavior:**
- Receives target text string
- On trigger: all characters simultaneously randomize through ASCII set (chars 33–126)
- Over ~1–1.5 seconds, characters probabilistically "lock in" to their final value
- Each character has an independent random lock time within the animation window
- Configurable: duration, character set, stagger randomness

**Hook API:**
```typescript
const { displayText, trigger, isAnimating } = useScrambleText({
  targetText: "Projects",
  duration: 1200,       // ms
  charset: "ASCII",     // or custom character set
  staggerMax: 400,      // ms random offset per character
});
```

### SectionWrapper

**Props:**
```typescript
interface SectionWrapperProps {
  id: string;                    // Section identifier for navbar
  children: React.ReactNode;
  enableScramble?: boolean;      // Default true, false for Contact
  enableBlur?: boolean;          // Default true, false for Contact
}
```

**Behavior:**
- Uses Intersection Observer (threshold: 0.5)
- When section enters majority view → triggers scramble on children
- When section leaves majority view → applies blur filter
- Manages animation state to avoid re-triggering on fast scrolls

### ProjectCard

**Props (from config):**
```typescript
interface Project {
  slug: string;
  title: string;
  description: string;
  videoSrc: string;          // path to mp4/webm loop
  videoPoster?: string;      // fallback image
  tags: string[];            // ["React", "WebGL", "Three.js"]
  featured?: boolean;
}
```

### CRTPowerTransition

**Power-Off Sequence (exiting a page):**
1. Screen content brightness rapidly increases (white flash, ~100ms)
2. Screen collapses vertically to a horizontal line (height → 2px, ~200ms, ease-in)
3. Horizontal line collapses to a center dot (~150ms)
4. Dot fades with phosphor afterglow (~200ms)
5. Black screen (~300ms pause)

**Power-On Sequence (entering a page):**
1. Black screen
2. Center dot appears with glow (~100ms)
3. Dot expands to horizontal line (~150ms)
4. Line expands to full screen with flicker (~250ms, ease-out)
5. Brief static/noise burst (~100ms)
6. Content fades in (~200ms)

---

## Project Data Config

```typescript
// src/config/projects.ts

import { Project } from '@/types/project';

export const projects: Project[] = [
  {
    slug: "project-name",
    title: "Project Name",
    description: "Brief description of the project shown on the card.",
    videoSrc: "/videos/project-name-preview.webm",
    videoPoster: "/images/project-name-poster.jpg",
    tags: ["React", "TypeScript", "WebGL"],
    featured: true,
  },
  // Add more projects here...
];
```

---

## Phased Build Plan

### Phase 1 — Foundation & CRT Shell (Week 1–2)
**Goal:** Next.js project scaffold with CRT frame rendering correctly

1. Initialize Next.js 14 project with TypeScript, Tailwind, App Router
2. Set up VT323 font via `next/font/google`
3. Build `CRTFrame` component — bezel, rounded screen area, CSS structure
4. Build `CRTScreen` component — scanline overlay, vignette (CSS-based first)
5. Build `GlossyReflection` — static arc overlay + `useMouseParallax` hook
6. Set up color palette as CSS variables / Tailwind theme
7. Create basic page routing: `/`, `/home`, `/projects/[slug]`

### Phase 2 — Start Page Core (Week 2–3)
**Goal:** Start page with boot sequence, ASCII title, and Enter button (no fluid sim yet)

1. Build `BootSequence` component — typewriter-style terminal commands
2. Build `ASCIITitle` component — large ASCII text with cycling phrases
3. Build `ScrambleText` hook + component for title transitions
4. Style the "Enter" button with CRT aesthetic
5. Implement basic page transition (placeholder before full CRT power effect)

### Phase 3 — Fluid Simulation + Dither (Week 3–5)
**Goal:** WebGL fluid sim running with dither post-process on Start Page

1. Set up WebGL 2.0 context and shader compilation utilities
2. Implement Navier-Stokes solver (advection, divergence, pressure, gradient)
3. Implement mouse interaction (splat injection)
4. Build Bayer dithering fragment shader
5. Chain render passes: fluid → dither → output
6. Add CRT shader passes (scanlines, barrel distortion, noise)
7. Performance tuning — resolution scaling, iteration count
8. Mobile detection → fall back to static dithered background

### Phase 4 — Home Page Sections (Week 5–7)
**Goal:** All 5 sections with scroll-triggered scramble + blur

1. Build `SectionWrapper` with Intersection Observer logic
2. Build `Navbar` with Exit button + section scroll links
3. Build `HeroSection` layout and content
4. Build `SkillsSection` layout and content
5. Build `ProjectsSection` with `ProjectCard` grid
6. Build `EducationSection` layout
7. Build `ContactSection` (no scramble/blur)
8. Implement section blur transitions via Framer Motion
9. Wire navbar links to scroll + trigger scramble

### Phase 5 — Transitions & Polish (Week 7–8)
**Goal:** CRT power transition, barrel distortion shader, final polish

1. Build `CRTPowerTransition` — power-off and power-on sequences
2. Wire transition between Start Page ↔ Home Page
3. Implement barrel distortion as WebGL shader on CRT screen content
4. Add project detail page (`/projects/[slug]`) basic layout
5. Add video loading states for project cards
6. Responsive adjustments — mobile bezel, font sizes, section layouts
7. Performance audit — Lighthouse, WebGL profiling
8. Cross-browser testing (Chrome, Firefox, Safari, Edge)

### Phase 6 — Content & Deployment (Week 8–9)
**Goal:** Real content, final QA, deploy to Vercel

1. Add real project data to `projects.ts`
2. Record/prepare project preview videos (webm + mp4 fallback)
3. Write section copy (hero intro, skills list, education/experience)
4. Fine-tune animation timings (scramble speed, blur duration, transition pacing)
5. SEO: meta tags, Open Graph, structured data
6. Deploy to Vercel, configure custom domain
7. Final cross-device QA

---

## Performance Considerations

- **Fluid sim at 1/4 resolution** — run physics at 480x270 even on 4K displays
- **Offscreen canvas** — run fluid sim on a separate canvas, composite into main view
- **requestAnimationFrame** — all animations synced to frame rate
- **Intersection Observer** — passive scroll detection, no scroll event listeners
- **Video lazy loading** — project card videos only load when section is near viewport
- **Font optimization** — VT323 subset via `next/font` with `display: swap`
- **Mobile detection** — skip WebGL entirely on mobile, use CSS-based CRT effects only
- **Shader precision** — use `mediump` float where possible for mobile GPU compat

---

## Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "framer-motion": "^11.x",
    "clsx": "^2.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "@types/react": "^18.x",
    "raw-loader": "^4.x"       // for importing .glsl files
  }
}
```

Minimal dependency footprint — the fluid sim, dithering, and CRT effects are all custom WebGL/GLSL, no heavy 3D libraries needed.

---

## Open Questions / Future Considerations

1. **ASCII art generation** — pre-built text blocks vs. runtime generation with figlet.js?
2. **Project detail page design** — same CRT frame? Full-page layout or modal?
3. **Sound effects?** — CRT hum, keyboard clicks, static burst on transitions (opt-in)
4. **Dark mode toggle?** — probably not needed given the aesthetic, but green phosphor variant?
5. **Analytics** — Vercel Analytics or a lightweight alternative?
6. **Accessibility** — `prefers-reduced-motion` media query to disable animations for users who need it
