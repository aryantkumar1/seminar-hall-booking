
import Link from 'next/link';
import { PageTitle } from '@/components/shared/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit3, Trash2, CheckCircle2, XCircle, Settings2, CalendarCheck2 } from 'lucide-react';

// Mock data
const mockHalls = [
  { id: '1', name: 'Grand Auditorium', capacity: 200, bookings: 5 },
  { id: '2', name: 'Innovation Hub', capacity: 50, bookings: 12 },
];

const mockBookingRequests = [
  { id: 'b1', hallName: 'Grand Auditorium', facultyName: 'Dr. Smith', date: '2024-09-15', startTime: '09:00', endTime: '11:00', status: 'pending' },
  { id: 'b2', hallName: 'Innovation Hub', facultyName: 'Prof. Jones', date: '2024-09-16', startTime: '14:00', endTime: '16:00', status: 'pending' },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <PageTitle>Admin Dashboard</PageTitle>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Settings2 className="text-primary"/>Manage Halls</CardTitle>
            <CardDescription>Create, view, edit, or delete seminar halls.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/halls/create" passHref>
              <Button className="w-full mb-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Hall
              </Button>
            </Link>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockHalls.map((hall) => (
                  <TableRow key={hall.id}>
                    <TableCell>{hall.name}</TableCell>
                    <TableCell>{hall.capacity}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/admin/halls/${hall.id}/edit`} passHref>
                        <Button variant="outline" size="icon" className="hover:text-primary">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon" className="hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><CalendarCheck2 className="text-accent"/>Booking Requests</CardTitle>
            <CardDescription>Approve or reject pending booking requests from faculty.</CardDescription>
          </CardHeader>
          <CardContent>
            {mockBookingRequests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hall</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBookingRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{req.hallName}</TableCell>
                      <TableCell>{req.facultyName}</TableCell>
                      <TableCell>{req.date} <br/> <span className="text-xs text-muted-foreground">{req.startTime} - {req.endTime}</span></TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-100">
                          <CheckCircle2 className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-100">
                          <XCircle className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">No pending booking requests.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
