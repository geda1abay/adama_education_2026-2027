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

export const NOTIFICATIONS: {
  id: string;
  avatar: string;
  name: string;
  message: string;
  time: string;
}[] = [
  {
    id: '1',
    avatar: 'user-avatar-1',
    name: 'John Doe',
    message: 'submitted a new assignment for review.',
    time: '5 min ago',
  },
  {
    id: '2',
    avatar: 'user-avatar-2',
    name: 'Jane Smith',
    message: 'has a fee payment overdue.',
    time: '1 hour ago',
  },
  {
    id: '3',
    avatar: 'user-avatar-3',
    name: 'Alex Johnson',
    message: 'is absent today.',
    time: '3 hours ago',
  },
];

export const RECENT_ACTIVITIES: {
  id: string;
  user: string;
  activity: string;
  timestamp: string;
  status: string;
}[] = [
  {
    id: '1',
    user: 'Mr. Anderson',
    activity: 'Graded "The Great Gatsby" essays',
    timestamp: '2024-07-30T10:00:00Z',
    status: 'Completed',
  },
  {
    id: '2',
    user: 'Admin',
    activity: 'Updated school event calendar',
    timestamp: '2024-07-30T09:30:00Z',
    status: 'Completed',
  },
  {
    id: '3',
    user: 'Ms. Davis',
    activity: 'Posted a new announcement',
    timestamp: '2024-07-30T08:45:00Z',
    status: 'In Progress',
  },
  {
    id: '4',
    user: 'System',
    activity: 'Generated weekly attendance report',
    timestamp: '2024-07-30T08:00:00Z',
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

export const RECENT_EXAM_RESULTS: {
  id: string;
  studentName: string;
  class: string;
  subject: string;
  score: string;
  grade: string;
}[] = [
  {
    id: '1',
    studentName: 'Michael Brown',
    class: '10-A',
    subject: 'Mathematics',
    score: '95/100',
    grade: 'A+',
  },
  {
    id: '2',
    studentName: 'Jessica Green',
    class: '10-B',
    subject: 'Science',
    score: '88/100',
    grade: 'A',
  },
  {
    id: '3',
    studentName: 'David Wilson',
    class: '10-A',
    subject: 'History',
    score: '76/100',
    grade: 'B',
  },
  {
    id: '4',
    studentName: 'Sarah Miller',
    class: '10-C',
    subject: 'English',
    score: '92/100',
    grade: 'A',
  },
];

export const STUDENTS: {
  id: string;
  name: string;
  class: string;
  parentName: string;
  mobile: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Inactive';
}[] = [
  {
    id: 'STU-001',
    name: 'Olivia Martin',
    class: '10-A',
    parentName: 'Liam Martin',
    mobile: '+1 123 456 7890',
    email: 'olivia.martin@example.com',
    avatar: 'user-avatar-1',
    status: 'Active',
  },
  {
    id: 'STU-002',
    name: 'Jackson Lee',
    class: '10-B',
    parentName: 'Noah Lee',
    mobile: '+1 234 567 8901',
    email: 'jackson.lee@example.com',
    avatar: 'user-avatar-2',
    status: 'Active',
  },
  {
    id: 'STU-003',
    name: 'Sophia Williams',
    class: '11-A',
    parentName: 'Ava Williams',
    mobile: '+1 345 678 9012',
    email: 'sophia.williams@example.com',
    avatar: 'user-avatar-3',
    status: 'Inactive',
  },
  {
    id: 'STU-004',
    name: 'Ethan Garcia',
    class: '11-C',
    parentName: 'Mia Garcia',
    mobile: '+1 456 789 0123',
    email: 'ethan.garcia@example.com',
    avatar: 'user-avatar-4',
    status: 'Active',
  },
  {
    id: 'STU-005',
    name: 'Isabella Rodriguez',
    class: '12-B',
    parentName: 'Evelyn Rodriguez',
    mobile: '+1 567 890 1234',
    email: 'isabella.rodriguez@example.com',
    avatar: 'user-avatar-5',
    status: 'Active',
  },
];
