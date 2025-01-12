"use client";

import React from 'react';
import MobileBottomMenu from '../Navigation/MobileBottomMenu';
import Navbar from '../Navigation/Navbar';
import Sidebar from '../Navigation/Sidebar';
import PullDownFitnessStats from '../PullToRefresh/PullDownCalendar';
import { LayoutProvider, useLayout } from '@/app/context/LayoutContext';

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { 
    isExpanded, 
    setIsExpanded, 
    isMobileOpen, 
    setIsMobileOpen,
    isPullDownOpen,
    setIsPullDownOpen 
  } = useLayout();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Sidebar 
        isExpanded={isExpanded} 
        setIsExpanded={setIsExpanded}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <Navbar setIsMobileOpen={setIsMobileOpen} />
      <main className={`transition-all duration-300 pt-16 pb-20 ${isExpanded ? 'md:ml-60' : 'md:ml-[72px]'}`}>
        {children}
      </main>
      <MobileBottomMenu />
      <PullDownFitnessStats />
    </div>
  );
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <LayoutProvider>
      <LayoutContent>{children}</LayoutContent>
    </LayoutProvider>
  );
};

export default MainLayout;
