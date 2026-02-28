'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { 
    STUDENT_ATTENDANCE,
    RECENT_EXAM_RESULTS,
    FEES_DATA,
    type Student,
    type Fee,
} from '@/lib/data';
import { useAuth, useFirestore, useCollection, useMemoFirebase, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, setDoc, writeBatch, getDocs, updateDoc, query } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';


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


interface DataContextType {
  students: Student[];
  teachers: Teacher[];
  studentAttendance: StudentAttendance[];
  recentExamResults: ExamResult[];
  feesData: Fee[];
  addStudent: (studentData: Omit<Student, 'id' | 'avatar' | 'status' | 'registrationId'> & { password: string }) => void;
  addTeacher: (teacherData: Omit<Teacher, 'id' | 'avatar' | 'status'> & { password: string}) => void;
  addAttendance: (attendanceData: StudentAttendance) => void;
  addExamResult: (examResultData: Omit<ExamResult, 'id'>) => void;
  addFee: (feeData: Fee) => void;
  clearStudents: () => void;
  clearTeachers: () => void;
  toggleStudentStatus: (studentId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const { user } = useUser();

  const studentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'students'))
  }, [firestore, user]);
  const { data: studentsData, isLoading: studentsLoading } = useCollection<Omit<Student, 'id'>>(studentsQuery);
  const students = useMemo(() => studentsData || [], [studentsData]);

  const teachersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'teachers'))
  }, [firestore, user]);
  const { data: teachersData, isLoading: teachersLoading } = useCollection<Omit<Teacher, 'id'>>(teachersQuery);
  const teachers = useMemo(() => teachersData || [], [teachersData]);

  // Keep mock data for these for now
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>(STUDENT_ATTENDANCE);
  const [recentExamResults, setRecentExamResults] = useState<ExamResult[]>(RECENT_EXAM_RESULTS);
  const [feesData, setFeesData] = useState<Fee[]>(FEES_DATA);

  const addStudent = useCallback(async (studentData: Omit<Student, 'id' | 'avatar' | 'status' | 'registrationId'> & { password: string }) => {
    try {
        // NOTE: Creating users on the client is not recommended for production.
        // This should be moved to a secure backend (e.g., Cloud Function).
        const userCredential = await createUserWithEmailAndPassword(auth, studentData.email, studentData.password);
        const newStudentId = userCredential.user.uid;
        
        const randomId = Math.floor(Math.random() * 10000);
        const newRegistrationId = `Hgr/${String(randomId).padStart(4, '0')}/24`;
        
        const newStudentDoc = {
            userId: newStudentId,
            firstName: studentData.name.split(' ')[0] || '',
            lastName: studentData.name.split(' ')[1] || '',
            name: studentData.name, // Keeping full name for compatibility
            class: studentData.class,
            parentName: studentData.parentName,
            mobile: studentData.mobile,
            email: studentData.email,
            registrationId: newRegistrationId,
            status: 'Active',
            avatar: `user-avatar-${(randomId % 5) + 1}`,
        };

        const studentRef = doc(firestore, 'students', newStudentId);
        setDocumentNonBlocking(studentRef, newStudentDoc, {});
        
        toast({ title: "Student Added", description: `${studentData.name} has been added successfully.` });

    } catch (error: any) {
        console.error("Error adding student:", error);
         if (error.code === 'auth/email-already-in-use') {
             toast({
                variant: "destructive",
                title: "Error adding student",
                description: "This email is already in use by another account."
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error adding student",
                description: error.message || 'An unknown error occurred.'
            });
        }
    }
  }, [auth, firestore, toast]);

  const addTeacher = useCallback(async (teacherData: Omit<Teacher, 'id' | 'avatar' | 'status'> & { password: string }) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, teacherData.email, teacherData.password);
        const newTeacherId = userCredential.user.uid;

        const randomId = Math.floor(Math.random() * 1000);
        const newTeacherDoc = {
            userId: newTeacherId,
            firstName: teacherData.name.split(' ')[0] || '',
            lastName: teacherData.name.split(' ')[1] || '',
            name: teacherData.name,
            subject: teacherData.subject,
            mobile: teacherData.mobile,
            email: teacherData.email,
            status: 'Active',
            avatar: `user-avatar-${(randomId % 3) + 6}`,
        };

        const teacherRef = doc(firestore, 'teachers', newTeacherId);
        setDocumentNonBlocking(teacherRef, newTeacherDoc, {});

        toast({ title: "Teacher Added", description: `${teacherData.name} has been added successfully.` });
    } catch (error: any) {
        console.error("Error adding teacher:", error);
        if (error.code === 'auth/email-already-in-use') {
             toast({
                variant: "destructive",
                title: "Error adding teacher",
                description: "This email is already in use by another account."
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error adding teacher",
                description: error.message || 'An unknown error occurred.'
            });
        }
    }
  }, [auth, firestore, toast]);

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

  const clearStudents = useCallback(async () => {
    console.log("Clearing all students...");
    try {
        const studentsSnapshot = await getDocs(collection(firestore, 'students'));
        studentsSnapshot.docs.forEach((studentDoc) => {
            deleteDocumentNonBlocking(doc(firestore, 'students', studentDoc.id));
            // Note: This does not delete the user from Firebase Auth.
            // That requires the Admin SDK and a backend function.
        });
        toast({ title: "Students Cleared", description: "All student data is being removed from Firestore." });
    } catch (error: any) {
        console.error("Error clearing students:", error);
        const permissionError = new FirestorePermissionError({ operation: 'list', path: 'students' });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: "destructive", title: "Error", description: "Could not list students to clear them." });
    }
  }, [firestore, toast]);

  const clearTeachers = useCallback(async () => {
    console.log("Clearing all teachers...");
    try {
        const teachersSnapshot = await getDocs(collection(firestore, 'teachers'));
        teachersSnapshot.docs.forEach((teacherDoc) => {
            deleteDocumentNonBlocking(doc(firestore, 'teachers', teacherDoc.id));
        });
        toast({ title: "Teachers Cleared", description: "All teacher data has been removed from Firestore." });
    } catch (error: any) {
        console.error("Error clearing teachers:", error);
        const permissionError = new FirestorePermissionError({ operation: 'list', path: 'teachers' });
        errorEmitter.emit('permission-error', permissionError);
         toast({ variant: "destructive", title: "Error", description: "Could not list teachers to clear them." });
    }
  }, [firestore, toast]);

  const toggleStudentStatus = useCallback((studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newStatus = student.status === 'Active' ? 'Inactive' : 'Active';
    const studentRef = doc(firestore, 'students', studentId);
    updateDocumentNonBlocking(studentRef, { status: newStatus });
  }, [firestore, students]);

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
  }), [students, teachers, studentAttendance, recentExamResults, feesData, addStudent, addTeacher, addAttendance, addExamResult, addFee, clearStudents, clearTeachers, toggleStudentStatus]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
