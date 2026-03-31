'use client';

import Link from 'next/link';
import { useData } from '@/context/data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function TeacherAccountPage() {
  const { currentTeacher: teacher, isUserLoading } = useData();
  
  const isLoading = isUserLoading;

  const avatar = teacher ? PlaceHolderImages.find((img) => img.id === 'user-avatar-6') : null;

  if (isLoading) {
    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <div className="mb-6">
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-80" />
            </div>
            <Card>
                <CardHeader className="items-center text-center">
                    <Skeleton className="h-24 w-24 rounded-full mb-2" />
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                    <div className="flex justify-between border-t pt-4">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="flex justify-between border-t pt-4">
                         <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="flex justify-between border-t pt-4">
                         <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!teacher) {
    return (
        <div className="flex items-center justify-center h-[80vh]">
            <Card>
                <CardHeader>
                    <CardTitle>Not Logged In</CardTitle>
                    <CardDescription>Please log in to view your account.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Link href="/teacher/login">
                        <Button>Go to Login</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
  }

  const teacherName = `${teacher.firstName} ${teacher.lastName}`;

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">My Account</h1>
        <p className="text-muted-foreground">View and manage your account details.</p>
      </div>

       <Card>
            <CardHeader className="items-center text-center">
                <Avatar className="h-24 w-24 mb-2">
                    <AvatarImage src={avatar?.imageUrl} alt={teacherName} data-ai-hint={avatar?.imageHint} />
                    <AvatarFallback>{teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle>{teacherName}</CardTitle>
                <CardDescription>{teacher.contactEmail}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
                <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Date of Birth:</span>
                    <span>{new Date(teacher.dateOfBirth).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Gender:</span>
                    <span>{teacher.gender}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Department:</span>
                    <span>{teacher.department}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Contact:</span>
                    <span>{teacher.contactPhone}</span>
                </div>
                 <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Address:</span>
                    <span className="text-right">{teacher.address}</span>
                </div>
                 <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Hire Date:</span>
                    <span>{new Date(teacher.hireDate).toLocaleDateString()}</span>
                </div>
            </CardContent>
          </Card>
    </div>
  );
}
