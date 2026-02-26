import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: keyof typeof Icons;
}

export default function StatCard({
  title,
  value,
  change,
  icon,
}: StatCardProps) {
  const LucideIcon = Icons[icon] as LucideIcon;
  const isPositiveChange = change.startsWith('+');

  return (
    <Card className="bg-card/70 backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <LucideIcon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-headline">{value}</div>
        <p
          className={cn(
            'text-xs text-muted-foreground',
            isPositiveChange ? 'text-green-500' : 'text-red-500'
          )}
        >
          {change} from last month
        </p>
      </CardContent>
    </Card>
  );
}
