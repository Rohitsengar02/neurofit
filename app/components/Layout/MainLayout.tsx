'use client';

import React, { useEffect, useState } from 'react';
import MobileBottomMenu from '../Navigation/MobileBottomMenu';
import Navbar from '../Navigation/Navbar';
import Sidebar from '../Navigation/Sidebar';
import { LayoutProvider, useLayout } from '@/app/context/LayoutContext';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '@/app/utils/firebase';

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { 
    isExpanded, 
    setIsExpanded, 
    isMobileOpen, 
    setIsMobileOpen 
  } = useLayout();

  const [isOnboarding, setIsOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const db = getFirestore();
        const userDataRef = doc(db, 'userdata', user.uid);
        try {
          const userDataSnap = await getDoc(userDataRef);
          if (userDataSnap.exists()) {
            const userData = userDataSnap.data();
            setIsOnboarding(!userData.onboardingCompleted);
          } else {
            setIsOnboarding(true);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setIsOnboarding(true);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Don't show navigation during onboarding or on the auth page
  const showNavigation = !isOnboarding && pathname !== '/';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {showNavigation && (
        <>
          <Navbar setIsMobileOpen={setIsMobileOpen} />
          <Sidebar 
            isExpanded={isExpanded} 
            setIsExpanded={setIsExpanded}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />
        </>
      )}
      
      <main 
        className={`transition-all duration-300 ${
          showNavigation ? 'pt-16 pb-20 md:pb-6' : ''
        } ${
          showNavigation && isExpanded ? 'md:ml-64' : 
          showNavigation ? 'md:ml-20' : ''
        }`}
      >
        {children}
      </main>

      {showNavigation && (
        <div className="md:hidden">
          <MobileBottomMenu />
        </div>
      )}
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
