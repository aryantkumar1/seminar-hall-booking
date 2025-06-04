
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { PageTitle } from '@/components/shared/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2, Settings2, Users } from 'lucide-react';
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

      <div className="grid lg:grid-cols-1 gap-6 mb-8"> {/* Changed to lg:grid-cols-1 */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"> {/* Adjusted for potentially more halls */}
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
    </div>
  );
}
