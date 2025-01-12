"use client";

import React, { createContext, useContext, useState } from 'react';

interface LayoutContextType {
  isPullDownOpen: boolean;
  togglePullDown: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPullDownOpen, setIsPullDownOpen] = useState(false);

  const togglePullDown = () => {
    setIsPullDownOpen(!isPullDownOpen);
  };

  return (
    <LayoutContext.Provider value={{ isPullDownOpen, togglePullDown }}>
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
