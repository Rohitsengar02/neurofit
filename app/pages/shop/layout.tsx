'use client';

import React from 'react';
import SearchBar from './components/SearchBar';
import MobileBottomMenu from '@/app/components/Navigation/MobileBottomMenu';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SearchBar />
      <main>{children}</main>
      <MobileBottomMenu />
    </div>
  );
}
