'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaPlay, FaPause, FaRedo } from 'react-icons/fa';
import CardWrapper from './CardWrapper';

const AnimatedWorkoutTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(1800); // 30 minutes in seconds
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (time / 1800) * 100;

  return (
    <CardWrapper title="Workout Timer" icon={<FaClock />}>
      <div className="space-y-4">
        <div className="relative h-40 w-40 mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-blue-500"
              strokeDasharray={`${2 * Math.PI * 70}`}
              initial={{ strokeDashoffset: 0 }}
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 70 * (1 - progress / 100) 
              }}
              transition={{ duration: 0.5 }}
            />
          </svg>

          {/* Time Display */}
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-gray-700"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {formatTime(time)}
          </motion.div>

          {/* Hover Controls */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex space-x-4">
                  {isRunning ? (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsRunning(false)}
                      className="p-2 bg-white rounded-full text-red-500 shadow-lg"
                    >
                      <FaPause />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsRunning(true)}
                      className="p-2 bg-white rounded-full text-green-500 shadow-lg"
                    >
                      <FaPlay />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setTime(1800);
                      setIsRunning(false);
                    }}
                    className="p-2 bg-white rounded-full text-blue-500 shadow-lg"
                  >
                    <FaRedo />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Text */}
        <motion.div 
          className="text-center text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isRunning ? 'Workout in progress' : 'Ready to start'}
        </motion.div>
      </div>
    </CardWrapper>
  );
};

export default AnimatedWorkoutTimer;
