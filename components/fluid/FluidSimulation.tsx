'use client';

import { useFluidSim } from '@/hooks/useFluidSim';

export function FluidSimulation() {
  const { canvasRef, isMobileFallback } = useFluidSim({
    splatRadius: 0.01,
    pressureIterations: 10,
  });

  if (isMobileFallback) {
    return (
      <div
        className="absolute inset-0 z-0 crt-noise"
        style={{ background: 'var(--crt-bg-base)' }}
        aria-hidden="true"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
