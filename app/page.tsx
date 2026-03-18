'use client';

import { useRouter } from 'next/navigation';
import { BootSequence } from '@/components/text/BootSequence';
import { ASCIITitle } from '@/components/text/ASCIITitle';

export default function StartPage() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-10 p-8">
      <BootSequence />
      <ASCIITitle />
      <button
        className="crt-btn text-lg"
        onClick={() => router.push('/home')}
      >
        [ ENTER ]
      </button>
    </main>
  );
}
