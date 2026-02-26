import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ClassesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-4">Classes & Subjects</h1>
      <Card>
        <CardHeader>
          <CardTitle>Class & Subject Management</CardTitle>
          <CardDescription>
            This page will contain tools for managing classes and subjects.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
