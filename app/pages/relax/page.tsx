'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface OnboardingStep {
  title: string;
  description: string;
  image: string;
  bgColor: string;
  soundEffect?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: 'Sleep Sounds',
    description: 'Fall asleep with natural sounds for a better dream',
    image: '/images/relax/sleep-bg.jpg',
    bgColor: 'from-black/30 to-black/60',
    soundEffect: '/sounds/gentle-rain.mp3'
  },
  {
    title: 'Meditation',
    description: 'Find peace with guided meditation sessions',
    image: '/images/relax/meditation-bg.jpg',
    bgColor: 'from-black/30 to-black/60',
    soundEffect: '/sounds/soft-bells.mp3'
  }
];

// Sound wave animation variants
const waveVariants = {
  animate: (i: number) => ({
    scaleY: [0.4, 1, 0.4],
    transition: {
      duration: 1,
      repeat: Infinity,
      delay: i * 0.1,
    },
  }),
};

export default function RelaxPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize and auto-play audio for current step
    if (onboardingSteps[currentStep].soundEffect) {
      const newAudio = new Audio(onboardingSteps[currentStep].soundEffect);
      newAudio.loop = true;
      newAudio.volume = 0.3;
      setAudio(newAudio);
      newAudio.play().catch(console.error);
      return () => {
        newAudio.pause();
        newAudio.currentTime = 0;
      };
    }
  }, [currentStep]);

  const handleContinue = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/pages/relax/sounds');
    }
  };

  const handlePrevious = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Background Image with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.1, opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <Image
            src={onboardingSteps[currentStep].image}
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          {/* Dark Overlay with Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-b ${onboardingSteps[currentStep].bgColor}`} />
        </motion.div>
      </AnimatePresence>

      {/* Fixed Content Container */}
      <div className="fixed inset-0 flex flex-col items-center justify-center px-6">
        {/* Sound Wave Animation */}
        <div className="flex items-center justify-center space-x-1 mb-12">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={waveVariants}
              animate="animate"
              className="w-1 h-12 bg-yellow-400/80 rounded-full origin-center"
              style={{
                height: `${Math.sin((i / 12) * Math.PI) * 48 + 24}px`,
              }}
            />
          ))}
        </div>

        {/* Center Content with Floating Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center relative"
        >
          {/* Glowing Circle Behind Title */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-yellow-400/20 rounded-full filter blur-3xl"
          />

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-bold text-white mb-6"
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}
          >
            {onboardingSteps[currentStep].title}
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-xl text-gray-100 mb-12 max-w-md mx-auto"
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            {onboardingSteps[currentStep].description}
          </motion.p>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-4 mb-12">
            {onboardingSteps.map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: index === currentStep ? [1, 1.2, 1] : 1,
                  opacity: index === currentStep ? 1 : 0.5
                }}
                transition={index === currentStep ? {
                  scale: {
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  }
                } : {}}
                className={`w-4 h-4 rounded-full ${
                  index === currentStep ? 'bg-yellow-400' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="fixed bottom-24 left-0 right-0 flex justify-center items-center space-x-4 px-6">
            {currentStep > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrevious}
                className="bg-white/20 backdrop-blur-sm text-white px-12 py-4 rounded-full text-lg font-semibold 
                         hover:bg-white/30 transition-all duration-300 shadow-lg relative overflow-hidden group"
              >
                <span className="relative z-10">Previous</span>
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.3, 0.2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-white/10 rounded-full filter blur-md"
                />
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleContinue}
              className="bg-yellow-400 text-gray-900 px-12 py-4 rounded-full text-lg font-semibold 
                       hover:bg-yellow-300 transition-all duration-300 shadow-lg relative overflow-hidden group"
            >
              <span className="relative z-10">{currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Continue'}</span>
              <motion.div
                animate={{
                  x: ['0%', '100%'],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                           skew-x-12 group-hover:via-white/40"
              />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-yellow-300 rounded-full filter blur-md opacity-20"
              />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
