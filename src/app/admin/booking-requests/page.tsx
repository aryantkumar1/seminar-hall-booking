
"use client";

import { PageTitle } from '@/components/shared/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, XCircle, CalendarCheck2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useBookings, type Booking } from '@/context/BookingContext';
import { useMemo } from 'react';
import { format } from 'date-fns';

export default function BookingRequestsPage() {
  const { bookings, loading, updateBookingStatus, deleteBooking } = useBookings();

  const allBookingRequests = useMemo(() => {
    return bookings.sort((a,b) => {
      // Sort by status (Pending first, then by date)
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return b.date.getTime() - a.date.getTime(); // Most recent first
    });
  }, [bookings]);

  const handleApproveBooking = async (bookingId: string) => {
    console.log('🟢 Attempting to approve booking:', bookingId);
    try {
      const success = await updateBookingStatus(bookingId, 'Approved');
      console.log('🟢 Approval result:', success);

      if (!success) {
        console.error('❌ Failed to approve booking');
        alert('Failed to approve booking. Please try again.');
      }
      // No page reload needed - state is updated automatically by BookingContext
    } catch (error) {
      console.error('❌ Error approving booking:', error);
      alert('Error approving booking. Please check your connection.');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    console.log('🔴 Attempting to reject booking:', bookingId);
    try {
      const success = await updateBookingStatus(bookingId, 'Rejected');
      console.log('🔴 Rejection result:', success);

      if (!success) {
        console.error('❌ Failed to reject booking');
        alert('Failed to reject booking. Please try again.');
      }
      // No page reload needed - state is updated automatically by BookingContext
    } catch (error) {
      console.error('❌ Error rejecting booking:', error);
      alert('Error rejecting booking. Please check your connection.');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    console.log('🗑️ Attempting to cancel booking:', bookingId);
    try {
      const success = await deleteBooking(bookingId);
      console.log('🗑️ Cancellation result:', success);

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
        <PageTitle>Booking Requests</PageTitle>
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <p>Loading booking requests...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageTitle>Booking Requests</PageTitle>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CalendarCheck2 className="text-accent"/>
            All Booking Requests
          </CardTitle>
          <CardDescription>View and manage all seminar hall booking requests from faculty.</CardDescription>
        </CardHeader>
        <CardContent>
          {allBookingRequests.length > 0 ? (
            <div className="max-h-[600px] overflow-y-auto"> {/* Consider if max-h is needed or adjust based on page layout */}
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Faculty & Hall Details</TableHead><TableHead>Date & Time</TableHead><TableHead>Purpose</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {allBookingRequests.map((req: Booking) => (
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
                      <TableCell>
                        <Badge
                          variant={
                            req.status === 'Approved' ? 'default' :
                            req.status === 'Pending' ? 'secondary' :
                            req.status === 'Rejected' ? 'destructive' :
                            'outline'
                          }
                          className={
                            req.status === 'Approved' ? 'bg-green-600 hover:bg-green-700 text-white' :
                            req.status === 'Pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
                            req.status === 'Rejected' ? 'bg-red-600 hover:bg-red-700 text-white' : ''
                          }
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {req.status === 'Pending' ? (
                          <>
                            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-100" onClick={() => handleApproveBooking(req.id)}>
                              <CheckCircle2 className="h-5 w-5" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => handleRejectBooking(req.id)}>
                              <XCircle className="h-5 w-5" />
                               <span className="sr-only">Reject</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-700 hover:bg-gray-100" onClick={() => handleCancelBooking(req.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Cancel</span>
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-muted-foreground mr-2">
                              {req.status === 'Approved' ? 'Approved' : 'Rejected'}
                            </span>
                            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-700 hover:bg-gray-100" onClick={() => handleCancelBooking(req.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Cancel</span>
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No booking requests found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
