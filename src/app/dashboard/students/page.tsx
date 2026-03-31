'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  File,
  FileUp,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Trash,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { downloadCsv, parseCsv } from '@/lib/export';
import { ResetPasswordDialog } from '@/components/dashboard/reset-password-dialog';

const DEFAULT_IMPORT_PASSWORD = '123456';

export default function StudentsPage() {
  const { students, addStudent, deleteStudent, resetStudentPassword, isLoading, importStudents, clearStudentsByClass } = useData();
  const { toast } = useToast();
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const router = useRouter();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClearClassDialogOpen, setIsClearClassDialogOpen] = useState(false);
  const [classToClear, setClassToClear] = useState<string>('');
  const [studentPasswordTarget, setStudentPasswordTarget] = useState<Student | null>(null);

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

  const handleAddStudent = async (data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    parentPhone: string;
    enrollmentDate: string;
    gradeLevel: string;
    password?: string;
  }) => {
    await addStudent(data);
    setIsAddStudentDialogOpen(false);
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const [headerRow, ...dataRows] = parseCsv(text);
      const headerIndex = new Map((headerRow || []).map((header, index) => [header.trim().toLowerCase(), index]));

      const newStudents = dataRows
        .filter((row) => row.some((value) => value))
        .map((row) => ({
          firstName: row[headerIndex.get('first name') ?? -1] || '',
          lastName: row[headerIndex.get('last name') ?? -1] || '',
          dateOfBirth: row[headerIndex.get('date of birth') ?? -1] || '',
          gender: row[headerIndex.get('gender') ?? -1] || '',
          address: row[headerIndex.get('address') ?? -1] || '',
          contactEmail: row[headerIndex.get('login email') ?? headerIndex.get('email') ?? -1] || '',
          contactPhone: row[headerIndex.get('student phone') ?? headerIndex.get('phone') ?? -1] || '',
          parentPhone: row[headerIndex.get('parent phone') ?? -1] || '',
          enrollmentDate: row[headerIndex.get('enrollment date') ?? -1] || '',
          gradeLevel: row[headerIndex.get('class') ?? headerIndex.get('grade level') ?? -1] || '',
          password: row[headerIndex.get('login password') ?? headerIndex.get('password') ?? -1] || DEFAULT_IMPORT_PASSWORD,
        }));

      if (newStudents.length > 0 && newStudents.every((student) => student.firstName && student.lastName && student.contactEmail && student.gradeLevel && student.contactPhone)) {
        await importStudents(newStudents);
      }
    };
    reader.readAsText(file);
    // Reset file input value to allow re-uploading the same file
    event.target.value = ''; 
  };
  
  const handleClearClass = async () => {
      if (classToClear) {
          await clearStudentsByClass(classToClear);
          setIsClearClassDialogOpen(false);
          setClassToClear('');
      }
  };

  const handleExportStudents = () => {
    if (filteredStudents.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nothing to export',
        description: 'There are no students in the current view.',
      });
      return;
    }

    downloadCsv(
      'students-export.csv',
      ['Student ID', 'First Name', 'Last Name', 'Date of Birth', 'Gender', 'Address', 'Email', 'Student Phone', 'Parent Phone', 'Enrollment Date', 'Class', 'Parent IDs', 'Login Email', 'Login Password'],
      filteredStudents.map((student) => [
        student.id,
        student.firstName,
        student.lastName,
        student.dateOfBirth.slice(0, 10),
        student.gender,
        student.address,
        student.contactEmail,
        student.contactPhone,
        student.parentPhone,
        student.enrollmentDate.slice(0, 10),
        student.gradeLevel,
        student.parentIds.join(', '),
        student.contactEmail,
        DEFAULT_IMPORT_PASSWORD,
      ])
    );

    toast({
      title: 'Export complete',
      description: `${filteredStudents.length} student records downloaded.`,
    });
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
              <TableHead className="hidden lg:table-cell">DOB</TableHead>
              <TableHead className="hidden xl:table-cell">Gender</TableHead>
              <TableHead className="hidden xl:table-cell">Address</TableHead>
              <TableHead className="hidden md:table-cell">Student Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Parent Phone</TableHead>
              <TableHead className="hidden xl:table-cell">Enrollment</TableHead>
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
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="hidden xl:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="hidden xl:table-cell"><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="hidden xl:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
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
                  <TableCell className="hidden lg:table-cell">
                    {new Date(student.dateOfBirth).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {student.gender}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell max-w-[220px] truncate">
                    {student.address}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {student.contactPhone}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {student.parentPhone}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {new Date(student.enrollmentDate).toLocaleDateString()}
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
                        <DropdownMenuItem onClick={() => setStudentPasswordTarget(student)}>Reset Password</DropdownMenuItem>
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
            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleImportClick}>
                <FileUp className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Import
                </span>
            </Button>
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileImport}
            />
            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExportStudents}>
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
             <AlertDialog open={isClearClassDialogOpen} onOpenChange={setIsClearClassDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="h-8 gap-1">
                        <Trash className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Clear by Class
                        </span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Clear Students by Class</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will permanently delete all students from the selected class. This cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="my-4">
                        <Select onValueChange={setClassToClear} value={classToClear}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a class to clear" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueClasses.map((cls) => (
                                    <SelectItem key={cls} value={cls}>
                                        {cls}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setClassToClear('')}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearClass} disabled={!classToClear}>
                        Continue
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
      <ResetPasswordDialog
        open={Boolean(studentPasswordTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setStudentPasswordTarget(null);
          }
        }}
        title="Reset Student Password"
        description={studentPasswordTarget ? `Set a new login password for ${studentPasswordTarget.firstName} ${studentPasswordTarget.lastName}.` : ''}
        onSubmitPassword={async (password) => {
          if (studentPasswordTarget) {
            await resetStudentPassword(studentPasswordTarget.id, password);
          }
        }}
      />
    </div>
  );
}
