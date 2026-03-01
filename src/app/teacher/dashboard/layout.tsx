
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TeacherHeader from '@/components/teacher/header';
import { useData } from '@/context/data-context';

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isUserLoading, firebaseUser, userRole } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && (!firebaseUser || userRole !== 'teacher')) {
      router.push('/teacher/login');
    }
  }, [isUserLoading, firebaseUser, userRole, router]);

  if (isUserLoading || userRole !== 'teacher') {
    return (
       <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <TeacherHeader />
      <main className="p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}
