import { PageTitle } from '@/components/shared/PageTitle';
import { BookingForm } from '@/components/shared/BookingForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

// Mock data - in a real app, this would be fetched based on params.hallId
const mockHallDetails = {
  id: '1',
  name: 'Grand Auditorium',
  capacity: 200,
  equipment: ['Projector', 'Sound System', 'Whiteboard'],
  imageUrl: 'https://placehold.co/600x400.png',
  imageHint: 'auditorium interior',
  description: 'A large hall perfect for keynote speeches and major presentations. Fully equipped with modern AV technology.'
};

export default function BookHallPage({ params }: { params: { hallId: string } }) {
  // Fetch hall details based on params.hallId or use mock
  const hall = mockHallDetails; // In a real app: await fetchHallDetails(params.hallId);

  return (
    <div className="max-w-4xl mx-auto">
      <PageTitle>Book: {hall.name}</PageTitle>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">{hall.name}</CardTitle>
            <CardDescription>{hall.description}</CardDescription>
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
            <BookingForm hallName={hall.name} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
