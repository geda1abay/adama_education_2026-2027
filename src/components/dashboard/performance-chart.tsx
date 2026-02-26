'use client';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PERFORMANCE_DATA, PERFORMANCE_CHART_CONFIG } from '@/lib/data';

export default function PerformanceChart() {
  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Student Performance</CardTitle>
        <CardDescription>Average scores across key subjects</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          id="performance-chart"
          config={PERFORMANCE_CHART_CONFIG}
          className="h-64"
        >
          <LineChart
            accessibilityLayer
            data={PERFORMANCE_DATA}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="Math"
              type="monotone"
              stroke="var(--color-Math)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="Science"
              type="monotone"
              stroke="var(--color-Science)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="English"
              type="monotone"
              stroke="var(--color-English)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
