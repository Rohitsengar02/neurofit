'use client';

import React from 'react';
import { motion } from 'framer-motion';
import DietPlanComponent from '../components/Diet/DietPlan';
import { predefinedDiets } from '../data/predefinedDiets';

export default function DietPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Personalized Diet Plans
        </h1>
        
        <DietPlanComponent predefinedDiets={predefinedDiets} />
      </motion.div>
    </div>
  );
}
