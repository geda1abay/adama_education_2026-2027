import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NOTIFICATIONS } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function NotificationsPanel() {
  const getImage = (avatarId: string) =>
    PlaceHolderImages.find((img) => img.id === avatarId);

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Notifications</CardTitle>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <a href="#">
            View All
            <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {NOTIFICATIONS.map((notification) => {
          const avatar = getImage(notification.avatar);
          return (
            <div key={notification.id} className="flex items-start gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={avatar?.imageUrl}
                  alt={avatar?.description}
                  data-ai-hint={avatar?.imageHint}
                />
                <AvatarFallback>{notification.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm">
                  <span className="font-semibold">{notification.name}</span>{' '}
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {notification.time}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
