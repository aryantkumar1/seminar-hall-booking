
"use client";

import { PageTitle } from '@/components/shared/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, XCircle, CalendarCheck2 } from 'lucide-react';
import { useBookings, type Booking } from '@/context/BookingContext';
import { useMemo } from 'react';
import { format } from 'date-fns';

export default function BookingRequestsPage() {
  const { bookings, updateBookingStatus } = useBookings();

  const pendingBookingRequests = useMemo(() => {
    return bookings.filter(b => b.status === 'Pending').sort((a,b) => a.date.getTime() - b.date.getTime());
  }, [bookings]);

  const handleApproveBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'Approved');
  };

  const handleRejectBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'Rejected');
  };

  return (
    <div>
      <PageTitle>Booking Requests</PageTitle>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CalendarCheck2 className="text-accent"/>
            Pending Approvals
          </CardTitle>
          <CardDescription>Approve or reject seminar hall booking requests from faculty.</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingBookingRequests.length > 0 ? (
            <div className="max-h-[600px] overflow-y-auto"> {/* Consider if max-h is needed or adjust based on page layout */}
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Faculty & Hall Details</TableHead><TableHead>Date & Time</TableHead><TableHead>Purpose</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {pendingBookingRequests.map((req: Booking) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="font-medium">{req.facultyName}</div>
                        <div className="text-xs text-muted-foreground">Wants to book: {req.hallName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{format(req.date, 'PP')}</div>
                        <div className="text-xs text-muted-foreground">{req.startTime} - {req.endTime}</div>
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{req.purpose}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-100" onClick={() => handleApproveBooking(req.id)}>
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="sr-only">Approve</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => handleRejectBooking(req.id)}>
                          <XCircle className="h-5 w-5" />
                           <span className="sr-only">Reject</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No pending booking requests.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
