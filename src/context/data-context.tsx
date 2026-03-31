'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useToast } from '@/hooks/use-toast';
import type {
  AdminProfile,
  Appearance,
  Attendance,
  ExamResult,
  SchoolInfo,
  Student,
  StudentFee,
  Teacher,
} from '@/lib/data';

type WithId<T> = T & { id: string };
type UserRole = 'admin' | 'student' | 'teacher';

type Snapshot = {
  students: WithId<Student>[];
  teachers: WithId<Teacher>[];
  studentAttendance: WithId<Attendance>[];
  recentExamResults: WithId<ExamResult>[];
  feesData: WithId<StudentFee>[];
  adminProfile: WithId<AdminProfile> | null;
  schoolInfo: WithId<SchoolInfo> | null;
  appearance: WithId<Appearance> | null;
};

type SessionUser = {
  uid: string;
  email: string;
  role: UserRole;
  linkedId: string | null;
  name: string;
};

interface DataContextType {
  students: WithId<Student>[] | null;
  teachers: WithId<Teacher>[] | null;
  studentAttendance: WithId<Attendance>[] | null;
  recentExamResults: WithId<ExamResult>[] | null;
  feesData: WithId<StudentFee>[] | null;
  isLoading: boolean;
  isUserLoading: boolean;
  isRoleLoading: boolean;
  sessionUser: SessionUser | null;
  userRole: UserRole | null;
  isAdmin: boolean;
  currentStudent: WithId<Student> | null;
  currentTeacher: WithId<Teacher> | null;
  adminProfile: WithId<AdminProfile> | null;
  schoolInfo: WithId<SchoolInfo> | null;
  appearance: WithId<Appearance> | null;
  adminLogin: (email: string, password: string) => Promise<string | null>;
  loginStudent: (email: string, password: string) => Promise<string | null>;
  loginTeacher: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  addStudent: (studentData: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    parentPhone: string;
    enrollmentDate: string;
    gradeLevel: string;
    password?: string;
  }) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  addTeacher: (teacherData: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    department: string;
    classes?: string;
    password?: string;
  }) => Promise<void>;
  deleteTeacher: (teacherId: string) => Promise<void>;
  resetStudentPassword: (studentId: string, password: string) => Promise<void>;
  resetTeacherPassword: (teacherId: string, password: string) => Promise<void>;
  addAttendance: (attendanceData: Omit<Attendance, 'id' | 'recordedByTeacherName'>) => Promise<void>;
  addExamResult: (examResultData: {
    studentName: string;
    subjectName: string;
    score: number;
    maxScore: number;
  }) => Promise<void>;
  addFee: (feeData: Omit<StudentFee, 'id'>) => Promise<void>;
  importStudents: (newStudents: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    contactEmail: string;
    contactPhone: string;
    parentPhone?: string;
    enrollmentDate?: string;
    gradeLevel: string;
    password?: string;
  }[]) => Promise<void>;
  importTeachers: (newTeachers: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    contactEmail: string;
    contactPhone: string;
    department: string;
    classes?: string;
    password?: string;
  }[]) => Promise<void>;
  clearStudentsByClass: (gradeLevel: string) => Promise<void>;
  updateAdminProfile: (data: Partial<AdminProfile>) => void;
  updateSchoolInfo: (data: Partial<SchoolInfo>) => void;
  setTheme: (theme: string) => void;
  toggleDarkMode: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
const SESSION_STORAGE_KEY = 'school-dashboard-session';

const EMPTY_SNAPSHOT: Snapshot = {
  students: [],
  teachers: [],
  studentAttendance: [],
  recentExamResults: [],
  feesData: [],
  adminProfile: null,
  schoolInfo: null,
  appearance: null,
};

async function parseResponse<T>(response: Response) {
  const body = await response.json();
  if (!response.ok) {
    throw new Error((body as { error?: string }).error || 'Request failed.');
  }

  return body as T;
}

function getStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as SessionUser;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY_SNAPSHOT);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentStudent, setCurrentStudent] = useState<WithId<Student> | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<WithId<Teacher> | null>(null);

  const hydrateSession = useCallback((nextSnapshot: Snapshot, nextSession: SessionUser | null) => {
    setSessionUser(nextSession);
    setUserRole(nextSession?.role || null);

    if (!nextSession) {
      setCurrentStudent(null);
      setCurrentTeacher(null);
      return;
    }

    if (nextSession.role === 'student') {
      setCurrentStudent(
        nextSnapshot.students.find((student) => student.id === nextSession.linkedId) || null
      );
      setCurrentTeacher(null);
      return;
    }

    if (nextSession.role === 'teacher') {
      setCurrentTeacher(
        nextSnapshot.teachers.find((teacher) => teacher.id === nextSession.linkedId) || null
      );
      setCurrentStudent(null);
      return;
    }

    setCurrentStudent(null);
    setCurrentTeacher(null);
  }, []);

  const refreshSnapshot = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextSnapshot = await parseResponse<Snapshot>(await fetch('/api/bootstrap', { cache: 'no-store' }));
      setSnapshot(nextSnapshot);
      hydrateSession(nextSnapshot, getStoredSession());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load MySQL data.';
      toast({ variant: 'destructive', title: 'Database Error', description: message });
    } finally {
      setIsLoading(false);
    }
  }, [hydrateSession, toast]);

  useEffect(() => {
    void refreshSnapshot();
  }, [refreshSnapshot]);

  useEffect(() => {
    if (typeof window !== 'undefined' && snapshot.appearance) {
      document.documentElement.classList.toggle('dark', snapshot.appearance.darkMode);
      document.documentElement.style.setProperty('--primary', snapshot.appearance.theme);
    }
  }, [snapshot.appearance]);

  const login = useCallback(
    async (email: string, password: string, role: UserRole) => {
      setIsLoading(true);
      try {
        const result = await parseResponse<{ user: SessionUser }>(
          await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role }),
          })
        );

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(result.user));
        }

        const nextSnapshot = await parseResponse<Snapshot>(await fetch('/api/bootstrap', { cache: 'no-store' }));
        setSnapshot(nextSnapshot);
        hydrateSession(nextSnapshot, result.user);
        return null;
      } catch (error) {
        return error instanceof Error ? error.message : 'Login failed.';
      } finally {
        setIsLoading(false);
      }
    },
    [hydrateSession]
  );

  const mutate = useCallback(
    async (action: string, payload: unknown, successTitle: string) => {
      setIsLoading(true);
      try {
        const nextSnapshot = await parseResponse<Snapshot>(
          await fetch('/api/mutate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action,
              payload,
              actorId: sessionUser?.uid || 'admin-user',
            }),
          })
        );

        setSnapshot(nextSnapshot);
        hydrateSession(nextSnapshot, sessionUser);
        toast({ title: successTitle });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Database update failed.';
        toast({ variant: 'destructive', title: 'Database Error', description: message });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [hydrateSession, sessionUser, toast]
  );

  const adminLogin = useCallback((email: string, password: string) => login(email, password, 'admin'), [login]);
  const loginStudent = useCallback((email: string, password: string) => login(email, password, 'student'), [login]);
  const loginTeacher = useCallback((email: string, password: string) => login(email, password, 'teacher'), [login]);

  const logout = useCallback(async () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    hydrateSession(snapshot, null);
  }, [hydrateSession, snapshot]);

  const addStudent = useCallback(async (data: DataContextType['addStudent'] extends (arg: infer T) => Promise<void> ? T : never) => {
    await mutate('addStudent', data, 'Student Added');
  }, [mutate]);

  const deleteStudent = useCallback(async (studentId: string) => {
    await mutate('deleteStudent', { studentId }, 'Student Deleted');
  }, [mutate]);

  const addTeacher = useCallback(async (data: DataContextType['addTeacher'] extends (arg: infer T) => Promise<void> ? T : never) => {
    await mutate('addTeacher', data, 'Teacher Added');
  }, [mutate]);

  const deleteTeacher = useCallback(async (teacherId: string) => {
    await mutate('deleteTeacher', { teacherId }, 'Teacher Deleted');
  }, [mutate]);

  const resetStudentPassword = useCallback(async (studentId: string, password: string) => {
    await mutate('resetStudentPassword', { studentId, password }, 'Student Password Reset');
  }, [mutate]);

  const resetTeacherPassword = useCallback(async (teacherId: string, password: string) => {
    await mutate('resetTeacherPassword', { teacherId, password }, 'Teacher Password Reset');
  }, [mutate]);

  const addAttendance = useCallback(async (data: Omit<Attendance, 'id' | 'recordedByTeacherName'>) => {
    await mutate('addAttendance', data, 'Attendance Added');
  }, [mutate]);

  const addExamResult = useCallback(async (data: DataContextType['addExamResult'] extends (arg: infer T) => Promise<void> ? T : never) => {
    await mutate('addExamResult', data, 'Exam Result Added');
  }, [mutate]);

  const addFee = useCallback(async (data: Omit<StudentFee, 'id'>) => {
    await mutate('addFee', data, 'Fee Record Added');
  }, [mutate]);

  const importStudents = useCallback(async (students: DataContextType['importStudents'] extends (arg: infer T) => Promise<void> ? T : never) => {
    await mutate('importStudents', { students }, `${students.length} students imported successfully.`);
  }, [mutate]);

  const importTeachers = useCallback(async (teachers: DataContextType['importTeachers'] extends (arg: infer T) => Promise<void> ? T : never) => {
    await mutate('importTeachers', { teachers }, `${teachers.length} teachers imported successfully.`);
  }, [mutate]);

  const clearStudentsByClass = useCallback(async (gradeLevel: string) => {
    await mutate('clearStudentsByClass', { gradeLevel }, `Cleared students from ${gradeLevel}.`);
  }, [mutate]);

  const updateAdminProfile = useCallback((data: Partial<AdminProfile>) => {
    void mutate('updateAdminProfile', data, 'Profile Updated');
  }, [mutate]);

  const updateSchoolInfo = useCallback((data: Partial<SchoolInfo>) => {
    void mutate('updateSchoolInfo', data, 'School Info Updated');
  }, [mutate]);

  const setTheme = useCallback((theme: string) => {
    void mutate('updateAppearance', { theme }, 'Theme Updated');
  }, [mutate]);

  const toggleDarkMode = useCallback(() => {
    void mutate('updateAppearance', { darkMode: !snapshot.appearance?.darkMode }, 'Appearance Updated');
  }, [mutate, snapshot.appearance?.darkMode]);

  const value = useMemo<DataContextType>(() => ({
    students: snapshot.students,
    teachers: snapshot.teachers,
    studentAttendance: snapshot.studentAttendance,
    recentExamResults: snapshot.recentExamResults,
    feesData: snapshot.feesData,
    isLoading,
    isUserLoading: isLoading,
    isRoleLoading: isLoading,
    sessionUser,
    userRole,
    isAdmin: userRole === 'admin',
    currentStudent,
    currentTeacher,
    adminProfile: snapshot.adminProfile,
    schoolInfo: snapshot.schoolInfo,
    appearance: snapshot.appearance,
    adminLogin,
    loginStudent,
    loginTeacher,
    logout,
    addStudent,
    deleteStudent,
    addTeacher,
    deleteTeacher,
    resetStudentPassword,
    resetTeacherPassword,
    addAttendance,
    addExamResult,
    addFee,
    importStudents,
    importTeachers,
    clearStudentsByClass,
    updateAdminProfile,
    updateSchoolInfo,
    setTheme,
    toggleDarkMode,
  }), [
    addAttendance,
    addExamResult,
    addFee,
    addStudent,
    addTeacher,
    adminLogin,
    clearStudentsByClass,
    currentStudent,
    currentTeacher,
    deleteStudent,
    deleteTeacher,
    resetStudentPassword,
    resetTeacherPassword,
    importStudents,
    importTeachers,
    isLoading,
    loginStudent,
    loginTeacher,
    logout,
    sessionUser,
    setTheme,
    snapshot.adminProfile,
    snapshot.appearance,
    snapshot.feesData,
    snapshot.recentExamResults,
    snapshot.schoolInfo,
    snapshot.studentAttendance,
    snapshot.students,
    snapshot.teachers,
    toggleDarkMode,
    updateAdminProfile,
    updateSchoolInfo,
    userRole,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
