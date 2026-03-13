'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUserMd,
  FaCalendarCheck,
  FaThLarge,
  FaPlus,
  FaCommentDots,
  FaChartPie
} from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { checkIfUserIsDoctor } from '@/app/services/medicalService';

export default function FloatingMedicalMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    async function checkStatus() {
      if (user) {
        const status = await checkIfUserIsDoctor(user.uid);
        setIsDoctor(status);
      }
    }
    checkStatus();
  }, [user]);

  // Base items for all users
  const menuItems = [
    {
      id: 'appointments',
      label: 'My Appointments',
      icon: FaCalendarCheck,
      href: '/pages/appointments',
      color: 'bg-indigo-500'
    },
    {
      id: 'chats',
      label: 'My Chats',
      icon: FaCommentDots,
      href: '/pages/chats',
      color: 'bg-pink-500'
    },
    {
      id: 'categories',
      label: 'Specialties',
      icon: FaThLarge,
      href: '/pages/doctors/category',
      color: 'bg-blue-500'
    }
  ];

  // Add "Join as Doctor" if NOT a doctor
  if (!isDoctor) {
    menuItems.push({
      id: 'apply',
      label: 'Join as Doctor',
      icon: FaUserMd,
      href: '/pages/doctors/apply',
      color: 'bg-teal-500'
    });
  } else {
    // Add "Go to Dashboard" if a doctor
    menuItems.push({
      id: 'dashboard',
      label: 'Doctor Dashboard',
      icon: FaChartPie,
      href: '/pages/doctor-panel',
      color: 'bg-violet-600'
    });
  }

  // Only show on doctor related pages or panel
  if (!pathname.includes('/pages/doctors') && !pathname.includes('/pages/doctor-panel') && !pathname.includes('/pages/appointments') && !pathname.includes('/pages/chats')) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 z-[60] md:bottom-10 md:right-10">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col-reverse items-end gap-4 mb-4">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={item.href} onClick={() => setIsOpen(false)}>
                  <div className="flex items-center gap-3 group">
                    <span className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-xl shadow-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.label}
                    </span>
                    <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform active:scale-95`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-indigo-600 text-white'
        } w-14 h-14 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/20 transition-colors z-50 overflow-hidden relative`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <FaPlus className="w-6 h-6" />
        </motion.div>

        {/* Subtle pulse animation when closed */}
        {!isOpen && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-white/20 rounded-full"
          />
        )}
      </motion.button>
    </div>
  );
}
