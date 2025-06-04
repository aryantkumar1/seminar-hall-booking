
"use client";

import { PageTitle } from '@/components/shared/PageTitle';
import { BookingForm } from '@/components/shared/BookingForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useHalls } from '@/context/HallContext';
import { useEffect, useState } from 'react';
import type { Hall } from '@/components/shared/HallCard'; // Ensure Hall type is available

export default function BookHallPage() {
  const params = useParams();
  const router = useRouter();
  const hallId = params.hallId as string;
  const { getHallById } = useHalls();
  const [hall, setHall] = useState<Hall | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (hallId) {
      const foundHall = getHallById(hallId);
      if (foundHall) {
        setHall(foundHall);
      } else {
        // Handle hall not found, e.g., redirect or show error
        console.error("Hall not found:", hallId);
        router.push('/faculty/halls'); // Redirect if hall not found
      }
      setIsLoading(false);
    }
  }, [hallId, getHallById, router]);

  if (isLoading) {
    return <PageTitle>Loading hall details...</PageTitle>;
  }

  if (!hall) {
    return <PageTitle>Hall not found</PageTitle>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageTitle>Book: {hall.name}</PageTitle>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">{hall.name}</CardTitle>
            {/* Hall description can be added to Hall type and context if needed */}
            <CardDescription>Review the hall details before proceeding with your booking.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-64 rounded-md overflow-hidden mb-4">
              <Image
                src={hall.imageUrl}
                alt={hall.name}
                layout="fill"
                objectFit="cover"
                data-ai-hint={hall.imageHint}
              />
            </div>
            <p><strong>Capacity:</strong> {hall.capacity}</p>
            <p><strong>Equipment:</strong> {hall.equipment.join(', ')}</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Booking Details</CardTitle>
            <CardDescription>Please fill in the form to request a booking for {hall.name}.</CardDescription>
          </CardHeader>
          <CardContent>
            <BookingForm hallId={hall.id} hallName={hall.name} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
