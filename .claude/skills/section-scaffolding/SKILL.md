# Section Scaffolding Skill

## When to Use
Apply this skill when creating a new home page section, modifying the scroll behavior, adding a section to the navbar, or working on any file in `components/sections/`.

## Project Context
The home page (`app/home/page.tsx`) is composed of full-viewport sections that the user scrolls through. Each section (except Contact) has a scroll-triggered scramble text animation and blur transition. The navbar links to each section.

## Section Registry

All sections are defined in a central config so the navbar, scroll observer, and page layout stay in sync.

```typescript
// config/sections.ts

export interface SectionConfig {
  id: string;              // URL-friendly ID, used as element ID and nav anchor
  label: string;           // Display name in navbar
  enableScramble: boolean; // Whether scramble text plays on scroll-in
  enableBlur: boolean;     // Whether section blurs when scrolled past
}

export const sections: SectionConfig[] = [
  { id: 'hero',       label: 'Hero',                 enableScramble: true,  enableBlur: true },
  { id: 'skills',     label: 'Skills',               enableScramble: true,  enableBlur: true },
  { id: 'projects',   label: 'Projects',             enableScramble: true,  enableBlur: true },
  { id: 'education',  label: 'Education/Experience',  enableScramble: true,  enableBlur: true },
  { id: 'contact',    label: 'Contact',              enableScramble: false, enableBlur: false },
];
```

When adding a new section:
1. Add it to this config array
2. Create the component in `components/sections/`
3. Import and render it in `app/home/page.tsx`
4. The navbar and scroll observer read from this config — no separate wiring needed

## SectionWrapper Component

Every section is wrapped in `SectionWrapper`. This handles scroll detection, scramble triggering, and blur transitions.

```typescript
// components/sections/SectionWrapper.tsx

interface SectionWrapperProps {
  id: string;                     // Must match SectionConfig.id
  children: React.ReactNode;
  enableScramble?: boolean;       // Default: true
  enableBlur?: boolean;           // Default: true
  className?: string;
}
```

### Behavior
- Uses Intersection Observer with `threshold: 0.5` (section occupies >50% of viewport)
- When section enters majority view:
  1. Sets `isActive = true`
  2. Triggers scramble animation on children via context or callback
  3. Updates active section in a shared scroll state (for navbar highlighting)
- When section leaves majority view:
  1. Sets `isActive = false`
  2. Applies `filter: blur(4px)` with a 500ms CSS transition
- Scramble only plays ONCE per scroll-in (debounced, doesn't retrigger on fast scrolling)
- Blur transition uses CSS `transition: filter var(--blur-transition) ease-out`

### Scroll State
Use a React context or Zustand store to share the active section ID across components:

```typescript
// hooks/useSectionObserver.ts
// Returns: { activeSectionId: string, registerSection: (id: string, ref: RefObject) => void }
```

The navbar reads `activeSectionId` to highlight the current section link.

## Creating a New Section — Step by Step

### 1. Create the component file

```typescript
// components/sections/NewSection.tsx
'use client';

import { SectionWrapper } from './SectionWrapper';
import { ScrambleText } from '../text/ScrambleText';

export function NewSection() {
  return (
    <SectionWrapper id="new-section" enableScramble={true} enableBlur={true}>
      <div className="min-h-screen flex flex-col justify-center px-8 py-16">

        {/* Section heading — always uses ScrambleText */}
        <ScrambleText
          text="Section Title"
          as="h2"
          className="text-4xl mb-8"
        />

        {/* Section content */}
        <div>
          {/* Your content here */}
        </div>

      </div>
    </SectionWrapper>
  );
}
```

### 2. Add to section config

```typescript
// In config/sections.ts, add to the sections array:
{ id: 'new-section', label: 'New Section', enableScramble: true, enableBlur: true },
```

### 3. Add to home page

```typescript
// In app/home/page.tsx, import and add in order:
import { NewSection } from '@/components/sections/NewSection';

// In the JSX, place in desired scroll order:
<NewSection />
```

That's it — the navbar and scroll observer pick it up automatically from the config.

## Section Layout Rules

- Every section is `min-h-screen` — fills at least the full viewport height
- Horizontal padding: `px-8` on mobile, `px-16` on desktop
- Vertical padding: `py-16` minimum
- Content is vertically centered with `flex flex-col justify-center` unless the section needs to scroll internally (like Projects with many cards)
- All text uses the CRT color palette from globals.css — no custom colors
- Section headings are always wrapped in `ScrambleText` component

## Removing a Section

1. Remove from `config/sections.ts`
2. Remove the component import from `app/home/page.tsx`
3. Optionally delete the component file

## Section-Specific Notes

- **Hero:** No scroll trigger on initial load — scramble plays immediately on page mount
- **Projects:** May exceed `min-h-screen` due to card grid — that's fine, the observer still works
- **Contact:** `enableScramble: false` and `enableBlur: false` — renders normally, no effects