interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-crt-red-dim text-2xl">{`> PROJECT: ${slug.toUpperCase()}`}</p>
    </div>
  );
}
