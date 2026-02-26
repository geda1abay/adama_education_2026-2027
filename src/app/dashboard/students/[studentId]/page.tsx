'use client';

import { useParams } from 'next/navigation';
import { useData } from '@/context/data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function StudentDetailsPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const { students, recentExamResults } = useData();

  const student = students.find((s) => s.id === studentId);
  const examResults = recentExamResults.filter((r) => r.studentId === studentId);
  const avatar = PlaceHolderImages.find((img) => img.id === student?.avatar);

  const getGradeVariant = (grade: string) => {
    if (grade.startsWith('A') || grade === 'N/A') return 'default';
    if (grade.startsWith('B')) return 'secondary';
    if (grade.startsWith('C')) return 'outline';
    return 'destructive';
  }

  if (!student) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center h-full">
         <Card className="w-full max-w-lg">
            <CardHeader>
               <CardTitle>Student Not Found</CardTitle>
               <CardDescription>The student you are looking for does not exist.</CardDescription>
            </CardHeader>
            <CardContent>
               <Link href="/dashboard/students">
                  <Button variant="outline">
                     <ArrowLeft className="mr-2 h-4 w-4" />
                     Back to Students
                  </Button>
               </Link>
            </CardContent>
         </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/students">
            <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
        <h1 className="text-3xl font-bold font-headline">Student Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="items-center text-center">
                <Avatar className="h-24 w-24 mb-2">
                    <AvatarImage src={avatar?.imageUrl} alt={student.name} data-ai-hint={avatar?.imageHint} />
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle>{student.name}</CardTitle>
                <Badge variant="outline">{student.class}</Badge>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
                <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Status:</span>
                    <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>{student.status}</Badge>
                </div>
                <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Parent:</span>
                    <span>{student.parentName}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Contact:</span>
                    <span>{student.mobile}</span>
                </div>
                 <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold text-muted-foreground">Email:</span>
                    <span className="truncate">{student.email}</span>
                </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Exam Results</CardTitle>
                    <CardDescription>A log of the student's exam results.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead className="text-right">Grade</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {examResults.length > 0 ? examResults.map((result) => (
                            <TableRow key={result.id}>
                                <TableCell>{result.subject}</TableCell>
                                <TableCell>{result.score}</TableCell>
                                <TableCell className="text-right">
                                <Badge variant={getGradeVariant(result.grade) as any}>{result.grade}</Badge>
                                </TableCell>
                            </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">No exam results found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
