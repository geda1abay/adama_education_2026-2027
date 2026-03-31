'use client';

import { useState, useMemo } from 'react';
import { FileDown, ListFilter, PlusCircle } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EXAM_STAT_CARDS } from '@/lib/data';
import { useData } from '@/context/data-context';
import { AddExamResultDialog } from '@/components/dashboard/add-exam-result-dialog';
import type { ExamResult, Student } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { downloadCsv } from '@/lib/export';

export default function ExamsPage() {
  const { students, recentExamResults, addExamResult, isLoading } = useData();
  const { toast } = useToast();
  const [classFilters, setClassFilters] = useState<string[]>([]);
  const [isAddExamResultDialogOpen, setIsAddExamResultDialogOpen] = useState(false);
  
  const uniqueClasses = useMemo(() => {
    if (!students) return [];
    const classes = new Set(students.map((student) => student.gradeLevel));
    return Array.from(classes).sort();
  }, [students]);

  const handleClassFilterChange = (className: string, checked: boolean) => {
    setClassFilters((prev) => {
      if (checked) {
        return [...prev, className];
      } else {
        return prev.filter((c) => c !== className);
      }
    });
  };

  const getStudentByName = (studentName: string) => students?.find(s => `${s.firstName} ${s.lastName}` === studentName);

  const filteredResults = useMemo(() => {
    if (!recentExamResults || !students) return [];
    const studentNameToClassMap = new Map(students.map(s => [`${s.firstName} ${s.lastName}`, s.gradeLevel]));
    return recentExamResults.filter((result) => {
      const studentClass = studentNameToClassMap.get(result.studentName);
      return classFilters.length === 0 || (studentClass && classFilters.includes(studentClass));
    });
  }, [classFilters, students, recentExamResults]);

  const studentStats = useMemo(() => {
    const statsMap = new Map<string, { totalScore: number; averagePercentage: string; rank: string }>();
    if (!students || !recentExamResults) return statsMap;

    const allStudentAverages = students.map(student => {
      const studentName = `${student.firstName} ${student.lastName}`;
      const studentExamResults = recentExamResults.filter(r => r.studentName === studentName);
      const totalScore = studentExamResults.reduce((acc, r) => acc + r.score, 0);
      const totalMaxScore = studentExamResults.reduce((acc, r) => acc + (r.maxScore || 100), 0);
      const average = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
      return { studentName, studentClass: student.gradeLevel, average, totalScore };
    });

    students.forEach(student => {
      const studentName = `${student.firstName} ${student.lastName}`;
      const studentData = allStudentAverages.find(s => s.studentName === studentName);
      if (!studentData) return;

      const studentsInClass = allStudentAverages.filter(s => s.studentClass === student.gradeLevel);
      studentsInClass.sort((a, b) => b.average - a.average);
      
      const rankIndex = studentsInClass.findIndex(s => s.studentName === studentName);
      const rank = rankIndex !== -1 ? `${rankIndex + 1}/${studentsInClass.length}` : 'N/A';

      statsMap.set(studentName, {
        totalScore: studentData.totalScore,
        averagePercentage: studentData.average.toFixed(2),
        rank: rank,
      });
    });

    return statsMap;
  }, [students, recentExamResults]);

  const handleAddExamResult = async (data: Parameters<typeof addExamResult>[0]) => {
    await addExamResult(data);
    setIsAddExamResultDialogOpen(false);
  };

  const handleExportResults = () => {
    if (filteredResults.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nothing to export',
        description: 'There are no exam results in the current view.',
      });
      return;
    }

    downloadCsv(
      'exam-results-export.csv',
      ['Result ID', 'Student Name', 'Class', 'Subject', 'Score', 'Max Score', 'Result Date', 'Graded By', 'Total Score', 'Average', 'Class Rank'],
      filteredResults.map((result) => {
        const student = getStudentByName(result.studentName);
        const stats = studentStats.get(result.studentName) || { totalScore: 0, averagePercentage: '0.00', rank: 'N/A' };
        return [
          result.id,
          result.studentName,
          student?.gradeLevel || 'N/A',
          result.subjectName,
          result.score,
          result.maxScore || 100,
          new Date(result.resultDate).toLocaleDateString(),
          result.gradedByTeacherName,
          stats.totalScore,
          `${stats.averagePercentage}%`,
          stats.rank,
        ];
      })
    );

    toast({
      title: 'Export complete',
      description: `${filteredResults.length} exam results downloaded.`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Exams & Results</h1>
          <p className="text-muted-foreground">
            Overview of examination performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter by Class
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Class</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {uniqueClasses.map((cls) => (
                  <DropdownMenuCheckboxItem
                    key={cls}
                    checked={classFilters.includes(cls)}
                    onCheckedChange={(checked) =>
                      handleClassFilterChange(cls, !!checked)
                    }
                  >
                    {cls}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setIsAddExamResultDialogOpen(true)} size="sm" className="h-8 gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Result
              </span>
            </Button>
          <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90" onClick={handleExportResults}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {EXAM_STAT_CARDS.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            change={card.change}
            icon={card.icon}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Exam Results</CardTitle>
          <CardDescription>A log of the most recent exam results with overall student performance.</CardDescription>
        </CardHeader>
        <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Total Score</TableHead>
              <TableHead className="text-right">Average</TableHead>
              <TableHead className="text-right">Class Rank</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    </TableRow>
                ))
            ) : filteredResults.map((result) => {
              const student = getStudentByName(result.studentName);
              const stats = studentStats.get(result.studentName) || { totalScore: 0, averagePercentage: '0.00', rank: 'N/A' };
              return (
              <TableRow key={result.id}>
                <TableCell className="font-medium">{result.studentName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{student?.gradeLevel || 'N/A'}</Badge>
                </TableCell>
                <TableCell>{result.subjectName}</TableCell>
                <TableCell className="text-right">{result.score}/{result.maxScore || 100}</TableCell>
                <TableCell className="text-right">{stats.totalScore}</TableCell>
                <TableCell className="text-right">{stats.averagePercentage}%</TableCell>
                <TableCell className="text-right">{stats.rank}</TableCell>
              </TableRow>
              )
            })}
          </TableBody>
        </Table>
        </CardContent>
      </Card>
      <AddExamResultDialog
        open={isAddExamResultDialogOpen}
        onExamResultAdd={handleAddExamResult}
        onOpenChange={setIsAddExamResultDialogOpen}
        students={students || []}
      />
    </div>
  );
}
