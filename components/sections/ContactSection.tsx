'use client';
import { useSectionActive } from '@/components/sections/SectionWrapper';
import { ScrambleText } from '@/components/text/ScrambleText';

const LINKS = [
  { label: 'EMAIL', href: 'mailto:hello@example.com', display: 'hello@example.com' },
  { label: 'GITHUB', href: 'https://github.com/username', display: 'github.com/username' },
  { label: 'LINKEDIN', href: 'https://linkedin.com/in/username', display: 'linkedin.com/in/username' },
];

export function ContactSection() {
  const { active } = useSectionActive();
  return (
    <div className="flex min-h-screen flex-col justify-center px-8 py-24">
      <ScrambleText
        as="h2"
        text="// CONTACT"
        active={active}
        className="font-vt323 mb-12 text-4xl tracking-widest"
        style={{ color: 'var(--crt-red-bright)', textShadow: 'var(--crt-glow-heading)' }}
      />
      <div className="flex flex-col gap-4">
        {LINKS.map(({ label, href, display }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="font-vt323 text-2xl tracking-wide"
            style={{ color: 'var(--crt-red-medium)' }}
          >
            <ScrambleText
              as="span"
              text={`> ${label} — ${display}`}
              active={active}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
