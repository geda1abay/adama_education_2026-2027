import type { ChartConfig } from '@/components/ui/chart';
import * as Icons from 'lucide-react';

// Matches /students/{studentId} schema in backend.json
export type Student = {
  id: string; // Document ID
  userId: string; // Auth UID
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  gender: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  enrollmentDate: string; // ISO date string
  gradeLevel: string;
  parentIds: string[];
};

// Matches /teachers/{teacherId} schema in backend.json
export type Teacher = {
  id: string; // Document ID
  userId: string; // Auth UID
  firstName: string;
  lastName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  hireDate: string; // ISO date string
  department: string;
  qualification: string;
  classes?: string[];
};

// Matches /students/{studentId}/studentFees/{studentFeeId}
export type StudentFee = {
  id: string;
  studentId: string;
  feeTypeId: string;
  amountDue: number;
  dueDate: string; // ISO date string
  academicYear: string;
  status: 'paid' | 'due' | 'overdue';
  description?: string;
};

// Matches /students/{studentId}/attendance/{attendanceId}
export type Attendance = {
  id: string;
  studentId: string;
  classSessionId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  recordedByTeacherId: string;
};

// Matches /students/{studentId}/examResults/{examResultId}
export type ExamResult = {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  score: number;
  maxScore: number;
  resultDate: string; // ISO date-time string
  comments?: string;
};

// Settings types
export type AdminProfile = {
  name: string;
  email: string;
}

export type SchoolInfo = {
    name: string;
    address: string;
    contact: string;
}

export type Appearance = {
    theme: string;
    darkMode: boolean;
}

export const STUDENTS: Student[] = [
  {
    id: 's1',
    userId: 's1',
    firstName: 'Lina',
    lastName: 'Ahmed',
    gradeLevel: '10-A',
    contactPhone: '+251 911 123 456',
    contactEmail: 'lina.ahmed@example.com',
    enrollmentDate: '2023-09-01T00:00:00.000Z',
    dateOfBirth: '2008-05-10T00:00:00.000Z',
    gender: 'Female',
    address: '123 Bole, Addis Ababa',
    parentIds: ['p1'],
  },
  {
    id: 's2',
    userId: 's2',
    firstName: 'Samuel',
    lastName: 'Taye',
    gradeLevel: '11-B',
    contactPhone: '+251 911 234 567',
    contactEmail: 'samuel.taye@example.com',
    enrollmentDate: '2022-09-01T00:00:00.000Z',
    dateOfBirth: '2007-03-15T00:00:00.000Z',
    gender: 'Male',
    address: '456 Cazanchis, Addis Ababa',
    parentIds: ['p2'],
  },
];

export const TEACHERS: Teacher[] = [
  {
    id: 't1',
    userId: 't1',
    firstName: 'Solomon',
    lastName: 'Abebe',
    contactEmail: 'solomon.abebe@example.com',
    department: 'Mathematics',
    contactPhone: '+251 922 111 222',
    hireDate: '2020-08-15T00:00:00.000Z',
    qualification: 'M.Sc. in Mathematics',
    address: '789 CMC, Addis Ababa',
    classes: ['10-A', '11-B'],
  },
  {
    id: 't2',
    userId: 't2',
    firstName: 'Fatuma',
    lastName: 'Hassan',
    contactEmail: 'fatuma.hassan@example.com',
    department: 'Science',
    contactPhone: '+251 922 333 444',
    hireDate: '2018-07-20T00:00:00.000Z',
    qualification: 'B.Ed. in Biology',
    address: '101 Sarbet, Addis Ababa',
    classes: ['10-A', '10-C'],
  },
];

export const STUDENT_ATTENDANCE: Attendance[] = [
    { id: 'att1', studentId: 's1', classSessionId: 'cs1', status: 'present', recordedByTeacherId: 't1' },
    { id: 'att2', studentId: 's1', classSessionId: 'cs2', status: 'present', recordedByTeacherId: 't1' },
    { id: 'att3', studentId: 's1', classSessionId: 'cs3', status: 'late', recordedByTeacherId: 't2' },
    { id: 'att4', studentId: 's2', classSessionId: 'cs4', status: 'present', recordedByTeacherId: 't1' },
    { id: 'att5', studentId: 's2', classSessionId: 'cs5', status: 'absent', recordedByTeacherId: 't1' },
];

export const RECENT_EXAM_RESULTS: ExamResult[] = [
  { id: 'er1', examId: 'mid-math', studentId: 's1', subjectId: 'Mathematics', score: 88, maxScore: 100, resultDate: '2024-05-15T10:00:00Z' },
  { id: 'er2', examId: 'mid-sci', studentId: 's1', subjectId: 'Science', score: 92, maxScore: 100, resultDate: '2024-05-16T11:00:00Z' },
  { id: 'er3', examId: 'mid-math', studentId: 's2', subjectId: 'Mathematics', score: 75, maxScore: 100, resultDate: '2024-05-15T10:00:00Z' },
  { id: 'er4', examId: 'mid-sci', studentId: 's2', subjectId: 'Science', score: 81, maxScore: 100, resultDate: '2024-05-16T11:00:00Z' },
];

