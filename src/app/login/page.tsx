'use client';

import Link from "next/link"
import { Bot, Terminal } from "lucide-react"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase"; // Import useAuth and useFirestore
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"; // Import sign in and create user
import { doc, setDoc, getDoc } from "firebase/firestore"; // Import firestore functions

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
    const [email, setEmail] = useState('gedaabay8@gmail.com');
    const [password, setPassword] = useState('151835');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Helper to ensure role exists and then redirect
    const ensureAdminRoleAndRedirect = async (userId: string) => {
        const adminRoleRef = doc(firestore, 'admins', userId);
        try {
            const adminRoleSnap = await getDoc(adminRoleRef);
            if (!adminRoleSnap.exists()) {
                console.log("Admin role document missing, creating...");
                await setDoc(adminRoleRef, { userId: userId, role: 'admin', email: email.toLowerCase() });
                // Verify creation
                const finalCheck = await getDoc(adminRoleRef);
                if (!finalCheck.exists()) {
                    throw new Error("Failed to create and verify admin role in database.");
                }
                console.log("Admin role created and verified.");
            }
            router.push('/dashboard');
        } catch (e: any) {
            console.error("Role verification/creation failed:", e);
            setError("An error occurred verifying admin permissions. Please try again.");
            setIsLoading(false); // Make sure to stop loading indicator on error
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Only allow gedaabay8@gmail.com to attempt login here
        if (email.toLowerCase() !== 'gedaabay8@gmail.com') {
            setError("This login is for administrators only.");
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await userCredential.user.getIdToken(true); // Force token refresh
            await ensureAdminRoleAndRedirect(userCredential.user.uid);
        } catch (signInError: any) {
            if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
                console.log('Admin user not found. Attempting to create a new admin account...');
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    await userCredential.user.getIdToken(true); // Force token refresh for new user
                    await ensureAdminRoleAndRedirect(userCredential.user.uid);
                } catch (createError: any) {
                    if (createError.code === 'auth/email-already-in-use') {
                        setError('Invalid password for admin account. Please try again.');
                    } else {
                        setError('Failed to create admin account. Please check console for details.');
                        console.error('Admin creation error:', createError);
                    }
                    setIsLoading(false);
                }
            } else {
                setError(signInError.message || 'An unexpected error occurred during login.');
                console.error(signInError);
                setIsLoading(false);
            }
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
                placeholder="gedaabay8@gmail.com"
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
