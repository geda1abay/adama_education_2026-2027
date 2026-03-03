'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useToast } from '@/hooks/use-toast';
import type {
  Student,
  Teacher,
  StudentFee,
  Attendance,
  ExamResult,
  AdminProfile,
  SchoolInfo,
  Appearance,
} from '@/lib/data';
import { SEED_STUDENTS, SEED_TEACHERS, SEED_FEES, SEED_ATTENDANCE, SEED_EXAM_RESULTS } from '@/lib/data';

// This is a simple ID generator for mock data since we can't use external libraries like uuid.
const generateId = () => Math.random().toString(36).substring(2, 11);


type WithId<T> = T & { id: string };

interface DataContextType {
  // Data
  students: WithId<Student>[] | null;
  teachers: WithId<Teacher>[] | null;
  studentAttendance: WithId<Attendance>[] | null;
  recentExamResults: WithId<ExamResult>[] | null;
  feesData: WithId<StudentFee>[] | null;

  // Loading states
  isLoading: boolean;
  isUserLoading: boolean;
  isRoleLoading: boolean;

  // Auth & Role
  firebaseUser: any | null; // Keep for compatibility, but will be a mock object
  userRole: 'admin' | 'student' | 'teacher' | null;
  isAdmin: boolean;
  currentStudent: WithId<Student> | null;
  currentTeacher: WithId<Teacher> | null;

  // Settings
  adminProfile: WithId<AdminProfile> | null;
  schoolInfo: WithId<SchoolInfo> | null;
  appearance: WithId<Appearance> | null;

  // Functions
  adminLogin: (email: string, password: string) => Promise<string | null>;
  loginStudent: (email: string, password: string) => Promise<string | null>;
  loginTeacher: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;

  addStudent: (
    studentData: Omit<
      Student,
      'id' | 'userId' | 'parentIds' | 'enrollmentDate' | 'dateOfBirth' | 'gender' | 'address'
    > & { password?: string }
  ) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  addTeacher: (
    teacherData: Omit<
      Teacher,
      'id' | 'userId' | 'hireDate' | 'qualification' | 'address'
    > & { classes?: string; password?: string }
  ) => Promise<void>;
  deleteTeacher: (teacherId: string) => Promise<void>;
  addAttendance: (
    attendanceData: Omit<Attendance, 'id'>
  ) => Promise<void>;
  addExamResult: (
    examResultData: Omit<ExamResult, 'id'>
  ) => Promise<void>;
  addFee: (feeData: Omit<StudentFee, 'id'>) => Promise<void>;

  updateAdminProfile: (data: Partial<AdminProfile>) => void;
  updateSchoolInfo: (data: Partial<SchoolInfo>) => void;
  setTheme: (theme: string) => void;
  toggleDarkMode: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// In-memory store for mock users to simulate a user database
const MOCK_USERS: { [email: string]: any } = {
    'gedaabay@gmail.com': { password: '151835', role: 'admin', profile: { name: 'Geda Abay', email: 'gedaabay@gmail.com' } },
    'lina.ahmed@example.com': { password: 'password', role: 'student', id: 'student-1' },
    'biniam.assefa@example.com': { password: 'password', role: 'student', id: 'student-2' },
    'solomon.taye@example.com': { password: 'password', role: 'teacher', id: 'teacher-1' },
    'fatuma.hassan@example.com': { password: 'password', role: 'teacher', id: 'teacher-2' },
};

export function DataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Local state for data
  const [students, setStudents] = useState<WithId<Student>[]>(SEED_STUDENTS);
  const [teachers, setTeachers] = useState<WithId<Teacher>[]>(SEED_TEACHERS);
  const [feesData, setFeesData] = useState<WithId<StudentFee>[]>(SEED_FEES);
  const [studentAttendance, setStudentAttendance] = useState<WithId<Attendance>[]>(SEED_ATTENDANCE);
  const [recentExamResults, setRecentExamResults] = useState<WithId<ExamResult>[]>(SEED_EXAM_RESULTS);
  
