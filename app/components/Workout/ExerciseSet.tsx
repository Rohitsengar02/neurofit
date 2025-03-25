'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaPause, FaRedo, FaTimes, FaDumbbell } from 'react-icons/fa';

interface ExerciseSetProps {
  setNumber: number;
  reps: number;
  weight: number;
  isCompleted: boolean;
  restTime: number;
  onUpdateSet: (updates: { reps?: number; weight?: number }) => void;
  onComplete: () => void;
  onRemove: () => void;
}

export default function ExerciseSet({
  setNumber,
  reps,
  weight,
  isCompleted,
  restTime,
  onUpdateSet,
  onComplete,
  onRemove
}: ExerciseSetProps) {
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(restTime);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setShowTimer(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const startTimer = () => {
    setTimeLeft(restTime);
    setShowTimer(true);
    setIsTimerRunning(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 rounded-xl border ${
          isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
        } transition-colors duration-300 hover:shadow-md`}
      >
        {/* Set Number */}
        <div className="flex items-center justify-between sm:justify-start sm:w-20">
          <span className="text-lg font-bold text-gray-700">
            Set {setNumber}
          </span>
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors sm:hidden"
          >
            <FaTimes />
          </button>
        </div>

        {/* Weight and Reps */}
        <div className="flex flex-1 items-center gap-4 sm:gap-6">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={weight || ''}
                onChange={(e) => onUpdateSet({ weight: e.target.value ? parseInt(e.target.value) : 0 })}
                className="w-full px-3 py-2 border rounded-xl text-center focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                min="0"
                placeholder="kg"
                disabled={isCompleted}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">kg</span>
            </div>
          </div>

          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={reps || ''}
                onChange={(e) => onUpdateSet({ reps: e.target.value ? parseInt(e.target.value) : 0 })}
                className="w-full px-3 py-2 border rounded-xl text-center focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                min="1"
                placeholder="reps"
                disabled={isCompleted}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">reps</span>
            </div>
          </div>
        </div>

        {/* Complete Button and Status */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          {!isCompleted ? (
            <button
              onClick={onComplete}
              className="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium shadow-sm hover:shadow"
            >
              Complete
            </button>
          ) : (
            <button
              onClick={startTimer}
              className="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-sm hover:shadow flex items-center justify-center gap-2"
            >
              <FaPlay className="text-sm" />
              Rest
            </button>
          )}
          <button
            onClick={onRemove}
            className="hidden sm:block text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showTimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              className="bg-white rounded-2xl p-8 w-full max-w-sm mx-4"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <div className="flex items-center justify-center mb-6">
                <FaDumbbell className="text-4xl text-blue-500 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
                Rest Timer
              </h3>
              <div className="text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 mb-8 font-mono">
                {formatTime(timeLeft)}
              </div>
              <div className="flex justify-center gap-4">
                {isTimerRunning ? (
                  <button
                    onClick={() => setIsTimerRunning(false)}
                    className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <FaPause />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsTimerRunning(true)}
                    className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <FaPlay />
                  </button>
                )}
                <button
                  onClick={() => {
                    setTimeLeft(restTime);
                    setIsTimerRunning(false);
                  }}
                  className="p-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <FaRedo />
                </button>
              </div>
              <button
                onClick={() => setShowTimer(false)}
                className="mt-8 w-full px-4 py-2 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Skip Rest
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
