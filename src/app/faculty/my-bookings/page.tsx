
"use client";

import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Info } from 'lucide-react';
import { format } from 'date-fns';

// Mock data for faculty's bookings - in a real app, this would be fetched
const facultyBookings = [
  { id: 'fb1', hallName: 'Grand Auditorium', date: new Date(2024, 8, 20), startTime: '10:00', endTime: '12:00', purpose: 'Department Meeting', status: 'Approved' },
  { id: 'fb2', hallName: 'Innovation Hub', date: new Date(2024, 8, 25), startTime: '14:00', endTime: '15:30', purpose: 'Guest Lecture Series Prep', status: 'Pending' },
  { id: 'fb3', hallName: 'Lecture Hall A', date: new Date(2024, 9, 5), startTime: '09:00', endTime: '11:00', purpose: 'Student Workshop on AI', status: 'Approved' },
  { id: 'fb4', hallName: 'Grand Auditorium', date: new Date(2024, 9, 10), startTime: '13:00', endTime: '16:00', purpose: 'Annual Research Symposium', status: 'Rejected' },
  { id: 'fb5', hallName: 'Conference Room B', date: new Date(2024, 9, 15), startTime: '11:00', endTime: '12:30', purpose: 'PhD Candidacy Defense', status: 'Pending' },
];

export default function MyBookingsPage() {
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
                {facultyBookings.map((booking) => (
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
