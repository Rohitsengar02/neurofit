'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDumbbell } from 'react-icons/fa';
import { GiMuscleUp, GiWeightLiftingUp } from 'react-icons/gi';
import { TbActivityHeartbeat } from 'react-icons/tb';
import StepLayout from './StepLayout';

interface WeightliftingExperienceProps {
  onNext: (experience: string) => void;
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
}

const experienceLevels = [
  {
    id: 'beginner',
    title: 'Beginner',
    icon: TbActivityHeartbeat,
    color: 'bg-green-600',
    description: 'New to weightlifting or returning after a long break',
    details: [
      'Learn proper form and technique',
      'Start with bodyweight exercises',
      'Build foundational strength',
      'Focus on consistency'
    ]
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    icon: FaDumbbell,
    color: 'bg-blue-600',
    description: 'Regular training with basic knowledge of exercises',
    details: [
      'Progressive overload training',
      'Complex movement patterns',
      'Structured workout plans',
      'Nutrition optimization'
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced',
    icon: GiMuscleUp,
    color: 'bg-purple-600',
    description: 'Experienced lifter with strong technical knowledge',
    details: [
      'Advanced training techniques',
      'Periodization programs',
      'Performance optimization',
      'Recovery management'
    ]
  },
  {
    id: 'expert',
    title: 'Expert',
    icon: GiWeightLiftingUp,
    color: 'bg-red-600',
    description: 'Competitive level with years of dedicated training',
    details: [
      'Elite programming methods',
      'Peak performance training',
      'Competition preparation',
      'Advanced recovery protocols'
    ]
  }
];

export default function WeightliftingExperience({
  onNext,
  currentStep,
  totalSteps,
  onPrevious
}: WeightliftingExperienceProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  const handleNext = () => {
    if (selectedLevel) {
      onNext(selectedLevel);
    }
  };

  return (
    <StepLayout
      title="What's your weightlifting experience?"
      subtitle="Help us customize your training program"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={selectedLevel ? handleNext : undefined}
      onPrevious={onPrevious}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experienceLevels.map((level, index) => {
            const Icon = level.icon;
            const isSelected = selectedLevel === level.id;
            const isHovered = hoveredLevel === level.id;

            return (
              <motion.button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                onMouseEnter={() => setHoveredLevel(level.id)}
                onMouseLeave={() => setHoveredLevel(null)}
                className={`
                  group relative w-full p-6 rounded-2xl text-left transition-all duration-300
                  ${isSelected 
                    ? `${level.color} ring-2 ring-white shadow-lg` 
                    : 'bg-gray-800 hover:bg-gray-700'}
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl transition-colors duration-300 ${
                    isSelected ? 'bg-white/20' : level.color
                  }`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {level.title}
                    </h3>
                    <p className="text-gray-300 mb-3">
                      {level.description}
                    </p>
                    <motion.div
                      initial={false}
                      animate={{ 
                        height: (isSelected || isHovered) ? 'auto' : 0,
                        opacity: (isSelected || isHovered) ? 1 : 0
                      }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2">
                        {level.details.map((detail, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center text-sm text-white"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-2" />
                            {detail}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {selectedLevel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 rounded-2xl bg-gray-800"
          >
            <h3 className="text-xl font-bold mb-4">Training Recommendations</h3>
            <div className="space-y-4">
              {experienceLevels.find(l => l.id === selectedLevel)?.details.map((detail, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  {detail}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </StepLayout>
  );
}
