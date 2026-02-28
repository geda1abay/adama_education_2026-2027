'use client';

import Link from "next/link"
import { Bot, Terminal } from "lucide-react"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase"; // Import useAuth and useFirestore
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"; // Import sign in and create user
import { doc, setDoc } from "firebase/firestore"; // Import firestore functions

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
    const router = useRouter();
    const auth = useAuth(); // Get auth instance
    const firestore = useFirestore(); // Get firestore instance
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('151835');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // First, try to sign in
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard');
        } catch (signInError: any) {
            // If the user is not found, and it's the admin email, try to create the user
            if (signInError.code === 'auth/user-not-found' && email.toLowerCase() === 'admin@example.com') {
                try {
                    console.log('Admin user not found. Attempting to create a new admin account...');
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;

                    // IMPORTANT: Create the admin role document in Firestore for authorization
                    const adminRoleRef = doc(firestore, 'user_roles/admins', user.uid);
                    await setDoc(adminRoleRef, { role: 'admin' });

                    console.log('Admin user and role created successfully.');
                    router.push('/dashboard'); // Redirect after successful creation
                } catch (createError: any) {
                    setError('Failed to create admin account. Please check console for details.');
                    console.error('Admin creation error:', createError);
                }
            } else if (signInError.code === 'auth/wrong-password' || signInError.code === 'auth/invalid-credential') {
                setError('Invalid email or password. Please try again.');
            } else if (signInError.code === 'auth/invalid-email') {
                setError('The email address is not a valid format.');
            } else {
                setError('An unexpected error occurred. Please try again later.');
                console.error(signInError);
            }
        } finally {
            setIsLoading(false);
        }
    };

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
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
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
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Not an admin?{" "}
            <Link href="/student/login" className="underline">
              Student Portal
            </Link>
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
