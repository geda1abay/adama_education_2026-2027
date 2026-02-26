import type { ChartConfig } from '@/components/ui/chart';
import * as Icons from 'lucide-react';

export const MOCK_STAT_CARDS: {
  title: string;
  value: string;
  change: string;
  icon: keyof typeof Icons;
}[] = [
  {
    title: 'Total Students',
    value: '1,250',
    change: '+15.2%',
    icon: 'Users',
  },
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

export const NOTIFICATIONS = [
  {
    id: '1',
    avatar: 'user-avatar-1',
    name: 'Emily Johnson',
    message: 'submitted a new assignment for Mathematics.',
    time: '5m ago',
  },
  {
    id: '2',
    avatar: 'user-avatar-2',
    name: 'Admin',
    message: 'posted a new announcement about the upcoming parent-teacher meeting.',
    time: '1h ago',
  },
  {
    id: '3',
    avatar: 'user-avatar-3',
    name: 'Michael Davis',
    message: 'has a fee payment overdue.',
    time: '3h ago',
  },
  {
    id: '4',
    avatar: 'user-avatar-4',
    name: 'Jessica Brown',
    message: 'requested leave for tomorrow.',
    time: '1d ago',
  },
];

export const RECENT_ACTIVITIES = [
  {
    id: '1',
    user: 'Mr. Alan',
    activity: 'Updated grades for Class 10A Science.',
    timestamp: '2024-05-21T10:30:00Z',
    status: 'Completed',
  },
  {
    id: '2',
    user: 'Admin',
    activity: 'Enrolled 5 new students.',
    timestamp: '2024-05-21T09:45:00Z',
    status: 'Completed',
  },
  {
    id: '3',
    user: 'Ms. Sarah',
    activity: 'Created a new assignment for English.',
    timestamp: '2024-05-20T15:00:00Z',
    status: 'In Progress',
  },
  {
    id: '4',
    user: 'Admin',
    activity: 'Sent out fee reminders.',
    timestamp: '2024-05-20T11:00:00Z',
    status: 'Completed',
  },
  {
    id: '5',
    user: 'Student Portal',
    activity: 'Liam Wilson submitted "History of Art" essay.',
    timestamp: '2024-05-19T20:15:00Z',
    status: 'Pending Review',
  },
];

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

export const RECENT_EXAM_RESULTS = [
  {
    id: '1',
    studentName: 'Liam Johnson',
    class: '10A',
    subject: 'Mathematics',
    score: '95/100',
    grade: 'A+',
  },
  {
    id: '2',
    studentName: 'Olivia Smith',
    class: '10A',
    subject: 'Science',
    score: '88/100',
    grade: 'A',
  },
  {
    id: '3',
    studentName: 'Noah Williams',
    class: '10B',
    subject: 'English',
    score: '76/100',
    grade: 'B',
  },
  {
    id: '4',
    studentName: 'Emma Brown',
    class: '10A',
    subject: 'Mathematics',
    score: '89/100',
    grade: 'A',
  },
  {
    id: '5',
    studentName: 'James Jones',
    class: '10C',
    subject: 'History',
    score: '65/100',
    grade: 'C',
  },
  {
    id: '6',
    studentName: 'Sophia Garcia',
    class: '10B',
    subject: 'Science',
    score: '92/100',
    grade: 'A+',
  },
];
