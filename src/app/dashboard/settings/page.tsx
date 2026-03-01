'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useData } from '@/context/data-context';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  // Password validation removed from here, handled separately
});

const schoolInfoSchema = z.object({
    name: z.string().min(3, "School name is required."),
    address: z.string().min(3, "Address is required."),
    contact: z.string().min(10, "A valid contact phone is required."),
});

const themeColors = [
    { name: 'Purple', value: '259 71% 50%' },
    { name: 'Blue', value: '221 83% 53%' },
    { name: 'Green', value: '142 71% 45%' },
    { name: 'Rose', value: '347 77% 50%' },
    { name: 'Black', value: '24 9.8% 10%' },
];

export default function SettingsPage() {
  const { 
    adminProfile, 
    schoolInfo, 
    appearance, 
    updateAdminProfile, 
    updateSchoolInfo, 
    setTheme, 
    toggleDarkMode,
    isLoading, // Use global loading state
  } = useData();
  
  const { toast } = useToast();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '' },
  });

  const schoolInfoForm = useForm<z.infer<typeof schoolInfoSchema>>({
    resolver: zodResolver(schoolInfoSchema),
    defaultValues: { name: '', address: '', contact: '' },
  });
  
  // Sync form with context data when it loads
  useEffect(() => {
    if (adminProfile) {
      profileForm.reset({ name: adminProfile.name });
    }
  }, [adminProfile, profileForm]);

  useEffect(() => {
    if (schoolInfo) {
      schoolInfoForm.reset(schoolInfo);
    }
  }, [schoolInfo, schoolInfoForm]);

  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    updateAdminProfile(data);
  };
  
  const onSchoolInfoSubmit = (data: z.infer<typeof schoolInfoSchema>) => {
    updateSchoolInfo(data);
  };
  
  const onThemeChange = (colorValue: string) => {
    setTheme(colorValue);
  };

  const handleAppearanceSave = () => {
    toast({
      title: 'Appearance Saved',
      description: 'Your appearance settings are saved automatically.',
    });
  }

  if (isLoading) {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">Settings</h1>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
                <Card className="lg:col-span-2"><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Settings</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Profile Settings */}
        <Card>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <CardHeader>
                <CardTitle>Admin Profile</CardTitle>
                <CardDescription>
                  Update your personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input id="admin-email" type="email" value={adminProfile?.email || ''} readOnly />
                </div>
                 {/* Password fields can be added here if needed, linking to a password change function */}
              </CardContent>
              <CardFooter>
                <Button type="submit">Update Profile</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {/* General App Settings */}
        <Card>
          <Form {...schoolInfoForm}>
            <form onSubmit={schoolInfoForm.handleSubmit(onSchoolInfoSubmit)}>
                <CardHeader>
                    <CardTitle>School Information</CardTitle>
                    <CardDescription>
                    Manage general school details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={schoolInfoForm.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>School Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={schoolInfoForm.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={schoolInfoForm.control}
                        name="contact"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </CardContent>
                <CardFooter>
                    <Button type="submit">Save School Info</Button>
                </CardFooter>
            </form>
          </Form>
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
                    <Switch 
                        id="dark-mode" 
                        checked={appearance?.darkMode}
                        onCheckedChange={toggleDarkMode}
                    />
                </div>
                 <Separator />
                <div className="space-y-2">
                    <Label className="text-base">Theme Color</Label>
                    <p className="text-sm text-muted-foreground">
                        Select a primary color for the application theme.
                    </p>
                    <div className="flex gap-2 pt-2">
                        {themeColors.map(color => (
                            <Button
                                key={color.name}
                                type="button"
                                variant="outline"
                                size="icon"
                                className={cn(
                                    "h-8 w-8 rounded-full",
                                    appearance?.theme === color.value && "ring-2 ring-ring"
                                )}
                                style={{ backgroundColor: `hsl(${color.value})` }}
                                onClick={() => onThemeChange(color.value)}
                            >
                                {appearance?.theme === color.value && <Check className="h-4 w-4 text-primary-foreground" />}
                                <span className="sr-only">{color.name}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            </CardContent>
             <CardFooter>
                <Button type="button" onClick={handleAppearanceSave}>Save Appearance Settings</Button>
            </CardFooter>
        </Card>

      </div>
    </div>
  );
}
