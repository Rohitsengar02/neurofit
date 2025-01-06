'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDumbbell, FaHome, FaRunning } from 'react-icons/fa';
import { MdOutlineSportsGymnastics } from 'react-icons/md';
import StepLayout from './StepLayout';

interface WorkoutLocationProps {
  onNext: (location: string) => void;
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
}

const locations = [
  {
    id: 'gym',
    title: 'Gym',
    description: 'Access to full equipment',
    icon: FaDumbbell,
    color: 'bg-purple-600'
  },
  {
    id: 'home',
    title: 'Home',
    description: 'Workout in your space',
    icon: FaHome,
    color: 'bg-blue-600'
  },
  {
    id: 'outdoors',
    title: 'Outdoors',
    description: 'Nature as your gym',
    icon: FaRunning,
    color: 'bg-green-600'
  },
  {
    id: 'hybrid',
    title: 'Hybrid',
    description: 'Mix of locations',
    icon: MdOutlineSportsGymnastics,
    color: 'bg-orange-600'
  }
];

export default function WorkoutLocation({
  onNext,
  currentStep,
  totalSteps,
  onPrevious
}: WorkoutLocationProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const handleNext = () => {
    if (selectedLocation) {
      onNext(selectedLocation);
    }
  };

  return (
    <StepLayout
      title="Where will you work out?"
      subtitle="Choose your preferred workout location"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={selectedLocation ? handleNext : undefined}
      onPrevious={onPrevious}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {locations.map((location, index) => {
            const Icon = location.icon;
            const isSelected = selectedLocation === location.id;
            
            return (
              <motion.button
                key={location.id}
                onClick={() => setSelectedLocation(location.id)}
                className={`
                  w-full p-6 rounded-2xl text-left transition-all duration-300
                  ${isSelected 
                    ? `${location.color} ring-2 ring-white` 
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
                    isSelected ? 'bg-white/20' : location.color
                  }`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {location.title}
                    </h3>
                    <p className="text-gray-300">
                      {location.description}
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
