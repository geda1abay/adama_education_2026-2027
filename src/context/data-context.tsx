
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
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
    deleteDoc,
    getDoc,
} from 'firebase/firestore';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    User,
} from 'firebase/auth';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

interface DataContextType {
  // Data collections - provides the correct slice of data based on role
  students: WithId<Student>[] | null;
  teachers: WithId<Teacher>[] | null;
  studentAttendance: WithId<Attendance>[] | null;
  recentExamResults: WithId<ExamResult>[] | null;
  feesData: WithId<StudentFee>[] | null;

  // Loading state
  isLoading: boolean; // A single, reliable loading flag for the UI
  isUserLoading: boolean; // For handling auth-related redirects

  // Current user profiles and role
  firebaseUser: User | null;
  currentStudent: WithId<Student> | null;
  currentTeacher: WithId<Teacher> | null;
  isAdmin: boolean;
  userRole: 'admin' | 'teacher' | 'student' | null;

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
  addTeacher: (teacherData: Omit<Teacher, 'id' | 'userId' | 'hireDate' | 'qualification' | 'address' > & { password?: string; classes?: string }) => Promise<void>;
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
  const { firestore, auth } = useFirebase();
  const { user: firebaseUser, isUserLoading: isAuthLoading } = useUser();

  // --- Role & Profile State ---
  const [userRole, setUserRole] = useState<'admin' | 'teacher' | 'student' | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  // --- Role Determination Effect ---
  useEffect(() => {
    if (isAuthLoading) return;
    
    if (!firebaseUser || !firestore) {
      setUserRole(null);
      setIsRoleLoading(false);
      return;
    }

    setIsRoleLoading(true);
    const checkUserRole = async (user: User) => {
      const adminRef = doc(firestore, 'admins', user.uid);
      const adminDoc = await getDoc(adminRef);
      if (adminDoc.exists()) {
        setUserRole('admin');
        setIsRoleLoading(false);
        return;
      }

      const teacherRef = doc(firestore, 'teachers', user.uid);
      const teacherDoc = await getDoc(teacherRef);
      if (teacherDoc.exists()) {
        setUserRole('teacher');
        setIsRoleLoading(false);
        return;
      }
      
      const studentRef = doc(firestore, 'students', user.uid);
      const studentDoc = await getDoc(studentRef);
      if (studentDoc.exists()) {
        setUserRole('student');
        setIsRoleLoading(false);
        return;
      }
      
      setUserRole(null);
      setIsRoleLoading(false);
    };

    checkUserRole(firebaseUser);
  }, [firebaseUser, isAuthLoading, firestore]);

  // --- Data Fetching ---
  const isAdmin = userRole === 'admin';
  const isTeacher = userRole === 'teacher';
  const isStudent = userRole === 'student';

  // Admin Data
  const adminStudentsQuery = useMemoFirebase(() => (firestore && isAdmin) ? collection(firestore, 'students') : null, [firestore, isAdmin]);
  const { data: adminStudents, isLoading: isAdminStudentsLoading } = useCollection<Student>(adminStudentsQuery);
  const adminTeachersQuery = useMemoFirebase(() => (firestore && isAdmin) ? collection(firestore, 'teachers') : null, [firestore, isAdmin]);
  const { data: adminTeachers, isLoading: isAdminTeachersLoading } = useCollection<Teacher>(adminTeachersQuery);
  const allFeesQuery = useMemoFirebase(() => (firestore && isAdmin) ? collectionGroup(firestore, 'studentFees') : null, [firestore, isAdmin]);
  const { data: allFeesData, isLoading: isAllFeesLoading } = useCollection<StudentFee>(allFeesQuery);
  const allAttendanceQuery = useMemoFirebase(() => (firestore && isAdmin) ? collectionGroup(firestore, 'attendance') : null, [firestore, isAdmin]);
  const { data: allAttendance, isLoading: isAllAttendanceLoading } = useCollection<Attendance>(allAttendanceQuery);
  const allExamResultsQuery = useMemoFirebase(() => (firestore && isAdmin) ? collectionGroup(firestore, 'examResults') : null, [firestore, isAdmin]);
  const { data: allExamResults, isLoading: isAllExamResultsLoading } = useCollection<ExamResult>(allExamResultsQuery);

