'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar } from 'react-icons/fi';

const CalendarPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <FiCalendar className="text-2xl text-amber-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <p className="text-gray-600 dark:text-gray-300">
          Calendar page is under development. Coming soon!
        </p>
      </div>
    </motion.div>
  );
};

export default CalendarPage;
