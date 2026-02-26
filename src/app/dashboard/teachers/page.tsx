import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function TeachersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-4">Teachers</h1>
      <Card>
        <CardHeader>
          <CardTitle>Teacher Management</CardTitle>
          <CardDescription>
            This page will contain tools for managing teachers.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
