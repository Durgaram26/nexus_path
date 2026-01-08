'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentAIRoadmapPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified roadmap page
    router.replace('/student/roadmap');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to roadmap...</p>
      </div>
    </div>
  );
}