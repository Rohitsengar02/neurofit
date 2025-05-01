'use client';

import React from 'react';
import { CommunityProvider } from '../features/community/context/CommunityContext';

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CommunityProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </div>
    </CommunityProvider>
  );
}
