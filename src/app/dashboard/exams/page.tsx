import { FileDown } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EXAM_STAT_CARDS, RECENT_EXAM_RESULTS } from '@/lib/data';
import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';

export default function ExamsPage() {
  const getGradeVariant = (
    grade: string
  ): VariantProps<typeof badgeVariants>['variant'] => {
    if (grade.startsWith('A')) return 'default';
    if (grade.startsWith('B')) return 'secondary';
    if (grade.startsWith('C') || grade.startsWith('D')) return 'outline';
    return 'destructive';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Exams & Results</h1>
          <p className="text-muted-foreground">
            Overview of student examination performance.
          </p>
        </div>
        <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
          <FileDown className="mr-2 h-4 w-4" />
          Export Results
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {EXAM_STAT_CARDS.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            change={card.change}
            icon={card.icon}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Exam Results</CardTitle>
          <CardDescription>
            A summary of the most recent exam results across all classes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="hidden sm:table-cell">Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_EXAM_RESULTS.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <div className="font-medium">{result.studentName}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {result.class}
                  </TableCell>
                  <TableCell>{result.subject}</TableCell>
                  <TableCell className="text-right">{result.score}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getGradeVariant(result.grade)}>
                      {result.grade}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
