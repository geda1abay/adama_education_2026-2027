'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { 
    STUDENT_ATTENDANCE,
    RECENT_EXAM_RESULTS,
    FEES_DATA,
    type Student,
    type Fee,
} from '@/lib/data';
import { useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
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
  addStudent: (studentData: Omit<Student, 'id' | 'avatar' | 'status' | 'registrationId'>) => void;
  addTeacher: (teacherData: Omit<Teacher, 'id' | 'avatar' | 'status'>) => void;
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

  const studentsQuery = useMemoFirebase(() => query(collection(firestore, 'students')), [firestore]);
  const { data: studentsData, isLoading: studentsLoading } = useCollection<Omit<Student, 'id'>>(studentsQuery);
  const students = useMemo(() => studentsData || [], [studentsData]);

  const teachersQuery = useMemoFirebase(() => query(collection(firestore, 'teachers')), [firestore]);
  const { data: teachersData, isLoading: teachersLoading } = useCollection<Omit<Teacher, 'id'>>(teachersQuery);
  const teachers = useMemo(() => teachersData || [], [teachersData]);

  // Keep mock data for these for now
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>(STUDENT_ATTENDANCE);
  const [recentExamResults, setRecentExamResults] = useState<ExamResult[]>(RECENT_EXAM_RESULTS);
  const [feesData, setFeesData] = useState<Fee[]>(FEES_DATA);

  const addStudent = useCallback(async (studentData: Omit<Student, 'id' | 'avatar' | 'status' | 'registrationId'>) => {
    try {
        // NOTE: Creating users on the client is not recommended for production.
        // This should be moved to a secure backend (e.g., Cloud Function).
        const userCredential = await createUserWithEmailAndPassword(auth, studentData.email, studentData.password);
        const newStudentId = userCredential.user.uid;
        
        const studentCount = students.length;
        const newRegistrationId = `Hgr/${String(studentCount + 1000).padStart(4, '0')}/24`;
        
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
            avatar: `user-avatar-${(studentCount % 5) + 1}`,
        };

        await setDoc(doc(firestore, 'students', newStudentId), newStudentDoc);
        await setDoc(doc(firestore, 'user_roles/students', newStudentId), { role: 'student' });
        
        toast({ title: "Student Added", description: `${studentData.name} has been added successfully.` });

    } catch (error: any) {
        console.error("Error adding student:", error);
        toast({
            variant: "destructive",
            title: "Error adding student",
            description: error.message || 'An unknown error occurred.'
        });
    }
  }, [auth, firestore, students.length, toast]);

  const addTeacher = useCallback(async (teacherData: Omit<Teacher, 'id' | 'avatar' | 'status'>) => {
    // This requires a password, but the form doesn't collect it.
    // For now, let's use a default password and log a warning.
    console.warn("Using default password for teacher creation. This should be changed.");
    const defaultPassword = "password123";

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, teacherData.email, defaultPassword);
        const newTeacherId = userCredential.user.uid;

        const teacherCount = teachers.length;
        const newTeacherDoc = {
            userId: newTeacherId,
            firstName: teacherData.name.split(' ')[0] || '',
            lastName: teacherData.name.split(' ')[1] || '',
            name: teacherData.name,
            subject: teacherData.subject,
            mobile: teacherData.mobile,
            email: teacherData.email,
            status: 'Active',
            avatar: `user-avatar-${(teacherCount % 3) + 6}`,
        };

        await setDoc(doc(firestore, 'teachers', newTeacherId), newTeacherDoc);
        await setDoc(doc(firestore, 'user_roles/teachers', newTeacherId), { role: 'teacher' });

        toast({ title: "Teacher Added", description: `${teacherData.name} has been added successfully.` });
    } catch (error: any) {
        console.error("Error adding teacher:", error);
        toast({
            variant: "destructive",
            title: "Error adding teacher",
            description: error.message || 'An unknown error occurred.'
        });
    }
  }, [auth, firestore, teachers.length, toast]);

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
        const batch = writeBatch(firestore);
        studentsSnapshot.docs.forEach((studentDoc) => {
            batch.delete(doc(firestore, 'students', studentDoc.id));
            batch.delete(doc(firestore, 'user_roles/students', studentDoc.id));
            // Note: This does not delete the user from Firebase Auth.
            // That requires the Admin SDK and a backend function.
        });
        await batch.commit();
        toast({ title: "Students Cleared", description: "All student data has been removed from Firestore." });
    } catch (error: any) {
        console.error("Error clearing students:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not clear students." });
    }
  }, [firestore, toast]);

  const clearTeachers = useCallback(async () => {
    console.log("Clearing all teachers...");
    try {
        const teachersSnapshot = await getDocs(collection(firestore, 'teachers'));
        const batch = writeBatch(firestore);
        teachersSnapshot.docs.forEach((teacherDoc) => {
            batch.delete(doc(firestore, 'teachers', teacherDoc.id));
            batch.delete(doc(firestore, 'user_roles/teachers', teacherDoc.id));
        });
        await batch.commit();
        toast({ title: "Teachers Cleared", description: "All teacher data has been removed from Firestore." });
    } catch (error: any) {
        console.error("Error clearing teachers:", error);
         toast({ variant: "destructive", title: "Error", description: "Could not clear teachers." });
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
