'use client';

import { useMemo } from 'react';
import StatCard from '@/components/dashboard/stat-card';
import AttendanceChart from '@/components/dashboard/attendance-chart';
import { AiProgressOverview } from '@/components/dashboard/ai-progress-overview';
import PerformanceChart from '@/components/dashboard/performance-chart';
import RecentActivitiesTable from '@/components/dashboard/recent-activities-table';
import NotificationsPanel from '@/components/dashboard/notifications-panel';
import { useData } from '@/context/data-context';
import type { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';


export default function DashboardPage() {
  const { students, teachers, feesData, studentAttendance, recentExamResults, isLoading } = useData();

  const totalFeesCollected = useMemo(() => {
    if (!feesData) return 0;
    return feesData
      .filter((fee) => fee.status === 'paid')
      .reduce((acc, fee) => acc + fee.amount, 0);
  }, [feesData]);

  const averageAttendance = useMemo(() => {
    if (!studentAttendance || studentAttendance.length === 0) return 0;
    const presentCount = studentAttendance.filter(att => att.status === 'present').length;
    return (presentCount / studentAttendance.length) * 100;
  }, [studentAttendance]);

  const statCards: {
    title: string;
    value: string;
    change: string;
    icon: keyof typeof Icons;
    href: string;
  }[] = useMemo(() => [
    {
      title: 'Total Students',
      value: String(students?.length || 0),
      change: '+0',
      icon: 'Users',
      href: '/dashboard/students',
    },
    {
      title: 'Total Teachers',
      value: String(teachers?.length || 0),
      change: '+0',
      icon: 'GraduationCap',
      href: '/dashboard/teachers',
    },
    {
      title: 'Fees Collected',
      value: `Birr ${(totalFeesCollected / 1000).toFixed(1)}K`,
      change: '+0',
      icon: 'DollarSign',
      href: '/dashboard/fees',
    },
    {
        title: 'Average Attendance',
        value: `${averageAttendance.toFixed(1)}%`,
        change: '+0',
        icon: 'ClipboardCheck',
        href: '/dashboard/attendance',
    }
  ], [students, teachers, totalFeesCollected, averageAttendance]);


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome Back, Admin!</h1>
          <p className="text-muted-foreground">Here&apos;s a snapshot of your school&apos;s activities and performance.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {isLoading ? (
          Array.from({length: 4}).map((_, i) => (
            <Skeleton key={i} className="h-[125px]" />
          ))
        ) : (
          statCards.map((card) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              change={card.change}
              icon={card.icon}
              href={card.href}
            />
          ))
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-[320px] w-full" />
      ) : (
        <AiProgressOverview
          students={students || []}
          teachers={teachers || []}
          recentExamResults={recentExamResults || []}
          studentAttendance={studentAttendance || []}
          feesData={feesData || []}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
           <PerformanceChart />
           <RecentActivitiesTable />
        </div>
        <div className="flex flex-col gap-6">
            <AttendanceChart />
            <NotificationsPanel />
        </div>
      </div>
    </div>
  );
}
