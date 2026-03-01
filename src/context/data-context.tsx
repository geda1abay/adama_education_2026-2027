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
    collectionGroup,
    doc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDoc
} from 'firebase/firestore';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  deleteStudent: (studentId: string) => void;
  addTeacher: (teacherData: Omit<Teacher, 'id' | 'userId' | 'hireDate' | 'qualification' | 'address' | 'classes'> & { password?: string; classes?: string }) => Promise<void>;
  deleteTeacher: (teacherId: string) => void;
  addAttendance: (attendanceData: Omit<Attendance, 'id'>) => void;
  addExamResult: (examResultData: Omit<ExamResult, 'id'>) => void;
  addFee: (feeData: Omit<StudentFee, 'id'>) => void;

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

  // --- User Profile Derivation ---
  const [currentStudent, setCurrentStudent] = useState<WithId<Student> | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<WithId<Teacher> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // --- Data Fetching ---
  const studentsQuery = useMemoFirebase(() => (firestore && isAdmin) ? collection(firestore, 'students') : null, [firestore, isAdmin]);
  const { data: students, isLoading: isStudentsLoading } = useCollection<Student>(studentsQuery);

  const teachersQuery = useMemoFirebase(() => (firestore && isAdmin) ? collection(firestore, 'teachers') : null, [firestore, isAdmin]);
  const { data: teachers, isLoading: isTeachersLoading } = useCollection<Teacher>(teachersQuery);

  // Use collectionGroup for admin-level list views. This requires a Firestore index.
  const feesQuery = useMemoFirebase(() => (firestore && isAdmin) ? collectionGroup(firestore, 'studentFees') : null, [firestore, isAdmin]);
  const { data: feesData, isLoading: isFeesLoading } = useCollection<StudentFee>(feesQuery);

  const attendanceQuery = useMemoFirebase(() => (firestore && isAdmin) ? collectionGroup(firestore, 'attendance') : null, [firestore, isAdmin]);
  const { data: studentAttendance, isLoading: isAttendanceLoading } = useCollection<Attendance>(attendanceQuery);

  const examResultsQuery = useMemoFirebase(() => (firestore && isAdmin) ? collectionGroup(firestore, 'examResults') : null, [firestore, isAdmin]);
  const { data: recentExamResults, isLoading: isExamResultsLoading } = useCollection<ExamResult>(examResultsQuery);


  // --- Settings Fetching ---
  const adminProfileDoc = useMemoFirebase(() => (firestore && isAdmin) ? doc(firestore, 'settings', 'adminProfile') : null, [firestore, isAdmin]);
  const { data: adminProfile } = useDoc<AdminProfile>(adminProfileDoc);
  
  const schoolInfoDoc = useMemoFirebase(() => (firestore && isAdmin) ? doc(firestore, 'settings', 'schoolInfo') : null, [firestore, isAdmin]);
  const { data: schoolInfo } = useDoc<SchoolInfo>(schoolInfoDoc);
  
  const appearanceDoc = useMemoFirebase(() => (firestore && isAdmin) ? doc(firestore, 'settings', 'appearance') : null, [firestore, isAdmin]);
  const { data: appearance } = useDoc<Appearance>(appearanceDoc);
  
  useEffect(() => {
    const checkAndSetRoles = async () => {
      if (firebaseUser && firestore) {
        const adminDocRef = doc(firestore, 'admins', firebaseUser.uid);
        const adminDoc = await getDoc(adminDocRef);
        let isAdminUser = adminDoc.exists();
        
        setIsAdmin(isAdminUser);

        if (isAdminUser) {
          setCurrentStudent(null);
          setCurrentTeacher(null);
        } else {
          // These will be null at first, then update when the collections load
          setCurrentStudent(students?.find(s => s.userId === firebaseUser.uid) || null);
          setCurrentTeacher(teachers?.find(t => t.userId === firebaseUser.uid) || null);
        }

      } else {
        setIsAdmin(false);
        setCurrentStudent(null);
        setCurrentTeacher(null);
      }
    };
    checkAndSetRoles();
  }, [firebaseUser, firestore, students, teachers]);


  // --- Auth Functions ---
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    if (!auth || !firestore) return false;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const adminDocRef = doc(firestore, 'admins', userCredential.user.uid);
      const adminDoc = await getDoc(adminDocRef);
      if (!adminDoc.exists() && userCredential.user.email === 'gedaabay8@gmail.com') {
        await setDoc(adminDocRef, { userId: userCredential.user.uid, role: 'admin', email: userCredential.user.email });
      }
      setIsAdmin(true); 
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
      const studentDocData: Student = {
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
      const studentDocRef = doc(firestore, 'students', userCredential.user.uid);
      setDoc(studentDocRef, studentDocData)
        .then(() => {
          toast({ title: 'Student Added', description: `${data.firstName} has been created.` });
        })
        .catch(error => {
          const contextualError = new FirestorePermissionError({
            path: studentDocRef.path,
            operation: 'create',
            requestResourceData: studentDocData,
          });
          errorEmitter.emit('permission-error', contextualError);
        });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error adding student account', description: error.message });
    }
  }, [auth, firestore, toast]);

  const deleteStudent = useCallback((studentId: string) => {
    if (!firestore) return;
    const studentDocRef = doc(firestore, 'students', studentId);
    deleteDoc(studentDocRef)
      .then(() => {
        toast({ title: 'Student Deleted', description: 'Student profile has been removed from Firestore.' });
      })
      .catch(error => {
        const contextualError = new FirestorePermissionError({
          path: studentDocRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', contextualError);
      });
  }, [firestore, toast]);
  
  const addTeacher = useCallback(async (data: Omit<Teacher, 'id' | 'userId' | 'hireDate' | 'qualification' | 'address' | 'classes'> & { password?: string; classes?: string }) => {
    if (!auth || !firestore || !data.password) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.contactEmail, data.password);
      const teacherDocData: Teacher = {
        id: userCredential.user.uid,
        userId: userCredential.user.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        contactEmail: data.contactEmail,
        department: data.department,
        contactPhone: data.contactPhone,
        classes: data.classes ? data.classes.split(',').map(c => c.trim()) : [],
        hireDate: new Date().toISOString(),
        qualification: 'Not specified',
        address: 'Not specified',
      };
      const teacherDocRef = doc(firestore, 'teachers', userCredential.user.uid);
      setDoc(teacherDocRef, teacherDocData)
        .then(() => {
          toast({ title: 'Teacher Added', description: `${data.firstName} has been created.` });
        })
        .catch(error => {
          const contextualError = new FirestorePermissionError({
            path: teacherDocRef.path,
            operation: 'create',
            requestResourceData: teacherDocData,
          });
          errorEmitter.emit('permission-error', contextualError);
        });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error adding teacher account', description: error.message });
    }
  }, [auth, firestore, toast]);

  const deleteTeacher = useCallback((teacherId: string) => {
    if (!firestore) return;
    const teacherDocRef = doc(firestore, 'teachers', teacherId);
    deleteDoc(teacherDocRef)
      .then(() => {
        toast({ title: 'Teacher Deleted', description: 'Teacher profile has been removed from Firestore.' });
      })
      .catch(error => {
        const contextualError = new FirestorePermissionError({
          path: teacherDocRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', contextualError);
      });
  }, [firestore, toast]);

  const addAttendance = useCallback((data: Omit<Attendance, 'id'>) => {
    if (!firestore || !firebaseUser) return;
    const attendanceDoc = {
        ...data,
        recordedByTeacherId: firebaseUser.uid,
        classSessionId: 'session_placeholder' // Placeholder
    };
    const collectionRef = collection(firestore, 'students', data.studentId, 'attendance');
    addDoc(collectionRef, attendanceDoc)
      .catch(error => {
        const contextualError = new FirestorePermissionError({
          path: `${collectionRef.path}/{newDocId}`,
          operation: 'create',
          requestResourceData: attendanceDoc,
        });
        errorEmitter.emit('permission-error', contextualError);
      });
  }, [firestore, firebaseUser]);

  const addExamResult = useCallback((data: Omit<ExamResult, 'id'>) => {
    if (!firestore) return;
    const resultDoc = { ...data, resultDate: new Date().toISOString() };
    const collectionRef = collection(firestore, 'students', data.studentId, 'examResults');
    addDoc(collectionRef, resultDoc)
      .catch(error => {
        const contextualError = new FirestorePermissionError({
          path: `${collectionRef.path}/{newDocId}`,
          operation: 'create',
          requestResourceData: resultDoc,
        });
        errorEmitter.emit('permission-error', contextualError);
      });
  }, [firestore]);

  const addFee = useCallback((data: Omit<StudentFee, 'id'>) => {
    if (!firestore) return;
    const collectionRef = collection(firestore, 'students', data.studentId, 'studentFees');
    addDoc(collectionRef, data)
      .catch(error => {
        const contextualError = new FirestorePermissionError({
          path: `${collectionRef.path}/{newDocId}`,
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', contextualError);
      });
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
    updateAdminProfile, updateSchoolInfo, setTheme, toggleDarkMode,
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
