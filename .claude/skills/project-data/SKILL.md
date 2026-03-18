# Project Data Skill

## When to Use
Apply this skill when adding, editing, or removing projects from the portfolio. Also apply when working on `config/projects.ts`, `components/projects/ProjectCard.tsx`, `components/projects/ProjectGrid.tsx`, or any file in `app/projects/`.

## Project Context
Projects are the core content of the portfolio. Each project has a card on the home page and a dedicated detail page. All project data lives in a single TypeScript config file for easy editing — no CMS, no database, no markdown files.

## Data Structure

### Type Definition

```typescript
// types/project.ts

export interface Project {
  slug: string;               // URL-safe identifier: "fluid-sim-demo"
  title: string;              // Display title: "Fluid Simulation Demo"
  description: string;        // Brief description for card (1-2 sentences max)
  videoSrc: string;           // Path to looping preview video: "/videos/fluid-sim.webm"
  videoPoster?: string;       // Fallback image if video can't load: "/images/fluid-sim.jpg"
  tags: string[];             // Tech/tools used: ["WebGL", "GLSL", "TypeScript"]
  featured?: boolean;         // Show prominently or with special styling
  year?: number;              // Year completed
  liveUrl?: string;           // Link to live project
  repoUrl?: string;           // Link to source code
  detailContent?: {           // Extended content for the detail page
    longDescription: string;  // Full project writeup (can be multiple paragraphs)
    images?: string[];        // Additional screenshot/image paths
    challenges?: string;      // Technical challenges faced
    learnings?: string;       // Key takeaways
  };
}
```

### Config File

```typescript
// config/projects.ts

import { Project } from '@/types/project';

export const projects: Project[] = [
  {
    slug: "project-name",
    title: "Project Name",
    description: "A brief one or two sentence description shown on the card.",
    videoSrc: "/videos/project-name.webm",
    videoPoster: "/images/project-name-poster.jpg",
    tags: ["React", "TypeScript", "WebGL"],
    featured: true,
    year: 2025,
    liveUrl: "https://project-name.vercel.app",
    repoUrl: "https://github.com/seb/project-name",
    detailContent: {
      longDescription: "Extended description for the detail page...",
      images: ["/images/project-name-1.jpg", "/images/project-name-2.jpg"],
      challenges: "Description of technical challenges...",
      learnings: "Key takeaways from the project...",
    },
  },
  // Add more projects...
];

// Helper functions
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter(p => p.featured);
}

export function getAllSlugs(): string[] {
  return projects.map(p => p.slug);
}
```

## Adding a New Project — Checklist

1. **Prepare the video** — Record a short (5-15 second) screen capture of the project. Export as:
   - `.webm` (VP9 codec, primary) — smaller file, better quality
   - `.mp4` (H.264 codec, fallback) — Safari compatibility
   - Keep resolution reasonable: 640x360 or 800x450 is fine for cards
   - Ensure it loops seamlessly if possible

2. **Prepare the poster image** — A single frame from the video as `.jpg`, used as fallback and loading placeholder

3. **Place files:**
   - Videos → `public/videos/project-slug.webm` and `public/videos/project-slug.mp4`
   - Poster → `public/images/project-slug-poster.jpg`
   - Detail images → `public/images/project-slug-1.jpg`, etc.

4. **Add entry to `config/projects.ts`** — Fill in all fields. At minimum: slug, title, description, videoSrc, tags.

5. **Test** — Run `npm run dev`, check the card renders on the projects section, click through to `/projects/project-slug` and verify the detail page loads.

## ProjectCard Component

```typescript
// components/projects/ProjectCard.tsx

interface ProjectCardProps {
  project: Project;
}
```

### Card Structure
```
┌──────────────────────────────────┐
│  Project Title                   │  ← crt-red-bright, glow
├──────────────────────────────────┤
│                                  │
│  ┌────────────────────────────┐  │
│  │                            │  │
│  │   Looping Video Preview    │  │  ← muted, autoplay, loop, playsinline
│  │                            │  │
│  └────────────────────────────┘  │
│                                  │
│  Brief description text here     │  ← crt-red-medium, 1-2 lines
│  that explains the project.      │
│                                  │
│  React · TypeScript · WebGL      │  ← crt-red-dim, horizontal tag list
└──────────────────────────────────┘
```

### Video Element Rules
- Always include: `muted autoPlay loop playsInline`
- Provide both webm and mp4 sources with `<source>` tags (webm first)
- Set `poster` attribute for loading state
- Wrap in a container with `aspect-ratio: 16/9` and `overflow: hidden`
- Add `preload="metadata"` to avoid loading full video until visible
- Use Intersection Observer or `loading="lazy"` to defer offscreen videos

```tsx
<div className="aspect-video overflow-hidden rounded border border-[var(--crt-red-muted)]">
  <video
    muted
    autoPlay
    loop
    playsInline
    poster={project.videoPoster}
    preload="metadata"
    className="w-full h-full object-cover"
  >
    <source src={project.videoSrc} type="video/webm" />
    <source src={project.videoSrc.replace('.webm', '.mp4')} type="video/mp4" />
  </video>
</div>
```

### Card Styling
- Background: `--crt-bg-subtle`
- Border: `1px solid var(--crt-red-muted)`
- On hover: border brightens to `--crt-red-dim`, subtle glow on the card
- Entire card is clickable — wraps in a `<Link>` to `/projects/${project.slug}`
- Tags are displayed as a horizontal inline list separated by `·` characters
- No bullet points for tags — just inline text with dim color

## Project Detail Page

```typescript
// app/projects/[slug]/page.tsx

import { getProjectBySlug, getAllSlugs } from '@/config/projects';
import { notFound } from 'next/navigation';

// Generate static params for all project slugs
export function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug);
  if (!project) return notFound();

  // Render project detail...
}
```

### Detail Page Layout
- Shares the CRT frame aesthetic (it's inside the root layout)
- Back button at top → returns to `/home` (scrolls to projects section)
- Full project title with scramble-in animation
- Video/images displayed larger than card preview
- Full description text
- Technical challenges and learnings sections (if provided)
- Tech tags displayed
- Links to live project and source code (if provided)

## File Naming Conventions
- Video files: `project-slug.webm`, `project-slug.mp4` (lowercase, hyphenated)
- Poster images: `project-slug-poster.jpg`
- Detail images: `project-slug-1.jpg`, `project-slug-2.jpg` (numbered)
- All media in `public/` with appropriate subdirectory (`videos/`, `images/`)