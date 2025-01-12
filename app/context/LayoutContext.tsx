"use client";

import React, { createContext, useContext, useState } from 'react';

interface LayoutContextType {
  isPullDownOpen: boolean;
  setIsPullDownOpen: (value: boolean) => void;
  isBottomSheetOpen: boolean;
  setIsBottomSheetOpen: (value: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPullDownOpen, setIsPullDownOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <LayoutContext.Provider
      value={{
        isPullDownOpen,
        setIsPullDownOpen,
        isBottomSheetOpen,
        setIsBottomSheetOpen,
        isExpanded,
        setIsExpanded,
        isMobileOpen,
        setIsMobileOpen
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
