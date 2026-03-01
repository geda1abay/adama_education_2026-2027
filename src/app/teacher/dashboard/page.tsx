'use client';

import Link from 'next/link';
import { useData } from '@/context/data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function TeacherDashboardPage() {
  const { currentTeacher: teacher, isTeacherAuthLoading } = useData();
  
  const isLoading = isTeacherAuthLoading;

  if (isLoading) {
    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-80" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-48 mb-2" />
                    <Skeleton className="h-5 w-72" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-20 w-full" />
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
                    <CardDescription>Please log in to view your dashboard.</CardDescription>
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Welcome, {teacher.name}!</h1>
        <p className="text-muted-foreground">This is your teacher dashboard. More features coming soon.</p>
      </div>

       <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Your Classes</CardTitle>
                    <CardDescription>A list of classes you are assigned to.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Class management features will be available here.</p>
                </CardContent>
            </Card>
       </div>
    </div>
  );
}
