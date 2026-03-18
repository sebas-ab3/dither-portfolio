'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ANIMATION } from '@/config/animation';

interface UseScrambleTextOptions {
  charset?: string;
  staggerMax?: number;
  charInterval?: number;
  lockSpaces?: boolean;
}

interface UseScrambleTextReturn {
  displayText: string;
  trigger: (text: string) => void;
  isAnimating: boolean;
}

export function useScrambleText(
  initialText: string,
  options: UseScrambleTextOptions = {}
): UseScrambleTextReturn {
  const {
    charset = ANIMATION.scramble.charset,
    staggerMax = ANIMATION.scramble.staggerMax,
    charInterval = ANIMATION.scramble.charInterval,
    lockSpaces = true,
  } = options;

  const [displayText, setDisplayText] = useState(initialText);
  const [isAnimating, setIsAnimating] = useState(false);

  const targetRef = useRef(initialText);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const lockTimesRef = useRef<number[]>([]);

  const trigger = useCallback(
    (text: string) => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      targetRef.current = text;
      startTimeRef.current = Date.now();
      setIsAnimating(true);

      // Spaces lock immediately (unless lockSpaces=false); all other chars get a random lock time
      lockTimesRef.current = Array.from(text, (ch) =>
        ch === ' ' && lockSpaces ? 0 : Math.random() * staggerMax
      );

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const target = targetRef.current;
        const lockTimes = lockTimesRef.current;
        let allLocked = true;

        const chars = Array.from(target, (ch, i) => {
          if (ch === ' ' && lockSpaces) return ' ';
          if (elapsed >= lockTimes[i]) return ch;
          allLocked = false;
          return charset[Math.floor(Math.random() * charset.length)];
        });

        setDisplayText(chars.join(''));

        if (allLocked) {
          setDisplayText(target);
          setIsAnimating(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, charInterval);
    },
    [charset, staggerMax, charInterval, lockSpaces]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { displayText, trigger, isAnimating };
}