  // Student Data
  const studentProfileRef = useMemoFirebase(() => (firestore && isStudent && firebaseUser) ? doc(firestore, 'students', firebaseUser.uid) : null, [firestore, isStudent, firebaseUser]);
  const { data: currentStudent, isLoading: isStudentProfileLoading } = useDoc<Student>(studentProfileRef);
  const studentExamResultsQuery = useMemoFirebase(() => (firestore && currentStudent) ? collection(firestore, 'students', currentStudent.id, 'examResults') : null, [firestore, currentStudent]);
  const { data: studentExamResultsData, isLoading: isStudentExamResultsLoading } = useCollection<ExamResult>(studentExamResultsQuery);

  // Teacher Data
  const teacherProfileRef = useMemoFirebase(() => (firestore && isTeacher && firebaseUser) ? doc(firestore, 'teachers', firebaseUser.uid) : null, [firestore, isTeacher, firebaseUser]);
  const { data: currentTeacher, isLoading: isTeacherProfileLoading } = useDoc<Teacher>(teacherProfileRef);
  const teacherStudentsQuery = useMemoFirebase(() => (firestore && isTeacher) ? collection(firestore, 'students') : null, [firestore, isTeacher]);
  const { data: teacherStudents, isLoading: isTeacherStudentsLoading } = useCollection<Student>(teacherStudentsQuery);

  // Settings Data (Admin only)
  const adminProfileDoc = useMemoFirebase(() => (firestore && isAdmin) ? doc(firestore, 'settings', 'adminProfile') : null, [firestore, isAdmin]);
  const { data: adminProfile, isLoading: isAdminProfileLoading } = useDoc<AdminProfile>(adminProfileDoc);
  const schoolInfoDoc = useMemoFirebase(() => (firestore && isAdmin) ? doc(firestore, 'settings', 'schoolInfo') : null, [firestore, isAdmin]);
  const { data: schoolInfo, isLoading: isSchoolInfoLoading } = useDoc<SchoolInfo>(schoolInfoDoc);
  const appearanceDoc = useMemoFirebase(() => (firestore && isAdmin) ? doc(firestore, 'settings', 'appearance') : null, [firestore, isAdmin]);
  const { data: appearance, isLoading: isAppearanceLoading } = useDoc<Appearance>(appearanceDoc);
  
