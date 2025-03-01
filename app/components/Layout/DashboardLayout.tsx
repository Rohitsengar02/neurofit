"use client";

import React, { useState } from 'react';
import Sidebar from '../Navigation/Sidebar';
import Navbar from '../Navigation/Navbar';
import MobileBottomMenu from '../Navigation/MobileBottomMenu';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar setIsMobileOpen={setIsMobileOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
        <MobileBottomMenu />
      </div>
    </div>
  );
};

export default DashboardLayout;
