'use client';

import { useState, useEffect, useCallback } from 'react';

interface MouseParallaxOptions {
  sensitivity?: number;
}

interface MouseParallaxResult {
  offsetX: number; // range: [-sensitivity, +sensitivity], 0 = center
  offsetY: number;
}

export function useMouseParallax(
  options: MouseParallaxOptions = {}
): MouseParallaxResult {
  const { sensitivity = 0.03 } = options;
  const [offset, setOffset] = useState<MouseParallaxResult>({ offsetX: 0, offsetY: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    setOffset({ offsetX: nx * sensitivity, offsetY: ny * sensitivity });
  }, [sensitivity]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return offset;
}
