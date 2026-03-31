'use client';

import Link from 'next/link';
import { useData } from '@/context/data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { Award, Calculator, Download, QrCode, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function getPerformanceLabel(average: number) {
  if (average >= 75) {
    return 'Excellent';
  }

  if (average >= 50) {
    return 'Good';
  }

  return 'Needs Support';
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export default function StudentDashboardPage() {
  const { currentStudent: student, recentExamResults, isUserLoading, students } = useData();
  const slipSchoolName = 'Adama City Education Bureau';
  
  const isLoading = isUserLoading;

  const examResults = useMemo(() => {
    if (!student || !recentExamResults) return [];
    const studentName = `${student.firstName} ${student.lastName}`;
    return recentExamResults.filter((r) => r.studentName === studentName);
  }, [student, recentExamResults]);

  const stats = useMemo(() => {
    if (!student || !students || !recentExamResults) return { totalScore: 0, averagePercentage: '0.00', rank: 'N/A' };
    
    const totalScore = examResults.reduce((acc, r) => acc + r.score, 0);
    const totalMaxScore = examResults.reduce((acc, r) => acc + (r.maxScore || 100), 0);
    const averagePercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

    const studentsInClass = students.filter(s => s.gradeLevel === student.gradeLevel);
    const studentAverages = studentsInClass.map(s => {
        const studentName = `${s.firstName} ${s.lastName}`;
        const studentExams = recentExamResults.filter(r => r.studentName === studentName);
        const totalStudentScore = studentExams.reduce((acc, r) => acc + r.score, 0);
        const totalStudentMaxScore = studentExams.reduce((acc, r) => acc + (r.maxScore || 100), 0);
        const average = totalStudentMaxScore > 0 ? (totalStudentScore / totalStudentMaxScore) * 100 : 0;
        return { studentName, average };
    });
    
    studentAverages.sort((a, b) => b.average - a.average);
    const rank = studentAverages.findIndex(s => s.studentName === `${student.firstName} ${student.lastName}`) + 1;
    
    return {
        totalScore,
        averagePercentage: averagePercentage.toFixed(2),
        rank: rank > 0 ? `${rank} / ${studentsInClass.length}` : 'N/A'
    }
  }, [student, examResults, students, recentExamResults]);

  const studentName = student ? `${student.firstName} ${student.lastName}` : '';
  const latestResultDate = examResults.length > 0
    ? examResults
        .map((result) => new Date(result.resultDate).getTime())
        .reduce((latest, current) => Math.max(latest, current), 0)
    : null;
  const performanceLabel = getPerformanceLabel(Number(stats.averagePercentage));
  const qrPayload = useMemo(() => {
    if (!student) {
      return '';
    }

    return JSON.stringify({
      school: slipSchoolName,
      slipType: 'Student Result Slip',
      studentId: student.id,
      studentName,
      gradeLevel: student.gradeLevel,
      average: `${stats.averagePercentage}%`,
      rank: stats.rank,
      totalScore: stats.totalScore,
      generatedOn: new Date().toISOString(),
      latestResultDate: latestResultDate ? new Date(latestResultDate).toISOString() : null,
    });
  }, [
    latestResultDate,
    slipSchoolName,
    stats.averagePercentage,
    stats.rank,
    stats.totalScore,
    student,
    studentName,
  ]);
  const qrCodeUrl = qrPayload
    ? `https://quickchart.io/qr?text=${encodeURIComponent(qrPayload)}&size=180`
    : '';

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
      <div className="mb-6 print:hidden">
        <h1 className="text-3xl font-bold font-headline">Welcome, {studentName}!</h1>
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
                                <TableCell className="font-medium">{result.subjectName}</TableCell>
                                <TableCell className="text-right">{result.score}/{result.maxScore || 100}</TableCell>
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
            <Card className="overflow-hidden border-primary/20 print:border-black print:shadow-none">
                <CardHeader className="border-b bg-muted/40 print:bg-transparent">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>Official Result Slip</CardTitle>
                            <CardDescription>
                              Students can print or save this slip together with the QR code for quick verification.
                            </CardDescription>
                        </div>
                        <Button
                          type="button"
                          onClick={() => window.print()}
                          className="gap-2 print:hidden"
                        >
                          <Download className="h-4 w-4" />
                          Print Slip
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid gap-6 p-6 lg:grid-cols-[1fr_220px]">
                        <div className="space-y-6">
                            <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                      {slipSchoolName}
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold font-headline">Student Result Slip</h2>
                                    <p className="text-sm text-muted-foreground">
                                      Generated for exam results currently visible in the student portal.
                                    </p>
                                </div>
                                <Badge variant="outline" className="w-fit text-sm">
                                  {performanceLabel}
                                </Badge>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-lg border p-4">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Student Name</p>
                                    <p className="mt-2 text-lg font-semibold">{studentName}</p>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Student ID</p>
                                    <p className="mt-2 text-lg font-semibold">{student.id}</p>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Class</p>
                                    <p className="mt-2 text-lg font-semibold">{student.gradeLevel}</p>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Latest Result Date</p>
                                    <p className="mt-2 text-lg font-semibold">
                                      {latestResultDate ? formatDate(new Date(latestResultDate).toISOString()) : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-lg bg-primary/5 p-4">
                                    <p className="text-sm text-muted-foreground">Total Score</p>
                                    <p className="mt-2 text-3xl font-bold">{stats.totalScore}</p>
                                </div>
                                <div className="rounded-lg bg-primary/5 p-4">
                                    <p className="text-sm text-muted-foreground">Average</p>
                                    <p className="mt-2 text-3xl font-bold">{stats.averagePercentage}%</p>
                                </div>
                                <div className="rounded-lg bg-primary/5 p-4">
                                    <p className="text-sm text-muted-foreground">Class Rank</p>
                                    <p className="mt-2 text-3xl font-bold">{stats.rank}</p>
                                </div>
                            </div>

                            <div className="rounded-xl border">
                                <div className="border-b px-4 py-3">
                                    <h3 className="font-semibold">Result Breakdown</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Subject</TableHead>
                                                <TableHead className="text-right">Score</TableHead>
                                                <TableHead className="text-right">Percent</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {examResults.length > 0 ? examResults.map((result) => {
                                              const percent = result.maxScore > 0
                                                ? ((result.score / result.maxScore) * 100).toFixed(1)
                                                : '0.0';

                                              return (
                                                <TableRow key={`slip-${result.id}`}>
                                                    <TableCell className="font-medium">{result.subjectName}</TableCell>
                                                    <TableCell className="text-right">{result.score}/{result.maxScore || 100}</TableCell>
                                                    <TableCell className="text-right">{percent}%</TableCell>
                                                </TableRow>
                                              );
                                            }) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center">No exam results found.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border bg-background p-5">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <QrCode className="h-4 w-4" />
                                Verification QR
                            </div>
                            <div className="mt-4 flex justify-center rounded-xl border bg-white p-3">
                                {qrCodeUrl ? (
                                  <img
                                    src={qrCodeUrl}
                                    alt={`QR code for ${studentName}'s result slip`}
                                    className="h-[180px] w-[180px]"
                                  />
                                ) : (
                                  <div className="flex h-[180px] w-[180px] items-center justify-center text-center text-sm text-muted-foreground">
                                    QR data unavailable
                                  </div>
                                )}
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground">
                              The QR code includes the student ID, class, score summary, rank, and slip generation timestamp.
                            </p>
                            <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                              Generated on {formatDate(new Date().toISOString())}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
       </div>
    </div>
  );
}
