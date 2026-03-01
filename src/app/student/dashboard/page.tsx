'use client';

import Link from 'next/link';
import { useData } from '@/context/data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function StudentDashboardPage() {
  const { currentUser: student, recentExamResults, students } = useData();
  
  const isLoading = students.length === 0 && !student;

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
    return (
        <div className="flex items-center justify-center h-[80vh]">
            <Card>
                <CardHeader>
                    <CardTitle>Not Logged In</CardTitle>
                    <CardDescription>Please log in to view your dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/student/login">
                        <Button>Go to Login</Button>
                    </Link>
                </CardContent>
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
