
'use client';

import { AppHeader } from '@/components/layout/AppHeader';
import type { ReactNode } from 'react';
import { HallProvider } from '@/context/HallContext';
import { BookingProvider } from '@/context/BookingContext';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRole="admin" fallbackPath="/admin/login">
      <HallProvider>
        <BookingProvider>
          <div className="min-h-screen flex flex-col">
            <AppHeader />
            <main className="flex-grow container py-8">
              {children}
            </main>
            <footer className="border-t py-6 text-center text-sm text-muted-foreground">
              HallHub Admin Portal &copy; 2024
            </footer>
          </div>
        </BookingProvider>
      </HallProvider>
    </AuthGuard>
  );
}
