'use client';

import { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getStudentProgressOverview,
  type AIEnhancedStudentProgressOverviewInput,
} from '@/ai/flows/ai-enhanced-student-progress-overview';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/data-context';

const mockStudentData: AIEnhancedStudentProgressOverviewInput = {
  studentName: 'a student',
  grades: [
    { subject: 'Mathematics', score: 85, maxScore: 100 },
    { subject: 'Science', score: 92, maxScore: 100 },
    { subject: 'English', score: 78, maxScore: 100 },
    { subject: 'History', score: 88, maxScore: 100 },
  ],
  attendance: {
    totalClasses: 50,
    classesAttended: 45,
  },
};

export default function AiSummaryCard() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { students } = useData();

  const handleGenerateSummary = async () => {
    if (students.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Students',
        description: 'Please add a student to generate a progress overview.',
      });
      return;
    }

    setIsLoading(true);
    setSummary('');

    // In a real application, you'd have a way to select a student.
    // For now, we'll use the first student and mock their data.
    const dataToSummarize = {
      ...mockStudentData,
      studentName: students[0].name,
    };

    try {
      const result = await getStudentProgressOverview(dataToSummarize);
      setSummary(result.summary);
    } catch (error: any) {
      console.error('Failed to generate summary:', error);
      toast({
        variant: 'destructive',
        title: 'AI Summary Error',
        description: error.message || 'Failed to generate AI summary. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          <span>AI-Enhanced Progress Overview</span>
        </CardTitle>
        <CardDescription>
          Generate a summary of a student&apos;s progress using AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleGenerateSummary}
            disabled={isLoading || students.length === 0}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {students.length > 0 ? `Generate for ${students[0].name}` : 'Generate Summary'}
          </Button>
          {(isLoading || summary) && (
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
