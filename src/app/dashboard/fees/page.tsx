import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function FeesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-4">Fee Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Fee Management</CardTitle>
          <CardDescription>
            This page will contain tools for managing student fees.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
