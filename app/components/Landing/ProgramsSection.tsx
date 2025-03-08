'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

const programs = [
  {
    title: "Strength Training",
    description: "Build muscle and increase strength with our comprehensive weight training programs",
    image: "/images/strength-training.jpg",
    features: ["Personalized weight progression", "Form correction", "Recovery tracking"]
  },
  {
    title: "HIIT Workouts",
    description: "Burn fat and improve cardiovascular fitness with high-intensity interval training",
    image: "/images/hiit-workout.jpg",
    features: ["Customized intervals", "Calorie tracking", "Performance metrics"]
  },
  {
    title: "Yoga & Flexibility",
    description: "Enhance flexibility, balance, and mindfulness with guided yoga sessions",
    image: "/images/yoga-fitness.jpg",
    features: ["Pose guidance", "Breathing exercises", "Meditation sessions"]
  },
  {
    title: "Cardio Endurance",
    description: "Boost your stamina and endurance with personalized cardio programs",
    image: "/images/cardio-training.jpg",
    features: ["Heart rate zones", "Distance tracking", "Endurance building"]
  }
];

const ProgramsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section id="programs" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Training Programs
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose from our diverse range of AI-powered training programs tailored to your goals
          </p>
        </motion.div>

        {/* Programs Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {programs.map((program, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-transform duration-300"
            >
              <div className="relative h-48">
                <Image
                  src={program.image}
                  alt={program.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-white mb-3">
                  {program.title}
                </h3>
                <p className="text-gray-400 mb-4">
                  {program.description}
                </p>
                <ul className="space-y-2">
                  {program.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-300">
                      <svg
                        className="w-5 h-5 text-purple-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProgramsSection;
