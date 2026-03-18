'use client';

const LINKS = [
  { label: 'EMAIL', href: 'mailto:hello@example.com', display: 'hello@example.com' },
  { label: 'GITHUB', href: 'https://github.com/username', display: 'github.com/username' },
  { label: 'LINKEDIN', href: 'https://linkedin.com/in/username', display: 'linkedin.com/in/username' },
];

export function ContactSection() {
  return (
    <div className="flex min-h-screen flex-col justify-center px-8 py-24">
      <h2
        className="font-vt323 mb-12 text-4xl tracking-widest"
        style={{ color: 'var(--crt-red-bright)', textShadow: 'var(--crt-glow-heading)' }}
      >
        // CONTACT
      </h2>
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
            &gt; {label} — {display}
          </a>
        ))}
      </div>
    </div>
  );
}
