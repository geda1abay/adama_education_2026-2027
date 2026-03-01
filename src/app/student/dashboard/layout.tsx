'use client';

import StudentHeader from '@/components/student/header';

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background">
      <StudentHeader />
      <main className="p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}
