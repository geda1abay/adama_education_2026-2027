'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Student,
  Teacher,
  StudentFee,
  Attendance,
  ExamResult,
  AdminProfile,
  SchoolInfo,
  Appearance,
  STUDENTS,
  TEACHERS,
  STUDENT_ATTENDANCE,
  RECENT_EXAM_RESULTS,
  FEES_DATA,
} from '@/lib/data';
import type { User } from 'firebase/auth'; // Using type for mock user object shape

// Mock user object to satisfy components expecting `firebaseUser`
const MOCK_ADMIN_USER: User = {
    uid: 'admin-uid',
    email: 'gedaabay8@gmail.com',
} as User;

const MOCK_STUDENT_USER = (id: string, email: string): User => ({
    uid: id,
    email,
} as User)

const MOCK_TEACHER_USER = (id: string, email: string): User => ({
    uid: id,
    email,
} as User)


// Utility type to add an 'id' field
export type WithId<T> = T & { id: string };

interface DataContextType {
  students: WithId<Student>[] | null;
  teachers: WithId<Teacher>[] | null;
  studentAttendance: WithId<Attendance>[] | null;
  recentExamResults: WithId<ExamResult>[] | null;
  feesData: WithId<StudentFee>[] | null;
  
  isLoading: boolean;
  isUserLoading: boolean;

  firebaseUser: User | null;
  currentStudent: WithId<Student> | null;
  currentTeacher: WithId<Teacher> | null;
  isAdmin: boolean;
  userRole: 'admin' | 'teacher' | 'student' | null;

  adminProfile: WithId<AdminProfile> | null;
  schoolInfo: WithId<SchoolInfo> | null;
  appearance: WithId<Appearance> | null;
  
  adminLogin: (email: string, password: string) => Promise<boolean>;
  loginStudent: (email: string, password: string) => Promise<boolean>;
  loginTeacher: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;

  addStudent: (studentData: Omit<Student, 'id' | 'userId' | 'parentIds' | 'enrollmentDate' | 'dateOfBirth' | 'gender' | 'address'>) => Promise<void>;
  deleteStudent: (studentId: string) => void;
  addTeacher: (teacherData: Omit<Teacher, 'id' | 'userId' | 'hireDate' | 'qualification' | 'address'> & { classes?: string }) => Promise<void>;
  deleteTeacher: (teacherId: string) => void;
  addAttendance: (attendanceData: Omit<Attendance, 'id'>) => void;
  addExamResult: (examResultData: Omit<ExamResult, 'id'>) => void;
  addFee: (feeData: Omit<StudentFee, 'id'>) => void;
  
  updateAdminProfile: (data: Partial<AdminProfile>) => void;
  updateSchoolInfo: (data: Partial<SchoolInfo>) => void;
  setTheme: (theme: string) => void;
  toggleDarkMode: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Data state
  const [students, setStudents] = useState<Student[] | null>(null);
  const [teachers, setTeachers] = useState<Teacher[] | null>(null);
  const [feesData, setFeesData] = useState<StudentFee[] | null>(null);
  const [studentAttendance, setStudentAttendance] = useState<Attendance[] | null>(null);
  const [recentExamResults, setRecentExamResults] = useState<ExamResult[] | null>(null);

  // Settings state
  const [adminProfile, setAdminProfile] = useState<WithId<AdminProfile> | null>({ id: 'admin-profile', name: 'Admin', email: 'gedaabay8@gmail.com'});
  const [schoolInfo, setSchoolInfo] = useState<WithId<SchoolInfo> | null>({id: 'school-info', name: 'Adama Model', address: 'Adama, Ethiopia', contact: '+251 912 345 678'});
  const [appearance, setAppearance] = useState<WithId<Appearance> | null>({id: 'appearance', theme: '259 71% 50%', darkMode: false});
  
