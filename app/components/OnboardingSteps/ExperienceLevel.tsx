'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GiMuscleUp, GiWeightLiftingUp } from 'react-icons/gi';
import { FaDumbbell } from 'react-icons/fa';
import { TbActivityHeartbeat } from 'react-icons/tb';
import StepLayout from './StepLayout';

interface ExperienceLevelProps {
  onNext: (level: string) => Promise<void>;
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
}

const experienceLevels = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'New to weight training',
    icon: TbActivityHeartbeat,
    color: 'bg-green-600',
    details: [
      'Little to no experience with weights',
      'Want to learn proper form',
      'Ready to start your fitness journey'
    ],
    recommendations: [
      'Focus on form and technique',
      'Start with bodyweight exercises',
      'Learn basic movement patterns'
    ]
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'Some training experience',
    icon: FaDumbbell,
    color: 'bg-blue-600',
    details: [
      '6-18 months of consistent training',
      'Familiar with basic exercises',
      'Understanding of proper form'
    ],
    recommendations: [
      'Progressive overload training',
      'Complex movement patterns',
      'Structured workout plans'
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Experienced lifter',
    icon: GiWeightLiftingUp,
    color: 'bg-purple-600',
    details: [
      '2+ years of consistent training',
      'Strong technical foundation',
      'Deep understanding of nutrition'
    ],
    recommendations: [
      'Periodization training',
      'Advanced lifting techniques',
      'Specialized programs'
    ]
  },
  {
    id: 'expert',
    title: 'Expert',
    description: 'Professional level',
    icon: GiMuscleUp,
    color: 'bg-red-600',
    details: [
      '5+ years of dedicated training',
      'Competition experience',
      'Advanced programming knowledge'
    ],
    recommendations: [
      'Elite performance training',
      'Competition preparation',
      'Advanced recovery techniques'
    ]
  }
];

export default function ExperienceLevel({
  onNext,
  currentStep,
  totalSteps,
  onPrevious
}: ExperienceLevelProps) {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  const handleNext = async () => {
    if (selectedLevel) {
      await onNext(selectedLevel);
    }
  };

  return (
    <StepLayout
      title="What's your experience level?"
      subtitle="Help us customize your training program"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={selectedLevel ? handleNext : undefined}
      onPrevious={onPrevious}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Experience Levels */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 gap-4"
          >
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
                    w-full p-6 rounded-2xl text-left transition-all duration-300
                    ${isSelected 
                      ? `${level.color} ring-2 ring-white` 
                      : 'bg-gray-800 hover:bg-gray-700'
                    }
                  `}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      isSelected ? 'bg-white/20' : level.color
                    }`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">
                        {level.title}
                      </h3>
                      <p className="text-gray-300 mb-2">
                        {level.description}
                      </p>
                      {(isSelected || isHovered) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 space-y-2"
                        >
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
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Recommendations Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {selectedLevel ? (
              <div className="bg-gray-800 p-6 rounded-2xl">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-bold mb-4">Training Recommendations</h3>
                  {selectedLevel && (
                    <div className="space-y-6">
                      <div className={`p-4 rounded-xl ${
                        experienceLevels.find(l => l.id === selectedLevel)?.color
                      }`}>
                        <h4 className="font-semibold text-lg text-white mb-3">
                          Your Program Will Include:
                        </h4>
                        <div className="space-y-3">
                          {experienceLevels
                            .find(l => l.id === selectedLevel)
                            ?.recommendations.map((rec, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center text-sm text-white"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-white mr-2" />
                                {rec}
                              </motion.div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            ) : (
              <div className="bg-gray-800 p-6 rounded-2xl">
                <p className="text-gray-400">
                  Select your experience level to see personalized recommendations
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </StepLayout>
  );
}