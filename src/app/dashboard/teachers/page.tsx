'use client';

import { useState, useMemo } from 'react';
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
} from "@/components/ui/alert-dialog";
import { AddTeacherDialog } from '@/components/dashboard/add-teacher-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { Teacher } from '@/lib/data';

export default function TeachersPage() {
  const { teachers, addTeacher, deleteTeacher, isLoading } = useData();
  const [isAddTeacherDialogOpen, setIsAddTeacherDialogOpen] = useState(false);

  const getImage = (avatarId: string) =>
    PlaceHolderImages.find((img) => img.id === avatarId);

  const [subjectFilters, setSubjectFilters] = useState<string[]>([]);
  
  const uniqueSubjects = useMemo(() => {
    if (!teachers) return [];
    const subjects = new Set(teachers.map((teacher) => teacher.department));
    return Array.from(subjects).sort();
  }, [teachers]);

  const handleSubjectFilterChange = (subject: string, checked: boolean) => {
    setSubjectFilters((prev) => {
      if (checked) {
        return [...prev, subject];
      } else {
        return prev.filter((s) => s !== subject);
      }
    });
  };
  
  const handleAddTeacher = async (data: Omit<Teacher, 'id' | 'userId' | 'hireDate' | 'qualification' | 'address'> & { password?: string }) => {
    await addTeacher(data);
    setIsAddTeacherDialogOpen(false);
  };

  const filteredTeachers = useMemo(() => {
    if (!teachers) return [];
    return teachers.filter((teacher) => {
      const subjectMatch =
        subjectFilters.length === 0 || subjectFilters.includes(teacher.department);
      return subjectMatch;
    });
  }, [subjectFilters, teachers]);

  const teacherTableCard = (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Roster</CardTitle>
        <CardDescription>
          Manage your teachers and view their details.
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
              <TableHead>Department</TableHead>
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
               Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : filteredTeachers.map((teacher) => {
              const avatar = getImage('user-avatar-6'); // Simplified avatar
              return (
                <TableRow key={teacher.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={avatar?.imageUrl}
                        alt={teacher.firstName}
                        data-ai-hint={avatar?.imageHint}
                      />
                      <AvatarFallback>
                        {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    {teacher.firstName} {teacher.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{teacher.department}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {teacher.contactPhone}
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Delete</DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the teacher and their associated auth account. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteTeacher(teacher.id)}>Continue</AlertDialogAction>
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
          Showing <strong>{filteredTeachers.length}</strong> of{' '}
          <strong>{teachers?.length || 0}</strong> teachers
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-4">Teachers</h1>
      <Tabs defaultValue="all">
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
                <DropdownMenuLabel>Filter by Subject</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {uniqueSubjects.map((subject) => (
                  <DropdownMenuCheckboxItem
                    key={subject}
                    checked={subjectFilters.includes(subject)}
                    onCheckedChange={(checked) =>
                      handleSubjectFilterChange(subject, !!checked)
                    }
                  >
                    {subject}
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
            <Button onClick={() => setIsAddTeacherDialogOpen(true)} size="sm" className="h-8 gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Teacher
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">{teacherTableCard}</TabsContent>
      </Tabs>
       <AddTeacherDialog 
        open={isAddTeacherDialogOpen}
        onOpenChange={setIsAddTeacherDialogOpen}
        onTeacherAdd={handleAddTeacher}
      />
    </div>
  );
}
