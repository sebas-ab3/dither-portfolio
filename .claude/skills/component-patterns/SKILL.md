# Component Patterns Skill

## When to Use
Apply this skill when creating any new React component, custom hook, or utility function. This defines the standard patterns for how all code in this project should be structured.

## Project Context
This is a Next.js 14 App Router project using TypeScript and Tailwind CSS. Components are client-side heavy due to WebGL, animations, and scroll interactions. Server components are used only where no interactivity is needed.

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `CRTFrame.tsx`, `ProjectCard.tsx` |
| Hooks | camelCase with `use` prefix | `useScrambleText.ts`, `useMouseParallax.ts` |
| Utilities | camelCase | `createProgram.ts`, `framebuffer.ts` |
| Config files | camelCase | `projects.ts`, `sections.ts`, `animation.ts` |
| Types | camelCase | `project.ts` |
| GLSL shaders | lowercase kebab or single word | `advection.glsl`, `dither.glsl`, `barrel.glsl` |
| CSS modules | PascalCase matching component | `CRTScreen.module.css` |

## Component Structure

Every component follows this order:

```typescript
// 1. 'use client' directive (if needed — any component with hooks, event handlers, or browser APIs)
'use client';

// 2. External imports
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// 3. Internal imports — components
import { ScrambleText } from '@/components/text/ScrambleText';

// 4. Internal imports — hooks
import { useScrambleText } from '@/hooks/useScrambleText';

// 5. Internal imports — types, config, utils
import { Project } from '@/types/project';
import { ANIMATION } from '@/config/animation';

// 6. Types/interfaces for this component (exported if reused, otherwise not)
interface ProjectCardProps {
  project: Project;
  className?: string;
}

// 7. Component definition (named export, not default — except page.tsx files)
export function ProjectCard({ project, className }: ProjectCardProps) {
  // 8. Hooks (state, refs, custom hooks) — all at the top
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 9. Effects
  useEffect(() => {
    // Setup logic
    return () => {
      // Cleanup — ALWAYS clean up event listeners, intervals, animation frames, WebGL resources
    };
  }, []);

  // 10. Event handlers and helper functions
  const handleClick = () => {
    // ...
  };

  // 11. JSX return
  return (
    <div className={className}>
      {/* Component markup */}
    </div>
  );
}
```

## Export Rules

- **Components:** Named exports (`export function ComponentName`)
- **Page files (`page.tsx`):** Default exports (`export default function PageName`) — Next.js requires this
- **Layout files (`layout.tsx`):** Default exports — Next.js requires this
- **Hooks:** Named exports (`export function useHookName`)
- **Types:** Named exports (`export interface TypeName`)
- **Config:** Named exports (`export const configName`)

NEVER use `export default` except where Next.js App Router requires it (page.tsx, layout.tsx, loading.tsx, error.tsx).

## Hook Structure

```typescript
// hooks/useExampleHook.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseExampleOptions {
  // Config options with sensible defaults
  duration?: number;
  enabled?: boolean;
}

interface UseExampleReturn {
  // Clearly typed return value
  value: string;
  isActive: boolean;
  trigger: () => void;
  reset: () => void;
}

export function useExample(options: UseExampleOptions = {}): UseExampleReturn {
  const { duration = 1000, enabled = true } = options;

  // State and refs
  const [value, setValue] = useState('');
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup pattern — ALWAYS clear intervals, timeouts, and rAF
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Stable callbacks with useCallback
  const trigger = useCallback(() => {
    if (!enabled) return;
    setIsActive(true);
    // ...
  }, [enabled]);

  const reset = useCallback(() => {
    setIsActive(false);
    setValue('');
  }, []);

  return { value, isActive, trigger, reset };
}
```

## Styling Approach

### When to use what:
- **Tailwind utility classes:** Default for all layout, spacing, typography, responsive design
- **CSS variables (from globals.css):** All CRT colors and timing values — reference with `var(--crt-red-bright)` in Tailwind's arbitrary value syntax: `text-[var(--crt-red-bright)]`
- **CSS modules:** Only for CRT overlay effects that need complex selectors or keyframe animations that Tailwind can't express (scanlines, noise, flicker)
- **Inline styles:** Only for dynamic values computed in JS (mouse parallax position, WebGL canvas sizing)

### Tailwind + CSS Variable Pattern
```tsx
// Use Tailwind arbitrary values to reference CSS variables
<h2 className="text-4xl text-[var(--crt-red-bright)] tracking-wider"
    style={{ textShadow: 'var(--crt-glow-heading)' }}>
  Section Title
</h2>

// For text-shadow (not natively supported in Tailwind), use inline style
// For everything else, prefer Tailwind classes
```

### Do NOT:
- Create separate `.css` files per component (except CSS modules for complex animations)
- Use styled-components, Emotion, or any CSS-in-JS library
- Use Tailwind `@apply` extensively — it defeats the purpose of utility classes
- Hardcode color hex values in components — always reference CSS variables

## Client vs Server Components

### Must be `'use client'`:
- Any component using `useState`, `useEffect`, `useRef`, or any hook
- Any component with event handlers (`onClick`, `onMouseMove`, etc.)
- Any component using Framer Motion
- Any component that accesses browser APIs (`window`, `document`, `IntersectionObserver`)
- All WebGL/canvas components
- The `CRTFrame`, `GlossyReflection`, and any animation components

### Can be server components (no `'use client'`):
- `app/layout.tsx` (root layout, only wraps children with font/metadata)
- `app/projects/[slug]/page.tsx` (reads config data, renders static content)
- Pure presentational components with no interactivity

When in doubt, make it a client component. The performance difference is negligible for this project since it's almost entirely interactive.

## Ref Patterns for WebGL

WebGL components need careful ref management:

```typescript
export function FluidSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.error('WebGL 2 not supported');
      return;
    }

    glRef.current = gl;

    // Setup shaders, FBOs, etc.

    // Render loop
    const render = () => {
      // ... render frame
      frameIdRef.current = requestAnimationFrame(render);
    };
    frameIdRef.current = requestAnimationFrame(render);

    // Cleanup — CRITICAL for WebGL
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      // Delete textures, framebuffers, programs
      // Lose context if needed
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
```

### Rules:
- Store the GL context in a ref, not state (doesn't need reactivity)
- Store the rAF ID in a ref so cleanup can cancel it
- ALWAYS cancel rAF and delete GL resources on unmount
- Handle WebGL context loss events

## Error Boundaries

Wrap WebGL components in an error boundary with a fallback:

```typescript
// components/WebGLErrorBoundary.tsx
// If WebGL fails to initialize, show a static dithered background instead of crashing
```

This is especially important for the fluid sim — some browsers/devices may not support WebGL 2 or float textures.

## Import Path Aliases

Use the `@/` alias configured in `tsconfig.json`:

```typescript
// YES
import { ProjectCard } from '@/components/projects/ProjectCard';
import { useScrambleText } from '@/hooks/useScrambleText';
import { ANIMATION } from '@/config/animation';

// NO — relative paths are fragile and hard to refactor
import { ProjectCard } from '../../components/projects/ProjectCard';
```