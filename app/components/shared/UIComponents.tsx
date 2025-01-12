"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const GradientCard: React.FC<CardProps> = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`
      relative overflow-hidden rounded-2xl
      bg-gradient-to-br from-white to-gray-50
      dark:from-gray-800 dark:to-gray-900
      shadow-lg backdrop-blur-sm
      border border-gray-200 dark:border-gray-700
      ${className}
    `}
  >
    {children}
  </motion.div>
);

export const GradientButton: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  gradient?: string;
  className?: string;
}> = ({ 
  onClick, 
  children, 
  gradient = 'from-purple-500 to-indigo-500',
  className = ''
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`
      px-4 py-2 rounded-lg
      bg-gradient-to-r ${gradient}
      text-white font-medium
      shadow-lg shadow-indigo-500/20
      transition-all duration-200
      ${className}
    `}
  >
    {children}
  </motion.button>
);

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="min-h-screen w-full"
  >
    {children}
  </motion.div>
);
