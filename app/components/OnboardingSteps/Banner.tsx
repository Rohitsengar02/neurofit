import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Banner({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-500 to-purple-600 text-white p-4"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold mb-6">Transform Your Life</h1>
        <p className="text-xl mb-8">Your AI-Powered Personal Fitness Journey Begins Here</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
        >
          Get Started
        </motion.button>
      </motion.div>
    </motion.div>
  );
}