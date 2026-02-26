import type { ChartConfig } from '@/components/ui/chart';
import * as Icons from 'lucide-react';

export type Student = {
  id: string;
  name: string;
  class: string;
  parentName: string;
  mobile: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Inactive';
};

export type Fee = {
  studentId: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Due' | 'Overdue';
};

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
    value: 'Birr 250K',
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
}[] = [];

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

export const STUDENTS: Student[] = [
  {
    id: 'STU-001',
    name: 'Abebe Kebede',
    class: '10-A',
    parentName: 'Kebede Alemu',
    mobile: '+251 912 345 678',
    email: 'abebe.k@example.com',
    avatar: 'user-avatar-1',
    status: 'Active',
  },
  {
    id: 'STU-002',
    name: 'Birtukan Tadesse',
    class: '10-B',
    parentName: 'Tadesse Lemma',
    mobile: '+251 911 223 344',
    email: 'birtukan.t@example.com',
    avatar: 'user-avatar-2',
    status: 'Active',
  },
  {
    id: 'STU-003',
    name: 'Chala Dibaba',
    class: '11-A',
    parentName: 'Dibaba Kenenisa',
    mobile: '+251 922 556 677',
    email: 'chala.d@example.com',
    avatar: 'user-avatar-3',
    status: 'Inactive',
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
    name: 'Mr. Solomon',
    subject: 'Mathematics',
    mobile: '+251 911 111 222',
    email: 'solomon@example.com',
    avatar: 'user-avatar-6',
    status: 'Active',
  },
  {
    id: 'TCH-002',
    name: 'Ms. Genet',
    subject: 'Science',
    mobile: '+251 912 333 444',
    email: 'genet@example.com',
    avatar: 'user-avatar-7',
    status: 'Active',
  },
  {
    id: 'TCH-003',
    name: 'Mrs. Fatuma',
    subject: 'English',
    mobile: '+251 913 555 666',
    email: 'fatuma@example.com',
    avatar: 'user-avatar-8',
    status: 'Inactive',
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
    score: '92/100',
    grade: 'A',
  },
  {
    id: 'EXAM-002',
    studentId: 'STU-002',
    subject: 'Science',
    score: '85/100',
    grade: 'B+',
  },
  {
    id: 'EXAM-003',
    studentId: 'STU-001',
    subject: 'English',
    score: '88/100',
    grade: 'A-',
  },
    {
    id: 'EXAM-004',
    studentId: 'STU-003',
    subject: 'History',
    score: '76/100',
    grade: 'C+',
  },
  {
    id: 'EXAM-005',
    studentId: 'STU-002',
    subject: 'Mathematics',
    score: '95/100',
    grade: 'A+',
  },
];

export const FEES_DATA: Fee[] = STUDENTS.map((student, index) => ({
  studentId: student.id,
  amount: 1200,
  dueDate: '2024-08-15',
  status: index % 3 === 0 ? 'Paid' : (index % 3 === 1 ? 'Due' : 'Overdue'),
}));
