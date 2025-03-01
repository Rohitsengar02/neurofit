import { useState } from 'react';
import { motion } from 'framer-motion';
import StepLayout from './StepLayout';

interface MeasurementsProps {
  onNext: (data: { height: number; weight: number }) => void;
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.9
  },
  show: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

export default function Measurements({
  onNext,
  currentStep,
  totalSteps,
  onPrevious,
}: MeasurementsProps) {
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(70);
  const [activeInput, setActiveInput] = useState<'height' | 'weight' | null>(null);

  const handleSubmit = () => {
    if (height && weight) {
      onNext({ height, weight });
    }
  };

  const isValidInput = height >= 100 && height <= 250 && weight >= 30 && weight <= 200;
  const bmi = (weight / Math.pow(height / 100, 2));

  const getBmiCategory = () => {
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-blue-400' };
    if (bmi < 25) return { text: 'Normal', color: 'text-green-400' };
    if (bmi < 30) return { text: 'Overweight', color: 'text-yellow-400' };
    return { text: 'Obese', color: 'text-red-400' };
  };

  return (
    <StepLayout
      title="Your Measurements"
      subtitle="Help us understand your body better"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onPrevious={onPrevious}
      onNext={isValidInput ? handleSubmit : undefined}
      nextButtonText="Continue"
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-md mx-auto px-4"
      >
        {/* Height Input */}
        <motion.div 
          variants={itemVariants}
          className="relative mb-8"
        >
          <div className={`
            p-6 rounded-xl bg-gradient-to-br transition-all duration-300
            ${activeInput === 'height' ? 'from-blue-500/20 to-purple-500/20 scale-102' : 'from-gray-800/50 to-gray-700/50'}
          `}>
            <div className="flex justify-between items-center mb-4">
              <label className="text-lg font-medium text-gray-300">Height</label>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-white">{height}</span>
                <span className="text-sm text-gray-400">cm</span>
              </div>
            </div>
            
            <div className="relative">
              <input
                type="range"
                min="100"
                max="250"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                onFocus={() => setActiveInput('height')}
                onBlur={() => setActiveInput(null)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>100 cm</span>
                <span>250 cm</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Weight Input */}
        <motion.div 
          variants={itemVariants}
          className="relative mb-8"
        >
          <div className={`
            p-6 rounded-xl bg-gradient-to-br transition-all duration-300
            ${activeInput === 'weight' ? 'from-blue-500/20 to-purple-500/20 scale-102' : 'from-gray-800/50 to-gray-700/50'}
          `}>
            <div className="flex justify-between items-center mb-4">
              <label className="text-lg font-medium text-gray-300">Weight</label>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-white">{weight}</span>
                <span className="text-sm text-gray-400">kg</span>
              </div>
            </div>
            
            <div className="relative">
              <input
                type="range"
                min="30"
                max="200"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                onFocus={() => setActiveInput('weight')}
                onBlur={() => setActiveInput(null)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>30 kg</span>
                <span>200 kg</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* BMI Display */}
        {isValidInput && (
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-300">BMI Score</h3>
              <span className={`text-sm font-medium ${getBmiCategory().color}`}>
                {getBmiCategory().text}
              </span>
            </div>
            
            <div className="relative pt-2">
              <div className="flex justify-between mb-2">
                <span className="text-3xl font-bold text-white">{bmi.toFixed(1)}</span>
              </div>
              
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((bmi / 40) * 100, 100)}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500"
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0</span>
                <span>20</span>
                <span>40</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </StepLayout>
  );
}