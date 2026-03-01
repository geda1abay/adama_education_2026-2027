'use client';

import { DataProvider } from '@/context/data-context';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      {children}
    </DataProvider>
  );
}
