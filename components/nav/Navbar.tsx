'use client';
import { useRouter } from 'next/navigation';

const SECTIONS = [
  { id: 'hero', label: 'HERO' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'education', label: 'EDUCATION' },
  { id: 'contact', label: 'CONTACT' },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function Navbar() {
  const router = useRouter();
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
      style={{
        borderBottom: '1px solid var(--crt-red-muted)',
        background: 'rgba(10, 10, 10, 0.95)',
      }}
    >
      <button type="button" className="crt-btn text-sm" onClick={() => router.push('/')}>
        [ EXIT ]
      </button>
      <div className="flex gap-6">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollTo(id)}
            className="font-vt323 text-sm tracking-widest transition-colors hover:text-[var(--crt-red-bright)]"
            style={{ color: 'var(--crt-red-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
