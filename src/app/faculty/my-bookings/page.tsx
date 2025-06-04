
"use client";

import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useBookings, type Booking } from '@/context/BookingContext';
import { useMemo } from 'react';

// Mock current faculty ID - in a real app, this would come from auth
const MOCK_CURRENT_FACULTY_ID = "faculty007";

export default function MyBookingsPage() {
  const { bookings } = useBookings();

  const facultyBookings = useMemo(() => {
    // For now, let's assume we want to show bookings for the MOCK_CURRENT_FACULTY_ID
    // or show all if we don't have a specific user context yet.
    // To see bookings made by the form, we filter by MOCK_CURRENT_FACULTY_ID.
    // To see all initial bookings, you can remove the filter.
    return bookings.filter(b => b.facultyId === MOCK_CURRENT_FACULTY_ID).sort((a,b) => b.date.getTime() - a.date.getTime());
  }, [bookings]);

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
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facultyBookings.map((booking: Booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.hallName}</TableCell>
                    <TableCell>{format(booking.date, 'PPP')}</TableCell>
                    <TableCell>{booking.startTime} - {booking.endTime}</TableCell>
                    <TableCell>{booking.purpose}</TableCell>
                    <TableCell className="text-right">
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
