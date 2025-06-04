'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FacultyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to faculty login
    router.push('/faculty/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to faculty login...</p>
    </div>
  );
}
