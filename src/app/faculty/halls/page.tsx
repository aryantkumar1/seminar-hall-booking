
"use client"; // Required because useHalls is a hook

import { PageTitle } from '@/components/shared/PageTitle';
import { HallCard } from '@/components/shared/HallCard';
import { useHalls } from '@/context/HallContext'; // Import useHalls
import { useAuth } from '@/context/AuthContext';

export default function HallsPage() {
  const { halls } = useHalls(); // Use halls from context
  const { user } = useAuth();

  // Debug: Log user state changes
  console.log('🏛️ Faculty halls render - User:', user?.name || 'null');

  return (
    <div>
      <PageTitle>Available Seminar Halls</PageTitle>
      {halls.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls.map((hall, index) => (
            <HallCard key={`faculty-hall-${hall.id}-${index}`} hall={hall} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-4">No seminar halls are currently configured. Please check back later or contact an administrator.</p>
      )}
    </div>
  );
}
