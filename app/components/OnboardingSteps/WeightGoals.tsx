'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaWeight } from 'react-icons/fa';
import StepLayout from './StepLayout';

interface WeightGoalsProps {
  onNext: (data: { currentWeight: number; targetWeight: number }) => Promise<void>;
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
}

export default function WeightGoals({
  onNext,
  currentStep,
  totalSteps,
  onPrevious
}: WeightGoalsProps) {
  const [currentWeight, setCurrentWeight] = useState<number>(0);
  const [targetWeight, setTargetWeight] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const handleNext = async () => {
    if (currentWeight <= 0 || targetWeight <= 0) {
      setError('Please enter valid weights');
      return;
    }
    try {
      await onNext({ 
        currentWeight, 
        targetWeight 
      });
    } catch (error) {
      setError('Failed to save weight goals. Please try again.');
    }
  };

  return (
    <StepLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={currentWeight > 0 && targetWeight > 0 ? handleNext : undefined}
      onPrevious={onPrevious}
      title="Weight Goals"
      subtitle="Let's track your weight journey"
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-6 rounded-xl"
          >
            <label className="block text-white text-lg font-medium mb-4">
              Current Weight (kg)
            </label>
            <input
              type="number"
              value={currentWeight || ''}
              onChange={(e) => {
                setCurrentWeight(Number(e.target.value));
                setError('');
              }}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your current weight"
              min="0"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 p-6 rounded-xl"
          >
            <label className="block text-white text-lg font-medium mb-4">
              Target Weight (kg)
            </label>
            <input
              type="number"
              value={targetWeight || ''}
              onChange={(e) => {
                setTargetWeight(Number(e.target.value));
                setError('');
              }}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your target weight"
              min="0"
            />
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-red-500 text-center"
          >
            {error}
          </motion.div>
        )}
      </div>
    </StepLayout>
  );
}
