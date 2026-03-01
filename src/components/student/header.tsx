'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, LogOut, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/data-context';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '../ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function StudentHeader() {
  const { currentUser: student, students, logoutStudent } = useData();
  const router = useRouter();

  const handleLogout = () => {
    logoutStudent();
    router.push('/student/login');
  };

  const avatar = student ? PlaceHolderImages.find((img) => img.id === student.avatar) : null;
  const isLoading = students.length === 0;

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
        {isLoading ? (
            <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className='flex flex-col gap-1'>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
                </div>
            </div>
        ) : student ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 focus-visible:ring-0 h-12">
                     <Avatar className="h-9 w-9">
                        <AvatarImage src={avatar?.imageUrl} alt={student.name} data-ai-hint={avatar?.imageHint} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-sm items-start">
                        <span className="font-semibold">{student.name}</span>
                        <span className="text-xs text-muted-foreground">{student.class}</span>
                    </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/student/dashboard/account">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
}
