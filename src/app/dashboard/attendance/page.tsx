import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AttendancePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-4">Attendance</h1>
      <Card>
        <CardHeader>
          <CardTitle>Attendance Tracking</CardTitle>
          <CardDescription>
            This page will contain tools for tracking student attendance.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