  // Auth & loading state
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'teacher' | 'student' | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setStudents(STUDENTS);
      setTeachers(TEACHERS);
      setFeesData(FEES_DATA);
      setStudentAttendance(STUDENT_ATTENDANCE);
      setRecentExamResults(RECENT_EXAM_RESULTS);
      setIsDataLoading(false);
      setIsUserLoading(false);
    }, 1000); // 1-second delay
    return () => clearTimeout(timer);
  }, []);
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    if (email === 'gedaabay8@gmail.com' && password === '151835') {
      setFirebaseUser(MOCK_ADMIN_USER);
      setUserRole('admin');
      return true;
    }
    return false;
  };
  
  const loginStudent = async (email: string, password: string): Promise<boolean> => {
    const student = STUDENTS.find(s => s.contactEmail.toLowerCase() === email.toLowerCase());
    if (student && password) { // Mock password check
        setFirebaseUser(MOCK_STUDENT_USER(student.id, student.contactEmail));
        setUserRole('student');
        setCurrentStudent(student);
        return true;
    }
    return false;
  };

  const loginTeacher = async (email: string, password: string): Promise<boolean> => {
    const teacher = TEACHERS.find(t => t.contactEmail.toLowerCase() === email.toLowerCase());
    if (teacher && password) { // Mock password check
        setFirebaseUser(MOCK_TEACHER_USER(teacher.id, teacher.contactEmail));
        setUserRole('teacher');
        setCurrentTeacher(teacher);
        return true;
    }
    return false;
  };

  const logout = async () => {
    setFirebaseUser(null);
    setUserRole(null);
    setCurrentStudent(null);
    setCurrentTeacher(null);
  };
  
  const addStudent = async (data: Omit<Student, 'id' | 'userId' | 'parentIds' | 'enrollmentDate' | 'dateOfBirth' | 'gender' | 'address'>) => {
    const newId = `s${Date.now()}`;
    const newStudent: Student = {
        ...data,
        id: newId,
        userId: newId,
        parentIds: [],
        enrollmentDate: new Date().toISOString(),
        dateOfBirth: new Date().toISOString(),
        gender: 'Not Specified',
        address: 'Not Specified',
    };
    setStudents(prev => [...(prev || []), newStudent]);
    toast({ title: 'Student Added', description: `${data.firstName} has been added.` });
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => (prev || []).filter(s => s.id !== studentId));
    toast({ title: 'Student Deleted', description: 'The student has been removed.' });
  };
  
  const addTeacher = async (data: Omit<Teacher, 'id' | 'userId' | 'hireDate' | 'qualification' | 'address'> & { classes?: string }) => {
     const newId = `t${Date.now()}`;
     const newTeacher: Teacher = {
        ...data,
        id: newId,
        userId: newId,
        hireDate: new Date().toISOString(),
        qualification: 'Not specified',
        address: 'Not specified',
        classes: data.classes ? data.classes.split(',').map(c => c.trim()) : [],
     };
     setTeachers(prev => [...(prev || []), newTeacher]);
     toast({ title: 'Teacher Added', description: `${data.firstName} has been added.` });
  };
  
  const deleteTeacher = (teacherId: string) => {
    setTeachers(prev => (prev || []).filter(t => t.id !== teacherId));
    toast({ title: 'Teacher Deleted', description: 'The teacher has been removed.' });
  };
  
  const addAttendance = (data: Omit<Attendance, 'id'>) => {
     const newAttendance: Attendance = {
        ...data,
        id: `att${Date.now()}`,
     };
     setStudentAttendance(prev => [...(prev || []), newAttendance]);
     toast({ title: 'Attendance Added' });
  };

  const addExamResult = (data: Omit<ExamResult, 'id'>) => {
     const newResult: ExamResult = {
        ...data,
        id: `er${Date.now()}`,
        resultDate: new Date().toISOString(),
     };
     setRecentExamResults(prev => [...(prev || []), newResult]);
     toast({ title: 'Exam Result Added' });
  };

  const addFee = (data: Omit<StudentFee, 'id'>) => {
    const newFee: StudentFee = {
        ...data,
        id: `fee${Date.now()}`,
    };
    setFeesData(prev => [...(prev || []), newFee]);
    toast({ title: 'Fee Record Added' });
  };

  const updateAdminProfile = (data: Partial<AdminProfile>) => {
    setAdminProfile(prev => prev ? { ...prev, ...data } : null);
    toast({ title: 'Profile Updated' });
  };
  
  const updateSchoolInfo = (data: Partial<SchoolInfo>) => {
    setSchoolInfo(prev => prev ? { ...prev, ...data } : null);
    toast({ title: 'School Info Updated' });
  };

  const setTheme = (theme: string) => {
    setAppearance(prev => prev ? { ...prev, theme } : null);
  };
  
  const toggleDarkMode = () => {
    setAppearance(prev => prev ? { ...prev, darkMode: !prev.darkMode } : null);
  };
  
  useEffect(() => {
    if (typeof window !== 'undefined' && appearance) {
      document.documentElement.classList.toggle('dark', appearance.darkMode);
      document.documentElement.style.setProperty('--primary', appearance.theme);
    }
  }, [appearance]);

  const value = useMemo(() => ({
    students,
    teachers,
    studentAttendance,
    recentExamResults,
    feesData,
    isLoading: isDataLoading,
    isUserLoading,
    firebaseUser,
    currentStudent,
    currentTeacher,
    isAdmin: userRole === 'admin',
    userRole,
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
  }), [
      students, teachers, studentAttendance, recentExamResults, feesData,
      isDataLoading, isUserLoading,
      firebaseUser, currentStudent, currentTeacher, userRole,
      adminProfile, schoolInfo, appearance
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
