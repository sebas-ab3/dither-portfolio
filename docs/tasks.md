# Build Tasks

## Phase 1 — Foundation & CRT Shell
- [x] Initialize Next.js 16 with TypeScript, Tailwind v4, App Router
- [x] Set up VT323 font via `next/font/google` with fallback stack
- [x] Set up color palette as CSS variables in globals.css
- [x] Configure Tailwind `@theme` to expose CRT CSS variables as utility classes
- [x] Build `CRTFrame` component — bezel, padding, outer shadows
- [x] Build `CRTScreen` component — rounded screen area, overflow hidden
- [x] Build scanline overlay (CSS repeating-linear-gradient, pointer-events none)
- [x] Build vignette overlay (CSS radial-gradient)
- [x] Build noise overlay (tiling texture + CSS steps animation)
- [x] Build `GlossyReflection` component — static arc layer
- [x] Add `useMouseParallax` hook for reactive gloss layer
- [x] Wire glossy reflection mouse reactivity
- [x] Create page routing: `/` (start page), `/home`, `/projects/[slug]` — `/` and `/home` exist as placeholders
- [x] Create `/projects/[slug]/page.tsx` placeholder
- [x] Wrap root layout in CRTFrame so all pages share the monitor shell
- [ ] Test CRT shell renders correctly at multiple viewport sizes
- [x] Add `prefers-reduced-motion` media query handling

## Phase 2 — Start Page Core
- [x] Build `BootSequence` component — typewriter terminal commands, top-left
- [x] Define boot sequence text content (LOADING SYSTEM, INITIALIZING DISPLAY, etc.)
- [x] Boot sequence plays once on initial load, then settles
- [x] Build `useScrambleText` hook — simultaneous character randomization
- [x] Build `ASCIITitle` component — large ASCII art text, centered
- [x] Implement title cycling: "Hello World" → "Hello User" → "Hello Seb" → "Hello Employer" → "Hello ___"
- [x] Wire scramble transitions between title phrases
- [x] Style "Enter" button with CRT aesthetic (red border, glow on hover)
- [x] "Enter" button navigates to `/home`
- [x] Add placeholder transition between start → home (before full CRT power effect)
- [ ] Test start page layout and animations

## Phase 3 — Fluid Simulation + Dither Shader
- [ ] Set up WebGL 2.0 context creation utility (`lib/webgl/createProgram.ts`)
- [ ] Build framebuffer management utilities (`lib/webgl/framebuffer.ts`)
- [ ] Build texture creation helpers (`lib/webgl/textures.ts`)
- [ ] Write shared fullscreen quad vertex shader (`vertex.glsl`)
- [ ] Implement splat shader — inject velocity + dye at mouse position
- [ ] Implement advection shader — move fluid along velocity field
- [ ] Implement divergence shader — compute velocity divergence
- [ ] Implement pressure shader — Jacobi iterative solver
- [ ] Implement gradient subtraction shader — make velocity divergence-free
- [ ] Build `FluidSimulation.tsx` — orchestrates sim loop, manages FBOs
- [ ] Add mouse/touch interaction — track drag delta, inject splats
- [ ] Verify fluid sim runs at 60fps at 1/4 resolution
- [ ] Write Bayer 8x8 ordered dithering fragment shader (`dither.glsl`)
- [ ] Build `DitherPostProcess.tsx` — chains dither pass after fluid output
- [ ] Tune dither scale (start at 3.0, adjust visually)
- [ ] Add CRT post-process pass (scanlines + noise in shader)
- [ ] Add barrel distortion as final shader pass
- [ ] Wire fluid sim + dither + CRT into Start Page background
- [ ] Ensure text/button layers are NOT affected by fluid sim
- [ ] Check `EXT_color_buffer_float` support, add fallback path
- [ ] Implement mobile detection → static dithered background fallback
- [ ] Performance profiling — GPU usage, frame timing
- [ ] Handle `webglcontextlost` and `webglcontextrestored` events
- [ ] Test on Chrome, Firefox, Safari, Edge

## Phase 4 — Home Page Sections
- [ ] Build `SectionWrapper` component with Intersection Observer (threshold 0.5)
- [ ] Wire scramble text trigger on section entering majority view
- [ ] Wire blur-out transition on section leaving majority view (Framer Motion)
- [ ] Ensure Contact section is exempt from scramble/blur
- [ ] Build `Navbar` component — fixed top, CRT styled
- [ ] Add "Exit" button (left) → navigates to start page
- [ ] Add section links (Hero, Skills, Projects, Education/Experience, Contact)
- [ ] Navbar section click scrolls to section + triggers scramble
- [ ] Build `HeroSection` — name, tagline, scramble-in animation
- [ ] Build `SkillsSection` — skill categories/tags, scramble-in
- [ ] Build `ProjectCard` component — title, video, description, tech tags
- [ ] Add looping video support (webm primary, mp4 fallback, muted, autoplay)
- [ ] Build `ProjectGrid` — layout of project cards
- [ ] Build `ProjectsSection` — section title + project grid
- [ ] Project card click navigates to `/projects/[slug]`
- [ ] Build `EducationSection` — timeline or card layout, scramble-in
- [ ] Build `ContactSection` — links, email, social (no scramble/blur)
- [ ] Populate `config/projects.ts` with placeholder project data
- [ ] Test scroll behavior across all sections
- [ ] Test navbar scroll + scramble trigger
- [ ] Verify blur transitions feel smooth (timing, easing)

## Phase 5 — Transitions & Polish
- [ ] Build `CRTPowerTransition` component
- [ ] Implement power-off sequence (flash → vertical collapse → dot → fade)
- [ ] Implement power-on sequence (dot → line → expand → flicker → content)
- [ ] Add phosphor afterglow on power-off dot
- [ ] Wire transition: Start Page "Enter" → power-off → Home Page power-on
- [ ] Wire transition: Home Page "Exit" → power-off → Start Page power-on
- [ ] Implement barrel distortion for Home Page (CSS approximation or WebGL)
- [ ] Build project detail page layout (`/projects/[slug]`)
- [ ] Project detail page reads from config by slug
- [ ] Project detail page shares CRT frame aesthetic
- [ ] Add back navigation from project detail to home (Projects section)
- [ ] Add video loading states / skeleton for project cards
- [ ] Responsive pass — mobile bezel, font sizes, section layouts
- [ ] Reduce motion pass — respect `prefers-reduced-motion` everywhere
- [ ] Performance audit — Lighthouse score, WebGL profiling
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

## Phase 6 — Content & Deployment
- [ ] Replace placeholder project data with real projects
- [ ] Record/prepare project preview videos (webm + mp4)
- [ ] Write real section copy (hero intro, skills, education/experience)
- [ ] Add real contact links / social URLs
- [ ] Fine-tune animation timings (scramble speed, blur duration, transition pacing)
- [ ] SEO: page titles, meta descriptions, Open Graph tags
- [ ] Add favicon (CRT-themed)
- [ ] Deploy to Vercel
- [ ] Configure custom domain (if applicable)
- [ ] Final cross-device QA
- [ ] Share and get feedback
