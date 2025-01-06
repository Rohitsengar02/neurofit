'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function WeeklyProgress() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">This Week&apos;s Progress</h3>
        <select className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm">
          <option value="calories">Calories</option>
          <option value="time">Time</option>
          <option value="distance">Distance</option>
        </select>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-64 bg-gray-700 rounded-lg p-4"
      >
        <div className="flex justify-between h-full items-end">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="flex flex-col items-center">
              <div 
                className="w-8 bg-purple-600 rounded-t-lg"
                style={{ 
                  height: `${Math.random() * 100}%`,
                  minHeight: '20px'
                }}
              />
              <span className="mt-2 text-sm text-gray-400">{day}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
