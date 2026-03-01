'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { 
    useFirebase, 
    useUser,
    useCollection, 
    useDoc,
    useMemoFirebase,
    WithId,
} from '@/firebase';
import {
    collection,
    doc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    getDoc
} from 'firebase/firestore';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';

import {
    Student,
    Teacher,
    StudentFee,
    Attendance,
    ExamResult,
    AdminProfile,
    SchoolInfo,
    Appearance,
} from '@/lib/data';

interface DataContextType {
  // Data collections
  students: WithId<Student>[] | null;
  teachers: WithId<Teacher>[] | null;
  studentAttendance: WithId<Attendance>[] | null;
  recentExamResults: WithId<ExamResult>[] | null;
  feesData: WithId<StudentFee>[] | null;

  // Loading state
  isLoading: boolean;
  isUserLoading: boolean;

  // Current user profiles
  firebaseUser: any; // Firebase user object
  currentStudent: WithId<Student> | null;
  currentTeacher: WithId<Teacher> | null;
  isAdmin: boolean;

  // Settings
  adminProfile: WithId<AdminProfile> | null;
  schoolInfo: WithId<SchoolInfo> | null;
  appearance: WithId<Appearance> | null;

  // Auth functions
  adminLogin: (email: string, password: string) => Promise<boolean>;
  loginStudent: (email: string, password: string) => Promise<boolean>;
  loginTeacher: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // Mutation functions
  addStudent: (studentData: Omit<Student, 'id' | 'userId' | 'parentIds' | 'enrollmentDate' | 'dateOfBirth' | 'gender' | 'address'> & { password?: string }) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  addTeacher: (teacherData: Omit<Teacher, 'id' | 'userId' | 'hireDate' | 'qualification' | 'address' | 'classes'> & { password?: string; classes: string }) => Promise<void>;
  deleteTeacher: (teacherId: string) => Promise<void>;
  addAttendance: (attendanceData: Omit<Attendance, 'id'>) => Promise<void>;
  addExamResult: (examResultData: Omit<ExamResult, 'id'>) => Promise<void>;
  addFee: (feeData: Omit<StudentFee, 'id'>) => Promise<void>;

  // Settings mutations
  updateAdminProfile: (data: Partial<AdminProfile>) => void;
  updateSchoolInfo: (data: Partial<SchoolInfo>) => void;
  setTheme: (theme: string) => void;
  toggleDarkMode: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const router = useRouter();
  const { firestore, auth } = useFirebase();
  const { user: firebaseUser, isUserLoading } = useUser();

