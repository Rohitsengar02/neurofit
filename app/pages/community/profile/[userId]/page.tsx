'use client';

import { useParams } from 'next/navigation';
import { UserProfile } from '@/app/components/community/UserProfile';

export default function ProfilePage() {
  const { userId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UserProfile userId={userId as string} />
    </div>
  );
}
