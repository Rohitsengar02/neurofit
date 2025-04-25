'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MindfulnessTracker from '@/app/components/Dashboard/cards/MindfulnessTracker';
import MoodTracker from '@/app/components/Dashboard/cards/MoodTracker';
import SleepQualityInsights from '@/app/components/Dashboard/cards/SleepQualityInsights';
import MeditationTracker from '@/app/components/Dashboard/cards/MeditationTracker';
import GratitudeJournal from '@/app/components/Dashboard/cards/GratitudeJournal';
import BreathingExercises from '@/app/components/Dashboard/cards/BreathingExercises';
import StressManagement from '@/app/components/Dashboard/cards/StressManagement';
import CognitiveTraining from '@/app/components/Dashboard/cards/CognitiveTraining';

export default function MentalHealthPage() {
  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Mental Health & Wellness
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <MindfulnessTracker />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SleepQualityInsights />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <MeditationTracker />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GratitudeJournal />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <BreathingExercises />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
             <StressManagement />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CognitiveTraining />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MoodTracker />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
          >
            <div className="text-center text-gray-600 dark:text-gray-300 py-8">
              <p className="text-lg mb-2">More mental health features coming soon...</p>
              <p className="text-sm">We're working on adding meditation guides, stress management tools, and more!</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
