'use client';

import { useEffect } from 'react';
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

const studentSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  dateOfBirth: z.string().min(1, { message: 'Date of birth is required.' }),
  gender: z.string().min(1, { message: 'Gender is required.' }),
  address: z.string().min(3, { message: 'Address is required.' }),
  contactEmail: z.string().email({ message: 'Invalid email address.' }),
  gradeLevel: z.string().min(1, { message: 'Class is required.' }),
  contactPhone: z.string().min(10, { message: 'Mobile number must be at least 10 digits.' }),
  parentPhone: z.string().min(10, { message: 'Parent phone must be at least 10 digits.' }),
  enrollmentDate: z.string().min(1, { message: 'Enrollment date is required.' }),
  password: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudentAdd: (student: StudentFormValues) => void | Promise<void>;
  initialValues?: Partial<StudentFormValues>;
  mode?: 'add' | 'edit';
}

export function AddStudentDialog({
  open,
  onOpenChange,
  onStudentAdd,
  initialValues,
  mode = 'add',
}: AddStudentDialogProps) {
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      contactEmail: '',
      gradeLevel: '',
      contactPhone: '',
      parentPhone: '',
      enrollmentDate: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      firstName: initialValues?.firstName || '',
      lastName: initialValues?.lastName || '',
      dateOfBirth: initialValues?.dateOfBirth || '',
      gender: initialValues?.gender || '',
      address: initialValues?.address || '',
      contactEmail: initialValues?.contactEmail || '',
      gradeLevel: initialValues?.gradeLevel || '',
      contactPhone: initialValues?.contactPhone || '',
      parentPhone: initialValues?.parentPhone || '',
      enrollmentDate: initialValues?.enrollmentDate || '',
      password: '',
    });
  }, [form, initialValues, open]);

  const onSubmit = async (data: StudentFormValues) => {
    if (mode === 'add' && (!data.password || data.password.length < 6)) {
      form.setError('password', { message: 'Password must be at least 6 characters.' });
      return;
    }

    await onStudentAdd(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Student' : 'Add New Student'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update the student details. Leave the password blank to keep the current password.'
              : 'Enter the details of the new student. The system will assign the student ID automatically.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-h-[calc(90vh-8rem)] space-y-4 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Abebe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Kebede" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <Input placeholder="Male / Female" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Adama, Ethiopia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="student@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gradeLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <FormControl>
                    <Input placeholder="10-A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+251..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parentPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+251..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enrollmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enrollment Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <FormLabel>{mode === 'edit' ? 'New Password (optional)' : 'Password'}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
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
              <Button type="submit">{mode === 'edit' ? 'Save Changes' : 'Add Student'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
