'use client';

import Link from "next/link"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GraduationCap, Terminal } from "lucide-react"

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
import { STUDENTS } from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function StudentLoginPage() {
    const router = useRouter();
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const validStudentIds = STUDENTS.map(s => s.id);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        let loginId = studentId;

        // The student ID displayed on the roster is like "Hgr/0000/24".
        // The internal ID used for login is like "STU-001".
        // This logic converts the display ID back to the internal ID.
        if (loginId.toUpperCase().startsWith('HGR/')) {
            const parts = loginId.split('/');
            if (parts.length >= 2) {
                const idNumber = parseInt(parts[1], 10);
                if (!isNaN(idNumber)) {
                    const originalNumber = idNumber + 1;
                    loginId = `STU-${String(originalNumber).padStart(3, '0')}`;
                }
            }
        }

        if (validStudentIds.includes(loginId.toUpperCase()) && password === '1515') {
            sessionStorage.setItem('studentId', loginId.toUpperCase());
            router.push('/student/dashboard');
        } else {
            setError('Invalid Student ID or Password. The password for all students is 1515. Please use the ID from the student roster (e.g., Hgr/0000/24).');
        }
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
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="student-id">Student ID</Label>
              <Input
                id="student-id"
                type="text"
                placeholder="Hgr/0000/24"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                  onClick={(e) => { e.preventDefault(); alert("The password is '1515' for all students for this demo."); }}
                >
                  Forgot your password?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required />
            </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                Login
                </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Not a student?{" "}
            <Link href="/login" className="underline">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
