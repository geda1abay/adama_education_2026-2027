'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { 
    STUDENTS,
    TEACHERS,
    STUDENT_ATTENDANCE,
    RECENT_EXAM_RESULTS,
    FEES_DATA,
    type Student,
    type Fee,
} from '@/lib/data';
import { useToast } from '@/hooks/use-toast';


// The Teacher type from data.ts is different from the entity. Let's define it.
type Teacher = {
  id: string;
  name: string;
  subject: string;
  mobile: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Inactive';
};

type StudentAttendance = (typeof STUDENT_ATTENDANCE)[number];
type ExamResult = (typeof RECENT_EXAM_RESULTS)[number];

// New types for settings
type AdminProfile = {
  name: string;
};

type SchoolInfo = {
  name: string;
  address: string;
  contact: string;
};

type Appearance = {
  theme: string;
  darkMode: boolean;
};

interface DataContextType {
  students: Student[];
  teachers: Teacher[];
  studentAttendance: StudentAttendance[];
  recentExamResults: ExamResult[];
  feesData: Fee[];
  addStudent: (studentData: Omit<Student, 'id' | 'avatar' | 'status' | 'registrationId'>) => void;
  addTeacher: (teacherData: Omit<Teacher, 'id' | 'avatar' | 'status'>) => void;
  addAttendance: (attendanceData: StudentAttendance) => void;
  addExamResult: (examResultData: Omit<ExamResult, 'id'>) => void;
  addFee: (feeData: Fee) => void;
  clearStudents: () => void;
  clearTeachers: () => void;
  toggleStudentStatus: (studentId: string) => void;
  currentUser: Student | null;
  isAuthLoading: boolean;
  loginStudent: (email: string, password: string) => boolean;
  logoutStudent: () => void;
  adminProfile: AdminProfile;
  schoolInfo: SchoolInfo;
  appearance: Appearance;
  updateAdminProfile: (data: Partial<AdminProfile>) => void;
  updatePassword: () => void;
  updateSchoolInfo: (data: Partial<SchoolInfo>) => void;
  setTheme: (theme: string) => void;
  toggleDarkMode: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Default values for new state
const initialAdminProfile: AdminProfile = {
  name: 'Geda Abay',
};

const initialSchoolInfo: SchoolInfo = {
  name: 'Adama Model School',
  address: 'Adama, Ethiopia',
  contact: '+251 912 345 678',
};

const initialAppearance: Appearance = {
  theme: '259 71% 50%', // Default purple
  darkMode: false,
};


export function DataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>(STUDENTS);
  const [teachers, setTeachers] = useState<Teacher[]>(TEACHERS);
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>(STUDENT_ATTENDANCE);
  const [recentExamResults, setRecentExamResults] = useState<ExamResult[]>(RECENT_EXAM_RESULTS);
  const [feesData, setFeesData] = useState<Fee[]>(FEES_DATA);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [adminProfile, setAdminProfile] = useState<AdminProfile>(initialAdminProfile);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(initialSchoolInfo);
  const [appearance, setAppearance] = useState<Appearance>(initialAppearance);

  useEffect(() => {
    // This code only runs on the client.
    const studentId = sessionStorage.getItem('currentUserId');
    if (studentId) {
        const student = students.find(s => s.id === studentId);
        if (student) {
            setCurrentUser(student);
        }
    }
    setIsAuthLoading(false);
  }, [students]);

  const addStudent = useCallback((studentData: Omit<Student, 'id' | 'avatar' | 'status' | 'registrationId'>) => {
    const randomId = Math.floor(Math.random() * 10000);
    const newStudentId = `STU-${String(randomId).padStart(3, '0')}`;
    const newRegistrationId = `Hgr/${String(randomId).padStart(4, '0')}/24`;
    
    const newStudent: Student = {
        id: newStudentId,
        registrationId: newRegistrationId,
        name: studentData.name,
        class: studentData.class,
        parentName: studentData.parentName,
        mobile: studentData.mobile,
        email: studentData.email,
        status: 'Active',
        avatar: `user-avatar-${(students.length % 5) + 1}`,
        password: studentData.password,
    };

    setStudents(prev => [...prev, newStudent]);
    
    toast({ title: "Student Added", description: `${studentData.name} has been added successfully.` });

  }, [toast, students.length]);

  const addTeacher = useCallback((teacherData: Omit<Teacher, 'id' | 'avatar' | 'status'>) => {
    const randomId = Math.floor(Math.random() * 1000);
    const newTeacherId = `TCH-${String(randomId).padStart(3, '0')}`;

    const newTeacher: Teacher = {
        id: newTeacherId,
        name: teacherData.name,
        subject: teacherData.subject,
        mobile: teacherData.mobile,
        email: teacherData.email,
        status: 'Active',
        avatar: `user-avatar-${(teachers.length % 3) + 6}`,
    };

    setTeachers(prev => [...prev, newTeacher]);

    toast({ title: "Teacher Added", description: `${teacherData.name} has been added successfully.` });
  }, [toast, teachers.length]);

