'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPercentage } from 'react-icons/fa';
import Image from 'next/image';
import StepLayout from './StepLayout';

interface BodyFatSelectionProps {
  onNext: (data: { bodyFat: number }) => void;
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
}

const bodyFatRanges = [
  {
    min: 5,
    max: 10,
    label: 'Essential Fat',
    description: 'Very lean, visible abs and muscle definition',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    min: 11,
    max: 14,
    label: 'Athletes',
    description: 'Lean with visible muscle definition',
    image: 'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?w=500',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    min: 15,
    max: 20,
    label: 'Fitness',
    description: 'Athletic look with some definition',
    image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=500',
    gradient: 'from-green-500 to-teal-500'
  },
  {
    min: 21,
    max: 25,
    label: 'Average',
    description: 'Normal healthy range',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    min: 26,
    max: 30,
    label: 'Above Average',
    description: 'Some excess fat',
    image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=500',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    min: 31,
    max: 35,
    label: 'High',
    description: 'Excess fat accumulation',
    image: 'https://images.unsplash.com/photo-1573879541250-58ae8b322b40?w=500',
    gradient: 'from-red-500 to-pink-500'
  },
];

export default function BodyFatSelection({
  onNext,
  currentStep,
  totalSteps,
  onPrevious,
}: BodyFatSelectionProps) {
  const [bodyFat, setBodyFat] = useState<number>(15);

  const handleNext = () => {
    onNext({ bodyFat });
  };

  const getCurrentRange = () => {
    return bodyFatRanges.find(range => bodyFat >= range.min && bodyFat <= range.max);
  };

  const currentRange = getCurrentRange();

  return (
    <StepLayout
      title="What's your body fat percentage?"
      subtitle="This helps us understand your current body composition"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={handleNext}
      onPrevious={onPrevious}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Slider and Current Selection */}
          <div>
            {/* Body Fat Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-20 blur-xl"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <FaPercentage className="w-12 h-12 text-white/80" />
                </div>
              </div>
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text mb-2">
                {bodyFat}%
              </div>
              {currentRange && (
                <div>
                  <div className="text-xl font-semibold text-white mb-1">{currentRange.label}</div>
                  <div className="text-gray-400">{currentRange.description}</div>
                </div>
              )}
            </motion.div>

            {/* Body Fat Slider */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-sm mx-auto bg-gray-800 p-6 rounded-2xl shadow-xl"
            >
              <div className="relative pt-1">
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-6
                           [&::-webkit-slider-thumb]:h-6
                           [&::-webkit-slider-thumb]:bg-gradient-to-r
                           [&::-webkit-slider-thumb]:from-blue-500
                           [&::-webkit-slider-thumb]:to-purple-500
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:border-2
                           [&::-webkit-slider-thumb]:border-white
                           [&::-webkit-slider-thumb]:shadow-lg
                           [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between mt-4 text-sm text-gray-400">
                  <span>5%</span>
                  <span>35%</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Visual References */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            {bodyFatRanges.map((range) => (
              <div
                key={range.label}
                className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                  currentRange?.label === range.label
                    ? 'ring-2 ring-white scale-105 z-10'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div className="relative h-48">
                  <Image
                    src={range.image}
                    alt={range.label}
                    fill
                    className="object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${range.gradient} opacity-40`}></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="font-semibold text-white">
                      {range.label} ({range.min}-{range.max}%)
                    </div>
                    <div className="text-sm text-gray-200">
                      {range.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </StepLayout>
  );
}
