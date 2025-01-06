import { useState } from 'react';
import { motion } from 'framer-motion';
import StepLayout from './StepLayout';

interface StressLevelProps {
  onNext: (data: { stressLevel: number; stressors: string[] }) => void;
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
}

const stressors = [
  'Work',
  'Family',
  'Financial',
  'Health',
  'Relationships',
  'Studies',
  'Time Management',
  'Sleep',
];

export default function StressLevel({
  onNext,
  currentStep,
  totalSteps,
  onPrevious,
}: StressLevelProps) {
  const [stressLevel, setStressLevel] = useState(5);
  const [selectedStressors, setSelectedStressors] = useState<string[]>([]);

  const handleStressorToggle = (stressor: string) => {
    setSelectedStressors((prev) =>
      prev.includes(stressor)
        ? prev.filter((s) => s !== stressor)
        : [...prev, stressor]
    );
  };

  const handleSubmit = () => {
    onNext({ stressLevel, stressors: selectedStressors });
  };

  return (
    <StepLayout
      title="Stress Management"
      subtitle="Help us understand your stress levels to provide better recommendations"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onPrevious={onPrevious}
      onNext={handleSubmit}
      nextButtonText="Continue"
    >
      <div className="space-y-8 pb-4">
        {/* Stress Level Slider */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center">
            How would you rate your current stress level?
          </h3>
          <div className="relative w-full h-12 bg-gray-800/30 rounded-xl px-4">
            <input
              type="range"
              min="1"
              max="10"
              value={stressLevel}
              onChange={(e) => setStressLevel(Number(e.target.value))}
              className="w-full h-full appearance-none bg-transparent cursor-pointer"
              style={{
                background: `linear-gradient(to right, #9333ea 0%, #9333ea ${
                  ((stressLevel - 1) / 9) * 100
                }%, #1f2937 ${((stressLevel - 1) / 9) * 100}%, #1f2937 100%)`,
              }}
            />
            <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-sm text-gray-400">
              <span>Low</span>
              <span className="text-purple-500 font-bold">{stressLevel}</span>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Stressors Selection */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center">
            What are your main sources of stress?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {stressors.map((stressor) => (
              <motion.button
                key={stressor}
                onClick={() => handleStressorToggle(stressor)}
                className={`p-4 rounded-xl text-left transition-colors ${
                  selectedStressors.includes(stressor)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800/30 text-gray-300 hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {stressor}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
