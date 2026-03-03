'use client';

import Link from "next/link"
import { Bot } from "lucide-react"
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/data-context";
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

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { adminLogin, firebaseUser, isUserLoading, userRole } = useData();
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('password');
    const [isLoading, setIsLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;


    useEffect(() => {
      if (!isUserLoading && firebaseUser && userRole === 'admin') {
        router.push('/dashboard');
      }
    }, [firebaseUser, isUserLoading, userRole, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const errorMessage = await adminLogin(email, password);
        if (!errorMessage) {
            router.push('/dashboard');
        } else {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: errorMessage,
            });
            setIsLoading(false);
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
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Admin Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to login to your account.
            </p>
          </div>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
                disabled={isLoading}
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
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90" disabled={isLoading || (!!siteKey && !recaptchaToken)}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Are you a student or teacher? Go to the{" "}
            <Link href="/student/login" className="underline">
              Student Portal
            </Link> or the {" "}
            <Link href="/teacher/login" className="underline">
              Teacher Portal
            </Link>.
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex items-center justify-center p-8 bg-gradient-to-br from-primary to-accent">
        <div className="text-center text-white">
            <Bot className="mx-auto h-24 w-24 mb-4" />
            <h2 className="text-4xl font-headline font-bold">Adama Model</h2>
            <p className="mt-2 text-lg">The Future of School Management</p>
        </div>
      </div>
    </div>
  )
}
