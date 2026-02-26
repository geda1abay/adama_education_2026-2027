import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-4">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            This page will contain settings for the application.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