  // Local state for auth and settings
  const [userRole, setUserRole] = useState<'admin' | 'student' | 'teacher' | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentStudent, setCurrentStudent] = useState<WithId<Student> | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<WithId<Teacher> | null>(null);

  const [adminProfile, setAdminProfile] = useState<WithId<AdminProfile> | null>({ id: 'admin-profile', name: 'Geda Abay', email: 'gedaabay@gmail.com' });
  const [schoolInfo, setSchoolInfo] = useState<WithId<SchoolInfo> | null>({id: 'school-info', name: 'Adama Model', address: 'Adama, Ethiopia', contact: '+251 912 345 678'});
  const [appearance, setAppearance] = useState<WithId<Appearance> | null>({id: 'appearance', theme: '259 71% 50%', darkMode: false});
  const [isLoading, setIsLoading] = useState(false); // General loading state

  const login = async (email: string, password: string, expectedRole: 'admin' | 'student' | 'teacher'): Promise<string | null> => {
    setIsLoading(true);
    const user = MOCK_USERS[email as keyof typeof MOCK_USERS];
    if (user && user.password === password && user.role === expectedRole) {
      setUserRole(user.role);
      const mockUser = { uid: user.id || email, email };
      setCurrentUser(mockUser);
      if (user.role === 'student') {
        const studentProfile = students.find(s => s.id === user.id);
        setCurrentStudent(studentProfile || null);
      }
      if (user.role === 'teacher') {
        const teacherProfile = teachers.find(t => t.id === user.id);
        setCurrentTeacher(teacherProfile || null);
      }
      if(user.role === 'admin') {
        setAdminProfile(user.profile as any);
      }
      setIsLoading(false);
      return null;
    }
    setIsLoading(false);
    return 'Invalid email or password.';
  }

  const adminLogin = (email: string, password: string) => login(email, password, 'admin');
  const loginStudent = (email: string, password: string) => login(email, password, 'student');
  const loginTeacher = (email: string, password: string) => login(email, password, 'teacher');

  const logout = async () => {
    setUserRole(null);
    setCurrentUser(null);
    setCurrentStudent(null);
    setCurrentTeacher(null);
  };
  
  const addStudent = async (data: any) => {
    const newId = generateId();
    const newStudent: Student = {
      ...data,
      id: newId,
      userId: newId,
      enrollmentDate: new Date().toISOString(),
      dateOfBirth: new Date().toISOString(),
      gender: 'Not Specified',
      address: 'Not Specified',
      parentIds: [],
    };
    setStudents(prev => [...(prev || []), newStudent]);
    // Add to mock users for login
    MOCK_USERS[data.contactEmail as keyof typeof MOCK_USERS] = { password: data.password, role: 'student', id: newId };
    toast({ title: 'Student Added' });
  };

  const deleteStudent = async (studentId: string) => {
    const studentToDelete = students.find(s => s.id === studentId);
    setStudents(prev => prev?.filter(s => s.id !== studentId) || []);
    if(studentToDelete) {
        delete MOCK_USERS[studentToDelete.contactEmail];
    }
    toast({ title: 'Student Deleted' });
  };
  
  const addTeacher = async (data: any) => {
    const newId = generateId();
    const newTeacher: Teacher = {
      ...data,
      id: newId,
      userId: newId,
      hireDate: new Date().toISOString(),
      qualification: 'Not specified',
      address: 'Not specified',
      classes: data.classes ? data.classes.split(',').map((c:string) => c.trim()) : [],
    };
    setTeachers(prev => [...(prev || []), newTeacher]);
    MOCK_USERS[data.contactEmail as keyof typeof MOCK_USERS] = { password: data.password, role: 'teacher', id: newId };
    toast({ title: 'Teacher Added' });
  };
  
  const deleteTeacher = async (teacherId: string) => {
    const teacherToDelete = teachers.find(t => t.id === teacherId);
    setTeachers(prev => prev?.filter(t => t.id !== teacherId) || []);
     if(teacherToDelete) {
        delete MOCK_USERS[teacherToDelete.contactEmail];
    }
    toast({ title: 'Teacher Deleted' });
  };
  
  const addAttendance = async (data: any) => {
    const newAttendance: Attendance = { ...data, id: generateId() };
    setStudentAttendance(prev => [...(prev || []), newAttendance]);
    toast({ title: 'Attendance Added' });
  };

  const addExamResult = async (data: any) => {
     const newResult: ExamResult = { ...data, id: generateId(), resultDate: new Date().toISOString() };
     setRecentExamResults(prev => [...(prev || []), newResult]);
     toast({ title: 'Exam Result Added' });
  };

  const addFee = async (data: any) => {
    const newFee: StudentFee = { ...data, id: generateId() };
    setFeesData(prev => [...(prev || []), newFee]);
    toast({ title: 'Fee Record Added' });
  };

  const updateAdminProfile = (data: Partial<AdminProfile>) => {
    setAdminProfile((prev) => (prev ? { ...prev, ...data } : null));
    toast({ title: 'Profile Updated' });
  };
  const updateSchoolInfo = (data: Partial<SchoolInfo>) => {
    setSchoolInfo((prev) => (prev ? { ...prev, ...data } : null));
    toast({ title: 'School Info Updated' });
  };
  const setTheme = (theme: string) => {
    setAppearance((prev) => (prev ? { ...prev, theme } : null));
  };
  const toggleDarkMode = () => {
    setAppearance((prev) => (prev ? { ...prev, darkMode: !prev.darkMode } : null));
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && appearance) {
      document.documentElement.classList.toggle('dark', appearance.darkMode);
      document.documentElement.style.setProperty('--primary', appearance.theme);
    }
  }, [appearance]);

  const value: DataContextType = {
      students,
      teachers,
      studentAttendance,
      recentExamResults,
      feesData,
      isLoading: isLoading,
      isUserLoading: isLoading,
      isRoleLoading: isLoading,
      firebaseUser: currentUser,
      userRole,
      isAdmin: userRole === 'admin',
      currentStudent,
      currentTeacher,
      adminProfile,
      schoolInfo,
      appearance,
      adminLogin,
      loginStudent,
      loginTeacher,
      logout,
      addStudent,
      deleteStudent,
      addTeacher,
      deleteTeacher,
      addAttendance,
      addExamResult,
      addFee,
      updateAdminProfile,
      updateSchoolInfo,
      setTheme,
      toggleDarkMode,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
