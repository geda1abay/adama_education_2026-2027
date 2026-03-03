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
import {
  collection,
  doc,
  deleteDoc,
  serverTimestamp,
  collectionGroup,
  query,
  where,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  useAuth,
  useFirestore,
  useUser,
  useMemoFirebase,
  useCollection,
  useDoc,
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
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


type WithId<T> = T & { id: string };

interface DataContextType {
  // Data from Firestore
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
  firebaseUser: any | null; // Keep firebaseUser for general auth state
  userRole: 'admin' | 'student' | 'teacher' | null;
  isAdmin: boolean;
  currentStudent: WithId<Student> | null;
  currentTeacher: WithId<Teacher> | null;

  // Settings (can remain local or be moved to Firestore)
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

export function DataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user: firebaseUser, isUserLoading } = useUser();

  const [userRole, setUserRole] = useState<'admin' | 'student' | 'teacher' | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  // Firestore References
  const usersRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const studentsRef = useMemoFirebase(() => collection(firestore, 'students'), [firestore]);
  const teachersRef = useMemoFirebase(() => collection(firestore, 'teachers'), [firestore]);
  const attendanceRef = useMemoFirebase(() => collection(firestore, 'attendance'), [firestore]);
  const feesRef = useMemoFirebase(() => collection(firestore, 'fees'), [firestore]);
  
  // Real-time data fetching
  const { data: students, isLoading: studentsLoading } = useCollection<Student>(userRole === 'admin' ? studentsRef : null);
  const { data: teachers, isLoading: teachersLoading } = useCollection<Teacher>(userRole === 'admin' ? teachersRef : null);
  
  const attendanceQuery = useMemoFirebase(() => {
    if (!userRole || !firebaseUser) return null;
    if (userRole === 'admin') return attendanceRef;
    if (userRole === 'student') return query(attendanceRef, where('studentId', '==', firebaseUser.uid));
    if (userRole === 'teacher') return query(attendanceRef, where('recordedByTeacherId', '==', firebaseUser.uid));
    return null;
  }, [firestore, firebaseUser, userRole, attendanceRef]);
  const { data: studentAttendance, isLoading: attendanceLoading } = useCollection<Attendance>(attendanceQuery);

  const feesQuery = useMemoFirebase(() => {
    if (!userRole || !firebaseUser) return null;
    if (userRole === 'admin') return feesRef;
    if (userRole === 'student') return query(feesRef, where('studentId', '==', firebaseUser.uid));
    return null;
  }, [firestore, firebaseUser, userRole, feesRef]);
  const { data: feesData, isLoading: feesLoading } = useCollection<StudentFee>(feesQuery);

  const { data: userRoleDoc } = useDoc<{ role: 'admin' | 'student' | 'teacher' }>(
    firebaseUser ? doc(usersRef, firebaseUser.uid) : null
  );

  const { data: currentStudent } = useDoc<Student>(
    userRole === 'student' && firebaseUser ? doc(studentsRef, firebaseUser.uid) : null
  );

  const { data: currentTeacher } = useDoc<Teacher>(
    userRole === 'teacher' && firebaseUser ? doc(teachersRef, firebaseUser.uid) : null
  );
  
  const examsQuery = useMemoFirebase(() => {
    if (!userRole || !firebaseUser) return null;

    const group = collectionGroup(firestore, 'examResults');

    if (userRole === 'admin') {
      return group;
    }
    if (userRole === 'student') {
      return query(group, where('studentUserId', '==', firebaseUser.uid));
    }
    if (userRole === 'teacher') {
      return query(group, where('gradedByTeacherUserId', '==', firebaseUser.uid));
    }

    return null; // No query for other cases
  }, [firestore, firebaseUser, userRole]);

  const { data: recentExamResults, isLoading: examsLoading } = useCollection<ExamResult>(examsQuery);

  // Settings State (kept local for now)
  const [adminProfile, setAdminProfile] = useState<WithId<AdminProfile> | null>(null);
  const [schoolInfo, setSchoolInfo] = useState<WithId<SchoolInfo> | null>(null);
  const [appearance, setAppearance] = useState<WithId<Appearance> | null>(null);
  
  useEffect(() => {
    if (!isUserLoading) {
      if (firebaseUser) {
        if (userRoleDoc) {
          setUserRole(userRoleDoc.role);
          setIsRoleLoading(false);
        } else {
          // If the user document doesn't exist, they have no role.
          // This can happen briefly after user creation.
          // We don't set role to null immediately, but wait for doc.
           if (isRoleLoading) {
            // still waiting for doc, do nothing
           } else {
            setUserRole(null)
           }
        }
      } else {
        // No user, no role
        setIsRoleLoading(false);
        setUserRole(null);
      }
    }
  }, [isUserLoading, firebaseUser, userRoleDoc, isRoleLoading]);

  // One-time database seeding
  useEffect(() => {
    const seedDatabase = async () => {
      if (isUserLoading || !firestore || userRole !== 'admin') {
        return;
      }
      
      const seededRef = doc(firestore, 'meta', 'seeded');
      const seededSnap = await getDoc(seededRef);

      if (seededSnap.exists()) {
        return; // Already seeded
      }
      
      toast({ title: "Setting up demo data...", description: "Please wait a moment." });
      
      try {
        // Seed Students & Users
        for (const student of SEED_STUDENTS) {
          setDocumentNonBlocking(doc(usersRef, student.userId), {
            id: student.userId, email: student.contactEmail, role: 'student',
            firstName: student.firstName, lastName: student.lastName,
            createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
          }, { merge: true });
          setDocumentNonBlocking(doc(studentsRef, student.id), student, { merge: true });
        }

        // Seed Teachers & Users
        for (const teacher of SEED_TEACHERS) {
           setDocumentNonBlocking(doc(usersRef, teacher.userId), {
            id: teacher.userId, email: teacher.contactEmail, role: 'teacher',
            firstName: teacher.firstName, lastName: teacher.lastName,
            createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
          }, { merge: true });
          setDocumentNonBlocking(doc(teachersRef, teacher.id), teacher, { merge: true });
        }

        // Seed Attendance
        for (const attendance of SEED_ATTENDANCE) {
            addDocumentNonBlocking(attendanceRef, attendance);
        }

        // Seed Fees
         for (const fee of SEED_FEES) {
            addDocumentNonBlocking(feesRef, fee);
        }

        // Seed Exam Results (into subcollections for correctness)
        for (const result of SEED_EXAM_RESULTS) {
            // This assumes a class structure that we might not have yet.
            // For seeding, let's just place them where rules might find them,
            // even if the class documents don't exist. This is a simplification for demo data.
            const resultRef = doc(firestore, `classes/class-1/exams/exam-1/examResults/${result.id}`);
            setDocumentNonBlocking(resultRef, result, { merge: true });
        }

        // Set the seeded flag
        await setDoc(seededRef, { seeded: true, seededAt: serverTimestamp() });
        toast({ title: "Demo Data Ready!", description: "Your application is now populated with sample data." });

      } catch (error) {
         console.error("Database seeding failed:", error);
         toast({ variant: 'destructive', title: "Seeding Failed", description: "Could not add demo data." });
      }
    };

    seedDatabase();
  }, [firestore, userRole, isUserLoading, toast, usersRef, studentsRef, teachersRef, attendanceRef, feesRef]);


  // Login Functions
  const adminLogin = async (email: string, password: string): Promise<string | null> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return null; // Success
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed' || (error.message && error.message.includes('identity-toolkit-api-has-not-been-used'))) {
        return 'Firebase Authentication API is not enabled for this project. Please go to the Firebase Console, select your project, navigate to the Authentication section, and click "Get started" to enable it.';
      }
      if (error.code === 'auth/invalid-credential' && email === 'admin@example.com') {
        try {
          const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
          if (newUserCredential.user) {
            const userDocRef = doc(usersRef, newUserCredential.user.uid);
            await setDoc(userDocRef, {
              id: newUserCredential.user.uid,
              email: email,
              role: 'admin',
              firstName: 'Admin',
              lastName: 'User',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            return null; // Success after creation
          }
          return "Failed to create new admin user account.";
        } catch (createError: any) {
          if (createError.code === 'auth/operation-not-allowed') {
            return 'Could not create admin account. Please ensure the "Email/Password" sign-in provider is enabled in your Firebase Console (Authentication > Sign-in method).';
          }
          if (createError.message && createError.message.includes('identity-toolkit-api-has-not-been-used')) {
            return 'Firebase Authentication API is not enabled for this project. Please go to the Firebase Console, select your project, navigate to the Authentication section, and click "Get started" to enable it.';
          }
          console.error('Failed to auto-create admin user:', createError);
          return createError.message || "An unknown error occurred during admin account creation.";
        }
      }
      
      console.error('Admin login failed:', error);
      return error.message || 'An unknown login error occurred.';
    }
  };

  const loginStudent = async (email: string, password: string): Promise<string | null> => {
     try {
      await signInWithEmailAndPassword(auth, email, password);
      return null;
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed' || (error.message && error.message.includes('identity-toolkit-api-has-not-been-used'))) {
        return 'Firebase Authentication API is not enabled for this project. Please go to the Firebase Console, select your project, navigate to the Authentication section, and click "Get started" to enable it.';
      }
      console.error('Student login failed:', error);
      return error.message || 'An unknown error occurred.';
    }
  };

  const loginTeacher = async (email: string, password: string): Promise<string | null> => {
     try {
      await signInWithEmailAndPassword(auth, email, password);
      return null;
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed' || (error.message && error.message.includes('identity-toolkit-api-has-not-been-used'))) {
        return 'Firebase Authentication API is not enabled for this project. Please go to the Firebase Console, select your project, navigate to the Authentication section, and click "Get started" to enable it.';
      }
      console.error('Teacher login failed:', error);
      return error.message || 'An unknown error occurred.';
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserRole(null);
  };
  
  // Data modification functions
  const addStudent = async (data: Omit<Student, 'id' | 'userId' | 'parentIds' | 'enrollmentDate' | 'dateOfBirth' | 'gender' | 'address'> & { password?: string }) => {
    if (!data.password) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password is required to create a student user.' });
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.contactEmail, data.password);
      const newUserId = userCredential.user.uid;
      
      const userDocRef = doc(usersRef, newUserId);
      setDocumentNonBlocking(userDocRef, {
        id: newUserId,
        email: data.contactEmail,
        role: 'student',
        firstName: data.firstName,
        lastName: data.lastName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      const studentDocRef = doc(studentsRef, newUserId);
      const newStudent: Omit<Student, 'id'> = {
        ...data,
        userId: newUserId,
        parentIds: [],
        enrollmentDate: new Date().toISOString(),
        dateOfBirth: new Date().toISOString(),
        gender: 'Not Specified',
        address: 'Not Specified',
      };
      setDocumentNonBlocking(studentDocRef, newStudent, { merge: true });

      toast({ title: 'Student Added', description: `${data.firstName} has been added.` });
    } catch (error: any) {
      console.error("Error adding student:", error);
      let errorMessage = error.message;
      if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Could not create student account. Please ensure the "Email/Password" sign-in provider is enabled in your Firebase Console.';
      }
      toast({ variant: 'destructive', title: 'Error Adding Student', description: errorMessage });
    }
  };

  const deleteStudent = async (studentId: string) => {
    // This is complex because it involves deleting auth user.
    // For now, just delete the Firestore doc.
    await deleteDocumentNonBlocking(doc(studentsRef, studentId));
    await deleteDocumentNonBlocking(doc(usersRef, studentId));
    toast({ title: 'Student Deleted' });
  };
  
  const addTeacher = async (data: Omit<Teacher, 'id' | 'userId' | 'hireDate' | 'qualification' | 'address'> & { classes?: string; password?: string }) => {
    if (!data.password) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password is required to create a teacher user.' });
      return;
    }
     try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.contactEmail, data.password);
      const newUserId = userCredential.user.uid;
      
      const userDocRef = doc(usersRef, newUserId);
      setDocumentNonBlocking(userDocRef, {
        id: newUserId,
        email: data.contactEmail,
        role: 'teacher',
        firstName: data.firstName,
        lastName: data.lastName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      const teacherDocRef = doc(teachersRef, newUserId);
      const newTeacher: Omit<Teacher, 'id'> = {
        ...data,
        userId: newUserId,
        hireDate: new Date().toISOString(),
        qualification: 'Not specified',
        address: 'Not specified',
        classes: data.classes ? data.classes.split(',').map(c => c.trim()) : [],
      };
      setDocumentNonBlocking(teacherDocRef, newTeacher, { merge: true });

      toast({ title: 'Teacher Added', description: `${data.firstName} has been added.` });
    } catch (error: any) {
      console.error("Error adding teacher:", error);
      let errorMessage = error.message;
      if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Could not create teacher account. Please ensure the "Email/Password" sign-in provider is enabled in your Firebase Console.';
      }
      toast({ variant: 'destructive', title: 'Error Adding Teacher', description: errorMessage });
    }
  };
  
  const deleteTeacher = async (teacherId: string) => {
    await deleteDocumentNonBlocking(doc(teachersRef, teacherId));
    await deleteDocumentNonBlocking(doc(usersRef, teacherId));
    toast({ title: 'Teacher Deleted' });
  };
  
  const addAttendance = async (data: Omit<Attendance, 'id'>) => {
    await addDocumentNonBlocking(attendanceRef, data);
    toast({ title: 'Attendance Added' });
  };

  const addExamResult = async (data: Omit<ExamResult, 'id'>) => {
     // For now, add to the top-level collection for simplicity.
     const examResultsRef = collectionGroup(firestore, 'examResults');
     await addDocumentNonBlocking(collection(firestore, 'examResults'), {
       ...data,
       resultDate: new Date().toISOString()
     });
     toast({ title: 'Exam Result Added' });
  };

  const addFee = async (data: Omit<StudentFee, 'id'>) => {
    await addDocumentNonBlocking(feesRef, data);
    toast({ title: 'Fee Record Added' });
  };

  // Settings functions (local state updates)
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
  
  // Set default settings if they are not loaded
  useEffect(() => {
    if (!adminProfile) setAdminProfile({ id: 'admin-profile', name: 'Admin', email: firebaseUser?.email || '' });
    if (!schoolInfo) setSchoolInfo({id: 'school-info', name: 'Adama Model', address: 'Adama, Ethiopia', contact: '+251 912 345 678'});
    if (!appearance) setAppearance({id: 'appearance', theme: '259 71% 50%', darkMode: false});
  }, [adminProfile, schoolInfo, appearance, firebaseUser]);


  const value = useMemo(
    () => ({
      students,
      teachers,
      studentAttendance,
      recentExamResults,
      feesData,
      isLoading: studentsLoading || teachersLoading || attendanceLoading || examsLoading || isUserLoading || isRoleLoading,
      isUserLoading,
      isRoleLoading,
      firebaseUser,
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
    }),
    [
      students,
      teachers,
      studentAttendance,
      recentExamResults,
      feesData,
      studentsLoading,
      teachersLoading,
      attendanceLoading,
      examsLoading,
      feesLoading,
      isUserLoading,
      isRoleLoading,
      firebaseUser,
      userRole,
      currentStudent,
      currentTeacher,
      adminProfile,
      schoolInfo,
      appearance,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      addStudent,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
