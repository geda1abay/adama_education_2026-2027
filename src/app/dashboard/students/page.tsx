'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useData } from '@/context/data-context';
import { AddStudentDialog } from '@/components/dashboard/add-student-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from '@/components/ui/skeleton';
import type { Student } from '@/lib/data';

export default function StudentsPage() {
  const { students, addStudent, deleteStudent, isLoading } = useData();
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const router = useRouter();

  const getImage = (avatarId: string) =>
    PlaceHolderImages.find((img) => img.id === avatarId);

  const [classFilters, setClassFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');

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
      const classMatch =
        classFilters.length === 0 || classFilters.includes(student.gradeLevel);
      return classMatch;
    });
  }, [classFilters, students]);

  const handleAddStudent = async (data: Omit<Student, 'id' | 'userId' | 'parentIds' | 'enrollmentDate' | 'dateOfBirth' | 'gender' | 'address'> & { password?: string }) => {
    await addStudent(data);
    setIsAddStudentDialogOpen(false);
  };

  const studentTableCard = (
    <Card>
      <CardHeader>
        <CardTitle>Student Roster</CardTitle>
        <CardDescription>
          Manage your students and view their details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="hidden md:table-cell">
                Contact
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : filteredStudents.map((student) => {
              const avatar = getImage('user-avatar-1'); // Simplified avatar
              return (
                <TableRow key={student.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={avatar?.imageUrl}
                        alt={student.firstName}
                        data-ai-hint={avatar?.imageHint}
                      />
                      <AvatarFallback>
                        {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.gradeLevel}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {student.contactPhone}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/students/${student.id}`)}>View Details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Delete</DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the student and their associated auth account. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteStudent(student.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>{filteredStudents.length}</strong> of{' '}
          <strong>{students?.length || 0}</strong> students
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-4">Students</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
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
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button onClick={() => setIsAddStudentDialogOpen(true)} size="sm" className="h-8 gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Student
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">{studentTableCard}</TabsContent>
      </Tabs>
      <AddStudentDialog 
        open={isAddStudentDialogOpen}
        onOpenChange={setIsAddStudentDialogOpen}
        onStudentAdd={handleAddStudent}
      />
    </div>
  );
}
