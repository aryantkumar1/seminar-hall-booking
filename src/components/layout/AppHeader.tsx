
"use client";

import Link from 'next/link';
import { AppLogo } from '@/components/shared/AppLogo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, CalendarDays } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import React, { useState, useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { useBookings, type Booking } from '@/context/BookingContext'; // Import useBookings

interface NavLink {
  href: string;
  label: string;
}

interface AppHeaderProps {
  userRole?: 'admin' | 'faculty';
}

function ScheduleCalendar() {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date()); // Default to today
  const { bookings: allBookings } = useBookings(); // Use bookings from context

  const bookedDates = useMemo(() => allBookings.map(b => b.date), [allBookings]);

  const bookingsForSelectedDay = useMemo(() => {
    if (!selectedDay) return [];
    return allBookings.filter(booking => isSameDay(booking.date, selectedDay) && booking.status === 'Approved');
  }, [selectedDay, allBookings]);

  return (
    <>
      <Calendar
        mode="single"
        selected={selectedDay}
        onSelect={setSelectedDay}
        modifiers={{ booked: bookedDates.filter(date => allBookings.find(b => isSameDay(b.date, date) && b.status === 'Approved')) }} // Only mark approved bookings
        modifiersClassNames={{ booked: 'day-booked' }}
        className="rounded-md"
        initialFocus
      />
      {selectedDay && (
        <div className="mt-4 pt-4 border-t max-h-60 overflow-y-auto">
          <h4 className="text-sm font-semibold mb-2 text-foreground">
            Approved Bookings for {format(selectedDay, "PPP")}
          </h4>
          {bookingsForSelectedDay.length > 0 ? (
            <ul className="space-y-2 text-xs text-muted-foreground">
              {bookingsForSelectedDay.map(booking => (
                <li key={booking.id} className="p-2 bg-secondary/50 rounded-md">
                  <p className="font-medium text-foreground">{booking.hallName}</p>
                  <p>{booking.purpose}</p>
                  <p>{booking.startTime} - {booking.endTime} (by {booking.facultyName})</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No approved bookings for this day.</p>
          )}
        </div>
      )}
    </>
  );
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
      { href: '/faculty/my-bookings', label: 'My Bookings' },
    ];
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <AppLogo />
        <nav className="hidden md:flex items-center space-x-4 text-sm font-medium">
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <CalendarDays className="mr-1.5 h-4 w-4" /> Schedule
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 mt-1 sm:min-w-[320px] max-h-[80vh] overflow-y-auto shadow-xl rounded-lg">
                <ScheduleCalendar />
              </PopoverContent>
            </Popover>
          )}

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
                    className="text-lg transition-colors hover:text-primary px-2 py-1 rounded-md"
                  >
                    {link.label}
                  </Link>
                ))}

                {userRole && (
                  <Popover>
                    <PopoverTrigger asChild>
                       <Button variant="ghost" className="w-full justify-start text-lg hover:text-primary px-2 py-1 rounded-md">
                         <CalendarDays className="mr-2 h-5 w-5" /> Schedule
                       </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 mt-1 sm:min-w-[320px] max-h-[calc(80vh-2rem)] overflow-y-auto shadow-xl rounded-lg ml-[-10px] sm:ml-0">
                      <ScheduleCalendar />
                    </PopoverContent>
                  </Popover>
                )}

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
