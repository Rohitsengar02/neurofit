"use client";

import React from 'react';
import { LayoutProvider } from '@/app/context/LayoutContext';
import MobileBottomMenu from '@/app/components/Navigation/MobileBottomMenu';
import PullDownCalendar from '@/app/components/PullToRefresh/PullDownCalendar';

const LayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Pull Down Calendar */}
      <PullDownCalendar />

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Mobile Bottom Menu */}
      <MobileBottomMenu />
    </div>
  );
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LayoutProvider>
      <LayoutContent>{children}</LayoutContent>
    </LayoutProvider>
  );
};

export default MainLayout;
