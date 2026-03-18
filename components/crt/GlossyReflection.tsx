'use client';

import { useMouseParallax } from '@/hooks/useMouseParallax';

const SENSITIVITY = 0.03;
const MAX_PX = 30;

export function GlossyReflection() {
  const { offsetX, offsetY } = useMouseParallax({ sensitivity: SENSITIVITY });
  const tx = offsetX * (MAX_PX / SENSITIVITY);
  const ty = offsetY * (MAX_PX / SENSITIVITY);

  return (
    <>
      <div className="crt-gloss-static" aria-hidden="true" />
      <div
        className="crt-gloss-reactive"
        aria-hidden="true"
        style={{ transform: `translate(${tx}px, ${ty}px)` }}
      />
    </>
  );
}
