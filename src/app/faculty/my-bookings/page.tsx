
"use client";

import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useBookings, type Booking } from '@/context/BookingContext';
import { useMemo, useEffect, useState } from 'react';

export default function MyBookingsPage() {
  const { bookings, loading, deleteBooking } = useBookings();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Get current logged-in user
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const facultyBookings = useMemo(() => {
    if (!currentUser) return [];

    // Filter bookings by current faculty user's ID
    return bookings.filter(b => b.facultyId === currentUser.id || b.facultyId === currentUser._id)
      .sort((a,b) => b.date.getTime() - a.date.getTime());
  }, [bookings, currentUser]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    console.log('🗑️ Faculty attempting to cancel booking:', bookingId);
    try {
      const success = await deleteBooking(bookingId);
      console.log('🗑️ Faculty cancellation result:', success);

      if (!success) {
        console.error('❌ Failed to cancel booking');
        alert('Failed to cancel booking. Please try again.');
      }
      // No page reload needed - state is updated automatically by BookingContext
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      alert('Error cancelling booking. Please check your connection.');
    }
  };

  if (loading) {
    return (
      <div>
        <PageTitle>My Bookings</PageTitle>
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <p>Loading your bookings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageTitle>My Bookings</PageTitle>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CalendarClock className="text-primary" />
            Your Scheduled Bookings
          </CardTitle>
          <CardDescription>
            Here are all the seminar halls you have booked or requested.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {facultyBookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hall Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facultyBookings.map((booking: Booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.hallName}</TableCell>
                    <TableCell>{format(booking.date, 'PPP')}</TableCell>
                    <TableCell>{booking.startTime} - {booking.endTime}</TableCell>
                    <TableCell>{booking.purpose}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.status === 'Approved' ? 'default' :
                          booking.status === 'Pending' ? 'secondary' :
                          booking.status === 'Rejected' ? 'destructive' :
                          'outline'
                        }
                        className={
                          booking.status === 'Approved' ? 'bg-green-600 hover:bg-green-700 text-white' :
                          booking.status === 'Pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
                          booking.status === 'Rejected' ? 'bg-red-600 hover:bg-red-700 text-white' : ''
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Cancel Booking</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">You have no bookings yet.</p>
              <p className="text-sm text-muted-foreground">Browse available halls and make a booking to see it here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
