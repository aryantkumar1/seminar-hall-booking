
import { AppHeader } from '@/components/layout/AppHeader';
import type { ReactNode } from 'react';
import { BookingProvider } from '@/context/BookingContext';

export default function FacultyLayout({ children }: { children: ReactNode }) {
  return (
    <BookingProvider>
      <div className="min-h-screen flex flex-col">
        <AppHeader userRole="faculty" />
        <main className="flex-grow container py-8">
          {children}
        </main>
        <footer className="border-t py-6 text-center text-sm text-muted-foreground">
          HallHub Faculty Portal &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </BookingProvider>
  );
}
