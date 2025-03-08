'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiActivity, FiCpu, FiClock, FiTrendingUp, FiUsers, FiAward, FiHeart, FiShield } from 'react-icons/fi';

const features = [
  {
    icon: FiCpu,
    title: "AI-Powered Training",
    description: "Advanced algorithms create personalized workout plans tailored to your goals and fitness level.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: FiActivity,
    title: "Real-time Form Analysis",
    description: "Get instant feedback on your exercise form to maximize results and prevent injuries.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: FiTrendingUp,
    title: "Progress Tracking",
    description: "Visualize your fitness journey with detailed analytics and performance metrics.",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: FiClock,
    title: "Flexible Scheduling",
    description: "Work out on your own time with 24/7 access to personalized training sessions.",
    gradient: "from-green-500 to-teal-500"
  },
  {
    icon: FiUsers,
    title: "Community Support",
    description: "Connect with like-minded fitness enthusiasts and share your achievements.",
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    icon: FiAward,
    title: "Achievement System",
    description: "Stay motivated with rewards and badges as you reach your fitness milestones.",
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    icon: FiHeart,
    title: "Health Integration",
    description: "Sync with your favorite health apps for comprehensive fitness tracking.",
    gradient: "from-pink-500 to-rose-500"
  },
  {
    icon: FiShield,
    title: "Expert Guidance",
    description: "Access to certified trainers and nutrition experts for professional advice.",
    gradient: "from-emerald-500 to-green-500"
  }
];

const FeaturesSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="features" className="py-20 bg-gray-900 relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-yellow-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Cutting-Edge Features
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Experience the future of fitness with our innovative technology and personalized approach
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.6,
                    ease: "easeOut"
                  }
                }
              }}
              className="group relative"
            >
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 h-full transform transition-all duration-300 group-hover:scale-105 group-hover:bg-gray-800/70 border border-gray-700/50">
                {/* Feature Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 flex items-center justify-center transform transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Feature Content */}
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <button className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 group">
            <span className="relative z-10">Start Your Journey Now</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </motion.div>
      </div>

      {/* Add keyframes for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default FeaturesSection;
