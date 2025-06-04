
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

// Mock data for booking requests (can be moved to context if needed later)
const mockBookingRequests = [
  { id: 'b1', hallName: 'Grand Auditorium', facultyName: 'Dr. Smith', date: '2024-09-15', startTime: '09:00', endTime: '11:00', status: 'pending' },
  { id: 'b2', hallName: 'Innovation Hub', facultyName: 'Prof. Jones', date: '2024-09-16', startTime: '14:00', endTime: '16:00', status: 'pending' },
];

export default function AdminDashboardPage() {
  const { halls, deleteHall } = useHalls();
  const { toast } = useToast();

  const handleDeleteHall = (hallId: string, hallName: string) => {
    deleteHall(hallId);
    toast({
      title: "Hall Deleted",
      description: `${hallName} has been successfully deleted.`,
      variant: "destructive",
    });
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
                        {/* Removed bookings count as it's not in the core Hall type */}
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
            {mockBookingRequests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hall</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBookingRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.hallName}</TableCell>
                      <TableCell>{req.facultyName}</TableCell>
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