  const addAttendance = useCallback((data: StudentAttendance) => {
    setStudentAttendance(prev => {
      const existingIndex = prev.findIndex(
        att => att.studentId === data.studentId && att.month === data.month
      );

      if (existingIndex !== -1) {
        const updatedAttendance = [...prev];
        updatedAttendance[existingIndex] = {
          ...updatedAttendance[existingIndex],
          daysPresent: data.daysPresent,
          totalDays: data.totalDays,
        };
        return updatedAttendance;
      } else {
        return [...prev, data];
      }
    });
  }, []);

  const addExamResult = useCallback((data: Omit<ExamResult, 'id'>) => {
    setRecentExamResults(prev => {
      const newExamResult: ExamResult = {
        id: `EXAM-${String(prev.length + 1).padStart(3, '0')}`,
        ...data
      };
      return [newExamResult, ...prev];
    });
  }, []);

  const addFee = useCallback((data: Fee) => {
    setFeesData(prev => {
      const existingIndex = prev.findIndex(
        fee => fee.studentId === data.studentId
      );

      if (existingIndex !== -1) {
        const updatedFees = [...prev];
        updatedFees[existingIndex] = { ...updatedFees[existingIndex], ...data };
        return updatedFees;
      } else {
        return [...prev, data];
      }
    });
  }, []);

  const clearStudents = useCallback(() => {
    setStudents([]);
    toast({ title: "Students Cleared", description: "All student data has been removed." });
  }, [toast]);

  const clearTeachers = useCallback(() => {
    setTeachers([]);
    toast({ title: "Teachers Cleared", description: "All teacher data has been removed." });
  }, [toast]);

  const toggleStudentStatus = useCallback((studentId: string) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, status: student.status === 'Active' ? 'Inactive' : 'Active' }
          : student
      )
    );
  }, []);

  const loginStudent = useCallback((email: string, password: string): boolean => {
    const student = students.find(s => s.email === email && s.password === password);
    if (student) {
      sessionStorage.setItem('currentUserId', student.id);
      setCurrentUser(student);
      return true;
    }
    return false;
  }, [students]);

  const logoutStudent = useCallback(() => {
    sessionStorage.removeItem('currentUserId');
    setCurrentUser(null);
  }, []);

  // Settings functions
  const updateAdminProfile = useCallback((data: Partial<AdminProfile>) => {
    setAdminProfile(prev => ({ ...prev, ...data }));
    toast({ title: "Profile Updated", description: "Your profile information has been saved." });
  }, [toast]);

  const updatePassword = useCallback(() => {
    toast({ title: "Password Updated", description: "Your password has been changed successfully." });
  }, [toast]);
  
  const updateSchoolInfo = useCallback((data: Partial<SchoolInfo>) => {
    setSchoolInfo(prev => ({...prev, ...data}));
    toast({ title: "School Info Saved", description: "The school's information has been updated." });
  }, [toast]);
  
  const setTheme = useCallback((theme: string) => {
    setAppearance(prev => ({ ...prev, theme }));
    toast({ title: "Theme Updated", description: "The application theme has been changed." });
  }, [toast]);

  const toggleDarkMode = useCallback(() => {
    setAppearance(prev => {
        const newDarkMode = !prev.darkMode;
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return { ...prev, darkMode: newDarkMode };
    });
  }, []);

  // Effect to apply theme on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
        if (appearance.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        document.documentElement.style.setProperty('--primary', appearance.theme);
    }
  }, [appearance.darkMode, appearance.theme]);

  const value = useMemo(() => ({
    students,
    teachers,
    studentAttendance,
    recentExamResults,
    feesData,
    addStudent,
    addTeacher,
    addAttendance,
    addExamResult,
    addFee,
    clearStudents,
    clearTeachers,
    toggleStudentStatus,
    currentUser,
    isAuthLoading,
    loginStudent,
    logoutStudent,
    adminProfile,
    schoolInfo,
    appearance,
    updateAdminProfile,
    updatePassword,
    updateSchoolInfo,
    setTheme,
    toggleDarkMode,
  }), [students, teachers, studentAttendance, recentExamResults, feesData, addStudent, addTeacher, addAttendance, addExamResult, addFee, clearStudents, clearTeachers, toggleStudentStatus, currentUser, isAuthLoading, loginStudent, logoutStudent, adminProfile, schoolInfo, appearance, updateAdminProfile, updatePassword, updateSchoolInfo, setTheme, toggleDarkMode]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
