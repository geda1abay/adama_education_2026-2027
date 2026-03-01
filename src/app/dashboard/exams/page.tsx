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

export default function ExamsPage() {
  const { students, recentExamResults, addExamResult } = useData();
  const [classFilters, setClassFilters] = useState<string[]>([]);
  const [isAddExamResultDialogOpen, setIsAddExamResultDialogOpen] = useState(false);
  
  const uniqueClasses = useMemo(() => {
    const classes = new Set(students.map((student) => student.class));
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

  const filteredResults = useMemo(() => {
    const studentIdToClassMap = new Map(students.map(s => [s.id, s.class]));
    return recentExamResults.filter((result) => {
      const studentClass = studentIdToClassMap.get(result.studentId);
      return classFilters.length === 0 || (studentClass && classFilters.includes(studentClass));
    });
  }, [classFilters, students, recentExamResults]);

  const getStudentById = (studentId: string) => students.find(s => s.id === studentId);
  
  const studentStats = useMemo(() => {
    const statsMap = new Map<string, { totalScore: number, averagePercentage: string, rank: string }>();
    
    // First, calculate averages for all students
    const allStudentAverages = students.map(student => {
        const studentExamResults = recentExamResults.filter(r => r.studentId === student.id);
        const processedResults = studentExamResults.map(r => {
            const scoreParts = r.score.split('/');
            const score = parseInt(scoreParts[0], 10);
            const maxScore = scoreParts.length > 1 ? parseInt(scoreParts[1], 10) : 100;
            return { score: isNaN(score) ? 0 : score, maxScore: isNaN(maxScore) ? 100 : maxScore };
        });
        const totalScore = processedResults.reduce((acc, r) => acc + r.score, 0);
        const totalMaxScore = processedResults.reduce((acc, r) => acc + r.maxScore, 0);
        const average = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
        return { studentId: student.id, studentClass: student.class, average, totalScore };
    });

    // Then, for each student, calculate their rank within their class
    students.forEach(student => {
      const studentData = allStudentAverages.find(s => s.studentId === student.id)!;

      const studentsInClass = allStudentAverages.filter(s => s.studentClass === student.studentClass);
      studentsInClass.sort((a, b) => b.average - a.average);
      
      const rankIndex = studentsInClass.findIndex(s => s.studentId === student.id);
      const rank = rankIndex !== -1 ? `${rankIndex + 1}/${studentsInClass.length}` : 'N/A';

      statsMap.set(student.id, {
        totalScore: studentData.totalScore,
        averagePercentage: studentData.average.toFixed(2),
        rank: rank,
      });
    });

    return statsMap;
  }, [students, recentExamResults]);


  const handleAddExamResult = (data: any) => {
    addExamResult({ ...data, grade: 'N/A' });
    setIsAddExamResultDialogOpen(false);
  }

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
          <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
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
            {filteredResults.map((result) => {
              const student = getStudentById(result.studentId);
              const stats = studentStats.get(result.studentId) || { totalScore: 0, averagePercentage: '0.00', rank: 'N/A' };
              return (
              <TableRow key={result.id}>
                <TableCell className="font-medium">{student?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant="outline">{student?.class || 'N/A'}</Badge>
                </TableCell>
                <TableCell>{result.subject}</TableCell>
                <TableCell className="text-right">{result.score}</TableCell>
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
        onOpenChange={setIsAddExamResultDialogOpen}
        onExamResultAdd={handleAddExamResult}
        students={students}
      />
    </div>
  );
}
