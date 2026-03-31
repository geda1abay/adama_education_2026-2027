'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Brain, Search, Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Attendance, ExamResult, Student, StudentFee, Teacher } from '@/lib/data';
import { cn } from '@/lib/utils';

interface AiProgressOverviewProps {
  students: Student[];
  teachers: Teacher[];
  recentExamResults: ExamResult[];
  studentAttendance: Attendance[];
  feesData: StudentFee[];
}

export function AiProgressOverview({
  students,
  teachers,
  recentExamResults,
  studentAttendance,
  feesData,
}: AiProgressOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [generatedStudentName, setGeneratedStudentName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return students;
    }

    return students.filter((student) =>
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(query)
    );
  }, [searchTerm, students]);

  const activeStudentName = generatedStudentName || selectedStudentName;
  const activeStudent = students.find(
    (student) => `${student.firstName} ${student.lastName}` === activeStudentName
  );

  const studentExamResults = recentExamResults.filter(
    (result) => result.studentName === activeStudentName
  );
  const studentAttendanceRecords = studentAttendance.filter(
    (record) => record.studentName === activeStudentName
  );
  const studentFeeRecords = feesData.filter((fee) => fee.studentName === activeStudentName);

  const examAverage =
    studentExamResults.length > 0
      ? studentExamResults.reduce((sum, result) => sum + result.score / result.maxScore, 0) /
        studentExamResults.length *
        100
      : 0;

  const attendanceRate =
    studentAttendanceRecords.length > 0
      ? studentAttendanceRecords.filter((record) => record.status === 'present').length /
        studentAttendanceRecords.length *
        100
      : 0;

  const totalFeesPaid = studentFeeRecords
    .filter((fee) => fee.status === 'paid')
    .reduce((sum, fee) => sum + fee.amount, 0);

  const totalFeesOutstanding = studentFeeRecords
    .filter((fee) => fee.status !== 'paid')
    .reduce((sum, fee) => sum + fee.amount, 0);

  const teachersWhoGraded = Array.from(
    new Set(studentExamResults.map((result) => result.gradedByTeacherName).filter(Boolean))
  );
  const teachersWhoRecorded = Array.from(
    new Set(studentAttendanceRecords.map((record) => record.recordedByTeacherName).filter(Boolean))
  );

  const knownTeacherNames = new Set(teachers.map((teacher) => `${teacher.firstName} ${teacher.lastName}`));
  const relatedTeacherNames = Array.from(
    new Set([...teachersWhoGraded, ...teachersWhoRecorded].filter((name) => knownTeacherNames.has(name)))
  );

  const summaryText = useMemo(() => {
    if (!generatedStudentName || !activeStudent) {
      return 'Search for a student by name, choose a match from the dropdown, then generate an AI summary.';
    }

    const academicNote =
      studentExamResults.length === 0
        ? 'No exam results are available yet.'
        : examAverage >= 75
          ? `Exam performance is strong at ${examAverage.toFixed(1)}%.`
          : examAverage >= 50
            ? `Exam performance is moderate at ${examAverage.toFixed(1)}% and could improve with extra support.`
            : `Exam performance is currently low at ${examAverage.toFixed(1)}% and needs intervention.`;

    const attendanceNote =
      studentAttendanceRecords.length === 0
        ? 'No attendance records are available yet.'
        : attendanceRate >= 85
          ? `Attendance is healthy at ${attendanceRate.toFixed(1)}%.`
          : `Attendance is only ${attendanceRate.toFixed(1)}%, which may be affecting progress.`;

    const feeNote =
      studentFeeRecords.length === 0
        ? 'No fee records are available yet.'
        : totalFeesOutstanding > 0
          ? `Fees paid total Birr ${totalFeesPaid.toFixed(2)}, with Birr ${totalFeesOutstanding.toFixed(2)} still outstanding.`
          : `All tracked fees appear paid, totaling Birr ${totalFeesPaid.toFixed(2)}.`;

    const teacherNote =
      relatedTeacherNames.length > 0
        ? `Teacher contacts tied to this record: ${relatedTeacherNames.join(', ')}.`
        : 'No teacher-linked progress records are available yet.';

    return `${activeStudent.firstName} ${activeStudent.lastName} in ${activeStudent.gradeLevel}: ${academicNote} ${attendanceNote} ${feeNote} ${teacherNote}`;
  }, [
    activeStudent,
    attendanceRate,
    generatedStudentName,
    examAverage,
    relatedTeacherNames,
    studentAttendanceRecords.length,
    studentExamResults.length,
    studentFeeRecords.length,
    totalFeesOutstanding,
    totalFeesPaid,
  ]);

  useEffect(() => {
    setGeneratedStudentName('');
  }, [selectedStudentName]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleGenerate = () => {
    if (!selectedStudentName) {
      return;
    }

    setIsGenerating(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setGeneratedStudentName(selectedStudentName);
      setIsGenerating(false);
    }, 600);
  };

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Summary
            </CardTitle>
            <CardDescription>
              Search a student and generate an AI-enhanced summary from exams, attendance, and fee records.
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            Enhanced
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Search Student</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Type student name"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Student</p>
            <Select value={selectedStudentName} onValueChange={setSelectedStudentName}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                {filteredStudents.map((student) => {
                  const studentName = `${student.firstName} ${student.lastName}`;
                  return (
                    <SelectItem key={student.id} value={studentName}>
                      {studentName} ({student.gradeLevel})
                    </SelectItem>
                  );
                })}
                {filteredStudents.length === 0 ? (
                  <div className="px-2 py-2 text-sm text-muted-foreground">No student found.</div>
                ) : null}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleGenerate} disabled={!selectedStudentName || isGenerating} className="w-full lg:w-auto">
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>

        <div
          className={cn(
            'rounded-lg border bg-background/80 p-4 transition-colors',
            generatedStudentName && 'border-green-500/40 bg-green-50/80'
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className={cn(
                  'text-sm font-medium',
                  generatedStudentName && 'text-green-700'
                )}
              >
                {generatedStudentName ? generatedStudentName : 'No student summary generated yet'}
              </p>
              <p
                className={cn(
                  'text-xs text-muted-foreground',
                  generatedStudentName && 'text-green-600'
                )}
              >
                {generatedStudentName
                  ? 'AI summary generated from the selected student record.'
                  : 'Select a student first to unlock the summary.'}
              </p>
            </div>
            {activeStudent ? (
              <Badge variant="outline">{activeStudent.gradeLevel}</Badge>
            ) : null}
          </div>
          <p
            className={cn(
              'mt-4 text-sm text-muted-foreground',
              generatedStudentName && 'text-green-700'
            )}
          >
            {summaryText}
          </p>

          {generatedStudentName ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Exam Average</p>
                <p className="mt-2 text-xl font-semibold">{examAverage.toFixed(1)}%</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Attendance</p>
                <p className="mt-2 text-xl font-semibold">{attendanceRate.toFixed(1)}%</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Fees Paid</p>
                <p className="mt-2 text-xl font-semibold">Birr {totalFeesPaid.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Fees Outstanding</p>
                <p className="mt-2 text-xl font-semibold">Birr {totalFeesOutstanding.toFixed(2)}</p>
              </div>
            </div>
          ) : null}

          {generatedStudentName ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Teachers Involved</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {relatedTeacherNames.length > 0 ? relatedTeacherNames.join(', ') : 'No linked teacher names found yet.'}
                </p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Records Used</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {studentExamResults.length} exam results, {studentAttendanceRecords.length} attendance records, and{' '}
                  {studentFeeRecords.length} fee records.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
