'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaLock, FaCheck, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaDumbbell, FaCalendarCheck, FaTrophy } from 'react-icons/fa';
import { format, addDays, isSunday } from 'date-fns';
import CurrentDayWorkout from './CurrentDayWorkout';
import { Workout, ActiveWorkout } from '@/app/types/workout';

interface ChallengeDay {
  day: number;
  completed: boolean;
  locked: boolean;
  isSunday: boolean;
}

interface ChallengeMonth {
  month: number;
  year: number;
  days: ChallengeDay[];
}

interface ChallengeTrackerProps {
  challengeName?: string;
  challengeDuration: number;
  startDate: Date;
  backgroundImage?: string;
  onDayClick?: (day: number) => void;
  completedDays: number[];
  userId?: string;
  category?: string;
  workout: Workout;
  activeWorkout?: ActiveWorkout;
}

export default function ChallengeTracker({
  challengeName,
  challengeDuration,
  startDate = new Date(),
  backgroundImage,
  onDayClick,
  completedDays = [],
  userId = '',
  category,
  workout,
  activeWorkout
}: ChallengeTrackerProps) {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Calculate progress percentage
  const progressPercentage = Math.round((completedDays.length / (workout.days || challengeDuration)) * 100);
  
  // Calculate days left (excluding rest days)
  const daysLeft = (workout.days || challengeDuration) - completedDays.length;

  // Use workout properties if challenge-specific props are not provided
  const effectiveChallengeName = challengeName || workout.title || '';
  const effectiveCategory = activeWorkout?.categoryId || category || workout.categoryId || '';
  const effectiveBackgroundImage = backgroundImage || workout.imageUrl || '';
  const effectiveUserId = userId || '';
  const effectiveDuration = workout.days || challengeDuration;

  // Generate months and days data
  const months = useMemo(() => {
    const result: ChallengeMonth[] = [];
    let currentDay = 1;
    let currentDate = startDate;
    
    while (currentDay <= effectiveDuration) {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysLeftInChallenge = effectiveDuration - currentDay + 1;
      const daysToAdd = Math.min(daysInMonth, daysLeftInChallenge);

      const days: ChallengeDay[] = Array.from({ length: daysToAdd }, (_, i) => ({
        day: currentDay + i,
        completed: completedDays.includes(currentDay + i),
        locked: currentDay + i > 1 && !completedDays.includes(currentDay + i - 1),
        isSunday: isSunday(addDays(startDate, currentDay + i - 1))
      }));

      result.push({
        month,
        year,
        days
      });

      currentDay += daysToAdd;
      currentDate = addDays(currentDate, daysToAdd);
    }

    return result;
  }, [effectiveDuration, startDate, completedDays]);

  // Ensure we have months data before rendering
  if (!months.length) {
    console.log('No months data available');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading challenge data...</p>
        </div>
      </div>
    );
  }

  const getMonthName = (month: number) => {
    return new Date(0, month).toLocaleString('default', { month: 'long' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {selectedDay ? (
        <CurrentDayWorkout 
          dayNumber={selectedDay} 
          userId={effectiveUserId} 
          category={effectiveCategory} 
        />
      ) : (
        <div className="p-6 space-y-6">
          {/* Challenge Header with Parallax Effect */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative h-[40vh] md:h-[30vh] bg-cover bg-center transform-gpu"
            style={{ backgroundImage: `url(${effectiveBackgroundImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-gray-900" />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative h-full container mx-auto px-4 md:px-6 py-4 md:py-8 flex flex-col justify-between"
            >
              {/* Top Section */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                <div>
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <FaCalendarAlt className="text-blue-400" />
                    <span className="text-sm md:text-base">Started {format(startDate, 'MMM d, yyyy')}</span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{effectiveChallengeName}</h1>
                </div>
                
                {/* Icons Section - Scrollable on mobile */}
                <div className="flex items-center gap-3 md:gap-4 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
                  <div className="text-center flex-shrink-0">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 md:p-3">
                      <FaDumbbell className="text-purple-400 text-xl md:text-2xl" />
                    </div>
                    <span className="text-xs md:text-sm text-gray-300 mt-1 block">Workout</span>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 md:p-3">
                      <FaCalendarCheck className="text-green-400 text-xl md:text-2xl" />
                    </div>
                    <span className="text-xs md:text-sm text-gray-300 mt-1 block">{effectiveDuration} Days</span>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 md:p-3">
                      <FaTrophy className="text-yellow-400 text-xl md:text-2xl" />
                    </div>
                    <span className="text-xs md:text-sm text-gray-300 mt-1 block">Challenge</span>
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                <div className="flex items-center gap-4 md:gap-6">
                  {/* Progress Section */}
                  <div className="flex-1 md:flex-none">
                    <div className="text-xs md:text-sm text-gray-400 mb-1">Progress</div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 md:h-2 w-24 md:w-32 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          className="h-full bg-blue-500 rounded-full"
                        />
                      </div>
                      <span className="text-sm md:text-base text-white font-medium">{progressPercentage}%</span>
                    </div>
                  </div>
                  
                  {/* Days Left Section */}
                  <div className="flex-1 md:flex-none">
                    <div className="text-xs md:text-sm text-gray-400 mb-1">Days Left</div>
                    <div className="text-sm md:text-base text-white font-medium">{daysLeft} Days</div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <div className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-green-500/20 text-green-400 text-xs md:text-sm">
                    {progressPercentage === 100 ? 'Completed' : 'Active'}
                  </div>
                  <div className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs md:text-sm">
                    {`${completedDays.length}/${effectiveDuration} Days`}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Add custom styles for hiding scrollbar */}
          <style jsx global>{`
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Month Navigation */}
          <div className="max-w-7xl mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4"
            >
              
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between my-6"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentMonthIndex(i => Math.max(0, i - 1))}
                disabled={currentMonthIndex === 0}
                className="p-3 text-gray-600 dark:text-gray-300 disabled:opacity-50 bg-white dark:bg-gray-800 rounded-full shadow-lg disabled:shadow-none transition-all"
              >
                <FaChevronLeft size={20} />
              </motion.button>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                {getMonthName(months[currentMonthIndex].month)} {months[currentMonthIndex].year}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentMonthIndex(i => Math.min(months.length - 1, i + 1))}
                disabled={currentMonthIndex === months.length - 1}
                className="p-3 text-gray-600 dark:text-gray-300 disabled:opacity-50 bg-white dark:bg-gray-800 rounded-full shadow-lg disabled:shadow-none transition-all"
              >
                <FaChevronRight size={20} />
              </motion.button>
            </motion.div>

            {/* Days Grid with Stagger Animation */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8"
            >
              {months[currentMonthIndex].days.map((day) => (
                <motion.div
                  key={day.day}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <button
                    onClick={() => {
                      if (!day.locked) {
                        setSelectedDay(day.day);
                        onDayClick?.(day.day);
                      }
                    }}
                    disabled={day.locked || day.isSunday}
                    className="w-full p-4 flex items-center justify-between group relative overflow-hidden"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold text-gray-800 dark:text-white">
                        Day {day.day}
                      </span>
                      {day.completed && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-500"
                        >
                          <FaCheck size={20} />
                        </motion.span>
                      )}
                      {day.isSunday && (
                        <span className="text-purple-400 font-medium">
                          Rest Day
                        </span>
                      )}
                    </div>
                    {day.locked ? (
                      <span className="text-gray-400 dark:text-gray-500">
                        <FaLock size={16} />
                      </span>
                    ) : day.isSunday ? (
                      <span className="text-purple-400 font-medium">
                        Rest Day
                      </span>
                    ) : (
                      <motion.span 
                        whileHover={{ x: 5 }}
                        className="text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center space-x-2"
                      >
                        <span>Start Workout</span>
                        <FaChevronRight size={14} />
                      </motion.span>
                    )}
                    {!day.locked && !day.isSunday && (
                      <motion.div
                        initial={false}
                        whileHover={{ opacity: 0.05 }}
                        className="absolute inset-0 bg-blue-500 opacity-0 transition-opacity"
                      />
                    )}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
