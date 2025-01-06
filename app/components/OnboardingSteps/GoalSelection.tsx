'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDumbbell, FaRunning, FaHeartbeat, FaBrain } from 'react-icons/fa';
import { GiMuscleUp, GiWeightLiftingUp, GiStrongMan } from 'react-icons/gi';
import { MdSelfImprovement } from 'react-icons/md';
import StepLayout from './StepLayout';

interface GoalSelectionProps {
  onNext: (goals: string[]) => Promise<void>;
  onPrevious?: () => void;
  currentStep: number;
  totalSteps: number;
}

const fitnessGoals = [
  {
    id: 'muscle_gain',
    title: 'Build Muscle',
    description: 'Increase muscle mass and strength',
    icon: GiMuscleUp,
    color: 'bg-blue-600',
    benefits: ['Increased strength', 'Better metabolism', 'Improved posture']
  },
  {
    id: 'weight_loss',
    title: 'Lose Weight',
    description: 'Reduce body fat and get lean',
    icon: GiWeightLiftingUp,
    color: 'bg-green-600',
    benefits: ['Fat loss', 'More energy', 'Better health']
  },
  {
    id: 'endurance',
    title: 'Build Endurance',
    description: 'Improve stamina and performance',
    icon: FaRunning,
    color: 'bg-purple-600',
    benefits: ['Better cardio', 'Increased stamina', 'Mental toughness']
  },
  {
    id: 'strength',
    title: 'Gain Strength',
    description: 'Increase power and performance',
    icon: GiStrongMan,
    color: 'bg-orange-600',
    benefits: ['Raw power', 'Functional strength', 'Joint stability']
  }
];

export default function GoalSelection({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}: GoalSelectionProps) {
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

  const handleNext = async () => {
    if (selectedGoals.length > 0) {
      await onNext(selectedGoals);
    }
  };

  return (
    <StepLayout
      title="Choose Your Goals"
      subtitle="Select up to 2 fitness goals that matter most to you"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={selectedGoals.length > 0 ? handleNext : undefined}
      onPrevious={onPrevious}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fitnessGoals.map((goal, index) => {
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
                  w-full p-6 rounded-2xl text-left transition-all duration-300
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
                  <div className={`p-3 rounded-xl ${
                    isSelected ? 'bg-white/20' : goal.color
                  }`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {goal.title}
                    </h3>
                    <p className="text-gray-300 mb-2">
                      {goal.description}
                    </p>
                    {(isSelected || isHovered) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        {goal.benefits.map((benefit, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center text-sm text-white"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-2" />
                            {benefit}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
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
            <h3 className="text-xl font-bold mb-4">Selected Goals</h3>
            <div className="space-y-4">
              {selectedGoals.map((goalId, index) => {
                const goal = fitnessGoals.find(g => g.id === goalId)!;
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