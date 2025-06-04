'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLogo } from '@/components/shared/AppLogo';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function FacultyLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.login(email, password);

      if (response.error) {
        setError(response.error);
      } else if (response.data?.user) {
        // Check if user is faculty
        if (response.data.user.role === 'faculty') {
          console.log('✅ Faculty login successful');
          console.log('👤 Faculty login response user:', response.data.user);

          // Manually store user data to ensure it's saved
          localStorage.setItem('user', JSON.stringify(response.data.user));
          console.log('💾 Manually stored faculty user in localStorage');

          // Verify storage
          const storedUser = localStorage.getItem('user');
          console.log('🔍 Verification - stored faculty user:', storedUser);

          // Trigger data loading for contexts
          window.dispatchEvent(new Event('authChanged'));

          // Add a small delay to ensure AuthGuard processes the login
          setTimeout(() => {
            console.log('🔄 Redirecting to faculty halls after login');
            router.push('/faculty/halls');
          }, 100);
        } else {
          setError('Access denied. Faculty credentials required.');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-fit mb-4">
            <AppLogo />
          </div>
          <CardTitle className="font-headline">Login to Faculty Portal</CardTitle>
          <CardDescription>Access your faculty account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/faculty/register" className="text-green-600 hover:underline">
                Register here
              </Link>
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
