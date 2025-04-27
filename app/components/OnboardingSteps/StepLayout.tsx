'use client';

import { motion } from 'framer-motion';

interface StepLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void | Promise<void>;
  onPrevious?: () => void;
  title?: string;
  subtitle?: string;
  nextButtonText?: string;
}

export default function StepLayout({
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  title,
  subtitle,
  nextButtonText = 'Next'
}: StepLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="max-w-6xl w-full mx-auto px-4 flex-1 pt-8  relative">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${(currentStep / totalSteps) * 100}%`
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Title Section */}
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            )}
            {subtitle && <p className="text-gray-400">{subtitle}</p>}
          </div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>

        {/* Fixed Navigation Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-10">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPrevious}
              className={`px-6 py-3 rounded-lg font-medium shadow-lg ${
                onPrevious
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={!onPrevious}
            >
              Previous
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNext}
              className={`px-6 py-3 rounded-lg font-medium shadow-lg ${
                onNext
                  ? 'bg-purple-600 text-white hover:bg-purple-500'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={!onNext}
            >
              {currentStep === totalSteps ? nextButtonText : nextButtonText || 'Next'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}