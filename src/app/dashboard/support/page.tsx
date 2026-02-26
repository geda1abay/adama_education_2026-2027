import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SupportPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-4">Support</h1>
      <Card>
        <CardHeader>
          <CardTitle>Support Center</CardTitle>
          <CardDescription>
            This page will provide support information.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
