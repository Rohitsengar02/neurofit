'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDumbbell, FaRunning, FaHeartbeat, FaWeight } from 'react-icons/fa';
import { GiMuscleUp } from 'react-icons/gi';
import StepLayout from './StepLayout';

interface FitnessGoalsProps {
  onNext: (goals: string[]) => void;
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
}

const goals = [
  {
    id: 'weight_loss',
    title: 'Weight Loss',
    description: 'Burn fat and achieve a leaner physique',
    icon: FaWeight,
    color: 'bg-rose-600',
    details: [
      'Personalized calorie targets',
      'Fat-burning workouts',
      'Progress tracking'
    ]
  },
  {
    id: 'muscle_gain',
    title: 'Build Muscle',
    description: 'Increase muscle mass and strength',
    icon: GiMuscleUp,
    color: 'bg-blue-600',
    details: [
      'Progressive overload training',
      'Muscle-specific workouts',
      'Nutrition guidance'
    ]
  },
  {
    id: 'fitness',
    title: 'General Fitness',
    description: 'Improve overall health and wellness',
    icon: FaDumbbell,
    color: 'bg-green-600',
    details: [
      'Full-body workouts',
      'Balanced approach',
      'Lifestyle improvements'
    ]
  },
  {
    id: 'endurance',
    title: 'Endurance',
    description: 'Build stamina and cardiovascular health',
    icon: FaRunning,
    color: 'bg-purple-600',
    details: [
      'Cardio programming',
      'Endurance building',
      'Performance tracking'
    ]
  },
  {
    id: 'health',
    title: 'Health Focus',
    description: 'Focus on wellness and longevity',
    icon: FaHeartbeat,
    color: 'bg-red-600',
    details: [
      'Balanced workouts',
      'Health monitoring',
      'Stress management'
    ]
  }
];

export default function FitnessGoals({
  onNext,
  currentStep,
  totalSteps,
  onPrevious
}: FitnessGoalsProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [hoveredGoal, setHoveredGoal] = useState<string | null>(null);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      }
      if (prev.length < 2) {
        return [...prev, goalId];
      }
      return prev;
    });
  };

  const handleNext = () => {
    if (selectedGoals.length > 0) {
      onNext(selectedGoals);
    }
  };

  return (
    <StepLayout
      title="What are your fitness goals?"
      subtitle="Choose up to 2 goals to customize your fitness journey"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={selectedGoals.length > 0 ? handleNext : undefined}
      onPrevious={onPrevious}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal, index) => {
            const Icon = goal.icon;
            const isSelected = selectedGoals.includes(goal.id);
            const isHovered = hoveredGoal === goal.id;

            return (
              <motion.button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                onMouseEnter={() => setHoveredGoal(goal.id)}
                onMouseLeave={() => setHoveredGoal(null)}
                className={`
                  group relative w-full p-6 rounded-2xl text-left transition-all duration-300
                  ${isSelected 
                    ? `${goal.color} ring-2 ring-white shadow-lg` 
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
                    isSelected ? 'bg-white/20' : goal.color
                  }`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {goal.title}
                    </h3>
                    <p className="text-gray-300 mb-3">
                      {goal.description}
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
                        {goal.details.map((detail, i) => (
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

        {selectedGoals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 rounded-2xl bg-gray-800"
          >
            <h3 className="text-xl font-bold mb-4">Your Selected Goals</h3>
            <div className="space-y-4">
              {selectedGoals.map((goalId, index) => {
                const goal = goals.find(g => g.id === goalId)!;
                const Icon = goal.icon;
                
                return (
                  <motion.div
                    key={goalId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl ${goal.color}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/20">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {goal.title}
                        </h4>
                        <p className="text-sm text-white/80">
                          {goal.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </StepLayout>
  );
}
