import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Projector, Tv, Mic, CalendarPlus } from 'lucide-react';

export interface Hall {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  imageUrl: string;
  imageHint: string;
}

interface HallCardProps {
  hall: Hall;
}

const equipmentIcons: { [key: string]: React.ElementType } = {
  Projector: Projector,
  Whiteboard: Tv, // Using Tv as placeholder for Presentation/Whiteboard
  'Sound System': Mic,
};

export function HallCard({ hall }: HallCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative w-full h-48">
        <Image
          src={hall.imageUrl}
          alt={hall.name}
          layout="fill"
          objectFit="cover"
          data-ai-hint={hall.imageHint}
        />
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-xl">{hall.name}</CardTitle>
        <CardDescription className="flex items-center text-sm text-muted-foreground">
          <Users className="w-4 h-4 mr-2 text-primary" />
          Capacity: {hall.capacity}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <h4 className="font-semibold text-sm mb-2">Equipment:</h4>
        <div className="flex flex-wrap gap-2">
          {hall.equipment.map((item) => {
            const IconComponent = equipmentIcons[item] || Tv;
            return (
              <span key={item} className="flex items-center text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                <IconComponent className="w-3 h-3 mr-1" />
                {item}
              </span>
            );
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/faculty/halls/${hall.id}/book`} passHref className="w-full">
          <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <CalendarPlus className="mr-2 h-4 w-4" /> Book Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
