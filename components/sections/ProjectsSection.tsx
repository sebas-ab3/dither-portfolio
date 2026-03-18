'use client';
import { ScrambleText } from '@/components/text/ScrambleText';
import { useSectionActive } from '@/components/sections/SectionWrapper';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { projects } from '@/config/projects';

export function ProjectsSection() {
  const { active } = useSectionActive();
  return (
    <div className="flex min-h-screen flex-col justify-center px-8 py-24">
      <ScrambleText
        as="h2"
        text="// PROJECTS"
        active={active}
        className="font-vt323 mb-12 text-4xl tracking-widest"
        style={{ color: 'var(--crt-red-bright)', textShadow: 'var(--crt-glow-heading)' }}
      />
      <ProjectGrid projects={projects} />
    </div>
  );
}
