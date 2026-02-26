'use client';

import { useEffect, useState } from 'react';
import { useData } from '@/context/data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Student } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentDashboardPage() {
  const { students, recentExamResults } = useData();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const studentId = sessionStorage.getItem('studentId');
    // The auth check is now in the layout, so we just need to get the student data
    if (studentId) {
      const currentStudent = students.find(s => s.id === studentId);
      if (currentStudent) {
        setStudent(currentStudent);
      }
    }
    setIsLoading(false);
  }, [students]);


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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead className="text-right">Grade</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-6 w-10 inline-block" /></TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-6 w-10 inline-block" /></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!student) {
    // This case should be handled by the redirect in the layout, but as a fallback.
    return (
        <div className="flex items-center justify-center h-[80vh]">
            <Card>
                <CardHeader>
                    <CardTitle>Student Not Found</CardTitle>
                    <CardDescription>Could not find your information. Please try logging in again.</CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
  }

  const examResults = recentExamResults.filter((r) => r.studentId === student.id);
  
  const getGradeVariant = (grade: string) => {
    if (grade.startsWith('A') || grade === 'N/A') return 'default';
    if (grade.startsWith('B')) return 'secondary';
    if (grade.startsWith('C')) return 'outline';
    return 'destructive';
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Welcome, {student.name}!</h1>
        <p className="text-muted-foreground">Here are your latest exam results.</p>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Your Exam Results</CardTitle>
              <CardDescription>A summary of your performance in recent exams.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead className="text-right">Grade</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {examResults.length > 0 ? examResults.map((result) => (
                      <TableRow key={result.id}>
                          <TableCell className="font-medium">{result.subject}</TableCell>
                          <TableCell>{result.score}</TableCell>
                          <TableCell className="text-right">
                          <Badge variant={getGradeVariant(result.grade) as any}>{result.grade}</Badge>
                          </TableCell>
                      </TableRow>
                      )) : (
                          <TableRow>
                              <TableCell colSpan={3} className="text-center">No exam results found.</TableCell>
                          </TableRow>
                      )}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
    </div>
  );
}
