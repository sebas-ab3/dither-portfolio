'use client';
import { useRef, useState, useEffect } from 'react';

interface UseSectionObserverResult {
  ref: React.RefObject<HTMLElement | null>;
  isActive: boolean;
}

export function useSectionObserver(threshold = 0.5): UseSectionObserverResult {
  const ref = useRef<HTMLElement | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isActive };
}
