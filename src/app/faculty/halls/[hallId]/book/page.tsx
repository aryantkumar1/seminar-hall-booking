
"use client";

import { PageTitle } from '@/components/shared/PageTitle';
import { BookingForm } from '@/components/shared/BookingForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useHalls } from '@/context/HallContext';
import { useEffect, useState } from 'react';
import type { Hall } from '@/components/shared/HallCard'; // Ensure Hall type is available

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function BookHallPage() {
  const params = useParams();
  const router = useRouter();

  // Try multiple ways to get the hallId
  const hallId = params.hallId as string || params['hallId'] as string;
  const { getHallById, halls, loading } = useHalls();
  const [hall, setHall] = useState<Hall | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('BookHallPage Debug Info:');
    console.log('- window.location.pathname:', typeof window !== 'undefined' ? window.location.pathname : 'N/A');
    console.log('- params:', params);
    console.log('- params keys:', Object.keys(params));
    console.log('- hallId:', hallId);
    console.log('- typeof hallId:', typeof hallId);
    console.log('- loading:', loading);
    console.log('- hallsCount:', halls.length);
    console.log('- halls:', halls.map(h => ({ id: h.id, name: h.name })));

    // Extract hallId from pathname if params doesn't work
    let extractedHallId = hallId;
    if (!extractedHallId && typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const hallIndex = pathParts.findIndex(part => part === 'halls');
      if (hallIndex !== -1 && pathParts[hallIndex + 1]) {
        extractedHallId = pathParts[hallIndex + 1];
        console.log('- Extracted hallId from pathname:', extractedHallId);
      }
    }

    if (!extractedHallId || extractedHallId === 'undefined') {
      console.error("No valid hallId provided, hallId:", extractedHallId);
      router.push('/faculty/halls');
      return;
    }

    // Wait for halls to load before trying to find the hall
    if (loading) {
      return; // Still loading halls
    }

    const foundHall = getHallById(extractedHallId);
    if (foundHall) {
      console.log('Hall found:', foundHall);
      setHall(foundHall);
    } else {
      console.error("Hall not found:", extractedHallId);
      console.log('Available halls:', halls.map(h => ({ id: h.id, name: h.name })));
      router.push('/faculty/halls');
    }
    setIsLoading(false);
  }, [hallId, getHallById, router, halls, loading]);

  if (isLoading || loading) {
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
