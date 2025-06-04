
"use client"; // Required because useHalls is a hook

import { PageTitle } from '@/components/shared/PageTitle';
import { HallCard } from '@/components/shared/HallCard';
import { useHalls } from '@/context/HallContext'; // Import useHalls

export default function HallsPage() {
  const { halls } = useHalls(); // Use halls from context

  return (
    <div>
      <PageTitle>Available Seminar Halls</PageTitle>
      {halls.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls.map((hall) => (
            <HallCard key={hall.id} hall={hall} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-4">No seminar halls are currently configured. Please check back later or contact an administrator.</p>
      )}
    </div>
  );
}
