'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaClock } from 'react-icons/fa';
import StepLayout from './StepLayout';

interface WorkoutDurationProps {
  onNext: (duration: number) => void;
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
}

const durations = [
  {
    value: 15,
    label: '15 minutes',
    description: 'Quick and effective',
    color: 'bg-green-600'
  },
  {
    value: 30,
    label: '30 minutes',
    description: 'Balanced workout',
    color: 'bg-blue-600'
  },
  {
    value: 45,
    label: '45 minutes',
    description: 'Comprehensive session',
    color: 'bg-purple-600'
  },
  {
    value: 60,
    label: '60 minutes',
    description: 'Complete workout',
    color: 'bg-orange-600'
  },
  {
    value: 90,
    label: '90 minutes',
    description: 'Extended training',
    color: 'bg-red-600'
  }
];

export default function WorkoutDuration({
  onNext,
  currentStep,
  totalSteps,
  onPrevious
}: WorkoutDurationProps) {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const handleNext = () => {
    if (selectedDuration !== null) {
      onNext(selectedDuration);
    }
  };

  return (
    <StepLayout
      title="How long do you want to workout?"
      subtitle="Choose your preferred workout duration"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={selectedDuration ? handleNext : undefined}
      onPrevious={onPrevious}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {durations.map((duration, index) => {
            const isSelected = selectedDuration === duration.value;
            
            return (
              <motion.button
                key={duration.value}
                onClick={() => setSelectedDuration(duration.value)}
                className={`
                  w-full p-6 rounded-2xl text-left transition-all duration-300
                  ${isSelected 
                    ? `${duration.color} ring-2 ring-white` 
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
                    isSelected ? 'bg-white/20' : duration.color
                  }`}>
                    <FaClock className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {duration.label}
                    </h3>
                    <p className="text-gray-300">
                      {duration.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </StepLayout>
  );
}
