'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSectionObserver } from '@/hooks/useSectionObserver';
import { ANIMATION } from '@/config/animation';

const SectionContext = createContext({ active: false });
export function useSectionActive() { return useContext(SectionContext); }

interface SectionWrapperProps {
  id: string;
  children: React.ReactNode;
  enableScramble?: boolean;
  enableBlur?: boolean;
}

export function SectionWrapper({
  id, children, enableScramble = true, enableBlur = true,
}: SectionWrapperProps) {
  const { ref, isActive } = useSectionObserver(0.5);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);

  useEffect(() => {
    if (isActive) setHasBeenSeen(true);
  }, [isActive]);

  const shouldBlur = enableBlur && hasBeenSeen && !isActive;

  return (
    <SectionContext.Provider value={{ active: isActive && enableScramble }}>
      <motion.section
        id={id}
        ref={ref as React.RefObject<HTMLElement>}
        className="relative min-h-screen"
        animate={{ filter: shouldBlur ? `blur(${ANIMATION.blur.amount})` : 'blur(0px)' }}
        transition={{ duration: ANIMATION.blur.duration / 1000, ease: 'easeOut' }}
      >
        {children}
      </motion.section>
    </SectionContext.Provider>
  );
}
