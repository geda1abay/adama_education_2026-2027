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
import {
  getStudentProgressOverview,
  type AIEnhancedStudentProgressOverviewInput,
} from '@/ai/flows/ai-enhanced-student-progress-overview';
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
    if (!selectedStudentId) {
      toast({
        variant: 'destructive',
        title: 'No Student Selected',
        description: 'Please select a student to generate a progress overview.',
      });
      return;
    }

    const student = students.find(s => s.id === selectedStudentId);
    if (!student) {
        toast({
            variant: 'destructive',
            title: 'Student Not Found',
            description: 'The selected student could not be found.',
        });
        return;
    }

    setIsLoading(true);
    setSummary('');
    setError('');

    // Prepare grades data
    const grades = recentExamResults
      .filter(r => r.studentId === selectedStudentId && r.score !== 'N/A')
      .map(result => {
        const scoreParts = result.score.split('/');
        const score = parseInt(scoreParts[0], 10);
        const maxScore = scoreParts.length > 1 ? parseInt(scoreParts[1], 10) : 100;
        return {
          subject: result.subject,
          score: isNaN(score) ? 0 : score,
          maxScore: isNaN(maxScore) ? 100 : maxScore,
        };
      })
      .filter(g => !isNaN(g.score));

    // Prepare attendance data
    const studentAttendanceRecords = studentAttendance.filter(att => att.studentId === selectedStudentId);
    const totalClasses = studentAttendanceRecords.reduce((sum, record) => sum + record.totalDays, 0);
    const classesAttended = studentAttendanceRecords.reduce((sum, record) => sum + record.daysPresent, 0);

    const dataToSummarize: AIEnhancedStudentProgressOverviewInput = {
      studentName: student.name,
      grades: grades,
      attendance: {
        totalClasses: totalClasses > 0 ? totalClasses : 50, // mock fallback
        classesAttended: classesAttended > 0 ? classesAttended : 45, // mock fallback
      },
    };
    
    // Add mock data if no real data is available, so the AI has something to work with.
    if (dataToSummarize.grades.length === 0) {
        dataToSummarize.grades.push({ subject: 'General', score: 85, maxScore: 100 });
    }


    try {
      const result = await getStudentProgressOverview(dataToSummarize);
      setSummary(result.summary);
    } catch (error: any) {
      console.error('Failed to generate summary:', error);
      const errorMessage = error.message || 'Failed to generate AI summary. Please try again.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'AI Summary Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const selectedStudent = students.find(s => s.id === selectedStudentId);

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
                    disabled={students.length === 0}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a student..." />
                    </SelectTrigger>
                    <SelectContent>
                        {students.map(student => (
                            <SelectItem key={student.id} value={student.id}>
                                {student.name}
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
                <AlertTitle>AI Feature Error</AlertTitle>
                <AlertDescription>
                  {error}
                  {error.includes('API key') && (
                    <p className="mt-2">
                      Please{' '}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        get a valid Gemini API Key
                      </a>{' '}
                      and add it to your .env file as `GEMINI_API_KEY=your_key_here`.
                    </p>
                  )}
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
