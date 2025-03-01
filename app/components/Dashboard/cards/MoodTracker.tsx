'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSmile } from 'react-icons/fa';

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState(3);
  const moods = [
    { emoji: '😔', label: 'Sad', color: 'from-blue-400 to-blue-600' },
    { emoji: '😕', label: 'Meh', color: 'from-purple-400 to-purple-600' },
    { emoji: '😊', label: 'Good', color: 'from-green-400 to-green-600' },
    { emoji: '😄', label: 'Great', color: 'from-yellow-400 to-yellow-600' },
    { emoji: '🤩', label: 'Amazing', color: 'from-orange-400 to-orange-600' },
  ];

  // Animation variants for the wave background
  const waveVariants = {
    animate: {
      x: [0, -100],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  // Demo mood history data
  const moodHistory = [
    { id: 1, mood: 'Happy', icon: FaSmile, color: 'text-yellow-400', time: '2:30 PM', date: 'Today', note: 'Great workout session!' },
    { id: 2, mood: 'Neutral', icon: FaSmile, color: 'text-blue-400', time: '9:00 AM', date: 'Today', note: 'Regular morning routine' },
    { id: 3, mood: 'Happy', icon: FaSmile, color: 'text-yellow-400', time: '8:00 PM', date: 'Yesterday', note: 'Enjoyed dinner with friends' },
    { id: 4, mood: 'Sad', icon: FaSmile, color: 'text-purple-400', time: '3:00 PM', date: 'Yesterday', note: 'Missed workout goal' },
    { id: 5, mood: 'Happy', icon: FaSmile, color: 'text-yellow-400', time: '11:00 AM', date: '2 days ago', note: 'Productive morning' },
    { id: 6, mood: 'Neutral', icon: FaSmile, color: 'text-blue-400', time: '4:00 PM', date: '2 days ago', note: 'Regular day at work' }
  ];

  const moodOptions = [
    { mood: 'Happy', icon: FaSmile, color: 'text-yellow-400' },
    { mood: 'Neutral', icon: FaSmile, color: 'text-blue-400' },
    { mood: 'Sad', icon: FaSmile, color: 'text-purple-400' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-800 rounded-2xl p-6 text-white"
    >
      {/* Animated wave background */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          variants={waveVariants}
          animate="animate"
          className="absolute inset-0 w-[200%]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 120\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z\' fill=\'%23FFFFFF\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat-x',
            height: '100%',
          }}
        />
      </div>

      {/* Card Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <FaSmile className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold">Mood Tracker</h3>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl"
          >
            {moods[selectedMood].emoji}
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Mood Selection */}
          <div className="grid grid-cols-5 gap-2">
            {moods.map((mood, index) => (
              <motion.button
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => setSelectedMood(index)}
                className={`relative aspect-square rounded-xl flex items-center justify-center text-2xl ${
                  selectedMood === index
                    ? 'bg-white/30 backdrop-blur-sm'
                    : 'bg-white/10 hover:bg-white/20'
                } transition-colors`}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: selectedMood === index ? [1, 1.2, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {mood.emoji}
                </motion.div>
                {selectedMood === index && (
                  <motion.div
                    layoutId="moodOutline"
                    className="absolute inset-0 rounded-xl border-2 border-white"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Mood History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
          >
            <div className="text-sm opacity-80 mb-3">Weekly Mood</div>
            <div className="flex items-end h-24 space-x-2">
              {[0.6, 0.8, 0.4, 0.9, 0.7, 0.5, 0.8].map((height, index) => (
                <motion.div
                  key={index}
                  className="flex-1 bg-white/20 rounded-t-lg"
                  initial={{ height: 0 }}
                  animate={{ height: `${height * 100}%` }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                >
                  <motion.div
                    className="w-full h-full"
                    style={{
                      background: `linear-gradient(to top, ${
                        index === 6 ? 'rgb(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'
                      })`
                    }}
                  />
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs opacity-60">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>
          </motion.div>

          {/* Mood Insights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMood}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm opacity-80"
              >
                {selectedMood === 4
                  ? "You're having an amazing day! Keep it up! 🌟"
                  : selectedMood === 3
                  ? "Great mood! Share your positivity! ✨"
                  : selectedMood === 2
                  ? "Good day ahead! Stay positive! 🌞"
                  : selectedMood === 1
                  ? "Take a moment to relax and recharge 🌱"
                  : "Remember, every day is a new beginning 💫"}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Mood History - Horizontally Scrollable */}
          <div className="relative z-10">
            <h4 className="text-sm font-medium mb-4">Mood History</h4>
            <div className="overflow-x-auto pb-4 -mx-6 px-6">
              <div className="flex space-x-4" style={{ minWidth: 'max-content' }}>
                {moodHistory.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center space-y-2"
                    style={{ minWidth: '160px' }}
                  >
                    <entry.icon className={`w-6 h-6 ${entry.color}`} />
                    <div className="text-sm font-medium">{entry.mood}</div>
                    <div className="text-xs opacity-80">{entry.time}</div>
                    <div className="text-xs opacity-60">{entry.date}</div>
                    <div className="text-xs text-center opacity-80 mt-2 px-2">{entry.note}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MoodTracker;
