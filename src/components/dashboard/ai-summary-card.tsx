'use client';

import { useState } from 'react';
import { Wand2, Loader2, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getStudentProgressOverview } from '@/ai/flows/ai-enhanced-student-progress-overview';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/data-context';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AiSummaryCard() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { students, recentExamResults, studentAttendance } = useData();

  const handleGenerateSummary = async () => {
    if (!selectedStudentId) return;

    const student = students?.find(s => s.id === selectedStudentId);
    if (!student) return;

    setIsLoading(true);
    setSummary('');
    setError('');

    // Prepare data for the AI flow
    const grades = (recentExamResults || [])
        .filter(r => r.studentId === selectedStudentId)
        .map(r => ({ subject: r.subjectId, score: r.score, maxScore: r.maxScore, assignmentName: r.examId }));

    const attendanceRecords = (studentAttendance || []).filter(a => a.studentId === selectedStudentId);
    const totalClasses = attendanceRecords.length;
    const classesAttended = attendanceRecords.filter(a => a.status === 'present').length;

    const input = {
        studentName: `${student.firstName} ${student.lastName}`,
        grades,
        attendance: {
            totalClasses,
            classesAttended
        }
    };

    const result = await getStudentProgressOverview(input);

    if ('summary' in result) {
      setSummary(result.summary);
    } else {
      const errorMessage = result.error || 'Failed to generate summary.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'AI Generation Failed',
        description: errorMessage,
      });
    }

    setIsLoading(false);
  };

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          <span>AI-Enhanced Progress Overview</span>
        </CardTitle>
        <CardDescription>
          Select a student and generate a summary of their progress using AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <Select
                    onValueChange={setSelectedStudentId}
                    disabled={!students || students.length === 0}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a student..." />
                    </SelectTrigger>
                    <SelectContent>
                        {(students ?? []).map(student => (
                            <SelectItem key={student.id} value={student.id}>
                                {student.firstName} {student.lastName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    onClick={handleGenerateSummary}
                    disabled={isLoading || !selectedStudentId}
                    className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 min-w-fit"
                >
                    {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generate
                </Button>
            </div>
            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>AI Generation Failed</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {(isLoading || summary) && !error && (
            <div className="min-h-[100px] rounded-lg border bg-muted/50 p-4 text-sm">
              {isLoading && (
                 <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                 </div>
              )}
              {summary && <p className="leading-relaxed">{summary}</p>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
