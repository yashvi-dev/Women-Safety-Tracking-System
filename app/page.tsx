'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { SignupForm } from '@/components/signup-form';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [activeTab, setActiveTab] = useState('login');
  const router = useRouter();
  const { user } = useAuth();

  // Redirect to dashboard if already authenticated
  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Women Safety Tracking System
          </h1>
          <p className="text-muted-foreground">
            Stay connected and protected with real-time safety tracking
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-4">
                <LoginForm />
              </TabsContent>
              <TabsContent value="signup" className="mt-4">
                <SignupForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <footer className="text-center text-sm text-muted-foreground">
          <p>
            By using this service, you agree to our{' '}
            <a href="/terms" className="underline hover:text-primary">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}

