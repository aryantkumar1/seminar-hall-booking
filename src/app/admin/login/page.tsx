'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLogo } from '@/components/shared/AppLogo';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function AdminLoginPage() {
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
      } else if (response.data && typeof response.data === 'object' && 'user' in response.data) {
        // Check if user is admin
        const userData = (response.data as any).user;
        if (userData.role === 'admin') {
          console.log('✅ Admin login successful');
          console.log('👤 Login response user:', userData);

          // Manually store user data to ensure it's saved
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('💾 Manually stored user in localStorage');

          // Verify storage
          const storedUser = localStorage.getItem('user');
          console.log('🔍 Verification - stored user:', storedUser);

          // Trigger data loading for contexts
          window.dispatchEvent(new Event('authChanged'));

          // Add a small delay to ensure AuthGuard processes the login
          setTimeout(() => {
            console.log('🔄 Redirecting to admin dashboard after login');
            router.push('/admin/dashboard');
          }, 100);
        } else {
          setError('Access denied. Admin credentials required.');
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
          <CardTitle className="font-headline">Login to Admin Portal</CardTitle>
          <CardDescription>Access your admin account.</CardDescription>
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/admin/register" className="text-blue-600 hover:underline">
                Register here
              </Link>
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
