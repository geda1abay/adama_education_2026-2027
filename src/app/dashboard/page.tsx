import StatCard from '@/components/dashboard/stat-card';
import AttendanceChart from '@/components/dashboard/attendance-chart';
import PerformanceChart from '@/components/dashboard/performance-chart';
import NotificationsPanel from '@/components/dashboard/notifications-panel';
import RecentActivitiesTable from '@/components/dashboard/recent-activities-table';
import AiSummaryCard from '@/components/dashboard/ai-summary-card';
import { MOCK_STAT_CARDS } from '@/lib/data';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-7">
        <div className="lg:col-span-4 flex flex-col gap-4">
          <AttendanceChart />
          <PerformanceChart />
        </div>
        <div className="lg:col-span-3 flex flex-col gap-4">
          <NotificationsPanel />
          <AiSummaryCard />
        </div>
      </div>
      <div>
        <RecentActivitiesTable />
      </div>
    </div>
  );
}
