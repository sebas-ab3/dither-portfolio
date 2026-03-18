'use client';

import { useEffect, useRef } from 'react';
import { useScrambleText } from '@/hooks/useScrambleText';
import { TITLE_PHRASES } from '@/lib/ascii';
import { ANIMATION } from '@/config/animation';

export function ASCIITitle() {
  const phraseIndexRef = useRef(0);
  const cycleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { displayText, trigger, isAnimating } = useScrambleText(TITLE_PHRASES[0], {
    staggerMax: ANIMATION.titleCycle.scrambleResolve,
  });

  // After each phrase displays for displayDuration, scramble to the next one.
  // When isAnimating goes false (scramble complete), schedule the next transition.
  useEffect(() => {
    if (isAnimating) return;

    cycleTimeoutRef.current = setTimeout(() => {
      phraseIndexRef.current = (phraseIndexRef.current + 1) % TITLE_PHRASES.length;
      trigger(TITLE_PHRASES[phraseIndexRef.current]);
    }, ANIMATION.titleCycle.displayDuration);

    return () => {
      if (cycleTimeoutRef.current) clearTimeout(cycleTimeoutRef.current);
    };
  }, [isAnimating, trigger]);

  return (
    <div className="select-none text-center" aria-live="polite">
      <p
        className="font-vt323 text-4xl leading-tight tracking-wide sm:text-5xl md:text-6xl lg:text-7xl"
        style={{
          color: 'var(--crt-red-bright)',
          textShadow: 'var(--crt-glow-heading)',
        }}
      >
        {displayText}
      </p>
    </div>
  );
}
