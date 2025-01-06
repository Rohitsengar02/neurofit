import { useState } from 'react';
import { motion } from 'framer-motion';
import StepLayout from './StepLayout';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface WorkoutFrequencyProps {
  onNext: (frequency: string) => void;
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
}

export default function WorkoutFrequency({
  onNext,
  currentStep,
  totalSteps,
  onPrevious
}: WorkoutFrequencyProps) {
  const [selected, setSelected] = useState<string>('');

  const frequencies = [
    {
      id: '2-3',
      title: '2-3 times/week',
      description: 'Perfect for beginners',
      color: 'text-blue-400'
    },
    {
      id: '3-4',
      title: '3-4 times/week',
      description: 'Balanced commitment',
      color: 'text-green-400'
    },
    {
      id: '4-5',
      title: '4-5 times/week',
      description: 'Dedicated routine',
      color: 'text-orange-400'
    },
    {
      id: '6+',
      title: '6+ times/week',
      description: 'Advanced training',
      color: 'text-purple-400'
    }
  ];

  const handleSelect = (frequencyId: string) => {
    setSelected(frequencyId);
    setTimeout(() => onNext(frequencyId), 500);
  };

  return (
    <StepLayout
      title="Weekly Workout Frequency"
      subtitle="How often would you like to work out?"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onPrevious={onPrevious}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {frequencies.map((frequency) => (
          <motion.button
            key={frequency.id}
            onClick={() => handleSelect(frequency.id)}
            className={`
              relative p-6 rounded-xl border-2 transition-all duration-300
              ${selected === frequency.id
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-600 hover:border-purple-400 bg-gray-800/50'}
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <CalendarIcon className={`w-12 h-12 ${frequency.color}`} />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {frequency.title}
                </h3>
                <p className="text-gray-400">
                  {frequency.description}
                </p>
              </div>
            </motion.div>

            {selected === frequency.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </StepLayout>
  );
}