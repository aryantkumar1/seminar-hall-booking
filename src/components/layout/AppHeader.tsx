import Link from 'next/link';
import { AppLogo } from '@/components/shared/AppLogo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
}

interface AppHeaderProps {
  userRole?: 'admin' | 'faculty';
}

export function AppHeader({ userRole }: AppHeaderProps) {
  let navLinks: NavLink[] = [];
  if (userRole === 'admin') {
    navLinks = [
      { href: '/admin/dashboard', label: 'Dashboard' },
      { href: '/admin/halls/create', label: 'Create Hall' },
    ];
  } else if (userRole === 'faculty') {
    navLinks = [
      { href: '/faculty/halls', label: 'Halls' },
      // { href: '/faculty/bookings', label: 'My Bookings' }, // Example for future
    ];
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <AppLogo />
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          {userRole && (
             <Link href="/" passHref>
                <Button variant="ghost" size="sm">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
             </Link>
          )}
        </nav>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                {userRole && (
                  <Link href="/" passHref>
                    <Button variant="outline" className="w-full mt-4">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
