'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataProvider } from '@/context/data-context';
import StudentHeader from '@/components/student/header';

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const studentId = sessionStorage.getItem('studentId');
    if (studentId) {
      setIsAuthorized(true);
    } else {
      router.push('/student/login');
    }
  }, [router]);

  if (!isAuthorized) {
    return null; // Or a loading spinner
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
