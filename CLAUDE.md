# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (flat config, eslint.config.mjs)
```

No test runner is configured yet.

## Architecture

This is a **Next.js 16 App Router** portfolio site with a retro CRT monitor aesthetic. It uses React 19, TypeScript (strict), and Tailwind CSS v4 (configured inline via `globals.css` with `@import "tailwindcss"` — no `tailwind.config.js`).

**Current state:** Early Phase 1. `app/layout.tsx`, `app/page.tsx`, and `app/home/page.tsx` exist as placeholders. `globals.css` has the full CRT color palette, overlay classes, and animations. No components, hooks, or lib directories exist yet.

### Planned directory structure (see `docs/architecture.md`)

```
app/
  page.tsx                    # Start page: fluid sim + ASCII hello
  home/page.tsx               # Home page: all portfolio sections
  projects/[slug]/page.tsx    # Dynamic project detail pages
components/
  crt/          # CRTFrame, CRTScreen, GlossyReflection + GLSL shaders
  fluid/        # FluidSimulation (WebGL Navier-Stokes), DitherPostProcess
  text/         # ScrambleText, ASCIITitle, BootSequence
  sections/     # SectionWrapper, Hero, Skills, Projects, Education, Contact
  projects/     # ProjectCard, ProjectGrid
  transitions/  # CRTPowerTransition
config/
  projects.ts   # Typed project data array
hooks/          # useFluidSim, useScrambleText, useSectionObserver, useMouseParallax, useCRTTransition
lib/
  webgl/        # createProgram, framebuffer, textures utilities
  ascii.ts      # ASCII art generation
types/
  project.ts    # Project interface
```

### Key design decisions

- **WebGL fluid sim** (Navier-Stokes on GPU at 1/4 resolution) with **Bayer 8x8 ordered dithering** post-process on the Start page. Mobile falls back to CSS-based static effects — no WebGL.
- **CRT effects** are GLSL shaders: barrel distortion, scanlines, vignette, static noise.
- **ScrambleText** animates all characters simultaneously through ASCII 33–126, each locking in at a random time within a ~1–1.5s window.
- **SectionWrapper** uses Intersection Observer (threshold 0.5) to trigger scramble-in for entering sections and blur-out for leaving sections. Contact section is exempt.
- **Page transitions** use a CRT power-off/power-on sequence (screen collapses to dot then expands) via `CRTPowerTransition`.
- **Font:** VT323 via `next/font/google`.
- **Color palette:** Defined as CSS variables in `globals.css` — use these exclusively. See `--crt-red-bright`, `--crt-red-medium`, `--crt-red-dim`, `--crt-red-muted`, `--crt-bg-base`, etc.
- **GLSL files** are imported as strings via `raw-loader` (configured in `next.config.ts`).
- **Project data** lives in `config/projects.ts` as a typed array; dynamic routes use the `slug` field.
- **Framer Motion** handles page transitions and blur animations.

### Path alias

`@/*` maps to the repo root (defined in `tsconfig.json`).

### Skills

Detailed implementation specs live in `.claude/skills/`:
- `crt-effects/SKILLS.md` — color palette rules, bezel/screen CSS, overlay specs, power transition timing, mobile behavq
aqaior
- `webgl-shaders/SKILLS.md` — render pipeline order, FBO patterns, GLSL conventions, fluid sim parameters, dither shader, common pitfalls
