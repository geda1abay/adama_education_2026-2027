'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useData } from '@/context/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function TeacherDetailsPage() {
  const params = useParams();
  const teacherId = params.teacherId as string;
  const { teachers, isLoading } = useData();

  const teacher = useMemo(() => teachers?.find((item) => item.id === teacherId), [teacherId, teachers]);
  const avatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-6');

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-9 w-48" />
        </div>
        <Card>
          <CardHeader className="items-center text-center">
            <Skeleton className="h-24 w-24 rounded-full mb-2" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!teacher) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Teacher Not Found</CardTitle>
          <CardDescription>The teacher you are looking for does not exist.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/teachers">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teachers
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const teacherName = `${teacher.firstName} ${teacher.lastName}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/teachers">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold font-headline">Teacher Details</h1>
      </div>

      <Card>
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-2">
            <AvatarImage src={avatar?.imageUrl} alt={teacherName} data-ai-hint={avatar?.imageHint} />
            <AvatarFallback>{teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle>{teacherName}</CardTitle>
          <Badge variant="outline">{teacher.department}</Badge>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold text-muted-foreground">Email:</span>
            <span className="truncate">{teacher.contactEmail}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold text-muted-foreground">Phone:</span>
            <span>{teacher.contactPhone}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold text-muted-foreground">Date of Birth:</span>
            <span>{new Date(teacher.dateOfBirth).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold text-muted-foreground">Gender:</span>
            <span>{teacher.gender}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold text-muted-foreground">Address:</span>
            <span className="text-right">{teacher.address}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold text-muted-foreground">Hire Date:</span>
            <span>{new Date(teacher.hireDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold text-muted-foreground">Qualification:</span>
            <span className="text-right">{teacher.qualification}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold text-muted-foreground">Classes:</span>
            <span className="text-right">{teacher.classes?.join(', ') || 'N/A'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
