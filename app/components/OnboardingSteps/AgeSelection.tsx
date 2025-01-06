'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { FaBirthdayCake } from 'react-icons/fa';
import StepLayout from './StepLayout';

interface AgeSelectionProps {
  onNext: (data: { age: number }) => void;
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
}

export default function AgeSelection({
  onNext,
  currentStep,
  totalSteps,
  onPrevious,
}: AgeSelectionProps) {
  const [age, setAge] = useState<number>(25);
  const [sliderValue, setSliderValue] = useState<number>(25);

  useEffect(() => {
    // GSAP animation for the age number
    gsap.from('.age-number', {
      scale: 0.5,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(1.7)',
    });
  }, [age]);

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAge = parseInt(e.target.value);
    setSliderValue(newAge);
    setAge(newAge);
  };

  const handleNext = () => {
    onNext({ age });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <StepLayout
      title="How old are you?"
      subtitle="Your age helps us personalize your fitness journey"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={handleNext}
      onPrevious={onPrevious}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md mx-auto px-4 py-8"
      >
        {/* Age Display */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-12"
        >
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-20 blur-xl"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <FaBirthdayCake className="w-12 h-12 text-white/80" />
            </div>
          </div>
          <div className="text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
            {age}
          </div>
          <div className="text-gray-400 mt-2">Years Old</div>
        </motion.div>

        {/* Age Slider */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-sm mx-auto"
        >
          <div className="relative pt-1">
            <input
              type="range"
              min="13"
              max="80"
              value={age}
              onChange={handleAgeChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-6
                       [&::-webkit-slider-thumb]:h-6
                       [&::-webkit-slider-thumb]:bg-gradient-to-r
                       [&::-webkit-slider-thumb]:from-purple-500
                       [&::-webkit-slider-thumb]:to-pink-500
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:border-2
                       [&::-webkit-slider-thumb]:border-white
                       [&::-webkit-slider-thumb]:shadow-lg
                       [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>13</span>
              <span>80</span>
            </div>
          </div>
        </motion.div>

        {/* Age Groups */}
        <motion.div
          variants={itemVariants}
          className="mt-12 grid grid-cols-2 gap-4"
        >
          {[
            { range: '13-17', label: 'Teen' },
            { range: '18-29', label: 'Young Adult' },
            { range: '30-49', label: 'Adult' },
            { range: '50+', label: 'Senior Adult' },
          ].map((group) => (
            <div
              key={group.range}
              className={`p-4 rounded-xl text-center transition-all duration-300
                ${
                  (age >= 13 && age <= 17 && group.range === '13-17') ||
                  (age >= 18 && age <= 29 && group.range === '18-29') ||
                  (age >= 30 && age <= 49 && group.range === '30-49') ||
                  (age >= 50 && group.range === '50+')
                    ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                    : 'bg-gray-800/30'
                }`}
            >
              <div className="text-sm text-gray-400">{group.range}</div>
              <div className="text-white font-medium mt-1">{group.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </StepLayout>
  );
}
