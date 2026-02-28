'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { 
    STUDENTS, 
    TEACHERS,
    STUDENT_ATTENDANCE,
    RECENT_EXAM_RESULTS,
    FEES_DATA,
    type Student,
    type Fee,
} from '@/lib/data';

type Teacher = (typeof TEACHERS)[number];
type StudentAttendance = (typeof STUDENT_ATTENDANCE)[number];
type ExamResult = (typeof RECENT_EXAM_RESULTS)[number];


interface DataContextType {
  students: Student[];
  teachers: Teacher[];
  studentAttendance: StudentAttendance[];
  recentExamResults: ExamResult[];
  feesData: Fee[];
  addStudent: (studentData: Omit<Student, 'id' | 'avatar' | 'status' | 'registrationId'>) => void;
  addAttendance: (attendanceData: StudentAttendance) => void;
  addExamResult: (examResultData: Omit<ExamResult, 'id'>) => void;
  addFee: (feeData: Fee) => void;
  clearStudents: () => void;
  clearTeachers: () => void;
  toggleStudentStatus: (studentId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(STUDENTS);
  const [teachers, setTeachers] = useState<Teacher[]>(TEACHERS);
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>(STUDENT_ATTENDANCE);
  const [recentExamResults, setRecentExamResults] = useState<ExamResult[]>(RECENT_EXAM_RESULTS);
  const [feesData, setFeesData] = useState<Fee[]>(FEES_DATA);

  const addStudent = useCallback((studentData: Omit<Student, 'id' | 'avatar' | 'status' | 'registrationId'>) => {
    const newStudentId = `STU-${String(students.length + 1).padStart(3, '0')}`;
    const newRegistrationId = `Hgr/${String(students.length + 1000).padStart(4, '0')}/24`;
    const newStudent: Student = {
      id: newStudentId,
      registrationId: newRegistrationId,
      ...studentData,
      status: 'Active',
      avatar: `user-avatar-${(students.length % 5) + 1}`,
    };
    setStudents(prev => [...prev, newStudent]);

    // Add attendance for the new student for one year
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const newAttendance: StudentAttendance[] = months.map((month, monthIndex) => {
      const studentIdNum = parseInt(newStudentId.split('-')[1]);
      const daysPresent = 18 + ((studentIdNum + monthIndex) % 5);
      return {
        studentId: newStudentId,
        month,
        daysPresent,
        totalDays: 22,
      };
    });
    setStudentAttendance(prev => [...prev, ...newAttendance]);

    // Add a placeholder exam result
    const newExamResult: ExamResult = {
        id: `EXAM-${String(recentExamResults.length + 1).padStart(3, '0')}`,
        studentId: newStudentId,
        subject: 'Mathematics',
        score: 'N/A',
        grade: 'N/A',
    };
    setRecentExamResults(prev => [newExamResult, ...prev]);

    // Add a fee record
    const newFee: Fee = {
        studentId: newStudentId,
        amount: 1200,
        dueDate: '2024-08-15',
        status: 'Due',
    };
    setFeesData(prev => [...prev, newFee]);
  }, [students.length, recentExamResults.length]);

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
    setStudentAttendance([]);
    setRecentExamResults([]);
    setFeesData([]);
  }, []);

  const clearTeachers = useCallback(() => {
    setTeachers([]);
  }, []);

  const toggleStudentStatus = useCallback((studentId: string) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, status: student.status === 'Active' ? 'Inactive' : 'Active' }
          : student
      )
    );
  }, []);

  const value = useMemo(() => ({
    students,
    teachers,
    studentAttendance,
    recentExamResults,
    feesData,
    addStudent,
    addAttendance,
    addExamResult,
    addFee,
    clearStudents,
    clearTeachers,
    toggleStudentStatus,
  }), [students, teachers, studentAttendance, recentExamResults, feesData, addStudent, addAttendance, addExamResult, addFee, clearStudents, clearTeachers, toggleStudentStatus]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
