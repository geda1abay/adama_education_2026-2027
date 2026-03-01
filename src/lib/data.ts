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


// --- The following are for UI display and can be populated from Firestore data ---

export const MOCK_STAT_CARDS: {
  title: string;
  value: string;
  change: string;
  icon: keyof typeof Icons;
  href: string;
}[] = [];

export const ATTENDANCE_DATA: { month: string; attendance: number }[] = [];

export const ATTENDANCE_CHART_CONFIG = {
  attendance: {
    label: 'Attendance',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export const PERFORMANCE_DATA: { month: string; Math: number; Science: number; English: number }[] = [];

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
}[] = [];

// The following are now empty as data will come from Firestore
export const STUDENTS: Student[] = [];
export const TEACHERS: Teacher[] = [];
export const STUDENT_ATTENDANCE: Attendance[] = [];
export const RECENT_EXAM_RESULTS: ExamResult[] = [];
export const FEES_DATA: StudentFee[] = [];
