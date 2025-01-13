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
            name: data.name || 'User',
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
              name: data.name || 'User',
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
    <div className="h-16 bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-between px-4 fixed right-0 left-0 md:left-[72px] top-0 z-40 transition-all duration-300 border-b border-gray-100 dark:border-zinc-800">
      {/* Mobile Menu Button and Logo */}
      <div className="flex items-center flex-1">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg mr-2"
        >
          <FaBars className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <div className="md:hidden flex items-center">
          <FaDumbbell className="w-8 h-8 text-[#a20bdb]" />
          <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">NeuroFit</span>
        </div>
        
        {/* Search Bar (Hidden on Mobile) */}
        <div className="hidden md:block w-full max-w-xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full h-9 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-zinc-800 border-0 text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#a20bdb] transition-all duration-300"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Right Side Items */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications (Hidden on Mobile) */}
        <div className="relative hidden md:block">
          <motion.button
            className="relative w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </motion.button>
        </div>

        {/* User Profile */}
        <div className="relative flex items-center space-x-3">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{userData.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Member</span>
          </div>
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 overflow-hidden bg-gray-100 dark:bg-gray-800"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src={userData.photoURL || '/default-avatar.png'}
              alt="Profile"
              width={36}
              height={36}
              className="rounded-lg object-cover w-full h-full"
              priority
            />
          </motion.button>

          {/* User Menu Dropdown */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute right-0 top-12 w-56 bg-white dark:bg-zinc-900 rounded-lg shadow-lg py-1 z-50 border border-gray-100 dark:border-zinc-800"
              >
                <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{userData.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{userData.email}</p>
                </div>
                <motion.button
                  onClick={() => router.push('/profile')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200 flex items-center group"
                  whileHover={{ x: 2 }}
                >
                  Profile Settings
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200 flex items-center group"
                  whileHover={{ x: 2 }}
                >
                  <FaSignOutAlt className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:text-[#a20bdb]" />
                  Logout
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
