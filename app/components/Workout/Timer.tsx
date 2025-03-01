'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaMinus, FaPause, FaPlay } from 'react-icons/fa';

interface TimerProps {
  onComplete: () => void;
  initialTime?: number;
}

export default function Timer({ onComplete, initialTime = 45 }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete();
      return;
    }

    if (!isPaused) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, isPaused, onComplete]);

  const adjustTime = (seconds: number) => {
    setTimeLeft((prev) => Math.max(0, prev + seconds));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-600 to-blue-500 rounded-2xl shadow-lg"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="text-6xl font-bold text-white mb-8"
        animate={{ scale: timeLeft <= 10 ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
      >
        {formatTime(timeLeft)}
      </motion.div>

      <div className="flex gap-4 mb-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="bg-white/20 p-3 rounded-full text-white hover:bg-white/30 transition-colors"
          onClick={() => adjustTime(-5)}
        >
          <FaMinus size={24} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="bg-white/20 p-3 rounded-full text-white hover:bg-white/30 transition-colors"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? <FaPlay size={24} /> : <FaPause size={24} />}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="bg-white/20 p-3 rounded-full text-white hover:bg-white/30 transition-colors"
          onClick={() => adjustTime(5)}
        >
          <FaPlus size={24} />
        </motion.button>
      </div>

      <motion.div 
        className="w-full bg-white/20 h-2 rounded-full overflow-hidden"
      >
        <motion.div 
          className="h-full bg-white"
          initial={{ width: '100%' }}
          animate={{ width: `${(timeLeft / initialTime) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
}
