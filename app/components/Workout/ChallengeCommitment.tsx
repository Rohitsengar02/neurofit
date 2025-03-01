'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaCalendarCheck, FaFire } from 'react-icons/fa';
import { GiTrophyCup } from 'react-icons/gi';
import { ChallengeWorkout } from '@/app/types/workout';
import Confetti from 'react-confetti';

interface ChallengeCommitmentProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit: () => void;
  workout: ChallengeWorkout;
}

const ChallengeCommitment: React.FC<ChallengeCommitmentProps> = ({
  isOpen,
  onClose,
  onCommit,
  workout,
}) => {
  const [showConfetti, setShowConfetti] = React.useState(false);

  const handleCommit = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      onCommit();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  <GiTrophyCup className="text-6xl text-amber-500" />
                </motion.div>
                <motion.div
                  className="absolute -right-2 -top-2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <FaFire className="text-2xl text-orange-500" />
                </motion.div>
              </div>
            </motion.div>

            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-center text-white mb-4"
            >
              Ready to Begin Your Challenge?
            </motion.h2>

            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 mb-6"
            >
              <div className="bg-gray-800/50 rounded-lg p-4 flex items-start space-x-3">
                <FaCalendarCheck className="text-green-500 text-xl mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Duration</h3>
                  <p className="text-gray-300 text-sm">{workout.duration} with Sundays as rest days</p>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 flex items-start space-x-3">
                <FaCheckCircle className="text-blue-500 text-xl mt-1" />
                <div>
                  <h3 className="font-semibold text-white">What You&apos;ll Get</h3>
                  <ul className="text-gray-300 text-sm space-y-1 mt-1">
                    <li>• Daily progress tracking</li>
                    <li>• Structured workout plan</li>
                    <li>• Achievement badges</li>
                    <li>• Progress statistics</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3"
            >
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg font-medium text-white bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleCommit}
                className="flex-1 px-4 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                I&apos;m Ready
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChallengeCommitment;
