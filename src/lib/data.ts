import type { ChartConfig } from '@/components/ui/chart';
import * as Icons from 'lucide-react';

export const MOCK_STAT_CARDS: {
  title: string;
  value: string;
  change: string;
  icon: keyof typeof Icons;
}[] = [
  {
    title: 'Total Teachers',
    value: '78',
    change: '+5.7%',
    icon: 'GraduationCap',
  },
  {
    title: 'Total Classes',
    value: '45',
    change: '+10.0%',
    icon: 'Book',
  },
  {
    title: 'Fees Collected',
    value: '$250K',
    change: '-2.1%',
    icon: 'DollarSign',
  },
];

export const ATTENDANCE_DATA = [
  { month: 'January', attendance: 82 },
  { month: 'February', attendance: 85 },
  { month: 'March', attendance: 88 },
  { month: 'April', attendance: 86 },
  { month: 'May', attendance: 90 },
  { month: 'June', attendance: 92 },
];

export const ATTENDANCE_CHART_CONFIG = {
  attendance: {
    label: 'Attendance',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export const PERFORMANCE_DATA = [
  { month: 'January', Math: 75, Science: 80, English: 85 },
  { month: 'February', Math: 78, Science: 82, English: 88 },
  { month: 'March', Math: 82, Science: 85, English: 90 },
  { month: 'April', Math: 80, Science: 88, English: 92 },
  { month: 'May', Math: 85, Science: 90, English: 94 },
  { month: 'June', Math: 88, Science: 92, English: 95 },
];

export const PERFORMANCE_CHART_CONFIG = {
  Math: {
    label: 'Math',
    color: 'hsl(var(--chart-1))',
  },
  Science: {
    label: 'Science',
    color: 'hsl(var(--chart-2))',
  },
  English: {
    label: 'English',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export const NOTIFICATIONS: {
    id: string;
    avatar: string;
    name: string;
    message: string;
    time: string;
}[] = [];

export const RECENT_ACTIVITIES: {
    id: string;
    user: string;
    activity: string;
    timestamp: string;
    status: string;
}[] = [];

export const EXAM_STAT_CARDS: {
  title: string;
  value: string;
  change: string;
  icon: keyof typeof Icons;
}[] = [
  {
    title: 'Average Score',
    value: '82.5%',
    change: '+3.2% from last term',
    icon: 'Activity',
  },
  {
    title: 'Pass Rate',
    value: '95.8%',
    change: '+1.5% from last term',
    icon: 'CheckCircle',
  },
  {
    title: 'Highest Scorer',
    value: 'Emily White',
    change: '99.2% in Science',
    icon: 'Trophy',
  },
  {
    title: 'Upcoming Exams',
    value: '3',
    change: 'Next week',
    icon: 'Calendar',
  },
];

export const RECENT_EXAM_RESULTS: {
    id: string;
    studentName: string;
    class: string;
    subject: string;
    score: string;
    grade: string;
}[] = [];
