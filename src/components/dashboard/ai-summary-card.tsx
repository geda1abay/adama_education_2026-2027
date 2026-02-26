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

const mockStudentData: AIEnhancedStudentProgressOverviewInput = {
  studentName: 'Jane Doe',
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

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary('');
    try {
      const result = await getStudentProgressOverview(mockStudentData);
      setSummary(result.summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate AI summary. Please try again.',
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
            disabled={isLoading}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate for Jane Doe
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
