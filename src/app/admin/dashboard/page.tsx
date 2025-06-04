
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { PageTitle } from '@/components/shared/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit3, Trash2, CheckCircle2, XCircle, Settings2, CalendarCheck2, Users } from 'lucide-react';
import { useHalls } from '@/context/HallContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useBookings, type Booking } from '@/context/BookingContext'; // Import useBookings
import { useMemo } from 'react';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const { halls, deleteHall } = useHalls();
  const { bookings, updateBookingStatus } = useBookings(); // Use bookings from context
  const { toast } = useToast();

  const pendingBookingRequests = useMemo(() => {
    return bookings.filter(b => b.status === 'Pending').sort((a,b) => a.date.getTime() - b.date.getTime());
  }, [bookings]);

  const handleDeleteHall = (hallId: string, hallName: string) => {
    deleteHall(hallId);
    toast({
      title: "Hall Deleted",
      description: `${hallName} has been successfully deleted.`,
      variant: "destructive",
    });
  };

  const handleApproveBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'Approved');
  };

  const handleRejectBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'Rejected');
  };

  return (
    <div>
      <PageTitle>Admin Dashboard</PageTitle>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Settings2 className="text-primary"/>Manage Halls</CardTitle>
              <CardDescription>Create, view, edit, or delete seminar halls.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/halls/create" passHref>
                <Button className="w-full mb-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Hall
                </Button>
              </Link>
              {halls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {halls.map((hall) => (
                    <Card key={hall.id} className="shadow-md flex flex-col">
                      <div className="relative w-full h-40">
                        <Image
                          src={hall.imageUrl || 'https://placehold.co/600x400.png'}
                          alt={hall.name}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-t-lg"
                          data-ai-hint={hall.imageHint}
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-headline">{hall.name}</CardTitle>
                        <CardDescription className="flex items-center text-sm">
                          <Users className="w-4 h-4 mr-1 text-muted-foreground" /> Capacity: {hall.capacity}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow pb-2">
                        {/* Future: Show number of upcoming approved bookings for this hall */}
                      </CardContent>
                      <CardFooter className="flex justify-end space-x-2 pt-2 pb-4 px-4">
                        <Link href={`/admin/halls/${hall.id}/edit`} passHref>
                          <Button variant="outline" size="sm" className="hover:text-primary hover:border-primary">
                            <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="hover:text-destructive hover:border-destructive">
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the hall "{hall.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteHall(hall.id, hall.name)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No halls available. Create one to get started!</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg h-full">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><CalendarCheck2 className="text-accent"/>Booking Requests</CardTitle>
            <CardDescription>Approve or reject pending booking requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingBookingRequests.length > 0 ? (
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Details</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingBookingRequests.map((req: Booking) => (
                      <TableRow key={req.id}><TableCell>
                          <div className="font-medium">{req.hallName}</div>
                          <div className="text-xs text-muted-foreground">By: {req.facultyName}</div>
                          <div className="text-xs text-muted-foreground">On: {format(req.date, 'PP')} ({req.startTime} - {req.endTime})</div>
                           <div className="text-xs text-muted-foreground mt-1">Purpose: {req.purpose}</div>
                        </TableCell><TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-100" onClick={() => handleApproveBooking(req.id)}>
                            <CheckCircle2 className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-100" onClick={() => handleRejectBooking(req.id)}>
                            <XCircle className="h-5 w-5" />
                          </Button>
                        </TableCell></TableRow>
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
    </div>
  );
}
