'use client';
import { useState } from 'react';

function generateBarrelMap(size: number, strength: number): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = x / (size - 1) - 0.5;
      const cy = y / (size - 1) - 0.5;
      const r2 = cx * cx + cy * cy;
      const r = Math.max(0, Math.min(255, (cx * r2 * strength + 0.5) * 255));
      const g = Math.max(0, Math.min(255, (cy * r2 * strength + 0.5) * 255));
      const i = (y * size + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

interface BarrelDistortionFilterProps {
  id?: string;
  strength?: number;
  scale?: number;
}

export function BarrelDistortionFilter({
  id = 'crt-barrel',
  strength = 2.0,
  scale = 120,
}: BarrelDistortionFilterProps) {
  const [href] = useState(() => generateBarrelMap(256, strength));
  return (
    <svg style={{ display: 'none' }} aria-hidden>
      <defs>
        <filter
          id={id}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={href}
            result="disp"
            preserveAspectRatio="none"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="disp"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
