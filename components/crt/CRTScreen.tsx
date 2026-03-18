import { GlossyReflection } from './GlossyReflection';

interface CRTScreenProps {
  children: React.ReactNode;
}

export function CRTScreen({ children }: CRTScreenProps) {
  return (
    <div className="crt-screen">
      {children}
      <div className="crt-noise" aria-hidden="true" />
      <div className="crt-scanlines" aria-hidden="true" />
      <div className="crt-vignette" aria-hidden="true" />
      <GlossyReflection />
    </div>
  );
}
