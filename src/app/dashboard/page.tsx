'use client';

import { useMemo } from 'react';
import StatCard from '@/components/dashboard/stat-card';
import AttendanceChart from '@/components/dashboard/attendance-chart';
import PerformanceChart from '@/components/dashboard/performance-chart';
import RecentActivitiesTable from '@/components/dashboard/recent-activities-table';
import NotificationsPanel from '@/components/dashboard/notifications-panel';
import AiSummaryCard from '@/components/dashboard/ai-summary-card';
import { useData } from '@/context/data-context';
import type { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';


export default function DashboardPage() {
  const { students, teachers } = useData();

  const statCards: {
    title: string;
    value: string;
    change: string;
    icon: keyof typeof Icons;
    href: string;
  }[] = useMemo(() => [
    {
      title: 'Total Students (up to now)',
      value: String(students.length),
      change: '+15.2%',
      icon: 'Users',
      href: '/dashboard/students',
    },
    {
      title: 'Total Teachers (up to now)',
      value: String(teachers.length),
      change: '+5.7%',
      icon: 'GraduationCap',
      href: '/dashboard/teachers',
    },
    {
      title: 'Fees Collected (up to now)',
      value: '$250K',
      change: '-2.1%',
      icon: 'DollarSign',
      href: '/dashboard/fees',
    },
  ], [students, teachers]);


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome Back, Admin!</h1>
          <p className="text-muted-foreground">Here&apos;s a snapshot of your school&apos;s activities.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            change={card.change}
            icon={card.icon}
            href={card.href}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6">
           <PerformanceChart id="performance-chart" />
           <RecentActivitiesTable />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
            <AiSummaryCard />
            <AttendanceChart id="attendance-chart" />
            <NotificationsPanel />
        </div>
      </div>
    </div>
  );
}