export const FEES_DATA: StudentFee[] = [
  { id: 'fee1', studentId: 's1', feeTypeId: 'tuition', amountDue: 15000, dueDate: '2024-09-30', academicYear: '2024-2025', status: 'paid' },
  { id: 'fee2', studentId: 's2', feeTypeId: 'tuition', amountDue: 18000, dueDate: '2024-09-30', academicYear: '2024-2025', status: 'due' },
  { id: 'fee3', studentId: 's1', feeTypeId: 'sports', amountDue: 2000, dueDate: '2024-10-15', academicYear: '2024-2025', status: 'due' },
  { id: 'fee4', studentId: 's2', feeTypeId: 'library', amountDue: 500, dueDate: '2024-05-30', academicYear: '2023-2024', status: 'overdue' },
];

export const MOCK_STAT_CARDS: {
  title: string;
  value: string;
  change: string;
  icon: keyof typeof Icons;
  href: string;
}[] = [
  {
    title: 'Total Students',
    value: '245',
    change: '+12',
    icon: 'Users',
    href: '/dashboard/students',
  },
  {
    title: 'Total Teachers',
    value: '22',
    change: '+2',
    icon: 'GraduationCap',
    href: '/dashboard/teachers',
  },
  {
    title: 'Fees Collected',
    value: 'Birr 1.2M',
    change: '+5.2%',
    icon: 'DollarSign',
    href: '/dashboard/fees',
  },
  {
    title: 'Average Attendance',
    value: '96.3%',
    change: '-0.5%',
    icon: 'ClipboardCheck',
    href: '/dashboard/attendance',
  },
];

export const ATTENDANCE_DATA = [
  { month: 'January', attendance: Math.floor(Math.random() * 10) + 90 },
  { month: 'February', attendance: Math.floor(Math.random() * 10) + 90 },
  { month: 'March', attendance: Math.floor(Math.random() * 10) + 88 },
  { month: 'April', attendance: Math.floor(Math.random() * 10) + 90 },
  { month: 'May', attendance: Math.floor(Math.random() * 10) + 92 },
  { month: 'June', attendance: Math.floor(Math.random() * 10) + 95 },
];

export const ATTENDANCE_CHART_CONFIG = {
  attendance: {
    label: 'Attendance',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export const PERFORMANCE_DATA = [
  { month: 'Jan', Math: 85, Science: 88, English: 90 },
  { month: 'Feb', Math: 86, Science: 89, English: 91 },
  { month: 'Mar', Math: 84, Science: 87, English: 89 },
  { month: 'Apr', Math: 88, Science: 90, English: 92 },
  { month: 'May', Math: 90, Science: 92, English: 94 },
  { month: 'Jun', Math: 91, Science: 93, English: 95 },
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
    name: 'Abebech',
    message: 'submitted their Math assignment.',
    time: '5 min ago',
  },
  {
    id: '2',
    avatar: 'user-avatar-2',
    name: 'Mr. Solomon',
    message: 'posted a new announcement for Grade 10.',
    time: '2 hours ago',
  },
  {
    id: '3',
    avatar: 'user-avatar-3',
    name: 'System',
    message: 'Parent-Teacher meetings are scheduled for next week.',
    time: '1 day ago',
  },
];

export const RECENT_ACTIVITIES = [
  { id: '1', user: 'Admin', activity: 'Updated school settings', timestamp: '2024-05-20 10:00 AM', status: 'Completed' },
  { id: '2', user: 'Mr. Solomon', activity: 'Graded Midterm Exams', timestamp: '2024-05-20 09:30 AM', status: 'In Progress' },
  { id: '3', user: 'Admin', activity: 'Added a new student', timestamp: '2024-05-19 03:00 PM', status: 'Completed' },
  { id: '4', user: 'Ms. Fatuma', activity: 'Submitted attendance for Grade 10-C', timestamp: '2024-05-19 09:00 AM', status: 'Pending Review' },
];

export const EXAM_STAT_CARDS = [
  {
    title: 'Average Score',
    value: '88%',
    change: '+2.1%',
    icon: 'Target' as keyof typeof Icons,
  },
  {
    title: 'Top Performer',
    value: 'Lina Ahmed',
    change: '95% Avg',
    icon: 'Award' as keyof typeof Icons,
  },
  {
    title: 'Exams Graded',
    value: '12/15',
    change: '3 pending',
    icon: 'FileCheck' as keyof typeof Icons,
  },
  {
    title: 'Lowest Score',
    value: '65%',
    change: 'Science Final',
    icon: 'TrendingDown' as keyof typeof Icons,
  },
];
