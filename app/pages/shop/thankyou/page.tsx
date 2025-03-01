'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiShoppingBag, FiPackage, FiArrowRight, FiCheck } from 'react-icons/fi';

export default function ThankYouPage() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full space-y-8 text-center"
      >
        {/* Success Icon */}
        <motion.div
          variants={itemVariants}
          className="mx-auto"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="w-16 h-16 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center"
              >
                <FiCheck className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="absolute -right-2 -top-2 w-8 h-8 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center"
            >
              <FiPackage className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Thank You Message */}
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Thank You for Your Order!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your order has been successfully placed and will be processed soon.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="mt-8 space-y-4">
          <Link 
            href="/pages/shop/orders"
            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-800 hover:shadow-lg transition-all duration-200"
          >
            <FiPackage className="w-5 h-5 mr-2" />
            View My Orders
          </Link>
          
          <Link 
            href="/pages/shop"
            className="w-full flex items-center justify-center px-8 py-3 border-2 border-purple-600 dark:border-purple-500 text-base font-medium rounded-md text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
          >
            <FiShoppingBag className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
        </motion.div>

        {/* Order Tips */}
        <motion.div
          variants={itemVariants}
          className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg space-y-3"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">What's Next?</h3>
          <ul className="space-y-2 text-left">
            {[
              'You will receive an order confirmation email shortly',
              'Track your order status in the Orders page',
              'We will notify you when your order ships',
              'Prepare for delivery within 3-5 business days'
            ].map((tip, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-start text-sm text-gray-600 dark:text-gray-300"
              >
                <FiArrowRight className="w-5 h-5 mr-2 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{tip}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
