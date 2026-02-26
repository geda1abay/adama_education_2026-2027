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


export default function AttendancePage() {
  const { students, studentAttendance, addAttendance } = useData();
  const [classFilters, setClassFilters] = useState<string[]>([]);
  const [isAddAttendanceDialogOpen, setIsAddAttendanceDialogOpen] = useState(false);
  
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

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      return classFilters.length === 0 || classFilters.includes(student.class);
    });
  }, [classFilters, students]);

  // For this example, let's just show attendance for "June"
  const currentMonth = 'June';
  const attendanceForMonth = studentAttendance.filter(att => att.month === currentMonth);

  const getStudentAttendance = (studentId: string) => {
    return attendanceForMonth.find(att => att.studentId === studentId);
  }
  
  const getAttendanceColor = (percentage: number) => {
    if (percentage > 90) return 'bg-green-500';
    if (percentage > 75) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  const handleAddAttendance = (data: any) => {
    addAttendance(data);
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
          <CardTitle>Monthly Attendance - {currentMonth}</CardTitle>
          <CardDescription>Showing attendance for June. You can add or update records for any month using the button above.</CardDescription>
        </CardHeader>
        <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Days Present</TableHead>
              <TableHead>Total Days</TableHead>
              <TableHead className="w-[30%]">Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => {
              const attendance = getStudentAttendance(student.id);
              const percentage = attendance ? (attendance.daysPresent / attendance.totalDays) * 100 : 0;
              return (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.class}</Badge>
                  </TableCell>
                  <TableCell>{attendance?.daysPresent || 'N/A'}</TableCell>
                  <TableCell>{attendance?.totalDays || 'N/A'}</TableCell>
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
        students={students}
      />
    </div>
  );
}
