import { useState } from 'react';
import { motion } from 'framer-motion';
import StepLayout from './StepLayout';
import { FaMars, FaVenus, FaTransgender } from 'react-icons/fa';

interface GenderSelectionProps {
  onNext: (data: { gender: string }) => void;
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
}

const genderOptions = [
  {
    id: 'male',
    label: 'Male',
    icon: FaMars,
    gradient: 'from-blue-500 to-blue-600',
    shadowColor: 'rgba(59, 130, 246, 0.5)',
  },
  {
    id: 'female',
    label: 'Female',
    icon: FaVenus,
    gradient: 'from-pink-500 to-pink-600',
    shadowColor: 'rgba(236, 72, 153, 0.5)',
  },
  {
    id: 'other',
    label: 'Other',
    icon: FaTransgender,
    gradient: 'from-purple-500 to-purple-600',
    shadowColor: 'rgba(168, 85, 247, 0.5)',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.8
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

export default function GenderSelection({
  onNext,
  currentStep,
  totalSteps,
  onPrevious,
}: GenderSelectionProps) {
  const [selectedGender, setSelectedGender] = useState('');
  const [hoveredGender, setHoveredGender] = useState('');

  const handleGenderSelect = (gender: string) => {
    setSelectedGender(gender);
  };

  const handleSubmit = () => {
    if (selectedGender) {
      onNext({ gender: selectedGender });
    }
  };

  return (
    <StepLayout
      title="Choose Your Gender"
      subtitle="Help us personalize your fitness journey"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onPrevious={onPrevious}
      onNext={selectedGender ? handleSubmit : undefined}
      nextButtonText="Continue"
    >
      <div className="max-w-md mx-auto px-4">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
        >
          {genderOptions.map((option) => (
            <motion.button
              key={option.id}
              variants={cardVariants}
              onClick={() => handleGenderSelect(option.id)}
              onHoverStart={() => setHoveredGender(option.id)}
              onHoverEnd={() => setHoveredGender('')}
              className={`relative overflow-hidden rounded-xl transition-all duration-300
                ${
                  selectedGender === option.id
                    ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-purple-500 scale-105'
                    : 'hover:scale-105'
                }
                ${option.id === 'other' ? 'col-span-2 sm:col-span-1' : ''}
              `}
              style={{
                boxShadow: selectedGender === option.id 
                  ? `0 0 20px ${option.shadowColor}` 
                  : 'none'
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className={`
                  aspect-square sm:aspect-[4/5] p-4 flex flex-col items-center justify-center
                  bg-gradient-to-br ${option.gradient}
                  ${selectedGender === option.id ? 'opacity-100' : 'opacity-90 hover:opacity-100'}
                `}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: hoveredGender === option.id || selectedGender === option.id ? 1.1 : 1,
                    y: hoveredGender === option.id || selectedGender === option.id ? -5 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <option.icon className="w-8 h-8 sm:w-10 sm:h-10 mb-2 text-white" />
                </motion.div>
                <motion.span
                  className="text-base sm:text-lg font-semibold text-white"
                  initial={false}
                  animate={{
                    y: hoveredGender === option.id || selectedGender === option.id ? 5 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {option.label}
                </motion.span>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Skip Option */}
        <motion.button
          variants={cardVariants}
          onClick={() => handleGenderSelect('prefer_not_to_say')}
          className={`
            mt-4 w-full py-3 text-center rounded-xl transition-colors
            ${
              selectedGender === 'prefer_not_to_say'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Prefer not to say
        </motion.button>
      </div>
    </StepLayout>
  );
}