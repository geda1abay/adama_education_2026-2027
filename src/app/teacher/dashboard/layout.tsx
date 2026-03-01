'use client';

import TeacherHeader from '@/components/teacher/header';

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background">
      <TeacherHeader />
      <main className="p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}
