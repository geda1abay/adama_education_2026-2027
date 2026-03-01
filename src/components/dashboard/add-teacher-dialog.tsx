'use client';

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

const teacherSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  subject: z.string().min(2, { message: 'Subject must be at least 2 characters.' }),
  classes: z.string().min(1, { message: 'At least one class is required.' }),
  mobile: z.string().min(10, { message: 'Mobile number must be at least 10 digits.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

interface AddTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeacherAdd: (teacher: Omit<TeacherFormValues, 'classes'> & { classes: string[] }) => void;
}

export function AddTeacherDialog({ open, onOpenChange, onTeacherAdd }: AddTeacherDialogProps) {
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      classes: '',
      mobile: '',
      password: '',
    },
  });

  const onSubmit = (data: TeacherFormValues) => {
    const teacherDataWithClassesArray = {
        ...data,
        classes: data.classes.split(',').map(c => c.trim()),
    };
    onTeacherAdd(teacherDataWithClassesArray);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>
            Enter the details of the new teacher. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Mr. Solomon" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="solomon@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Mathematics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="classes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classes (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="10-A, 10-B" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile</FormLabel>
                  <FormControl>
                    <Input placeholder="+251 911 111 222" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
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
              <Button type="submit">Add Teacher</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
