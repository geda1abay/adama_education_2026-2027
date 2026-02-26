import { Badge } from '@/components/ui/badge';
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
import { RECENT_ACTIVITIES } from '@/lib/data';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'default';
    case 'In Progress':
      return 'secondary';
    case 'Pending Review':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function RecentActivitiesTable() {
  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>
          An overview of recent activities in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {RECENT_ACTIVITIES.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <div className="font-medium">{activity.user}</div>
                </TableCell>
                <TableCell>{activity.activity}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={getStatusVariant(activity.status)}
                    className="capitalize"
                  >
                    {activity.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
