'use client';

import { useState, useEffect, useRef } from 'react';
import { useScrambleText } from '@/hooks/useScrambleText';
import { ANIMATION } from '@/config/animation';

const BOOT_LINES = [
  '> LOADING SYSTEM...',
  '> INITIALIZING DISPLAY...',
  '> CHECKING MEMORY... OK',
  '> READY_',
];

function BootLine({ text, scrambleOut }: { text: string; scrambleOut: boolean }) {
  const { displayText, trigger } = useScrambleText(text, { lockSpaces: false });

  useEffect(() => {
    if (scrambleOut) trigger(' '.repeat(text.length));
  }, [scrambleOut, text, trigger]);

  return <div>{displayText}</div>;
}

export function BootSequence() {
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState('');
  const [scrambleOut, setScrambleOut] = useState(false);
  const [gone, setGone] = useState(false);

  const lineIndexRef = useRef(0);
  const charIndexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const typeChar = () => {
      const lineIdx = lineIndexRef.current;
      const charIdx = charIndexRef.current;

      if (lineIdx >= BOOT_LINES.length) {
        timeoutRef.current = setTimeout(() => {
          setScrambleOut(true);
          timeoutRef.current = setTimeout(
            () => setGone(true),
            ANIMATION.scramble.staggerMax + 50
          );
        }, ANIMATION.boot.holdAfterComplete);
        return;
      }

      const line = BOOT_LINES[lineIdx];

      if (charIdx <= line.length) {
        setCurrentLine(line.slice(0, charIdx));
        charIndexRef.current = charIdx + 1;
        timeoutRef.current = setTimeout(typeChar, ANIMATION.boot.typeSpeed);
      } else {
        setCompletedLines((prev) => [...prev, line]);
        setCurrentLine('');
        lineIndexRef.current = lineIdx + 1;
        charIndexRef.current = 0;
        timeoutRef.current = setTimeout(typeChar, ANIMATION.boot.lineDelay);
      }
    };

    // Brief pause before boot starts
    timeoutRef.current = setTimeout(typeChar, 300);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className="absolute left-8 top-8 z-10 text-sm leading-relaxed"
      style={{ color: 'var(--crt-red-dim)', textShadow: 'var(--crt-glow-text)' }}
      aria-live="polite"
      aria-label="Boot sequence"
    >
      {completedLines.map((line, i) => (
        <BootLine key={i} text={line} scrambleOut={scrambleOut} />
      ))}
      {currentLine && (
        <div>
          {currentLine}
          <span className="cursor-blink">_</span>
        </div>
      )}
    </div>
  );
}
