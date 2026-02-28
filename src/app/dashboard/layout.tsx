'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import SidebarNav from '@/components/layout/sidebar-nav';
import { DataProvider } from '@/context/data-context';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const adminRoleRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'admins', user.uid);
  }, [firestore, user]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);

  const isLoading = isUserLoading || isAdminRoleLoading;
  const isAuthorized = !isLoading && !!user && !!adminRole;

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.push('/login');
    }
  }, [isLoading, isAuthorized]);

  // Show skeleton while loading, or if the user is not authorized (before the redirect happens).
  if (isLoading || !isAuthorized) {
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full mt-2" />
                <Skeleton className="h-8 w-full mt-2" />
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-48 ml-auto" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </div>
    );
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
