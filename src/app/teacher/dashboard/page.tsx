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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlusCircle } from 'lucide-react';
import { AddAttendanceDialog } from '@/components/dashboard/add-attendance-dialog';
import { AddExamResultDialog } from '@/components/dashboard/add-exam-result-dialog';

export default function TeacherDashboardPage() {
  const { 
    currentTeacher: teacher, 
    isTeacherAuthLoading, 
    students,
    addAttendance,
    addExamResult
  } = useData();

  const [isAddAttendanceDialogOpen, setIsAddAttendanceDialogOpen] = useState(false);
  const [isAddExamResultDialogOpen, setIsAddExamResultDialogOpen] = useState(false);
  
  const isLoading = isTeacherAuthLoading;

  const myStudents = useMemo(() => {
    if (!teacher) return [];
    return students.filter(student => teacher.classes.includes(student.class));
  }, [teacher, students]);
  
  const getImage = (avatarId: string) => PlaceHolderImages.find((img) => img.id === avatarId);

  const handleAddAttendance = (data: any) => {
    addAttendance(data);
    setIsAddAttendanceDialogOpen(false);
  };
  
  const handleAddExamResult = (data: any) => {
    // The teacher should only be able to add results for their subject
    addExamResult({ ...data, subject: teacher?.subject || data.subject, grade: 'N/A' });
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

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Welcome, {teacher.name}!</h1>
            <p className="text-muted-foreground">Here are the students in your classes: {teacher.classes.join(', ')}.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
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
            <CardTitle>My Students</CardTitle>
            <CardDescription>A list of students you can manage.</CardDescription>
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
                  <TableHead className="hidden md:table-cell">
                    Parent
                  </TableHead>
                   <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myStudents.map((student) => {
                  const avatar = getImage(student.avatar);
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={avatar?.imageUrl}
                            alt={avatar?.description || student.name}
                            data-ai-hint={avatar?.imageHint}
                          />
                          <AvatarFallback>
                            {student.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.class}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.parentName}
                      </TableCell>
                       <TableCell>
                        <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                          {student.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
        </CardContent>
         <CardFooter>
            <div className="text-xs text-muted-foreground">
            Showing <strong>{myStudents.length}</strong> students.
            </div>
        </CardFooter>
      </Card>

      <AddAttendanceDialog 
        open={isAddAttendanceDialogOpen}
        onOpenChange={setIsAddAttendanceDialogOpen}
        onAttendanceAdd={handleAddAttendance}
        students={myStudents}
      />
      <AddExamResultDialog
        open={isAddExamResultDialogOpen}
        onOpenChange={setIsAddExamResultDialogOpen}
        onExamResultAdd={handleAddExamResult}
        students={myStudents}
        defaultSubject={teacher.subject}
      />
    </div>
  );
}
