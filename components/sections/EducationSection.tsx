'use client';
import { ScrambleText } from '@/components/text/ScrambleText';
import { useSectionActive } from '@/components/sections/SectionWrapper';

const ENTRIES = [
  {
    period: '2020 — 2024',
    title: 'BSC COMPUTER SCIENCE',
    institution: 'UNIVERSITY NAME',
    detail: 'Specialization in graphics and systems programming.',
  },
  {
    period: '2022 — 2023',
    title: 'EXCHANGE YEAR',
    institution: 'PARTNER UNIVERSITY',
    detail: 'Focus on interactive media and creative computing.',
  },
];

export function EducationSection() {
  const { active } = useSectionActive();
  return (
    <div className="flex min-h-screen flex-col justify-center px-8 py-24">
      <ScrambleText
        as="h2"
        text="// EDUCATION"
        active={active}
        className="font-vt323 mb-12 text-4xl tracking-widest"
        style={{ color: 'var(--crt-red-bright)', textShadow: 'var(--crt-glow-heading)' }}
      />
      <div className="flex flex-col gap-10">
        {ENTRIES.map((entry) => (
          <div key={entry.title} className="border-l-2 pl-6"
            style={{ borderColor: 'var(--crt-red-muted)' }}>
            <div className="font-vt323 text-sm" style={{ color: 'var(--crt-red-muted)' }}>
              {entry.period}
            </div>
            <ScrambleText
              as="h3"
              text={entry.title}
              active={active}
              className="font-vt323 text-2xl tracking-widest"
              style={{ color: 'var(--crt-red-medium)' }}
            />
            <div className="font-vt323 text-lg" style={{ color: 'var(--crt-red-dim)' }}>
              {entry.institution}
            </div>
            <p className="font-vt323 mt-1 text-base" style={{ color: 'var(--crt-red-muted)' }}>
              {entry.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
