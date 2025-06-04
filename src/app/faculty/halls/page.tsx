import { PageTitle } from '@/components/shared/PageTitle';
import { HallCard, type Hall } from '@/components/shared/HallCard';

// Mock data for seminar halls
const mockHalls: Hall[] = [
  {
    id: '1',
    name: 'Grand Auditorium',
    capacity: 200,
    equipment: ['Projector', 'Sound System', 'Whiteboard'],
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'auditorium interior'
  },
  {
    id: '2',
    name: 'Innovation Hub',
    capacity: 50,
    equipment: ['Projector', 'Whiteboard'],
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'modern meeting room'
  },
  {
    id: '3',
    name: 'Lecture Hall A',
    capacity: 100,
    equipment: ['Projector'],
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'lecture hall seats'
  },
   {
    id: '4',
    name: 'Conference Room B',
    capacity: 25,
    equipment: ['Whiteboard', 'Sound System'],
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'conference room table'
  },
];

export default function HallsPage() {
  return (
    <div>
      <PageTitle>Available Seminar Halls</PageTitle>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockHalls.map((hall) => (
          <HallCard key={hall.id} hall={hall} />
        ))}
      </div>
    </div>
  );
}
