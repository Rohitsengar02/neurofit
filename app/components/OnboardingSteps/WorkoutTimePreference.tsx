'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSun, FaMoon, FaClock } from 'react-icons/fa';
import StepLayout from './StepLayout';

interface WorkoutTimePreferenceProps {
  onNext: (data: {
    daysPerWeek: number;
    timePerWorkout: number;
    preferredTime: string;
  }) => Promise<void>;
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
}

const timePreferences = [
  {
    id: 'morning',
    title: 'Morning',
    description: '5 AM - 11 AM',
    icon: FaSun,
    color: 'bg-orange-600'
  },
  {
    id: 'afternoon',
    title: 'Afternoon',
    description: '11 AM - 4 PM',
    icon: FaClock,
    color: 'bg-blue-600'
  },
  {
    id: 'evening',
    title: 'Evening',
    description: '4 PM - 8 PM',
    icon: FaSun,
    color: 'bg-purple-600'
  },
  {
    id: 'night',
    title: 'Night',
    description: '8 PM - 12 AM',
    icon: FaMoon,
    color: 'bg-indigo-600'
  },
  {
    id: 'flexible',
    title: 'Flexible',
    description: 'Varies day to day',
    icon: FaClock,
    color: 'bg-green-600'
  }
];

export default function WorkoutTimePreference({
  onNext,
  currentStep,
  totalSteps,
  onPrevious
}: WorkoutTimePreferenceProps) {
  const [selectedTime, setSelectedTime] = useState<string>('');

  const handleNext = async () => {
    if (selectedTime) {
      await onNext({
        daysPerWeek: 0,
        timePerWorkout: 0,
        preferredTime: selectedTime
      });
    }
  };

  return (
    <StepLayout
      title="When do you prefer to work out?"
      subtitle="Choose your ideal workout time"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={selectedTime ? handleNext : undefined}
      onPrevious={onPrevious}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {timePreferences.map((time, index) => {
            const Icon = time.icon;
            const isSelected = selectedTime === time.id;
            
            return (
              <motion.button
                key={time.id}
                onClick={() => setSelectedTime(time.id)}
                className={`
                  w-full p-6 rounded-2xl text-left transition-all duration-300
                  ${isSelected 
                    ? `${time.color} ring-2 ring-white` 
                    : 'bg-gray-800 hover:bg-gray-700'
                  }
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    isSelected ? 'bg-white/20' : time.color
                  }`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {time.title}
                    </h3>
                    <p className="text-gray-300">
                      {time.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {selectedTime && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-6 bg-gray-800 rounded-2xl"
          >
            <h4 className="text-lg font-semibold mb-2">Selected Time:</h4>
            <p className="text-gray-300">
              {timePreferences.find(t => t.id === selectedTime)?.description}
            </p>
          </motion.div>
        )}
      </div>
    </StepLayout>
  );
}
