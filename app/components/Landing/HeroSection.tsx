'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-gray-900 to-gray-900" />

      {/* Content container */}
      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Transform Your Fitness with </span>
              <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                AI-Powered Training
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Experience personalized workouts, real-time form correction, and AI-driven progress tracking. Your journey to peak fitness starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-violet-700 transition-all duration-300 transform hover:scale-105"
              >
                Start Your Journey
              </button>
              <a
                href="#features"
                className="px-8 py-4 border-2 border-purple-500/30 text-white rounded-lg font-semibold text-lg hover:bg-purple-500/10 transition-all duration-300"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Image/Visual content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative h-[400px] lg:h-[600px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-violet-500/30 rounded-2xl overflow-hidden">
              <Image
                src="/images/hero-fitness.jpg"
                alt="AI Fitness Training"
                fill
                style={{ objectFit: 'cover' }}
                className="mix-blend-overlay"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-purple-500 rounded-full flex justify-center">
          <motion.div
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="w-2 h-2 bg-purple-500 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
