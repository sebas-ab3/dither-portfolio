'use client';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';

export function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="group flex flex-col text-left w-full"
      style={{ border: '1px solid var(--crt-red-muted)', background: 'var(--crt-bg-subtle)' }}
      onClick={() => router.push(`/projects/${project.slug}`)}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-crt-bg-base">
        <video
          src={project.videoSrc}
          poster={project.videoPoster}
          autoPlay muted loop playsInline
          className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
        />
      </div>
      <div className="flex flex-col gap-2 p-4">
        <h3
          className="font-vt323 text-xl tracking-widest"
          style={{ color: 'var(--crt-red-bright)', textShadow: 'var(--crt-glow-text)' }}
        >
          {project.title}
        </h3>
        <p className="font-vt323 text-base leading-snug" style={{ color: 'var(--crt-red-dim)' }}>
          {project.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="font-vt323 text-sm px-2"
              style={{ border: '1px solid var(--crt-red-muted)', color: 'var(--crt-red-dim)' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
