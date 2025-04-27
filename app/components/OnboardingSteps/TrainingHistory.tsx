'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDumbbell, FaRunning, FaHeartbeat } from 'react-icons/fa';
import { GiMuscleUp, GiWeightLiftingUp, GiBoxingGlove, GiMeditation } from 'react-icons/gi';
import { MdSportsGymnastics, MdSportsKabaddi } from 'react-icons/md';
import StepLayout from './StepLayout';

interface TrainingHistoryProps {
  onNext: (history: {
    previousExperience: string[];
    trainingDuration: string;
    consistency: string;
  }) => Promise<void>;
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
}

const trainingTypes = [
  {
    id: 'weightlifting',
    title: 'Weightlifting',
    icon: GiWeightLiftingUp,
    color: 'bg-blue-600',
    description: 'Free weights, machines, resistance training',
    benefits: ['Strength building', 'Muscle growth', 'Bone density']
  },
  {
    id: 'cardio',
    title: 'Cardio Training',
    icon: FaRunning,
    color: 'bg-green-600',
    description: 'Running, cycling, swimming, HIIT',
    benefits: ['Endurance', 'Heart health', 'Fat burning']
  },
  {
    id: 'bodyweight',
    title: 'Bodyweight Training',
    icon: GiMuscleUp,
    color: 'bg-purple-600',
    description: 'Calisthenics, gymnastics, functional training',
    benefits: ['Body control', 'Core strength', 'Flexibility']
  },
  {
    id: 'yoga',
    title: 'Yoga & Stretching',
    icon: GiMeditation,
    color: 'bg-rose-600',
    description: 'Flexibility work, mobility training',
    benefits: ['Flexibility', 'Mind-body connection', 'Stress reduction']
  },
  {
    id: 'sports',
    title: 'Sports & Athletics',
    icon: MdSportsKabaddi,
    color: 'bg-orange-600',
    description: 'Team sports, athletics, recreational activities',
    benefits: ['Coordination', 'Team skills', 'Overall fitness']
  },
  {
    id: 'martial_arts',
    title: 'Martial Arts',
    icon: GiBoxingGlove,
    color: 'bg-red-600',
    description: 'Boxing, kickboxing, MMA, traditional arts',
    benefits: ['Self-defense', 'Discipline', 'Full-body fitness']
  }
];

const trainingDurations = [
  { id: 'beginner', label: '0 months', description: 'Building foundations' },
  { id: 'novice', label: '0-6 months', description: 'Developing habits' },
  { id: 'intermediate', label: '6-12 years', description: 'Consistent progress' },
  { id: 'advanced', label: '2+ years', description: 'Long-term dedication' }
];

const consistencyLevels = [
  { id: 'high', label: '4-6 times/week', description: 'Dedicated routine' },
  { id: 'medium', label: '2-3 times/week', description: 'Regular practice' },
  { id: 'low', label: '1-2 times/week', description: 'Getting started' },
  { id: 'irregular', label: 'Irregular', description: 'Variable schedule' }
];

export default function TrainingHistory({
  onNext,
  currentStep,
  totalSteps,
  onPrevious
}: TrainingHistoryProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>('');
  const [consistency, setConsistency] = useState<string>('');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleTypeToggle = (id: string) => {
    setSelectedTypes(prev => {
      if (prev.includes(id)) {
        return prev.filter(type => type !== id);
      }
      return [...prev, id];
    });
  };

  const handleNext = async () => {
    if (selectedTypes.length > 0 && duration && consistency) {
      await onNext({
        previousExperience: selectedTypes,
        trainingDuration: duration,
        consistency
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <StepLayout
      title="Tell us about your training history"
      subtitle="Help us understand your fitness background"
      currentStep={currentStep}
      totalSteps={totalSteps}
      onNext={selectedTypes.length > 0 && duration && consistency ? handleNext : undefined}
      onPrevious={onPrevious}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Previous Training Types */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mb-12"
        >
          <h3 className="text-xl font-bold mb-6">What types of training have you done before?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedTypes.includes(type.id);
              const isHovered = hoveredItem === type.id;

              return (
                <motion.button
                  key={type.id}
                  variants={itemVariants}
                  onClick={() => handleTypeToggle(type.id)}
                  onMouseEnter={() => setHoveredItem(type.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    relative w-full p-6 rounded-2xl text-left transition-all duration-300
                    ${isSelected 
                      ? `${type.color} ring-2 ring-white shadow-lg` 
                      : 'bg-gray-800 hover:bg-gray-700'}
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      isSelected ? 'bg-white/20' : type.color
                    }`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {type.title}
                      </h3>
                      <p className="text-gray-300 mb-2">
                        {type.description}
                      </p>
                      <AnimatePresence>
                        {(isSelected || isHovered) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                          >
                            {type.benefits.map((benefit, i) => (
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
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Training Duration */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mb-12"
        >
          <h3 className="text-xl font-bold mb-6">How long have you been training?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trainingDurations.map((item) => (
              <motion.button
                key={item.id}
                variants={itemVariants}
                onClick={() => setDuration(item.id)}
                className={`
                  p-4 rounded-xl text-center transition-all duration-300
                  ${duration === item.id
                    ? 'bg-purple-600 ring-2 ring-white shadow-lg'
                    : 'bg-gray-800 hover:bg-gray-700'}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <h4 className="text-lg font-bold text-white mb-1">{item.label}</h4>
                <p className="text-sm text-gray-300">{item.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Training Consistency */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <h3 className="text-xl font-bold mb-6">How consistent is your training?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {consistencyLevels.map((item) => (
              <motion.button
                key={item.id}
                variants={itemVariants}
                onClick={() => setConsistency(item.id)}
                className={`
                  p-4 rounded-xl text-center transition-all duration-300
                  ${consistency === item.id
                    ? 'bg-blue-600 ring-2 ring-white shadow-lg'
                    : 'bg-gray-800 hover:bg-gray-700'}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <h4 className="text-lg font-bold text-white mb-1">{item.label}</h4>
                <p className="text-sm text-gray-300">{item.description}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Summary Panel */}
        {selectedTypes.length > 0 && duration && consistency && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-6 rounded-2xl bg-gray-800"
          >
            <h3 className="text-xl font-bold mb-4">Your Training Profile</h3>
            <div className="space-y-6">
              {/* Experience Types */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Training Experience</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedTypes.map((typeId) => {
                    const type = trainingTypes.find(t => t.id === typeId)!;
                    const Icon = type.icon;
                    
                    return (
                      <motion.div
                        key={typeId}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${type.color}`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                        <span className="text-white font-medium">{type.title}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Duration & Consistency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Training Duration</h4>
                  <p className="text-gray-300">
                    {trainingDurations.find(d => d.id === duration)?.label}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Training Consistency</h4>
                  <p className="text-gray-300">
                    {consistencyLevels.find(c => c.id === consistency)?.label}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </StepLayout>
  );
}
