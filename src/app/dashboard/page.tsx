import StatCard from '@/components/dashboard/stat-card';
import AttendanceChart from '@/components/dashboard/attendance-chart';
import PerformanceChart from '@/components/dashboard/performance-chart';
import NotificationsPanel from '@/components/dashboard/notifications-panel';
import RecentActivitiesTable from '@/components/dashboard/recent-activities-table';
import AiSummaryCard from '@/components/dashboard/ai-summary-card';
import { MOCK_STAT_CARDS } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome Back, Admin!</h1>
          <p className="text-muted-foreground">Here&apos;s a snapshot of your school&apos;s activities.</p>
        </div>
        <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Student
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {MOCK_STAT_CARDS.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            change={card.change}
            icon={card.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6">
           <PerformanceChart />
           <RecentActivitiesTable />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
            <AiSummaryCard />
            <NotificationsPanel />
            <AttendanceChart />
        </div>
      </div>
    </div>
  );
}
