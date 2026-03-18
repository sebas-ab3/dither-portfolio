'use client';

import { useEffect, ElementType, ComponentPropsWithoutRef } from 'react';
import { useScrambleText } from '@/hooks/useScrambleText';

type ScrambleTextProps<T extends ElementType = 'span'> = {
  text: string;
  as?: T;
  active?: boolean;
  staggerMax?: number;
  charInterval?: number;
  lockSpaces?: boolean;
  onComplete?: () => void;
} & Omit<ComponentPropsWithoutRef<T>, 'children'>;

export function ScrambleText<T extends ElementType = 'span'>({
  text,
  as,
  active = false,
  staggerMax,
  charInterval,
  lockSpaces,
  onComplete,
  ...rest
}: ScrambleTextProps<T>) {
  const Tag = (as ?? 'span') as ElementType;
  const { displayText, trigger, isAnimating } = useScrambleText(text, {
    staggerMax,
    charInterval,
    lockSpaces,
  });

  useEffect(() => {
    if (active) trigger(text);
  }, [active, text, trigger]);

  useEffect(() => {
    if (!isAnimating && onComplete) onComplete();
  }, [isAnimating, onComplete]);

  return <Tag {...rest}>{displayText}</Tag>;
}
