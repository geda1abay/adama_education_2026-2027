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

export const SEED_STUDENTS: Student[] = [
  {
    id: 'student-1',
    userId: 'student-1',
    firstName: 'Lina',
    lastName: 'Ahmed',
    contactEmail: 'lina.ahmed@example.com',
    contactPhone: '+251 911 111 111',
    gradeLevel: '10-A',
    enrollmentDate: '2023-09-01T00:00:00.000Z',
    dateOfBirth: '2008-05-10T00:00:00.000Z',
    gender: 'Female',
    address: '123 Bole, Addis Ababa',
    parentIds: [],
  },
  {
    id: 'student-2',
    userId: 'student-2',
    firstName: 'Biniam',
    lastName: 'Assefa',
    contactEmail: 'biniam.assefa@example.com',
    contactPhone: '+251 911 222 222',
    gradeLevel: '11-B',
    enrollmentDate: '2022-09-01T00:00:00.000Z',
    dateOfBirth: '2007-03-15T00:00:00.000Z',
    gender: 'Male',
    address: '456 Cazanchis, Addis Ababa',
    parentIds: [],
  },
];

export const SEED_TEACHERS: Teacher[] = [
  {
    id: 'teacher-1',
    userId: 'teacher-1',
    firstName: 'Solomon',
    lastName: 'Taye',
    contactEmail: 'solomon.taye@example.com',
    contactPhone: '+251 922 111 222',
    department: 'Mathematics',
    hireDate: '2020-08-15T00:00:00.000Z',
    qualification: 'M.Sc. in Mathematics',
    address: '789 CMC, Addis Ababa',
    classes: ['10-A', '11-B'],
  },
  {
    id: 'teacher-2',
    userId: 'teacher-2',
    firstName: 'Fatuma',
    lastName: 'Hassan',
    contactEmail: 'fatuma.hassan@example.com',
    contactPhone: '+251 922 333 444',
    department: 'Science',
    hireDate: '2019-07-20T00:00:00.000Z',
    qualification: 'B.Sc. in Biology',
    address: '101 Summit, Addis Ababa',
    classes: ['10-C', '11-A'],
  },
];

export const SEED_FEES: StudentFee[] = [
    { id: 'fee-1', studentId: 'student-1', feeTypeId: 'tuition', amountDue: 12000, dueDate: '2024-09-30', academicYear: '2024-2025', status: 'paid' },
    { id: 'fee-2', studentId: 'student-2', feeTypeId: 'tuition', amountDue: 3000, dueDate: '2024-09-30', academicYear: '2024-2025', status: 'due' },
];

export const SEED_ATTENDANCE: Attendance[] = [
    { id: 'att-1', studentId: 'student-1', classSessionId: 'math-101-20240520', status: 'present', recordedByTeacherId: 'teacher-1'},
    { id: 'att-2', studentId: 'student-2', classSessionId: 'sci-101-20240520', status: 'present', recordedByTeacherId: 'teacher-2'},
    { id: 'att-3', studentId: 'student-1', classSessionId: 'math-101-20240521', status: 'present', recordedByTeacherId: 'teacher-1'},
    { id: 'att-4', studentId: 'student-2', classSessionId: 'sci-101-20240521', status: 'absent', recordedByTeacherId: 'teacher-2'},
    { id: 'att-5', studentId: 'student-2', classSessionId: 'sci-101-20240522', status: 'present', recordedByTeacherId: 'teacher-2'},
];

export const SEED_EXAM_RESULTS: ExamResult[] = [
    { id: 'res-1', examId: 'math-midterm', studentId: 'student-1', subjectId: 'Mathematics', score: 95, maxScore: 100, resultDate: new Date().toISOString(), studentUserId: 'student-1', gradedByTeacherUserId: 'teacher-1' },
    { id: 'res-2', examId: 'science-midterm', studentId: 'student-1', subjectId: 'Science', score: 88, maxScore: 100, resultDate: new Date().toISOString(), studentUserId: 'student-1', gradedByTeacherUserId: 'teacher-2' },
    { id: 'res-3', examId: 'math-midterm', studentId: 'student-2', subjectId: 'Mathematics', score: 82, maxScore: 100, resultDate: new Date().toISOString(), studentUserId: 'student-2', gradedByTeacherUserId: 'teacher-1' },
    { id: 'res-4', examId: 'science-midterm', studentId: 'student-2', subjectId: 'Science', score: 75, maxScore: 100, resultDate: new Date().toISOString(), studentUserId: 'student-2', gradedByTeacherUserId: 'teacher-2' },
];


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
