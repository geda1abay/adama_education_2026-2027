'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import SidebarNav from '@/components/layout/sidebar-nav';
import { DataProvider } from '@/context/data-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdmin');
    if (isAdmin === 'true') {
      setIsAuthorized(true);
    } else {
      router.push('/login');
    }
  }, [router]);

  if (!isAuthorized) {
    return null; // Or a loading spinner
  }

  return (
    <DataProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <SidebarNav />
        </div>
        <div className="flex flex-col">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </DataProvider>
  );
}
