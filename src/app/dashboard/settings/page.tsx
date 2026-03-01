'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Settings</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Profile</CardTitle>
            <CardDescription>
              Update your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Name</Label>
              <Input id="admin-name" defaultValue="Geda Abay" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" defaultValue="gedaabay8@gmail.com" readOnly />
            </div>
            <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Update Profile</Button>
          </CardFooter>
        </Card>

        {/* General App Settings */}
        <Card>
          <CardHeader>
            <CardTitle>School Information</CardTitle>
            <CardDescription>
              Manage general school details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="school-name">School Name</Label>
              <Input id="school-name" defaultValue="Adama Model School" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-address">Address</Label>
              <Input id="school-address" defaultValue="Adama, Ethiopia" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="school-contact">Contact Phone</Label>
              <Input id="school-contact" defaultValue="+251 912 345 678" />
            </div>
          </CardContent>
           <CardFooter>
            <Button>Save School Info</Button>
          </CardFooter>
        </Card>

        {/* Appearance Settings */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Appearance & Theme</CardTitle>
                <CardDescription>
                Customize the look and feel of the application.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                            Enable or disable dark mode for the dashboard.
                        </p>
                    </div>
                    <Switch id="dark-mode" />
                </div>
                 <Separator />
                <div className="space-y-2">
                    <Label className="text-base">Theme Color</Label>
                    <p className="text-sm text-muted-foreground">
                        Select a primary color for the application theme.
                    </p>
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full ring-2 ring-ring"
                            style={{ backgroundColor: 'hsl(259 71% 50%)' }}
                        >
                            <span className="sr-only">Purple</span>
                        </Button>
                         <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            style={{ backgroundColor: 'hsl(221 83% 53%)' }}
                        >
                            <span className="sr-only">Blue</span>
                        </Button>
                         <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            style={{ backgroundColor: 'hsl(142 71% 45%)' }}
                        >
                            <span className="sr-only">Green</span>
                        </Button>
                         <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            style={{ backgroundColor: 'hsl(347 77% 50%)' }}
                        >
                            <span className="sr-only">Rose</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            style={{ backgroundColor: 'hsl(24 9.8% 10%)' }}
                        >
                            <span className="sr-only">Black</span>
                        </Button>
                    </div>
                </div>
            </CardContent>
             <CardFooter>
                <Button>Save Appearance Settings</Button>
            </CardFooter>
        </Card>

      </div>
    </div>
  );
}