  // --- Auth Functions ---
  const adminLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!auth || !firestore) return false;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const adminDocRef = doc(firestore, 'admins', userCredential.user.uid);
      const adminDocSnap = await getDoc(adminDocRef);
      // Bootstrap the first admin if their document doesn't exist
      if (!adminDocSnap.exists() && userCredential.user.email === 'gedaabay8@gmail.com') {
        await setDoc(adminDocRef, {
          userId: userCredential.user.uid,
          role: 'admin',
          email: userCredential.user.email,
        });
      }
      return true;
    } catch (error) {
      console.error("Admin login failed:", error);
      return false;
    }
  }, [auth, firestore]);

  const loginStudent = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!auth) return false;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Student login failed:", error);
      return false;
    }
  }, [auth]);

  const loginTeacher = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!auth) return false;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Teacher login failed:", error);
      return false;
    }
  }, [auth]);
  
  const logout = useCallback(async () => {
    if (auth) {
      await signOut(auth);
    }
  }, [auth]);

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
        dateOfBirth: new Date().toISOString(), // Default value
        gender: 'Not specified', // Default value
        address: 'Not specified', // Default value
        parentIds: [], // Default value
      };
      const studentDocRef = doc(firestore, 'students', userCredential.user.uid);
      setDoc(studentDocRef, studentDocData)
        .then(() => {
          toast({ title: 'Student Added', description: `${data.firstName} has been created.` });
        })
        .catch(error => {
          const contextualError = new FirestorePermissionError({ path: studentDocRef.path, operation: 'create', requestResourceData: studentDocData });
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
        const contextualError = new FirestorePermissionError({ path: studentDocRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', contextualError);
      });
  }, [firestore, toast]);
  
  const addTeacher = useCallback(async (data: Omit<Teacher, 'id' | 'userId' | 'hireDate' | 'qualification' | 'address'> & { password?: string; classes?: string }) => {
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
          const contextualError = new FirestorePermissionError({ path: teacherDocRef.path, operation: 'create', requestResourceData: teacherDocData });
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
        const contextualError = new FirestorePermissionError({ path: teacherDocRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', contextualError);
      });
  }, [firestore, toast]);

  const addAttendance = useCallback((data: Omit<Attendance, 'id'>) => {
    if (!firestore || !firebaseUser) return;
    const attendanceDoc = { ...data, recordedByTeacherId: firebaseUser.uid, classSessionId: 'session_placeholder' };
    const collectionRef = collection(firestore, 'students', data.studentId, 'attendance');
    addDoc(collectionRef, attendanceDoc).catch(error => {
        const contextualError = new FirestorePermissionError({ path: `${collectionRef.path}/{newDocId}`, operation: 'create', requestResourceData: attendanceDoc });
        errorEmitter.emit('permission-error', contextualError);
      });
  }, [firestore, firebaseUser]);

  const addExamResult = useCallback((data: Omit<ExamResult, 'id'>) => {
    if (!firestore) return;
    const resultDoc = { ...data, resultDate: new Date().toISOString() };
    const collectionRef = collection(firestore, 'students', data.studentId, 'examResults');
    addDoc(collectionRef, resultDoc).catch(error => {
        const contextualError = new FirestorePermissionError({ path: `${collectionRef.path}/{newDocId}`, operation: 'create', requestResourceData: resultDoc });
        errorEmitter.emit('permission-error', contextualError);
      });
  }, [firestore]);

  const addFee = useCallback((data: Omit<StudentFee, 'id'>) => {
    if (!firestore) return;
    const collectionRef = collection(firestore, 'students', data.studentId, 'studentFees');
    addDoc(collectionRef, data).catch(error => {
        const contextualError = new FirestorePermissionError({ path: `${collectionRef.path}/{newDocId}`, operation: 'create', requestResourceData: data });
        errorEmitter.emit('permission-error', contextualError);
      });
  }, [firestore]);

  const updateSetting = useCallback(async (docId: string, data: any) => {
      if (!firestore) return;
      const docRef = doc(firestore, 'settings', docId);
      await setDoc(docRef, data, { merge: true })
        .then(() => toast({ title: 'Settings Saved', description: `Your ${docId} settings have been updated.` }))
        .catch(error => {
            const contextualError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: data });
            errorEmitter.emit('permission-error', contextualError);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Check console for details.' });
        });
  }, [firestore, toast]);

  const updateAdminProfile = useCallback((data: Partial<AdminProfile>) => updateSetting('adminProfile', data), [updateSetting]);
  const updateSchoolInfo = useCallback((data: Partial<SchoolInfo>) => updateSetting('schoolInfo', data), [updateSetting]);
  const setTheme = useCallback((theme: string) => updateSetting('appearance', { theme }), [updateSetting]);
  const toggleDarkMode = useCallback(() => {
    if(appearance) updateSetting('appearance', { darkMode: !appearance.darkMode });
  }, [appearance, updateSetting]);

  useEffect(() => {
    if (typeof window !== 'undefined' && appearance) {
        document.documentElement.classList.toggle('dark', appearance.darkMode);
        if (appearance.theme) {
          document.documentElement.style.setProperty('--primary', appearance.theme);
        }
    }
  }, [appearance]);

  // --- Combined Loading State ---
  const isLoading = useMemo(() => {
    if (isAuthLoading || isRoleLoading) return true;
    if (isAdmin) return isAdminStudentsLoading || isAdminTeachersLoading || isAllFeesLoading || isAllAttendanceLoading || isAllExamResultsLoading || isAdminProfileLoading || isSchoolInfoLoading || isAppearanceLoading;
    if (isStudent) return isStudentProfileLoading || isStudentExamResultsLoading;
    if (isTeacher) return isTeacherProfileLoading || isTeacherStudentsLoading;
    return false;
  }, [
    isAuthLoading, isRoleLoading, isAdmin, isStudent, isTeacher,
    isAdminStudentsLoading, isAdminTeachersLoading, isAllFeesLoading, isAllAttendanceLoading, isAllExamResultsLoading, isAdminProfileLoading, isSchoolInfoLoading, isAppearanceLoading,
    isStudentProfileLoading, isStudentExamResultsLoading,
    isTeacherProfileLoading, isTeacherStudentsLoading
  ]);
  
  // --- Memoized Context Value ---
  const value = useMemo(() => ({
    students: isAdmin ? adminStudents : teacherStudents,
    teachers: isAdmin ? adminTeachers : null,
    studentAttendance: allAttendance,
    recentExamResults: isAdmin ? allExamResults : studentExamResultsData,
    feesData: allFeesData,
    isLoading,
    isUserLoading: isAuthLoading || isRoleLoading,
    firebaseUser,
    currentStudent,
    currentTeacher,
    isAdmin,
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
    adminStudents, teacherStudents, adminTeachers, allAttendance, allExamResults, studentExamResultsData, allFeesData,
    isLoading, isAuthLoading, isRoleLoading,
    firebaseUser, currentStudent, currentTeacher, isAdmin, userRole,
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
