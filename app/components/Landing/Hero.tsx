import { motion } from 'framer-motion';

interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900" />
      
      {/* Animated Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-white mb-6"
        >
          Transform Your Fitness Journey
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
        >
          Personalized workouts, expert guidance, and progress tracking - all in one place.
          Start your journey to a healthier you today.
        </motion.p>

        <motion.button
          onClick={onStart}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-purple-600 text-white px-8 py-4 rounded-full font-semibold
                   hover:bg-purple-700 transition-colors shadow-lg"
        >
          Start Your Journey
        </motion.button>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-purple-500/20 rounded-full blur-sm animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-8 h-8 bg-blue-500/20 rounded-full blur-sm animate-float-delayed" />
      </motion.div>
    </div>
  );
}
