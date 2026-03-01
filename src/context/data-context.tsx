
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
  // Data collections
  students: WithId<Student>[] | null;
  teachers: WithId<Teacher>[] | null;
  studentAttendance: WithId<Attendance>[] | null;
  recentExamResults: WithId<ExamResult>[] | null;
  feesData: WithId<StudentFee>[] | null;

  // Loading states
  isLoading: boolean; // Combined loading state for general UI
  isUserLoading: boolean; // Specific loading state for auth/role check (used for redirects)

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

  const [userRole, setUserRole] = useState<'admin' | 'teacher' | 'student' | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) {
      setIsRoleLoading(true);
      return;
    }
    
    if (!firebaseUser || !firestore) {
      setUserRole(null);
      setIsRoleLoading(false);
      return;
    }

    setIsRoleLoading(true);
    const checkUserRole = async (user: User) => {
      try {
        // Bootstrap the first admin user if not present, and set role
        if (user.email === 'gedaabay8@gmail.com') {
          const adminRef = doc(firestore, 'admins', user.uid);
          const adminDoc = await getDoc(adminRef);
          if (!adminDoc.exists()) {
            await setDoc(adminRef, {
              userId: user.uid,
              role: 'admin',
              email: user.email,
            });
          }
          setUserRole('admin');
          return;
        }

        // Check for existing roles for other users
        const adminRef = doc(firestore, 'admins', user.uid);
        const teacherRef = doc(firestore, 'teachers', user.uid);
        const studentRef = doc(firestore, 'students', user.uid);

        const [adminDoc, teacherDoc, studentDoc] = await Promise.all([
            getDoc(adminRef),
            getDoc(teacherRef),
            getDoc(studentRef)
        ]);

        if (adminDoc.exists()) {
          setUserRole('admin');
        } else if (teacherDoc.exists()) {
          setUserRole('teacher');
        } else if (studentDoc.exists()) {
          setUserRole('student');
        } else {
          setUserRole(null); // Logged in user with no role assigned
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        setUserRole(null);
      } finally {
        // This is crucial: always set loading to false after the check.
        setIsRoleLoading(false);
      }
    };

    checkUserRole(firebaseUser);
  }, [firebaseUser, isAuthLoading, firestore]);

  const isAdmin = userRole === 'admin';
  const isTeacher = userRole === 'teacher';
  const isStudent = userRole === 'student';

  // --- Data Fetching ---
  const studentsQuery = useMemoFirebase(() => (firestore && (isAdmin || isTeacher)) ? collection(firestore, 'students') : null, [firestore, isAdmin, isTeacher]);
  const { data: students, isLoading: isStudentsLoading } = useCollection<Student>(studentsQuery);
  
  const teachersQuery = useMemoFirebase(() => (firestore && isAdmin) ? collection(firestore, 'teachers') : null, [firestore, isAdmin]);
  const { data: teachers, isLoading: isTeachersLoading } = useCollection<Teacher>(teachersQuery);

  const studentProfileRef = useMemoFirebase(() => (firestore && firebaseUser && isStudent) ? doc(firestore, 'students', firebaseUser.uid) : null, [firestore, firebaseUser, isStudent]);
  const { data: currentStudent, isLoading: isStudentProfileLoading } = useDoc<Student>(studentProfileRef);
  
  const teacherProfileRef = useMemoFirebase(() => (firestore && firebaseUser && isTeacher) ? doc(firestore, 'teachers', firebaseUser.uid) : null, [firestore, firebaseUser, isTeacher]);
  const { data: currentTeacher, isLoading: isTeacherProfileLoading } = useDoc<Teacher>(teacherProfileRef);

  const feesQuery = useMemoFirebase(() => (firestore && isAdmin) ? collectionGroup(firestore, 'studentFees') : null, [firestore, isAdmin]);
  const { data: feesData, isLoading: isFeesLoading } = useCollection<StudentFee>(feesQuery);

  const attendanceQuery = useMemoFirebase(() => (firestore && isAdmin) ? collectionGroup(firestore, 'attendance') : null, [firestore, isAdmin]);
  const { data: studentAttendance, isLoading: isAttendanceLoading } = useCollection<Attendance>(attendanceQuery);

  const examResultsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    if (isAdmin) return collectionGroup(firestore, 'examResults');
    if (isStudent && firebaseUser) return collection(firestore, 'students', firebaseUser.uid, 'examResults');
    return null;
  }, [firestore, isAdmin, isStudent, firebaseUser]);
  const { data: recentExamResults, isLoading: isExamResultsLoading } = useCollection<ExamResult>(examResultsQuery);

  // --- Settings ---
  const adminProfileDoc = useMemoFirebase(() => (firestore && isAdmin) ? doc(firestore, 'settings', 'adminProfile') : null, [firestore, isAdmin]);
  const { data: adminProfile, isLoading: isAdminProfileLoading } = useDoc<AdminProfile>(adminProfileDoc);
  const schoolInfoDoc = useMemoFirebase(() => (firestore && isAdmin) ? doc(firestore, 'settings', 'schoolInfo') : null, [firestore, isAdmin]);
  const { data: schoolInfo, isLoading: isSchoolInfoLoading } = useDoc<SchoolInfo>(schoolInfoDoc);
  const appearanceDoc = useMemoFirebase(() => (firestore && isAdmin) ? doc(firestore, 'settings', 'appearance') : null, [firestore, isAdmin]);
  const { data: appearance, isLoading: isAppearanceLoading } = useDoc<Appearance>(appearanceDoc);
  
  // --- Auth Functions ---
  const adminLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!auth) return false;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error("Admin login failed:", error);
      return false;
    }
  }, [auth]);

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
      setUserRole(null);
    }
  }, [auth]);

  // --- Mutations ---
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
        dateOfBirth: new Date().toISOString(),
        gender: 'Not specified',
        address: 'Not specified',
        parentIds: [],
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
        toast({ title: 'Student Deleted', description: 'Student profile has been removed.' });
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
        toast({ title: 'Teacher Deleted', description: 'Teacher profile has been removed.' });
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

  const isUserLoadingValue = isAuthLoading || isRoleLoading;

  const isDataLoading = useMemo(() => {
    if (isUserLoadingValue) return true;
    if (isAdmin) return isStudentsLoading || isTeachersLoading || isFeesLoading || isAttendanceLoading || isExamResultsLoading || isAdminProfileLoading || isSchoolInfoLoading || isAppearanceLoading;
    if (isTeacher) return isStudentsLoading || isTeacherProfileLoading;
    if (isStudent) return isStudentProfileLoading || isExamResultsLoading;
    return false;
  }, [isUserLoadingValue, isAdmin, isTeacher, isStudent, isStudentsLoading, isTeachersLoading, isFeesLoading, isAttendanceLoading, isExamResultsLoading, isAdminProfileLoading, isSchoolInfoLoading, isAppearanceLoading, isTeacherProfileLoading, isStudentProfileLoading]);

  const value = useMemo(() => ({
    students,
    teachers,
    studentAttendance,
    recentExamResults,
    feesData,
    isLoading: isDataLoading,
    isUserLoading: isUserLoadingValue,
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
    students, teachers, studentAttendance, recentExamResults, feesData,
    isDataLoading, isUserLoadingValue,
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
