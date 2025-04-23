'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTrophy, FaCalendarAlt, FaFire } from 'react-icons/fa';
import { useTheme } from 'next-themes';

interface ChallengeTrackerProps {
  totalDays?: number;
  completedDays: number[];
  onDayClick?: (day: number) => void;
  startDate?: Date;
  intensity?: 'beginner' | 'intermediate' | 'advanced';
  // Additional props from challenge page
  challengeName?: string;
  challengeDuration?: number;
  backgroundImage?: string;
  userId?: string;
  category?: string;
  workout?: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    level: string;
    days: number;
    exercises?: any[];
    categoryId?: string;
  };
  workoutId?: string;
}

const ChallengeTracker: React.FC<ChallengeTrackerProps> = ({
  totalDays = 30,
  challengeDuration,
  completedDays,
  onDayClick,
  startDate = new Date(),
  intensity = 'intermediate',
  challengeName,
  backgroundImage,
  userId,
  category,
  workout,
  workoutId
}) => {
  // Use challengeDuration if provided, otherwise use totalDays
  const days = challengeDuration || totalDays;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Calculate dates for each day
  const getDayDate = (dayIndex: number) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayIndex);
    return date;
  };

  // Format date as "Mon, 15"
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
    });
  };

  // Check if a day is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Get intensity level
  const getIntensityLevel = () => {
    switch (intensity) {
      case 'beginner':
        return 1;
      case 'intermediate':
        return 2;
      case 'advanced':
        return 3;
      default:
        return 2;
    }
  };

  return (
    <div className="w-full">
      {/* Progress header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {challengeName || 'Challenge Progress'}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {completedDays.length} of {days} days completed
          </p>
        </div>
        <div className="flex items-center">
          <div className="mr-2 text-sm text-gray-500">Intensity:</div>
          <div className="flex">
            {[...Array(3)].map((_, i) => (
              <FaFire
                key={i}
                className={`${
                  i < getIntensityLevel()
                    ? 'text-orange-500'
                    : isDark
                    ? 'text-gray-700'
                    : 'text-gray-300'
                } ${i > 0 ? '-ml-1' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-6">
        <div
          className="h-full bg-blue-500 rounded-full"
          style={{
            width: `${(completedDays.length / days) * 100}%`,
          }}
        ></div>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
        {[...Array(days)].map((_, index) => {
          const dayNumber = index + 1;
          const isCompleted = completedDays.includes(dayNumber);
          const dayDate = getDayDate(index);
          const isCurrentDay = isToday(dayDate);
          
          return (
            <motion.div
              key={`day-${dayNumber}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => onDayClick && onDayClick(dayNumber)}
              className={`
                relative p-3 rounded-lg flex flex-col items-center justify-center
                ${onDayClick ? 'cursor-pointer' : 'cursor-default'}
                ${
                  isCompleted
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : isCurrentDay
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-500'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                }
              `}
            >
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {formatDate(dayDate)}
              </div>
              
              <div className="font-bold text-lg mb-1">
                {dayNumber}
              </div>
              
              {isCompleted ? (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <FaCheck className="text-white text-xs" />
                </div>
              ) : dayNumber === days ? (
                <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <FaTrophy className="text-yellow-500 text-xs" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <FaCalendarAlt className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-xs`} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ChallengeTracker;
