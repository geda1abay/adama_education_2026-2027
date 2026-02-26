'use client';

import { useData } from '@/context/data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function StudentDashboardPage() {
  // For now, we mock the logged-in student as the first one.
  // In a real app, this would come from an auth context.
  const { students, recentExamResults } = useData();
  const student = students[0];

  if (!student) {
    return (
        <div className="flex items-center justify-center h-[80vh]">
            <Card>
                <CardHeader>
                    <CardTitle>No Student Data</CardTitle>
                    <CardDescription>Could not find information. Please contact administration.</CardDescription>
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
