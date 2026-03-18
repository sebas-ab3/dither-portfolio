'use client';
import { ScrambleText } from '@/components/text/ScrambleText';
import { useSectionActive } from '@/components/sections/SectionWrapper';

const SKILL_GROUPS = [
  { category: 'FRONTEND', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
  { category: 'GRAPHICS', skills: ['WebGL 2.0', 'GLSL', 'Three.js', 'Canvas API'] },
  { category: 'BACKEND',  skills: ['Node.js', 'Python', 'PostgreSQL', 'REST APIs'] },
  { category: 'TOOLING',  skills: ['Git', 'Docker', 'Vercel', 'Vite'] },
];

export function SkillsSection() {
  const { active } = useSectionActive();
  return (
    <div className="flex min-h-screen flex-col justify-center px-8 py-24">
      <ScrambleText
        as="h2"
        text="// SKILLS"
        active={active}
        className="font-vt323 mb-12 text-4xl tracking-widest"
        style={{ color: 'var(--crt-red-bright)', textShadow: 'var(--crt-glow-heading)' }}
      />
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {SKILL_GROUPS.map(({ category, skills }) => (
          <div key={category}>
            <ScrambleText
              as="h3"
              text={category}
              active={active}
              className="font-vt323 mb-4 text-2xl tracking-widest"
              style={{ color: 'var(--crt-red-medium)' }}
            />
            <ul className="space-y-1">
              {skills.map((skill) => (
                <li key={skill} className="font-vt323 text-lg"
                  style={{ color: 'var(--crt-red-dim)' }}>
                  &gt; {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
