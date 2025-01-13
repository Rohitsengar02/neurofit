"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

type LayoutContextType = {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
  isPullDownOpen: boolean;
  setIsPullDownOpen: (value: boolean) => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPullDownOpen, setIsPullDownOpen] = useState(false);

  const handleSetPullDownOpen = useCallback((value: boolean) => {
    console.log('Setting isPullDownOpen to:', value);
    setIsPullDownOpen(value);
    // Prevent body scroll when pulldown is open
    if (value) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, []);

  return (
    <LayoutContext.Provider
      value={{
        isExpanded,
        setIsExpanded,
        isMobileOpen,
        setIsMobileOpen,
        isPullDownOpen,
        setIsPullDownOpen: handleSetPullDownOpen,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
