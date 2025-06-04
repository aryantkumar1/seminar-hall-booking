
'use client';

import { AppHeader } from '@/components/layout/AppHeader';
import type { ReactNode } from 'react';
import { BookingProvider } from '@/context/BookingContext';
import { HallProvider } from '@/context/HallContext';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function FacultyLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requiredRole="faculty" fallbackPath="/faculty/login">
      <HallProvider>
        <BookingProvider>
        <div className="min-h-screen flex flex-col">
          <AppHeader />
          <main className="flex-grow container py-8">
            {children}
          </main>
          <footer className="border-t py-6 text-center text-sm text-muted-foreground">
            HallHub Faculty Portal &copy; 2024
          </footer>
        </div>
      </BookingProvider>
    </HallProvider>
    </AuthGuard>
  );
}
