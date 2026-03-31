'use client';

import { useState, useMemo } from 'react';
import { ListFilter, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useData } from '@/context/data-context';
import { AddAttendanceDialog } from '@/components/dashboard/add-attendance-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { Attendance, Student } from '@/lib/data';


export default function AttendancePage() {
  const { students, studentAttendance, addAttendance, isLoading } = useData();
  const [classFilters, setClassFilters] = useState<string[]>([]);
  const [isAddAttendanceDialogOpen, setIsAddAttendanceDialogOpen] = useState(false);
  
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

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter((student) => {
      return classFilters.length === 0 || classFilters.includes(student.gradeLevel);
    });
  }, [classFilters, students]);

  const attendanceForMonth = useMemo(() => {
    if (!studentAttendance) return new Map<string, { daysPresent: number; totalDays: number }>();
    const attendanceMap = new Map<string, { daysPresent: number; totalDays: number }>();
    studentAttendance.forEach(att => {
        const existing = attendanceMap.get(att.studentName) || { daysPresent: 0, totalDays: 0 };
        existing.daysPresent += att.status === 'present' ? 1 : 0;
        existing.totalDays += 1;
        attendanceMap.set(att.studentName, existing);
    });
    return attendanceMap;
  }, [studentAttendance]);

  const getStudentAttendance = (studentName: string) => {
    return attendanceForMonth.get(studentName);
  };
  
  const getAttendanceColor = (percentage: number) => {
    if (percentage > 90) return 'bg-green-500';
    if (percentage > 75) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  const handleAddAttendance = async (data: Omit<Attendance, 'id' | 'recordedByTeacherName'>) => {
    await addAttendance(data);
    setIsAddAttendanceDialogOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Attendance</h1>
          <p className="text-muted-foreground">
            Track student attendance records.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
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
            <Button onClick={() => setIsAddAttendanceDialogOpen(true)} size="sm" className="h-8 gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Record
              </span>
            </Button>
          </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
          <CardDescription>An overview of student attendance records.</CardDescription>
        </CardHeader>
        <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Sessions Present</TableHead>
              <TableHead>Total Sessions</TableHead>
              <TableHead className="w-[30%]">Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    </TableRow>
                ))
            ) : filteredStudents.map((student) => {
              const attendance = getStudentAttendance(`${student.firstName} ${student.lastName}`);
              const totalDays = attendance?.totalDays || 0;
              const daysPresent = attendance?.daysPresent || 0;
              const percentage = totalDays > 0 ? (daysPresent / totalDays) * 100 : 0;
              return (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.gradeLevel}</Badge>
                  </TableCell>
                  <TableCell>{daysPresent}</TableCell>
                  <TableCell>{totalDays}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={percentage} className="h-2" indicatorClassName={getAttendanceColor(percentage)} />
                      <span className="text-sm font-medium text-muted-foreground">{percentage.toFixed(0)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        </CardContent>
      </Card>

      <AddAttendanceDialog 
        open={isAddAttendanceDialogOpen}
        onOpenChange={setIsAddAttendanceDialogOpen}
        onAttendanceAdd={handleAddAttendance}
        students={students || []}
      />
    </div>
  );
}
