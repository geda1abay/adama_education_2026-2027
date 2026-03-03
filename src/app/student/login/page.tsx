'use client';

import Link from "next/link"
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { GraduationCap } from "lucide-react"
import ReCAPTCHA from "react-google-recaptcha";

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


export default function StudentLoginPage() {
    const router = useRouter();
    const { loginStudent, firebaseUser, isUserLoading, userRole } = useData();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;


    useEffect(() => {
        if (!isUserLoading && firebaseUser && userRole === 'student') {
            router.push('/student/dashboard');
        }
    }, [firebaseUser, isUserLoading, userRole, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const errorMessage = await loginStudent(email, password);

        if (!errorMessage) {
            router.push('/student/dashboard');
        } else {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: errorMessage,
            });
            setIsSubmitting(false);
            recaptchaRef.current?.reset();
            setRecaptchaToken(null);
        }
    };

    if (isUserLoading || (firebaseUser && userRole)) {
      return (
        <div className="flex h-screen items-center justify-center">
          <p>Loading...</p>
        </div>
      );
    }

  return (
    <div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="hidden bg-muted lg:flex items-center justify-center p-8 bg-gradient-to-br from-primary to-accent">
        <div className="text-center text-white">
            <GraduationCap className="mx-auto h-24 w-24 mb-4" />
            <h2 className="text-4xl font-headline font-bold">Adama Model Student Portal</h2>
            <p className="mt-2 text-lg">Your academic journey starts here.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Student Login</h1>
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
                placeholder="student@example.com"
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
             {siteKey && (
              <div className="grid gap-2 justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={siteKey}
                  onChange={setRecaptchaToken}
                />
              </div>
            )}
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90" disabled={isSubmitting || (!!siteKey && !recaptchaToken)}>
                {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Not a student? Go to{" "}
            <Link href="/login" className="underline">
              Admin Login
            </Link> or the {" "}
            <Link href="/teacher/login" className="underline">
              Teacher Portal
            </Link>.
          </div>
        </div>
      </div>
    </div>
  )
}
