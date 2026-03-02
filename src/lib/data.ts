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
  classSessionId: string; // You may want a proper classes collection
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

// --- Mock Data Section ---
// This data is used for UI development and placeholders.
// In a real application, this would be replaced by data from a database.

export const STUDENTS: Student[] = [];
export const TEACHERS: Teacher[] = [];
export const STUDENT_ATTENDANCE: Attendance[] = [];
export const RECENT_EXAM_RESULTS: ExamResult[] = [];
export const FEES_DATA: StudentFee[] = [];


export const ATTENDANCE_DATA = [
  { month: 'January', attendance: 95 },
  { month: 'February', attendance: 96 },
  { month: 'March', attendance: 94 },
  { month: 'April', attendance: 97 },
  { month: 'May', attendance: 98 },
  { month: 'June', attendance: 99 },
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
