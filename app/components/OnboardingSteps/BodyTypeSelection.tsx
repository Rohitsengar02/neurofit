'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GiMuscularTorso } from 'react-icons/gi';
import StepLayout from './StepLayout';

interface BodyTypeSelectionProps {
  onNext: (data: { bodyType: string }) => void;
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
}

const bodyTypes = [
  {
    id: 'ectomorph',
    title: 'Ectomorph',
    description: 'Lean & Long',
    characteristics: ['Naturally lean', 'Small joints/bones', 'Difficult to gain weight'],
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'mesomorph',
    title: 'Mesomorph',
    description: 'Athletic & Strong',
    characteristics: ['Athletic build', 'Gains muscle easily', 'Responsive to training'],
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'endomorph',
    title: 'Endomorph',
    description: 'Solid & Soft',
    characteristics: ['Naturally strong', 'Gains muscle easily', 'Higher body fat'],
    gradient: 'from-orange-500 to-red-500',
  },
];

export default function BodyTypeSelection({
  onNext,
  currentStep,
  totalSteps,
  onPrevious,
}: BodyTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<string>('');

  const handleNext = () => {
    if (selectedType) {
      onNext({ bodyType: selectedType });
    }
  };

  return (
    <StepLayout
      title="What's your body type?"
      subtitle="Understanding your body type helps us create a more effective program"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={selectedType ? handleNext : undefined}
      onPrevious={onPrevious}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bodyTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="h-full"
            >
              <button
                onClick={() => setSelectedType(type.id)}
                className={`w-full h-full p-6 rounded-2xl transition-all duration-300
                  ${
                    selectedType === type.id
                      ? `bg-gradient-to-br ${type.gradient} ring-2 ring-white/20`
                      : 'bg-gray-800/50 hover:bg-gray-800'
                  }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-24 h-24 rounded-full mb-4 flex items-center justify-center
                    ${
                      selectedType === type.id
                        ? 'bg-white/20'
                        : `bg-gradient-to-br ${type.gradient} bg-opacity-10`
                    }`}
                  >
                    <GiMuscularTorso className={`w-12 h-12 
                      ${selectedType === type.id ? 'text-white' : 'text-white/70'}`}
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{type.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{type.description}</p>
                  <ul className="text-sm text-left space-y-2">
                    {type.characteristics.map((char, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </StepLayout>
  );
}