  // --- Data Fetching ---
  const studentsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'students') : null, [firestore]);
  const { data: students, isLoading: isStudentsLoading } = useCollection<Student>(studentsQuery);

  const teachersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'teachers') : null, [firestore]);
  const { data: teachers, isLoading: isTeachersLoading } = useCollection<Teacher>(teachersQuery);

  const feesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'studentFees') : null, [firestore]);
  const { data: feesData, isLoading: isFeesLoading } = useCollection<StudentFee>(feesQuery);

  const attendanceQuery = useMemoFirebase(() => firestore ? collection(firestore, 'attendance') : null, [firestore]);
  const { data: studentAttendance, isLoading: isAttendanceLoading } = useCollection<Attendance>(attendanceQuery);

  const examResultsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'examResults') : null, [firestore]);
  const { data: recentExamResults, isLoading: isExamResultsLoading } = useCollection<ExamResult>(examResultsQuery);

  // --- Settings Fetching ---
  const adminProfileDoc = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'adminProfile') : null, [firestore]);
  const { data: adminProfile } = useDoc<AdminProfile>(adminProfileDoc);
  
  const schoolInfoDoc = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'schoolInfo') : null, [firestore]);
  const { data: schoolInfo } = useDoc<SchoolInfo>(schoolInfoDoc);
  
  const appearanceDoc = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'appearance') : null, [firestore]);
  const { data: appearance } = useDoc<Appearance>(appearanceDoc);
  

  // --- User Profile Derivation ---
  const [currentStudent, setCurrentStudent] = useState<WithId<Student> | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<WithId<Teacher> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdmin = async () => {
      if(firebaseUser && firestore) {
        const adminDocRef = doc(firestore, 'admins', firebaseUser.uid);
        const adminDoc = await getDoc(adminDocRef);
        setIsAdmin(adminDoc.exists());
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();

    if (firebaseUser) {
      setCurrentStudent(students?.find(s => s.id === firebaseUser.uid) || null);
      setCurrentTeacher(teachers?.find(t => t.id === firebaseUser.uid) || null);
    } else {
      setCurrentStudent(null);
      setCurrentTeacher(null);
    }
  }, [firebaseUser, students, teachers, firestore]);

  // --- Auth Functions ---
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    if (!auth || !firestore) return false;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // After successful login, ensure the admin document exists.
      // This is part of the bootstrapping process for the first admin.
      const adminDocRef = doc(firestore, 'admins', user.uid);
      const adminDoc = await getDoc(adminDocRef);

      if (!adminDoc.exists() && user.email === 'gedaabay8@gmail.com') {
        // The security rules allow the first admin to create their own document.
        await setDoc(adminDocRef, {
          userId: user.uid,
          role: 'admin',
          email: user.email,
        });
      }
      return true;
    } catch (error) {
      console.error("Admin login failed:", error);
      return false;
    }
  };

  const loginStudent = async (email: string, password: string): Promise<boolean> => {
    if (!auth) return false;
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      sessionStorage.setItem('student-user-id', user.uid);
      return true;
    } catch (error) {
      console.error("Student login failed:", error);
      return false;
    }
  };

  const loginTeacher = async (email: string, password: string): Promise<boolean> => {
    if (!auth) return false;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Teacher login failed:", error);
      return false;
    }
  };
  
  const logout = async () => {
    if (auth) {
      await signOut(auth);
      sessionStorage.removeItem('student-user-id');
    }
  };

  // --- Mutation Functions ---
  const addStudent = useCallback(async (data: Omit<Student, 'id' | 'userId' | 'parentIds' | 'enrollmentDate' | 'dateOfBirth' | 'gender' | 'address'> & { password?: string }) => {
    if (!auth || !firestore || !data.password) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.contactEmail, data.password);
      const studentDoc: Student = {
        id: userCredential.user.uid,
        userId: userCredential.user.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        contactEmail: data.contactEmail,
        gradeLevel: data.gradeLevel,
        contactPhone: data.contactPhone,
        enrollmentDate: new Date().toISOString(),
        dateOfBirth: new Date().toISOString(), // Placeholder
        gender: 'Not specified', // Placeholder
        address: 'Not specified', // Placeholder
        parentIds: [], // Placeholder
      };
      await setDoc(doc(firestore, 'students', userCredential.user.uid), studentDoc);
      toast({ title: 'Student Added', description: `${data.firstName} has been created.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error adding student', description: error.message });
    }
  }, [auth, firestore, toast]);

  const deleteStudent = useCallback(async (studentId: string) => {
    // This is a simplified delete. A real app would need a cloud function
    // to delete the user from Firebase Auth.
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'students', studentId));
      toast({ title: 'Student Deleted', description: 'Student profile has been removed from Firestore.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error deleting student', description: error.message });
    }
  }, [firestore, toast]);
  
  const addTeacher = useCallback(async (data: Omit<Teacher, 'id' | 'userId' | 'hireDate' | 'qualification' | 'address'> & { password?: string }) => {
    if (!auth || !firestore || !data.password) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.contactEmail, data.password);
      const teacherDoc: Teacher = {
        id: userCredential.user.uid,
        userId: userCredential.user.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        contactEmail: data.contactEmail,
        department: data.department,
        contactPhone: data.contactPhone,
        hireDate: new Date().toISOString(), // Placeholder
        qualification: 'Not specified', // Placeholder
        address: 'Not specified', // Placeholder
        classes: data.classes.split(',').map(c => c.trim()),
      };
      await setDoc(doc(firestore, 'teachers', userCredential.user.uid), teacherDoc);
      toast({ title: 'Teacher Added', description: `${data.firstName} has been created.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error adding teacher', description: error.message });
    }
  }, [auth, firestore, toast]);

  const deleteTeacher = useCallback(async (teacherId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'teachers', teacherId));
      toast({ title: 'Teacher Deleted', description: 'Teacher profile has been removed from Firestore.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error deleting teacher', description: error.message });
    }
  }, [firestore, toast]);

  const addAttendance = useCallback(async (data: Omit<Attendance, 'id'>) => {
    if (!firestore || !firebaseUser) return;
    const attendanceDoc = {
        ...data,
        recordedByTeacherId: firebaseUser.uid,
        classSessionId: 'session_placeholder' // Placeholder
    };
    await addDoc(collection(firestore, 'attendance'), attendanceDoc);
  }, [firestore, firebaseUser]);

  const addExamResult = useCallback(async (data: Omit<ExamResult, 'id'>) => {
    if (!firestore) return;
    const resultDoc = { ...data, resultDate: new Date().toISOString() };
    await addDoc(collection(firestore, 'examResults'), resultDoc);
  }, [firestore]);

  const addFee = useCallback(async (data: Omit<StudentFee, 'id'>) => {
    if (!firestore) return;
    await addDoc(collection(firestore, 'studentFees'), data);
  }, [firestore]);


  // Settings Mutations
  const updateSetting = useCallback(async (docId: string, data: any) => {
      if (!firestore) return;
      try {
          const docRef = doc(firestore, 'settings', docId);
          await setDoc(docRef, data, { merge: true });
          toast({ title: 'Settings Saved', description: `Your ${docId} settings have been updated.` });
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
      }
  }, [firestore, toast]);

  const updateAdminProfile = (data: Partial<AdminProfile>) => updateSetting('adminProfile', data);
  const updateSchoolInfo = (data: Partial<SchoolInfo>) => updateSetting('schoolInfo', data);
  const setTheme = (theme: string) => updateSetting('appearance', { theme });

  const toggleDarkMode = useCallback(() => {
    if(appearance) {
        updateSetting('appearance', { darkMode: !appearance.darkMode });
    }
  }, [appearance, updateSetting]);

  // --- UI Effects ---
  useEffect(() => {
    if (typeof window !== 'undefined' && appearance) {
        document.documentElement.classList.toggle('dark', appearance.darkMode);
        if (appearance.theme) {
          document.documentElement.style.setProperty('--primary', appearance.theme);
        }
    }
  }, [appearance]);

  const isLoading = isUserLoading || isStudentsLoading || isTeachersLoading || isFeesLoading || isAttendanceLoading || isExamResultsLoading;

  const value = useMemo(() => ({
    students, teachers, feesData, studentAttendance, recentExamResults,
    isLoading, isUserLoading,
    firebaseUser, currentStudent, currentTeacher, isAdmin,
    adminProfile, schoolInfo, appearance,
    adminLogin, loginStudent, loginTeacher, logout,
    addStudent, deleteStudent, addTeacher, deleteTeacher, addAttendance, addExamResult, addFee,
    updateAdminProfile, updateSchoolInfo, setTheme, toggleDarkMode
  }), [
    students, teachers, feesData, studentAttendance, recentExamResults,
    isLoading, isUserLoading,
    firebaseUser, currentStudent, currentTeacher, isAdmin,
    adminProfile, schoolInfo, appearance,
    adminLogin, loginStudent, loginTeacher, logout,
    addStudent, deleteStudent, addTeacher, deleteTeacher, addAttendance, addExamResult, addFee,
    updateAdminProfile, updateSchoolInfo, setTheme, toggleDarkMode
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
