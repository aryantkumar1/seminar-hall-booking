
import { AppHeader } from '@/components/layout/AppHeader';
import type { ReactNode } from 'react';
import { HallProvider } from '@/context/HallContext';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <HallProvider>
      <div className="min-h-screen flex flex-col">
        <AppHeader userRole="admin" />
        <main className="flex-grow container py-8">
          {children}
        </main>
        <footer className="border-t py-6 text-center text-sm text-muted-foreground">
          HallHub Admin Portal &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </HallProvider>
  );
}
