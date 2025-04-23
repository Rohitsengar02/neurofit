'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaCalendarCheck, FaFire, FaDumbbell, FaBolt, FaHeartbeat } from 'react-icons/fa';
import { GiTrophyCup } from 'react-icons/gi';
import { Workout } from '@/app/types/workout';
import Confetti from 'react-confetti';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface WorkoutCommitmentProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit: () => Promise<string | undefined>;
  workout: Workout;
  workoutId: string;
}

const WorkoutCommitment: React.FC<WorkoutCommitmentProps> = ({
  isOpen,
  onClose,
  onCommit,
  workout,
  workoutId,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [stage, setStage] = useState(0);
  const router = useRouter();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleCommit = async () => {
    setStage(1);
    setTimeout(() => {
      setShowConfetti(true);
      setTimeout(() => {
        setStage(2);
        setTimeout(async () => {
          // Call onCommit and wait for the result which should be the new active workout ID
          const result = await onCommit();
          // Use the returned ID if available, otherwise fall back to the provided workoutId
          const activeWorkoutId = result || workoutId;
          console.log('Redirecting to workout days with ID:', activeWorkoutId);
          if (activeWorkoutId) {
            router.push(`/workout/days/${activeWorkoutId}`);
          } else {
            console.error('No valid workout ID available for redirection');
          }
        }, 2000);
      }, 2000);
    }, 500);
  };

  const stageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  };

  const floatAnimation = {
    y: [-4, 4, -4],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={stage === 0 ? onClose : undefined}
        >
          {showConfetti && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={200}
              gravity={0.2}
            />
          )}
          
          <AnimatePresence mode="wait">
            {stage === 0 && (
              <motion.div
                key="stage0"
                variants={stageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="relative h-40 mb-6 rounded-xl overflow-hidden">
                  <Image
                    src={workout.imageUrl || '/images/workout-default.jpg'}
                    alt={workout.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                    <div className="p-4">
                      <h2 className="text-2xl font-bold text-white">{workout.title}</h2>
                      <p className="text-gray-300">{workout.level} • {workout.days} days</p>
                    </div>
                  </div>
                </div>

                <motion.h2
                  animate={pulseAnimation}
                  className="text-2xl font-bold text-center text-white mb-6"
                >
                  Ready to Begin Your Fitness Journey?
                </motion.h2>

                <motion.div
                  className="space-y-4 mb-6"
                >
                  <div className="bg-gray-800/50 rounded-lg p-4 flex items-start space-x-3">
                    <FaCalendarCheck className="text-green-500 text-xl mt-1" />
                    <div>
                      <h3 className="font-semibold text-white">Duration</h3>
                      <p className="text-gray-300 text-sm">{workout.days} days with structured progression</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4 flex items-start space-x-3">
                    <FaFire className="text-orange-500 text-xl mt-1" />
                    <div>
                      <h3 className="font-semibold text-white">Intensity</h3>
                      <p className="text-gray-300 text-sm">Burns approximately {workout.caloriesPerDay} calories per day</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4 flex items-start space-x-3">
                    <FaCheckCircle className="text-blue-500 text-xl mt-1" />
                    <div>
                      <h3 className="font-semibold text-white">What You&apos;ll Get</h3>
                      <ul className="text-gray-300 text-sm space-y-1 mt-1">
                        <li>• Daily exercise guidance</li>
                        <li>• Progress tracking</li>
                        <li>• Animated exercise demonstrations</li>
                        <li>• Achievement badges</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>

                <motion.div
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
                    className="flex-1 px-4 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all"
                  >
                    I&apos;m Ready
                  </button>
                </motion.div>
              </motion.div>
            )}

            {stage === 1 && (
              <motion.div
                key="stage1"
                variants={stageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center justify-center"
                onClick={e => e.stopPropagation()}
              >
                <motion.div
                  animate={floatAnimation}
                  className="text-6xl text-purple-500 mb-6"
                >
                  <FaDumbbell />
                </motion.div>
                <motion.h2
                  animate={pulseAnimation}
                  className="text-3xl font-bold text-center text-white mb-4"
                >
                  Awesome!
                </motion.h2>
                <p className="text-gray-300 text-center mb-6">
                  Your {workout.days}-day fitness journey is about to begin. Get ready for transformation!
                </p>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex space-x-2 text-2xl"
                >
                  <FaHeartbeat className="text-red-500" />
                  <FaBolt className="text-yellow-500" />
                  <FaFire className="text-orange-500" />
                </motion.div>
              </motion.div>
            )}

            {stage === 2 && (
              <motion.div
                key="stage2"
                variants={stageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center justify-center"
                onClick={e => e.stopPropagation()}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="text-6xl text-yellow-500 mb-6"
                >
                  <GiTrophyCup />
                </motion.div>
                <motion.h2
                  className="text-3xl font-bold text-center text-white mb-4"
                >
                  Let&apos;s Go!
                </motion.h2>
                <p className="text-gray-300 text-center">
                  Redirecting you to your workout plan...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorkoutCommitment;
