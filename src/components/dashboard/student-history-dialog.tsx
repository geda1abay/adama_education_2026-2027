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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { useData } from '@/context/data-context';
import type { Student } from '@/lib/data';

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
    currentTeacher,
  } = useData();

  const [editingAttId, setEditingAttId] = useState<string | null>(null);
  const [editAttStatus, setEditAttStatus] = useState<string>('');

  const [editingResId, setEditingResId] = useState<string | null>(null);
  const [editResScore, setEditResScore] = useState<string>('');
  const [editResMaxScore, setEditResMaxScore] = useState<string>('');

  if (!student) return null;

  const teacherName = currentTeacher
    ? `${currentTeacher.firstName} ${currentTeacher.lastName}`
    : null;

  const studentFullName = `${student.firstName} ${student.lastName}`;

  const studentAtt = (studentAttendance || []).filter(
    (a) => a.studentName === studentFullName
  );

  const studentRes = (recentExamResults || []).filter(
    (r) => r.studentName === studentFullName
  );

  // --- Attendance handlers ---
  const startEditAtt = (id: string, currentStatus: string) => {
    setEditingAttId(id);
    setEditAttStatus(currentStatus);
  };

  const cancelEditAtt = () => {
    setEditingAttId(null);
    setEditAttStatus('');
  };

  const saveEditAtt = async () => {
    if (!editingAttId) return;
    await updateAttendance(editingAttId, { status: editAttStatus as any });
    setEditingAttId(null);
    setEditAttStatus('');
  };

  const handleDeleteAttendance = async (id: string) => {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      await deleteAttendance(id);
    }
  };

  // --- Exam result handlers ---
  const startEditRes = (id: string, score: number, maxScore: number) => {
    setEditingResId(id);
    setEditResScore(String(score));
    setEditResMaxScore(String(maxScore));
  };

  const cancelEditRes = () => {
    setEditingResId(null);
    setEditResScore('');
    setEditResMaxScore('');
  };

  const saveEditRes = async () => {
    if (!editingResId) return;
    await updateExamResult(editingResId, {
      score: Number(editResScore),
      maxScore: Number(editResMaxScore),
    });
    setEditingResId(null);
    setEditResScore('');
    setEditResMaxScore('');
  };

  const handleDeleteResult = async (id: string) => {
    if (confirm('Are you sure you want to delete this exam result?')) {
      await deleteExamResult(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Academic History: {studentFullName}
          </DialogTitle>
          <DialogDescription>
            View, edit and manage records for this student.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="attendance">
              Attendance ({studentAtt.length})
            </TabsTrigger>
            <TabsTrigger value="results">
              Exam Results ({studentRes.length})
            </TabsTrigger>
          </TabsList>

          {/* ---- ATTENDANCE TAB ---- */}
          <TabsContent value="attendance" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recorded By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentAtt.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-4"
                    >
                      No attendance records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  studentAtt.map((att) => {
                    const isEditing = editingAttId === att.id;
                    const isOwner = att.recordedByTeacherName === teacherName;

                    return (
                      <TableRow key={att.id}>
                        <TableCell>{att.subjectName}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Select
                              value={editAttStatus}
                              onValueChange={setEditAttStatus}
                            >
                              <SelectTrigger className="w-[120px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                                <SelectItem value="late">Late</SelectItem>
                                <SelectItem value="excused">Excused</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge
                              variant={
                                att.status === 'present'
                                  ? 'default'
                                  : att.status === 'absent'
                                  ? 'destructive'
                                  : 'outline'
                              }
                            >
                              {att.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {att.recordedByTeacherName}
                        </TableCell>
                        <TableCell className="text-right">
                          {isOwner && (
                            <div className="flex justify-end gap-1">
                              {isEditing ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-green-600"
                                    onClick={saveEditAtt}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={cancelEditAtt}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() =>
                                      startEditAtt(att.id, att.status)
                                    }
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive"
                                    onClick={() =>
                                      handleDeleteAttendance(att.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TabsContent>

          {/* ---- EXAM RESULTS TAB ---- */}
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
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-4"
                    >
                      No exam results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  studentRes.map((res) => {
                    const isEditing = editingResId === res.id;
                    const isOwner = res.gradedByTeacherName === teacherName;

                    return (
                      <TableRow key={res.id}>
                        <TableCell>
                          {new Date(res.resultDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{res.subjectName}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                value={editResScore}
                                onChange={(e) => setEditResScore(e.target.value)}
                                className="w-16 h-8"
                              />
                              <span>/</span>
                              <Input
                                type="number"
                                value={editResMaxScore}
                                onChange={(e) =>
                                  setEditResMaxScore(e.target.value)
                                }
                                className="w-16 h-8"
                              />
                            </div>
                          ) : (
                            <>
                              <span className="font-bold">{res.score}</span> /{' '}
                              {res.maxScore}
                              <Badge className="ml-2" variant="secondary">
                                {Math.round(
                                  (res.score / res.maxScore) * 100
                                )}
                                %
                              </Badge>
                            </>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {res.gradedByTeacherName}
                        </TableCell>
                        <TableCell className="text-right">
                          {isOwner && (
                            <div className="flex justify-end gap-1">
                              {isEditing ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-green-600"
                                    onClick={saveEditRes}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={cancelEditRes}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() =>
                                      startEditRes(
                                        res.id,
                                        res.score,
                                        res.maxScore
                                      )
                                    }
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive"
                                    onClick={() => handleDeleteResult(res.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
