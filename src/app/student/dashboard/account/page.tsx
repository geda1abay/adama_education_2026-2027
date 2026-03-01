'use client';

import Link from 'next/link';
import { useData } from '@/context/data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function StudentAccountPage() {
  const { currentUser: student, students } = useData();
  
  const isLoading = students.length > 0 && !student;

  const avatar = student ? PlaceHolderImages.find((img) => img.id === student.avatar) : null;

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

  if (!student) {
    return (
        <div className="flex items-center justify-center h-[80vh]">
            <Card>
                <CardHeader>
                    <CardTitle>Not Logged In</CardTitle>
                    <CardDescription>Please log in to view your account.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Link href="/student/login">
                        <Button>Go to Login</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">My Account</h1>
        <p className="text-muted-foreground">View and manage your account details.</p>
      </div>

       <Card>
            <CardHeader className="items-center text-center">
                <Avatar className="h-24 w-24 mb-2">
                    <AvatarImage src={avatar?.imageUrl} alt={student.name} data-ai-hint={avatar?.imageHint} />
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle>{student.name}</CardTitle>
                <CardDescription>{student.email}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
                <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Class:</span>
                    <span>{student.class}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Registration ID:</span>
                    <span>{student.registrationId}</span>
                </div>
                 <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Status:</span>
                    <span>{student.status}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Parent Name:</span>
                    <span>{student.parentName}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Parent Contact:</span>
                    <span>{student.mobile}</span>
                </div>
            </CardContent>
          </Card>
    </div>
  );
}
