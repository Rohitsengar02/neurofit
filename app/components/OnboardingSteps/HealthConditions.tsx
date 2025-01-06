import { useState } from 'react';
import { motion } from 'framer-motion';
import StepLayout from './StepLayout';

interface HealthConditionsProps {
  onNext: (data: { conditions: string[]; medications: boolean; injuries: string[] }) => void;
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
}

const healthConditions = [
  'None',
  'High Blood Pressure',
  'Diabetes',
  'Heart Condition',
  'Asthma',
  'Arthritis',
  'Back Pain',
  'Joint Issues',
  'Other',
];

const commonInjuries = [
  'None',
  'Back',
  'Knee',
  'Shoulder',
  'Neck',
  'Ankle',
  'Hip',
  'Wrist',
  'Other',
];

export default function HealthConditions({
  onNext,
  currentStep,
  totalSteps,
  onPrevious,
}: HealthConditionsProps) {
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [takingMedications, setTakingMedications] = useState<boolean | null>(null);
  const [selectedInjuries, setSelectedInjuries] = useState<string[]>([]);

  const handleConditionToggle = (condition: string) => {
    setSelectedConditions((prev) => {
      if (condition === 'None') {
        return ['None'];
      }
      const newConditions = prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev.filter((c) => c !== 'None'), condition];
      return newConditions.length === 0 ? ['None'] : newConditions;
    });
  };

  const handleInjuryToggle = (injury: string) => {
    setSelectedInjuries((prev) => {
      if (injury === 'None') {
        return ['None'];
      }
      const newInjuries = prev.includes(injury)
        ? prev.filter((i) => i !== injury)
        : [...prev.filter((i) => i !== 'None'), injury];
      return newInjuries.length === 0 ? ['None'] : newInjuries;
    });
  };

  const handleSubmit = () => {
    if (takingMedications !== null && selectedConditions.length > 0 && selectedInjuries.length > 0) {
      onNext({
        conditions: selectedConditions,
        medications: takingMedications,
        injuries: selectedInjuries,
      });
    }
  };

  return (
    <StepLayout
      title="Health Profile"
      subtitle="Help us create a safe workout plan for you"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onPrevious={onPrevious}
      onNext={handleSubmit}
      nextButtonText="Continue"
    >
      <div className="space-y-8 pb-4">
        {/* Health Conditions */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center">
            Do you have any health conditions?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {healthConditions.map((condition) => (
              <motion.button
                key={condition}
                onClick={() => handleConditionToggle(condition)}
                className={`p-4 rounded-xl text-left transition-colors ${
                  selectedConditions.includes(condition)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800/30 text-gray-300 hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {condition}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Medications */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center">
            Are you currently taking any medications?
          </h3>
          <div className="flex justify-center gap-4">
            {[
              { value: true, label: 'Yes' },
              { value: false, label: 'No' },
            ].map(({ value, label }) => (
              <motion.button
                key={label}
                onClick={() => setTakingMedications(value)}
                className={`px-8 py-4 rounded-xl text-center transition-colors ${
                  takingMedications === value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800/30 text-gray-300 hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Injuries */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center">
            Any current or recent injuries?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {commonInjuries.map((injury) => (
              <motion.button
                key={injury}
                onClick={() => handleInjuryToggle(injury)}
                className={`p-4 rounded-xl text-left transition-colors ${
                  selectedInjuries.includes(injury)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800/30 text-gray-300 hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {injury}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
