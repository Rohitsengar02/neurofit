'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDumbbell, FaCalendarAlt, FaCheck } from 'react-icons/fa';
import { BsFillSunFill, BsFillMoonFill } from 'react-icons/bs';
import StepLayout from './StepLayout';

interface WeeklyScheduleProps {
  onNext: (schedule: { days: string[]; sessionsPerWeek: number }) => void;
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
}

const weekDays = [
  {
    id: 'monday',
    label: 'Monday',
    color: 'bg-blue-600',
    icon: BsFillSunFill
  },
  {
    id: 'tuesday',
    label: 'Tuesday',
    color: 'bg-purple-600',
    icon: BsFillSunFill
  },
  {
    id: 'wednesday',
    label: 'Wednesday',
    color: 'bg-green-600',
    icon: BsFillSunFill
  },
  {
    id: 'thursday',
    label: 'Thursday',
    color: 'bg-orange-600',
    icon: BsFillSunFill
  },
  {
    id: 'friday',
    label: 'Friday',
    color: 'bg-red-600',
    icon: BsFillSunFill
  },
  {
    id: 'saturday',
    label: 'Saturday',
    color: 'bg-indigo-600',
    icon: BsFillMoonFill
  },
  {
    id: 'sunday',
    label: 'Sunday',
    color: 'bg-pink-600',
    icon: BsFillMoonFill
  }
];

const recommendedSessions = [
  {
    count: 2,
    label: '2 days',
    description: 'Great for beginners',
    color: 'bg-green-600'
  },
  {
    count: 3,
    label: '3 days',
    description: 'Most popular choice',
    color: 'bg-blue-600'
  },
  {
    count: 4,
    label: '4 days',
    description: 'Intermediate level',
    color: 'bg-purple-600'
  },
  {
    count: 5,
    label: '5 days',
    description: 'Advanced training',
    color: 'bg-orange-600'
  },
  {
    count: 6,
    label: '6 days',
    description: 'Professional level',
    color: 'bg-red-600'
  }
];

export default function WeeklySchedule({
  onNext,
  currentStep,
  totalSteps,
  onPrevious
}: WeeklyScheduleProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedSessionCount, setSelectedSessionCount] = useState<number | null>(null);

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev => {
      const newSelection = prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId];
      
      // Update session count if needed
      if (newSelection.length > 0 && !selectedSessionCount) {
        setSelectedSessionCount(Math.min(newSelection.length, 3));
      }
      
      return newSelection;
    });
  };

  const handleNext = () => {
    if (selectedDays.length > 0 && selectedSessionCount) {
      onNext({
        days: selectedDays,
        sessionsPerWeek: selectedSessionCount
      });
    }
  };

  return (
    <StepLayout
      title="Select Your Training Days"
      subtitle="Choose which days you'll work out and how many sessions per week"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={selectedDays.length > 0 && selectedSessionCount ? handleNext : undefined}
      onPrevious={onPrevious}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-600 rounded-xl">
                <FaCalendarAlt className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Weekly Schedule</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {weekDays.map((day, index) => {
                const isSelected = selectedDays.includes(day.id);
                const Icon = day.icon;
                
                return (
                  <motion.button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={`
                      w-full p-4 rounded-xl text-left transition-all duration-300
                      ${isSelected 
                        ? `${day.color} ring-2 ring-white` 
                        : 'bg-gray-800 hover:bg-gray-700'
                      }
                    `}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-white/20' : day.color
                        }`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-white">
                          {day.label}
                        </span>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                        >
                          <FaCheck className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Sessions Per Week Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-600 rounded-xl">
                <FaDumbbell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Sessions per Week</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {recommendedSessions.map((session, index) => {
                const isSelected = selectedSessionCount === session.count;
                
                return (
                  <motion.button
                    key={session.count}
                    onClick={() => setSelectedSessionCount(session.count)}
                    className={`
                      w-full p-4 rounded-xl text-left transition-all duration-300
                      ${isSelected 
                        ? `${session.color} ring-2 ring-white` 
                        : 'bg-gray-800 hover:bg-gray-700'
                      }
                    `}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (index * 0.1) }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-white">
                          {session.label}
                        </h4>
                        <p className="text-sm text-gray-300">
                          {session.description}
                        </p>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                        >
                          <FaCheck className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </StepLayout>
  );
}
