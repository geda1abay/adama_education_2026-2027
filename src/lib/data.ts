import type { ChartConfig } from '@/components/ui/chart';
import * as Icons from 'lucide-react';

export const MOCK_STAT_CARDS: {
  title: string;
  value: string;
  change: string;
  icon: keyof typeof Icons;
  href: string;
}[] = [
  {
    title: 'Total Students (up to now)',
    value: '5',
    change: '+15.2%',
    icon: 'Users',
    href: '/dashboard/students',
  },
  {
    title: 'Total Teachers (up to now)',
    value: '5',
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
  {
    id: 'STU-006',
    name: 'Liam Brown',
    class: '10-A',
    parentName: 'James Brown',
    mobile: '+1 678 901 2345',
    email: 'liam.brown@example.com',
    avatar: 'user-avatar-1',
    status: 'Active',
  },
  {
    id: 'STU-007',
    name: 'Emma Jones',
    class: '12-A',
    parentName: 'David Jones',
    mobile: '+1 789 012 3456',
    email: 'emma.jones@example.com',
    avatar: 'user-avatar-2',
    status: 'Active',
  },
];

export const TEACHERS: {
  id: string;
  name: string;
  subject: string;
  mobile: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Inactive';
}[] = [
  {
    id: 'TCH-001',
    name: 'Mr. Anderson',
    subject: 'Mathematics',
    mobile: '+1 111 222 3333',
    email: 'mr.anderson@example.com',
    avatar: 'user-avatar-6',
    status: 'Active',
  },
  {
    id: 'TCH-002',
    name: 'Ms. Davis',
    subject: 'Science',
    mobile: '+1 222 333 4444',
    email: 'ms.davis@example.com',
    avatar: 'user-avatar-7',
    status: 'Active',
  },
  {
    id: 'TCH-003',
    name: 'Mrs. Wilson',
    subject: 'English',
    mobile: '+1 333 444 5555',
    email: 'mrs.wilson@example.com',
    avatar: 'user-avatar-8',
    status: 'Active',
  },
  {
    id: 'TCH-004',
    name: 'Mr. Taylor',
    subject: 'History',
    mobile: '+1 444 555 6666',
    email: 'mr.taylor@example.com',
    avatar: 'user-avatar-1',
    status: 'Inactive',
  },
  {
    id: 'TCH-005',
    name: 'Ms. Brown',
    subject: 'Mathematics',
    mobile: '+1 555 666 7777',
    email: 'ms.brown@example.com',
    avatar: 'user-avatar-2',
    status: 'Active',
  },
];

const generateYearlyAttendance = (studentId: string) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months.map((month, monthIndex) => {
    const studentIdNum = parseInt(studentId.split('-')[1]);
    // Make the data generation deterministic
    const daysPresent = 18 + ((studentIdNum + monthIndex) % 5); 
    return {
      studentId,
      month,
      daysPresent,
      totalDays: 22,
    };
  });
};

export const STUDENT_ATTENDANCE = STUDENTS.flatMap(student => generateYearlyAttendance(student.id));

export const RECENT_EXAM_RESULTS: {
  id: string;
  studentId: string;
  subject: string;
  score: string;
  grade: string;
}[] = [
  {
    id: 'EXAM-001',
    studentId: 'STU-001',
    subject: 'Mathematics',
    score: '95/100',
    grade: 'A+',
  },
  {
    id: 'EXAM-002',
    studentId: 'STU-002',
    subject: 'Science',
    score: '88/100',
    grade: 'A',
  },
  {
    id: 'EXAM-003',
    studentId: 'STU-004',
    subject: 'History',
    score: '76/100',
    grade: 'B',
  },
  {
    id: 'EXAM-005',
    studentId: 'STU-005',
    subject: 'English',
    score: '92/100',
    grade: 'A',
  },
  {
    id: 'EXAM-006',
    studentId: 'STU-006',
    subject: 'Mathematics',
    score: '81/100',
    grade: 'B+',
  },
  {
    id: 'EXAM-007',
    studentId: 'STU-007',
    subject: 'Science',
    score: '98/100',
    grade: 'A+',
  },
];

export const FEES_DATA: {
  studentId: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Due' | 'Overdue';
}[] = STUDENTS.map((student, index) => ({
  studentId: student.id,
  amount: 1200,
  dueDate: '2024-08-15',
  status: index % 3 === 0 ? 'Paid' : (index % 3 === 1 ? 'Due' : 'Overdue'),
}));
