'use client';

import Link from 'next/link';
import { GraduationCap, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/data-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function StudentHeader() {
    // For now, we mock the logged-in student as the first one.
    // In a real app, this would come from an auth context.
    const { students } = useData();
    const student = students[0];
    const avatar = PlaceHolderImages.find((img) => img.id === student?.avatar);


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <Link
          href="/student/dashboard"
          className="flex items-center gap-2 font-headline text-lg font-semibold"
        >
          <GraduationCap className="h-6 w-6 text-primary" />
          <span>Adama Model Portal</span>
        </Link>

      <div className="ml-auto flex items-center gap-4">
        {student && (
            <div className="flex items-center gap-2">
                 <Avatar className="h-9 w-9">
                    <AvatarImage src={avatar?.imageUrl} alt={student.name} data-ai-hint={avatar?.imageHint} />
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm">
                    <span className="font-semibold">{student.name}</span>
                    <span className="text-xs text-muted-foreground">{student.class}</span>
                </div>
            </div>
        )}
        <Link href="/student/login">
            <Button variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </Link>
      </div>
    </header>
  );
}
