'use client';

import Link from "next/link"
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { BookUser } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useData } from "@/context/data-context";
import { useToast } from "@/hooks/use-toast";


export default function TeacherLoginPage() {
    const router = useRouter();
    const { loginTeacher, firebaseUser, isUserLoading } = useData();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isUserLoading && firebaseUser) {
            router.push('/teacher/dashboard');
        }
    }, [firebaseUser, isUserLoading, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const success = await loginTeacher(email, password);

        if (success) {
            router.push('/teacher/dashboard');
        } else {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Invalid email or password. Please try again.',
            });
            setIsSubmitting(false);
        }
    };

    if (isUserLoading || firebaseUser) {
        return (
          <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
          </div>
        );
    }

  return (
    <div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Teacher Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your portal
            </p>
          </div>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                  onClick={(e) => { e.preventDefault(); alert("Please contact the administration to reset your password."); }}
                >
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
                disabled={isSubmitting}
                />
            </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Not a teacher? Go to{" "}
            <Link href="/login" className="underline">
              Admin Login
            </Link> or the {" "}
            <Link href="/student/login" className="underline">
              Student Portal
            </Link>.
          </div>
        </div>
      </div>
       <div className="hidden bg-muted lg:flex items-center justify-center p-8 bg-gradient-to-br from-primary to-accent">
        <div className="text-center text-white">
            <BookUser className="mx-auto h-24 w-24 mb-4" />
            <h2 className="text-4xl font-headline font-bold">Adama Model Teacher Portal</h2>
            <p className="mt-2 text-lg">Shape the future, one student at a time.</p>
        </div>
      </div>
    </div>
  )
}
