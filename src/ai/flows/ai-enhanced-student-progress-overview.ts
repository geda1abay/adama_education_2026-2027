'use server';
/**
 * @fileOverview A Genkit flow for generating an AI-enhanced student progress overview.
 *
 * - getStudentProgressOverview - A function that generates a concise summary of a student's academic progress.
 * - AIEnhancedStudentProgressOverviewInput - The input type for the getStudentProgressOverview function.
 * - AIEnhancedStudentProgressOverviewOutput - The return type for the getStudentProgressOverview function.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';

const AIEnhancedStudentProgressOverviewInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  grades: z
    .array(
      z.object({
        subject: z.string().describe('The name of the subject.'),
        score: z
          .number()
          .describe('The score the student received in this assignment or exam.'),
        maxScore: z
          .number()
          .optional()
          .describe('The maximum possible score for this assignment or exam.'),
        assignmentName: z
          .string()
          .optional()
          .describe('The name of the assignment or exam.'),
      })
    )
    .describe(
      "An array of the student's grades across different subjects and assignments."
    ),
  attendance: z
    .object({
      totalClasses: z.number().describe('The total number of classes held.'),
      classesAttended: z
        .number()
        .describe('The number of classes the student attended.'),
    })
    .describe("The student's attendance record."),
});
export type AIEnhancedStudentProgressOverviewInput = z.infer<
  typeof AIEnhancedStudentProgressOverviewInputSchema
>;

const AIEnhancedStudentProgressOverviewOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      "A concise textual summary of the student's academic progress, highlighting strengths and areas for improvement."
    ),
});
export type AIEnhancedStudentProgressOverviewOutput = z.infer<
  typeof AIEnhancedStudentProgressOverviewOutputSchema
>;

export type GetStudentProgressOverviewResult =
  | AIEnhancedStudentProgressOverviewOutput
  | { error: string };

const studentProgressPrompt = ai.definePrompt({
    name: 'studentProgressPrompt',
    input: { schema: AIEnhancedStudentProgressOverviewInputSchema },
    output: { schema: AIEnhancedStudentProgressOverviewOutputSchema },
    prompt: `You are a helpful teaching assistant. Your task is to provide a concise and insightful academic progress overview for a student named {{{studentName}}}.

Analyze the following data:
- Grades: {{{json grades}}}
- Attendance: {{{json attendance}}}

Based on this data, generate a summary. The summary should:
1. Start with a general statement about the student's overall performance.
2. Identify and praise their strengths (e.g., strong subjects, consistent high scores).
3. Gently point out areas for improvement (e.g., subjects with lower scores, poor attendance).
4. Conclude with a positive and encouraging remark.

Keep the summary to about 3-4 sentences.
`,
});

const studentProgressFlow = ai.defineFlow(
  {
    name: 'studentProgressFlow',
    inputSchema: AIEnhancedStudentProgressOverviewInputSchema,
    outputSchema: AIEnhancedStudentProgressOverviewOutputSchema,
  },
  async (input) => {
    const { output } = await studentProgressPrompt(input, { model: googleAI.model('gemini-1.5-flash') });
    return output!;
  }
);


export async function getStudentProgressOverview(
  input: AIEnhancedStudentProgressOverviewInput
): Promise<GetStudentProgressOverviewResult> {
    try {
        const summary = await studentProgressFlow(input);
        return summary;
    } catch (e: any) {
        console.error(e);
        return {
            error: e.message || 'An unexpected error occurred while generating the AI summary.',
        };
    }
}
