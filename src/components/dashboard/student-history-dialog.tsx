'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { useData } from '@/context/data-context';
import type { Student, Attendance, ExamResult } from '@/lib/data';
import { AddAttendanceDialog } from './add-attendance-dialog';
import { AddExamResultDialog } from './add-exam-result-dialog';

interface StudentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

export function StudentHistoryDialog({
  open,
  onOpenChange,
  student,
}: StudentHistoryDialogProps) {
  const { 
    studentAttendance, 
    recentExamResults, 
    deleteAttendance, 
    deleteExamResult,
    updateAttendance,
    updateExamResult,
    currentTeacher 
  } = useData();

  if (!student) return null;

  const teacherName = currentTeacher ? `${currentTeacher.firstName} ${currentTeacher.lastName}` : null;

  const studentAtt = (studentAttendance || []).filter(
    (a) => a.studentName === `${student.firstName} ${student.lastName}`
  );

  const studentRes = (recentExamResults || []).filter(
    (r) => r.studentName === `${student.firstName} ${student.lastName}`
  );

  const handleDeleteAttendance = async (id: string) => {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      await deleteAttendance(id);
    }
  };

  const handleDeleteResult = async (id: string) => {
    if (confirm('Are you sure you want to delete this exam result?')) {
      await deleteExamResult(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Academic History: {student.firstName} {student.lastName}</DialogTitle>
          <DialogDescription>
            View and manage records for this student.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="results">Exam Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="attendance" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recorded By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentAtt.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                      No attendance records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  studentAtt.map((att) => (
                    <TableRow key={att.id}>
                      <TableCell>{new Date().toLocaleDateString()}</TableCell>
                      <TableCell>{att.subjectName}</TableCell>
                      <TableCell>
                        <Badge variant={
                          att.status === 'present' ? 'default' :
                          att.status === 'absent' ? 'destructive' : 'outline'
                        }>
                          {att.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{att.recordedByTeacherName}</TableCell>
                      <TableCell className="text-right">
                        {att.recordedByTeacherName === teacherName && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteAttendance(att.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Graded By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentRes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                      No exam results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  studentRes.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell>{new Date(res.resultDate).toLocaleDateString()}</TableCell>
                      <TableCell>{res.subjectName}</TableCell>
                      <TableCell>
                        <span className="font-bold">{res.score}</span> / {res.maxScore}
                        <Badge className="ml-2" variant="secondary">
                          {Math.round((res.score / res.maxScore) * 100)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{res.gradedByTeacherName}</TableCell>
                      <TableCell className="text-right">
                        {res.gradedByTeacherName === teacherName && (
                          <div className="flex justify-end gap-2">
                             <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteResult(res.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
