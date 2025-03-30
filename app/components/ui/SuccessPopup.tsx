import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import confetti from 'canvas-confetti';

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function SuccessPopup({ isOpen, onClose, message }: SuccessPopupProps) {
  if (isOpen) {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-md w-full relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -right-4 -top-4 w-32 h-32 bg-gradient-to-br from-green-200 to-green-300 dark:from-green-500/20 dark:to-green-600/20 rounded-full opacity-50"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -left-4 -bottom-4 w-24 h-24 bg-gradient-to-tr from-teal-200 to-teal-300 dark:from-teal-500/20 dark:to-teal-600/20 rounded-full opacity-50"
              />
            </div>

            {/* Content */}
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5, delay: 0.1 }}
                className="mx-auto w-16 h-16 mb-4 text-green-500 dark:text-green-400"
              >
                <FaCheckCircle className="w-full h-full" />
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2"
              >
                Thank You!
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-gray-600 dark:text-gray-300 mb-6"
              >
                {message}
              </motion.p>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium rounded-xl transition-all"
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
