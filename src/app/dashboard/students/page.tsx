import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function StudentsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-4">Students</h1>
      <Card>
        <CardHeader>
          <CardTitle>Student Management</CardTitle>
          <CardDescription>
            This page will contain tools for managing students.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
