'use client';
import { ScrambleText } from '@/components/text/ScrambleText';
import { useSectionActive } from '@/components/sections/SectionWrapper';

export function HeroSection() {
  const { active } = useSectionActive();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-8 pt-16 text-center">
      <ScrambleText
        as="h1"
        text="SEB ABRAHAMSEN"
        active={active}
        className="font-vt323 text-6xl tracking-widest md:text-8xl"
        style={{ color: 'var(--crt-red-bright)', textShadow: 'var(--crt-glow-heading)' }}
      />
      <ScrambleText
        as="p"
        text="CREATIVE DEVELOPER — WEBGL / UI / SYSTEMS"
        active={active}
        className="font-vt323 text-xl tracking-wide md:text-2xl"
        style={{ color: 'var(--crt-red-dim)' }}
      />
    </div>
  );
}
