import { Project } from '@/types/project';

export const projects: Project[] = [
  {
    slug: 'project-one',
    title: 'PROJECT ONE',
    description: 'Placeholder description. Replace in Phase 6.',
    videoSrc: '/videos/project-one.webm',
    videoPoster: '/images/project-one.jpg',
    tags: ['React', 'TypeScript', 'WebGL'],
    featured: true,
  },
  {
    slug: 'project-two',
    title: 'PROJECT TWO',
    description: 'Placeholder description. Replace in Phase 6.',
    videoSrc: '/videos/project-two.webm',
    videoPoster: '/images/project-two.jpg',
    tags: ['Next.js', 'GLSL', 'Node.js'],
    featured: true,
  },
  {
    slug: 'project-three',
    title: 'PROJECT THREE',
    description: 'Placeholder description. Replace in Phase 6.',
    videoSrc: '/videos/project-three.webm',
    tags: ['Python', 'Three.js', 'WebSockets'],
  },
];
