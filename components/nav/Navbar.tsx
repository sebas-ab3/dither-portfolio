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
      className="sticky top-0 z-50 grid grid-cols-6"
      style={{ background: 'var(--crt-red-bright)' }}
    >
      {SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => scrollTo(id)}
          className="font-vt323 tracking-widest text-sm py-3 w-full"
          style={{
            color: 'var(--crt-bg-base)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => router.push('/')}
        className="font-vt323 tracking-widest text-sm py-3 w-full"
        style={{
          color: 'var(--crt-bg-base)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        [ EXIT ]
      </button>
    </nav>
  );
}
