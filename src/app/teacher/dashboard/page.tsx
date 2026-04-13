'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useData } from '@/context/data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlusCircle, History, Filter } from 'lucide-react';
import { AddAttendanceDialog } from '@/components/dashboard/add-attendance-dialog';
import { AddExamResultDialog } from '@/components/dashboard/add-exam-result-dialog';
import { StudentHistoryDialog } from '@/components/dashboard/student-history-dialog';
import type { Attendance, ExamResult, Student } from '@/lib/data';

export default function TeacherDashboardPage() {
  const { 
    currentTeacher: teacher, 
    isUserLoading,
    students,
    addAttendance,
    addExamResult
  } = useData();

  const [isAddAttendanceDialogOpen, setIsAddAttendanceDialogOpen] = useState(false);
  const [isAddExamResultDialogOpen, setIsAddExamResultDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  
  const isLoading = isUserLoading;

  const teacherClasses = useMemo(() => {
    if (!teacher) return [];
    return (teacher.classes || []).map((c) => c.trim()).filter(Boolean);
  }, [teacher]);

  const myStudents = useMemo(() => {
    if (!teacher || !students) return [];

    const lowerClasses = teacherClasses.map((c) => c.toLowerCase());

    if (lowerClasses.length === 0) return [];

    return students.filter((student) =>
      lowerClasses.includes(student.gradeLevel.trim().toLowerCase())
    );
  }, [teacher, students, teacherClasses]);

  const filteredStudents = useMemo(() => {
    if (selectedClass === 'all') return myStudents;
    return myStudents.filter(
      (s) => s.gradeLevel.trim().toLowerCase() === selectedClass.toLowerCase()
    );
  }, [myStudents, selectedClass]);
  
  const getImage = (avatarId: string) => PlaceHolderImages.find((img) => img.id === avatarId);

  const handleAddAttendance = async (data: Omit<Attendance, 'id' | 'recordedByTeacherName'>) => {
    await addAttendance(data);
    setIsAddAttendanceDialogOpen(false);
  };
  
  const handleAddExamResult = async (data: Parameters<typeof addExamResult>[0]) => {
    await addExamResult({ ...data, subjectName: teacher?.department || data.subjectName });
    setIsAddExamResultDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Card>
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>Please log in to view your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/teacher/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const teacherName = `${teacher.firstName} ${teacher.lastName}`;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Welcome, {teacherName}!</h1>
            <p className="text-muted-foreground">Here are the students you can manage.</p>
        </div>
        <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
            <Button onClick={() => setIsAddAttendanceDialogOpen(true)} size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Attendance
              </span>
            </Button>
            <Button onClick={() => setIsAddExamResultDialogOpen(true)} size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Exam Result
              </span>
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <CardTitle>My Students</CardTitle>
              <CardDescription>
                {teacherClasses.length > 0
                  ? `Students from ${teacherClasses.join(', ')}.`
                  : 'No class has been assigned to your account yet.'}
              </CardDescription>
            </div>
            {teacherClasses.length > 1 && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {teacherClasses.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
           <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="hidden lg:table-cell">DOB</TableHead>
                  <TableHead className="hidden xl:table-cell">Gender</TableHead>
                  <TableHead className="hidden xl:table-cell">Address</TableHead>
                  <TableHead className="hidden md:table-cell">Student Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Parent Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      {teacher.classes && teacher.classes.length > 0
                        ? 'No students found in your assigned classes.'
                        : 'Ask an administrator to assign one or more classes to your account.'}
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.map((student) => {
                  const avatar = getImage('user-avatar-1');
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={avatar?.imageUrl}
                            alt={student.firstName}
                            data-ai-hint={avatar?.imageHint}
                          />
                          <AvatarFallback>
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.gradeLevel}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {new Date(student.dateOfBirth).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {student.gender}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell max-w-[220px] truncate">
                        {student.address}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.contactPhone}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {student.parentPhone}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 gap-1"
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsHistoryDialogOpen(true);
                          }}
                        >
                          <History className="h-4 w-4" />
                          <span className="sr-only sm:not-sr-only">History</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
        </CardContent>
         <CardFooter>
             <div className="text-xs text-muted-foreground">
            Showing <strong>{filteredStudents.length}</strong> of <strong>{myStudents.length}</strong> students.
            </div>
        </CardFooter>
      </Card>

      <AddAttendanceDialog 
        open={isAddAttendanceDialogOpen}
        onOpenChange={setIsAddAttendanceDialogOpen}
        onAttendanceAdd={handleAddAttendance}
        students={filteredStudents}
      />
      <AddExamResultDialog
        open={isAddExamResultDialogOpen}
        onOpenChange={setIsAddExamResultDialogOpen}
        onExamResultAdd={handleAddExamResult}
        students={filteredStudents}
        defaultSubject={teacher.department}
      />
      <StudentHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        student={selectedStudent}
      />
    </div>
  );
}
