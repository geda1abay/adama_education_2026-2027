'use server';
/**
 * @fileOverview A Genkit flow for generating an AI-enhanced student progress overview.
 *
 * - getStudentProgressOverview - A function that generates a concise summary of a student's academic progress.
 * - AIEnhancedStudentProgressOverviewInput - The input type for the getStudentProgressOverview function.
 * - AIEnhancedStudentProgressOverviewOutput - The return type for the getStudentProgressOverview function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIEnhancedStudentProgressOverviewInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  grades: z.array(
    z.object({
      subject: z.string().describe('The name of the subject.'),
      score: z.number().describe('The score the student received in this assignment or exam.'),
      maxScore: z.number().optional().describe('The maximum possible score for this assignment or exam.'),
      assignmentName: z.string().optional().describe('The name of the assignment or exam.'),
    })
  ).describe('An array of the student\'s grades across different subjects and assignments.'),
  attendance: z.object({
    totalClasses: z.number().describe('The total number of classes held.'),
    classesAttended: z.number().describe('The number of classes the student attended.'),
  }).describe('The student\'s attendance record.'),
});
export type AIEnhancedStudentProgressOverviewInput = z.infer<typeof AIEnhancedStudentProgressOverviewInputSchema>;

const AIEnhancedStudentProgressOverviewOutputSchema = z.object({
  summary: z.string().describe('A concise textual summary of the student\'s academic progress, highlighting strengths and areas for improvement.'),
});
export type AIEnhancedStudentProgressOverviewOutput = z.infer<typeof AIEnhancedStudentProgressOverviewOutputSchema>;

const prompt = ai.definePrompt({
  name: 'aiEnhancedStudentProgressOverviewPrompt',
  input: { schema: AIEnhancedStudentProgressOverviewInputSchema },
  output: { schema: AIEnhancedStudentProgressOverviewOutputSchema },
  prompt: `You are an academic advisor specialized in summarizing student performance.
Your task is to provide a concise textual summary of {{studentName}}'s academic progress, highlighting their strengths and identifying clear areas for improvement based on the provided grades and attendance data.

Grades:
{{#each grades}}
  - Subject: {{this.subject}}, Score: {{this.score}}{{#if this.maxScore}}/{{this.maxScore}}{{/if}}{{#if this.assignmentName}} (Assignment: {{this.assignmentName}}){{/if}}
{{/each}}

Attendance:
  Total Classes: {{attendance.totalClasses}}
  Classes Attended: {{attendance.classesAttended}}

Based on this information, provide a summary of {{studentName}}'s academic progress. Focus on overall performance trends, subject-specific strengths or weaknesses, and how attendance might impact their learning. Keep the summary concise and actionable.
`,
});

const aiEnhancedStudentProgressOverviewFlow = ai.defineFlow(
  {
    name: 'aiEnhancedStudentProgressOverviewFlow',
    inputSchema: AIEnhancedStudentProgressOverviewInputSchema,
    outputSchema: AIEnhancedStudentProgressOverviewOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function getStudentProgressOverview(
  input: AIEnhancedStudentProgressOverviewInput
): Promise<AIEnhancedStudentProgressOverviewOutput> {
  return aiEnhancedStudentProgressOverviewFlow(input);
}
