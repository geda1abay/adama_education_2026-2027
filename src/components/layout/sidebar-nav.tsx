import Link from 'next/link';
import {
  Book,
  Bot,
  ChevronDown,
  GraduationCap,
  Home,
  LayoutDashboard,
  Settings,
  Users,
  ClipboardList,
  BarChart,
  DollarSign,
  LifeBuoy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard', icon: Users, label: 'Students' },
  { href: '/dashboard', icon: GraduationCap, label: 'Teachers' },
  { href: '/dashboard', icon: Book, label: 'Classes & Subjects' },
  { href: '/dashboard', icon: ClipboardList, label: 'Attendance' },
  { href: '/dashboard', icon: BarChart, label: 'Exams & Results' },
  { href: '/dashboard', icon: DollarSign, label: 'Fee Management' },
];

export default function SidebarNav() {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-headline text-lg font-semibold"
        >
          <Bot className="h-6 w-6 text-sidebar-primary" />
          <span>ScholarlyFlow</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 py-4 text-sm font-medium lg:px-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                item.href === '/dashboard'
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : ''
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t border-sidebar-border p-4">
        <nav className="grid gap-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LifeBuoy className="h-4 w-4" />
            Support
          </Link>
        </nav>
      </div>
    </div>
  );
}
