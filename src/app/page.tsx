import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/shared/AppLogo';
import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <header className="mb-12 text-center">
        <div className="inline-block mb-6">
         <AppLogo />
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Welcome to HallHub, your one-stop solution for booking seminar halls efficiently and effortlessly.
        </p>
      </header>

      <main className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <LogIn className="text-primary" />
              Admin Portal
            </CardTitle>
            <CardDescription>
              Manage seminar halls, approve bookings, and oversee system operations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/login" passHref>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Admin Login
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <LogIn className="text-accent" />
              Faculty Portal
            </CardTitle>
            <CardDescription>
              Browse available halls, check schedules, and book your preferred seminar space.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/faculty/login" passHref>
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Faculty Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-16 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} HallHub. All rights reserved.</p>
        <p>Streamlining seminar hall bookings with modern technology.</p>
      </footer>
    </div>
  );
}
