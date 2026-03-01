'use client';

import Link from 'next/link';
import { useData } from '@/context/data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { Award, Calculator, TrendingUp } from 'lucide-react';

export default function StudentDashboardPage() {
  const { currentUser: student, recentExamResults, isAuthLoading, students } = useData();
  
  const isLoading = isAuthLoading;

  const examResults = useMemo(() => {
    if (!student) return [];
    return recentExamResults.filter((r) => r.studentId === student.id);
  }, [student, recentExamResults]);

  const stats = useMemo(() => {
    if (!student) return { totalScore: 0, averagePercentage: '0.00', rank: 'N/A' };
    
    const processedResults = examResults.map(r => {
        const scoreParts = r.score.split('/');
        const score = parseInt(scoreParts[0], 10);
        const maxScore = scoreParts.length > 1 ? parseInt(scoreParts[1], 10) : 100;
        return {
            score: isNaN(score) ? 0 : score,
            maxScore: isNaN(maxScore) ? 100 : maxScore,
        };
    });
    
    const totalScore = processedResults.reduce((acc, r) => acc + r.score, 0);
    const totalMaxScore = processedResults.reduce((acc, r) => acc + r.maxScore, 0);
    const averagePercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

    const studentsInClass = students.filter(s => s.class === student.class);
    const studentAverages = studentsInClass.map(s => {
        const studentExams = recentExamResults.filter(r => r.studentId === s.id);
        const processedStudentResults = studentExams.map(r => {
            const scoreParts = r.score.split('/');
            const score = parseInt(scoreParts[0], 10);
            const maxScore = scoreParts.length > 1 ? parseInt(scoreParts[1], 10) : 100;
            return {
                score: isNaN(score) ? 0 : score,
                maxScore: isNaN(maxScore) ? 100 : maxScore,
            };
        });
        const totalStudentScore = processedStudentResults.reduce((acc, r) => acc + r.score, 0);
        const totalStudentMaxScore = processedStudentResults.reduce((acc, r) => acc + r.maxScore, 0);
        const average = totalStudentMaxScore > 0 ? (totalStudentScore / totalStudentMaxScore) * 100 : 0;
        return { studentId: s.id, average };
    });
    
    studentAverages.sort((a, b) => b.average - a.average);
    const rank = studentAverages.findIndex(s => s.studentId === student.id) + 1;
    
    return {
        totalScore,
        averagePercentage: averagePercentage.toFixed(2),
        rank: rank > 0 ? `${rank} / ${studentsInClass.length}` : 'N/A'
    }
  }, [student, examResults, students]);

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
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-5 w-16" /></TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-5 w-16" /></TableCell>
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Welcome, {student.name}!</h1>
        <p className="text-muted-foreground">Here is your academic summary.</p>
      </div>

       <div className="grid gap-6">
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
                    <CardTitle>Your Exam Results</CardTitle>
                    <CardDescription>A summary of your performance in recent exams.</CardDescription>
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
                            {examResults.length > 0 ? examResults.map((result) => (
                            <TableRow key={result.id}>
                                <TableCell className="font-medium">{result.subject}</TableCell>
                                <TableCell className="text-right">{result.score}</TableCell>
                            </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center">No exam results found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
       </div>
    </div>
  );
}
