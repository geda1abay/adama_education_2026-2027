
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
  const { isUserLoading, firebaseUser, userRole } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && (!firebaseUser || userRole !== 'student')) {
      router.push('/student/login');
    }
  }, [isUserLoading, firebaseUser, userRole, router]);

  // Don't render children until user role is confirmed to prevent flash of content
  if (isUserLoading || userRole !== 'student') {
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
