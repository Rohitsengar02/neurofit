'use client';

import React, { useEffect, useState } from 'react';
import { FaBars, FaSearch, FaBell, FaSignOutAlt, FaDumbbell } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import ThemeToggle from './ThemeToggle';
import Image from 'next/image';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface NavbarProps {
  setIsMobileOpen: (value: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setIsMobileOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<{
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    photoURL?: string;
  }>({});
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Set up real-time listener for user data
        const userDocRef = doc(db, 'users', user.uid);

        // Initial fetch
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'User',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: user.email || '',
            photoURL: data.photoURL,
          });
        }

        // Real-time updates
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setUserData(prev => ({
              ...prev,
              name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'User',
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              photoURL: data.photoURL,
            }));
          }
        }, (error) => {
          console.error('Error listening to user data:', error);
          toast.error('Failed to get latest profile updates');
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to home/login page
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="h-12 bg-white dark:bg-zinc-900 flex items-center justify-between px-6 fixed right-0 left-0 md:left-[72px] top-0 z-40 transition-all duration-300 border-b border-gray-100 dark:border-zinc-800">
      {/* Greeting and User Info */}
      <div className="flex flex-col">
        <span className="text-gray-400 text-sm font-medium">Hello,</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
          {userData.firstName || 'User'}!
        </h2>
      </div>

      {/* App Style Action Bar */}
      <div className="flex items-center gap-3">
        {/* Search Toggle */}
        <button className="w-9 h-9 flex items-center justify-center bg-gray-50 dark:bg-zinc-800 rounded-xl text-gray-400 hover:text-[#a20bdb] transition-all">
          <FaSearch className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center bg-gray-50 dark:bg-zinc-800 rounded-xl text-gray-400 hover:text-[#a20bdb] transition-all">
          <FaBell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
        </button>

        {/* Theme Toggle Integration */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {/* Avatar */}
        <div className="relative ml-2">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-700 shadow-sm"
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={userData.photoURL || 'https://img.freepik.com/premium-vector/person-with-blue-shirt-that-says-name-person_1029948-7040.jpg'}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </motion.button>

          {/* User Menu Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-xl py-2 z-50 border border-gray-100 dark:border-zinc-800 overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-gray-100 dark:border-zinc-800">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{userData.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{userData.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      router.push('/pages/profile');
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-2xl transition-all"
                  >
                    Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all flex items-center"
                  >
                    <FaSignOutAlt className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
