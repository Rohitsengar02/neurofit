'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDumbbell, FaRunning, FaSwimmer, FaYinYang } from 'react-icons/fa';
import { GiBoxingGlove, GiWeightLiftingUp } from 'react-icons/gi';
import StepLayout from './StepLayout';

interface ExercisePreferencesProps {
  onNext: (preferences: string[]) => void;
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
}

const exerciseTypes = [
  {
    id: 'weightlifting',
    title: 'Weight Lifting',
    description: 'Build strength and muscle',
    icon: GiWeightLiftingUp,
    color: 'bg-purple-600'
  },
  {
    id: 'cardio',
    title: 'Cardio',
    description: 'Improve endurance and heart health',
    icon: FaRunning,
    color: 'bg-blue-600'
  },
  {
    id: 'hiit',
    title: 'HIIT',
    description: 'High-intensity interval training',
    icon: FaDumbbell,
    color: 'bg-red-600'
  },
  {
    id: 'swimming',
    title: 'Swimming',
    description: 'Full-body workout with low impact',
    icon: FaSwimmer,
    color: 'bg-cyan-600'
  },
  {
    id: 'boxing',
    title: 'Boxing',
    description: 'Improve strength and coordination',
    icon: GiBoxingGlove,
    color: 'bg-orange-600'
  },
  {
    id: 'yoga',
    title: 'Yoga',
    description: 'Flexibility and mindfulness',
    icon: FaYinYang,
    color: 'bg-green-600'
  }
];

export default function ExercisePreferences({
  onNext,
  currentStep,
  totalSteps,
  onPrevious
}: ExercisePreferencesProps) {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const togglePreference = (id: string) => {
    setSelectedPreferences(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const handleNext = () => {
    if (selectedPreferences.length > 0) {
      onNext(selectedPreferences);
    }
  };

  return (
    <StepLayout
      title="Choose Your Exercise Preferences"
      subtitle="Select all the types of exercises you enjoy or would like to try"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={selectedPreferences.length > 0 ? handleNext : undefined}
      onPrevious={onPrevious}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {exerciseTypes.map((exercise, index) => {
            const Icon = exercise.icon;
            const isSelected = selectedPreferences.includes(exercise.id);
            
            return (
              <motion.button
                key={exercise.id}
                onClick={() => togglePreference(exercise.id)}
                className={`
                  w-full p-6 rounded-2xl text-left transition-all duration-300
                  ${isSelected 
                    ? `${exercise.color} ring-2 ring-white` 
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
                    isSelected ? 'bg-white/20' : exercise.color
                  }`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {exercise.title}
                    </h3>
                    <p className="text-gray-300">
                      {exercise.description}
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
