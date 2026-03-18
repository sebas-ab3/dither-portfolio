export interface Project {
  slug: string;
  title: string;
  description: string;
  videoSrc: string;
  videoPoster?: string;
  tags: string[];
  featured?: boolean;
}
