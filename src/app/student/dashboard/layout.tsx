'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataProvider } from '@/context/data-context';
import StudentHeader from '@/components/student/header';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase'; // Import firebase hooks
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const studentRoleRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'students', user.uid);
  }, [firestore, user]);

  const { data: studentRole, isLoading: isStudentRoleLoading } = useDoc(studentRoleRef);

  const isLoading = isUserLoading || (!!user && isStudentRoleLoading);

  useEffect(() => {
    if (isLoading) {
      return; // Wait until all loading is complete
    }

    if (!user || !studentRole) {
      router.push('/student/login');
    }
  }, [isLoading, user, studentRole]);

  if (isLoading || !user || !studentRole) {
    return (
        <div className="min-h-screen w-full bg-background">
            <header className="flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
                <Skeleton className="h-6 w-48" />
                <div className="ml-auto flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </header>
            <main className="p-4 lg:p-6">
                <Skeleton className="h-64 w-full" />
            </main>
        </div>
    );
  }

  return (
    <DataProvider>
      <div className="min-h-screen w-full bg-background">
        <StudentHeader />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </DataProvider>
  );
}
