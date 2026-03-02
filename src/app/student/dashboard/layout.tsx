
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StudentHeader from '@/components/student/header';
import { useData } from '@/context/data-context';

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isUserLoading, isRoleLoading, firebaseUser, userRole } = useData();
  const router = useRouter();

  const isLoading = isUserLoading || isRoleLoading;

  useEffect(() => {
    if (!isLoading && (!firebaseUser || userRole !== 'student')) {
      router.push('/student/login');
    }
  }, [isLoading, firebaseUser, userRole, router]);

  if (isLoading || userRole !== 'student') {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <StudentHeader />
      <main className="p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}
