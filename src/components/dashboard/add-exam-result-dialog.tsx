'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Student } from '@/lib/data';

const examResultSchema = z.object({
  studentId: z.string().min(1, { message: 'Please select a student.' }),
  subjectId: z.string().min(2, { message: 'Subject must be at least 2 characters.' }),
  examId: z.string().min(2, { message: 'Exam title is required.' }),
  score: z.coerce.number().min(0, { message: 'Score must be a positive number.' }),
  maxScore: z.coerce.number().min(1, { message: 'Max score must be at least 1.' }),
});

type ExamResultFormValues = z.infer<typeof examResultSchema>;

interface AddExamResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExamResultAdd: (data: ExamResultFormValues) => void;
  students: Student[];
  defaultSubject?: string;
}

export function AddExamResultDialog({ open, onOpenChange, onExamResultAdd, students, defaultSubject }: AddExamResultDialogProps) {
  const form = useForm<ExamResultFormValues>({
    resolver: zodResolver(examResultSchema),
    defaultValues: {
      studentId: '',
      subjectId: defaultSubject || '',
      examId: 'Midterm',
      score: 0,
      maxScore: 100,
    },
  });

  React.useEffect(() => {
    form.reset({
      studentId: '',
      subjectId: defaultSubject || '',
      examId: 'Midterm',
      score: 0,
      maxScore: 100,
    });
  }, [open, defaultSubject, form]);


  const onSubmit = (data: ExamResultFormValues) => {
    onExamResultAdd(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Exam Result</DialogTitle>
          <DialogDescription>
            Enter the exam result details for a student.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} ({student.gradeLevel})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Mathematics" {...field} disabled={!!defaultSubject} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Score</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="95" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="maxScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Score</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Add Result</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
