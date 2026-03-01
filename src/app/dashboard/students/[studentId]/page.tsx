
'use client';

import { useParams } from 'next/navigation';
import { useData } from '@/context/data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Award, Calculator, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentDetailsPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const { students, recentExamResults, isLoading } = useData();

  const student = useMemo(() => students?.find((s) => s.id === studentId), [students, studentId]);
  const examResults = useMemo(() => recentExamResults?.filter((r) => r.studentId === studentId), [recentExamResults, studentId]);

  const avatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');

  const stats = useMemo(() => {
    if (!student || !examResults || !students) return { totalScore: 0, averagePercentage: '0.00', rank: 'N/A' };

    const totalScore = examResults.reduce((acc, r) => acc + r.score, 0);
    const totalMaxScore = examResults.reduce((acc, r) => acc + (r.maxScore || 100), 0);
    const averagePercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

    const studentsInClass = students?.filter(s => s.gradeLevel === student.gradeLevel) || [];
    const studentAverages = studentsInClass.map(s => {
      const studentExams = recentExamResults?.filter(r => r.studentId === s.id) || [];
      const totalStudentScore = studentExams.reduce((acc, r) => acc + r.score, 0);
      const totalStudentMaxScore = studentExams.reduce((acc, r) => acc + (r.maxScore || 100), 0);
      const average = totalStudentMaxScore > 0 ? (totalStudentScore / totalStudentMaxScore) * 100 : 0;
      return { studentId: s.id, average };
    });
    
    studentAverages.sort((a, b) => b.average - a.average);
    const rank = studentAverages.findIndex(s => s.studentId === studentId) + 1;
    
    return {
        totalScore,
        averagePercentage: averagePercentage.toFixed(2),
        rank: rank > 0 ? `${rank} / ${studentsInClass.length}` : 'N/A'
    }
  }, [student, examResults, students, studentId, recentExamResults]);

  if (isLoading) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-9 w-48" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                <Card><CardHeader className="items-center"><Skeleton className="h-24 w-24 rounded-full" /><Skeleton className="h-7 w-32 mt-2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                <div className="md:col-span-2 flex flex-col gap-6">
                    <Card><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
                </div>
            </div>
        </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center h-full">
         <Card className="w-full max-w-lg">
            <CardHeader>
               <CardTitle>Student Not Found</CardTitle>
               <CardDescription>The student you are looking for does not exist.</CardDescription>
            </CardHeader>
            <CardContent>
               <Link href="/dashboard/students">
                  <Button variant="outline">
                     <ArrowLeft className="mr-2 h-4 w-4" />
                     Back to Students
                  </Button>
               </Link>
            </CardContent>
         </Card>
      </div>
    );
  }
  
  const studentName = `${student.firstName} ${student.lastName}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/students">
            <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
        <h1 className="text-3xl font-bold font-headline">Student Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="items-center text-center">
                <Avatar className="h-24 w-24 mb-2">
                    <AvatarImage src={avatar?.imageUrl} alt={studentName} data-ai-hint={avatar?.imageHint} />
                    <AvatarFallback>{student.firstName.charAt(0)}{student.lastName.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle>{studentName}</CardTitle>
                <Badge variant="outline">{student.gradeLevel}</Badge>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
                <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Parent:</span>
                    <span>{student.parentIds?.join(', ') || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Contact:</span>
                    <span>{student.contactPhone}</span>
                </div>
                 <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Email:</span>
                    <span className="truncate">{student.contactEmail}</span>
                </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 flex flex-col gap-6">
             <Card>
                <CardHeader>
                    <CardTitle>Academic Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-8 sm:grid-cols-3">
                    <div className="flex items-center gap-4">
                        <Calculator className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Total Score</p>
                            <p className="text-2xl font-bold">{stats.totalScore}</p>
                        </div>
                    </div>
                        <div className="flex items-center gap-4">
                        <TrendingUp className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Average</p>
                            <p className="text-2xl font-bold">{stats.averagePercentage}%</p>
                        </div>
                    </div>
                        <div className="flex items-center gap-4">
                        <Award className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Class Rank</p>
                            <p className="text-2xl font-bold">{stats.rank}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Exam Results</CardTitle>
                    <CardDescription>A log of the student's exam results.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {examResults && examResults.length > 0 ? examResults.map((result) => (
                            <TableRow key={result.id}>
                                <TableCell>{result.subjectId}</TableCell>
                                <TableCell className="text-right">{result.score}/{result.maxScore || 100}</TableCell>
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
      </div>
    </div>
  );
}
