'use client';

import { useState, useMemo } from 'react';
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
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
import { TEACHERS } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const getStatusVariant = (status: 'Active' | 'Inactive' | string) => {
  switch (status) {
    case 'Active':
      return 'default';
    case 'Inactive':
      return 'secondary';
    default:
      return 'outline';
  }
};

export default function TeachersPage() {
  const getImage = (avatarId: string) =>
    PlaceHolderImages.find((img) => img.id === avatarId);

  const [subjectFilters, setSubjectFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  const uniqueSubjects = useMemo(() => {
    const subjects = new Set(TEACHERS.map((teacher) => teacher.subject));
    return Array.from(subjects).sort();
  }, []);

  const handleSubjectFilterChange = (subject: string, checked: boolean) => {
    setSubjectFilters((prev) => {
      if (checked) {
        return [...prev, subject];
      } else {
        return prev.filter((s) => s !== subject);
      }
    });
  };

  const filteredTeachers = useMemo(() => {
    return TEACHERS.filter((teacher) => {
      const statusMatch =
        activeTab === 'all' || teacher.status.toLowerCase() === activeTab;
      const subjectMatch =
        subjectFilters.length === 0 || subjectFilters.includes(teacher.subject);
      return statusMatch && subjectMatch;
    });
  }, [activeTab, subjectFilters]);

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
              <TableHead>Subject</TableHead>
              <TableHead className="hidden md:table-cell">
                Contact
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeachers.map((teacher) => {
              const avatar = getImage(teacher.avatar);
              return (
                <TableRow key={teacher.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={avatar?.imageUrl}
                        alt={avatar?.description || teacher.name}
                        data-ai-hint={avatar?.imageHint}
                      />
                      <AvatarFallback>
                        {teacher.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    {teacher.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{teacher.subject}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {teacher.mobile}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(teacher.status)}>
                      {teacher.status}
                    </Badge>
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
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
          <strong>{TEACHERS.length}</strong> teachers
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-4">Teachers</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
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
            <Button size="sm" className="h-8 gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Teacher
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">{teacherTableCard}</TabsContent>
        <TabsContent value="active">{teacherTableCard}</TabsContent>
        <TabsContent value="inactive">{teacherTableCard}</TabsContent>
      </Tabs>
    </div>
  );
}
