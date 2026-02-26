'use client';

import { useState, useMemo } from 'react';
import { ListFilter, FileDown, PlusCircle } from 'lucide-react';
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
import { useData } from '@/context/data-context';
import { AddFeeDialog } from '@/components/dashboard/add-fee-dialog';
import type { Fee } from '@/lib/data';

export default function FeesPage() {
  const { students, feesData, addFee } = useData();
  const [classFilters, setClassFilters] = useState<string[]>([]);
  const [isAddFeeDialogOpen, setIsAddFeeDialogOpen] = useState(false);
  
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

  const getStudentById = (studentId: string) => students.find(s => s.id === studentId);

  const filteredFees = useMemo(() => {
    return feesData.filter((fee) => {
      const student = getStudentById(fee.studentId);
      return classFilters.length === 0 || (student && classFilters.includes(student.class));
    });
  }, [classFilters, feesData, students]);

  const getStatusVariant = (status: 'Paid' | 'Due' | 'Overdue') => {
    switch (status) {
      case 'Paid':
        return 'default';
      case 'Due':
        return 'secondary';
      case 'Overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleAddFee = (data: Fee) => {
    addFee(data);
    setIsAddFeeDialogOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Fee Management</h1>
          <p className="text-muted-foreground">
            Track and manage student fee payments.
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
          <Button size="sm" variant="outline" className="h-8 gap-1">
              <FileDown className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button onClick={() => setIsAddFeeDialogOpen(true)} size="sm" className="h-8 gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Record
              </span>
            </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Fee Status</CardTitle>
          <CardDescription>Overview of student fee payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFees.map((fee) => {
                 const student = getStudentById(fee.studentId);
                 return (
                  <TableRow key={fee.studentId}>
                    <TableCell className="font-medium">{student?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student?.class || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>Birr {fee.amount.toFixed(2)}</TableCell>
                    <TableCell>{fee.dueDate}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusVariant(fee.status)}>{fee.status}</Badge>
                    </TableCell>
                  </TableRow>
                 )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddFeeDialog
        open={isAddFeeDialogOpen}
        onOpenChange={setIsAddFeeDialogOpen}
        onFeeAdd={handleAddFee}
        students={students}
      />
    </div>
  );
}
