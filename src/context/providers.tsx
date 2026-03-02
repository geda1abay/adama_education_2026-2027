'use client';

import { FirebaseClientProvider } from '@/firebase';
import { DataProvider } from '@/context/data-context';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <DataProvider>{children}</DataProvider>
    </FirebaseClientProvider>
  );
}
