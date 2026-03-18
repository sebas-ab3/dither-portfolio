'use client';

import { useRouter } from 'next/navigation';
import { BootSequence } from '@/components/text/BootSequence';
import { ASCIITitle } from '@/components/text/ASCIITitle';
import { FluidSimulation } from '@/components/fluid/FluidSimulation';

export default function StartPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen">
      <FluidSimulation />
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center gap-10 p-8 pointer-events-none">
        <BootSequence />
        <ASCIITitle />
        <button className="crt-btn text-lg pointer-events-auto" onClick={() => router.push('/home')}>
          [ ENTER ]
        </button>
      </div>
    </main>
  );
}
