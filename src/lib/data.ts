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
  // Denormalized fields for security rules
  studentUserId: string;
  gradedByTeacherUserId: string;
  parentUserIds?: string[];
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
// This data is used for seeding the database.

export const SEED_STUDENTS: Student[] = [];

export const SEED_TEACHERS: Teacher[] = [];

export const SEED_FEES: StudentFee[] = [];

export const SEED_ATTENDANCE: Attendance[] = [];

export const SEED_EXAM_RESULTS: ExamResult[] = [];


export const ATTENDANCE_DATA = [
  { month: 'January', attendance: 0 },
  { month: 'February', attendance: 0 },
  { month: 'March', attendance: 0 },
  { month: 'April', attendance: 0 },
  { month: 'May', attendance: 0 },
  { month: 'June', attendance: 0 },
];

export const ATTENDANCE_CHART_CONFIG = {
  attendance: {
    label: 'Attendance',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export const PERFORMANCE_DATA = [
  { month: 'Jan', Math: 0, Science: 0, English: 0 },
  { month: 'Feb', Math: 0, Science: 0, English: 0 },
  { month: 'Mar', Math: 0, Science: 0, English: 0 },
  { month: 'Apr', Math: 0, Science: 0, English: 0 },
  { month: 'May', Math: 0, Science: 0, English: 0 },
  { month: 'Jun', Math: 0, Science: 0, English: 0 },
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

export const NOTIFICATIONS: {id: string, avatar: string, name: string, message: string, time: string}[] = [];

export const RECENT_ACTIVITIES: {id: string, user: string, activity: string, timestamp: string, status: string}[] = [];

export const EXAM_STAT_CARDS = [
  {
    title: 'Average Score',
    value: '0%',
    change: '+0%',
    icon: 'Target' as keyof typeof Icons,
  },
  {
    title: 'Top Performer',
    value: 'N/A',
    change: '0% Avg',
    icon: 'Award' as keyof typeof Icons,
  },
  {
    title: 'Exams Graded',
    value: '0/0',
    change: '0 pending',
    icon: 'FileCheck' as keyof typeof Icons,
  },
  {
    title: 'Lowest Score',
    value: '0%',
    change: 'N/A',
    icon: 'TrendingDown' as keyof typeof Icons,
  },
];
