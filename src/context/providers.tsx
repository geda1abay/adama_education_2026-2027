'use client';

import { DataProvider } from '@/context/data-context';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return <DataProvider>{children}</DataProvider>;
}
