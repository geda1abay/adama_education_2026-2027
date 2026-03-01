import type { ChartConfig } from '@/components/ui/chart';
import * as Icons from 'lucide-react';

export type Student = {
  id: string;
  registrationId: string;
  name: string;
  class: string;
  parentName: string;
  mobile: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Inactive';
  password: string;
};

export type Teacher = {
  id: string;
  name: string;
  subject: string;
  classes: string[];
  mobile: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Inactive';
  password: string;
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

export const STUDENTS: Student[] = [];

export const TEACHERS: Teacher[] = [];

export const STUDENT_ATTENDANCE: {
  studentId: string;
  month: string;
  daysPresent: number;
  totalDays: number;
}[] = [];

export const RECENT_EXAM_RESULTS: {
  id: string;
  studentId: string;
  subject: string;
  score: string;
  grade: string;
}[] = [];

export const FEES_DATA: Fee[] = [];
