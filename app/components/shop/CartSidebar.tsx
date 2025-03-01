'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { IoClose } from 'react-icons/io5';
import { HiMinus, HiPlus, HiTrash } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';

export interface CartItem {
  id: string;
  name: string;
  mainImage: string;
  price: number;
  discountedPrice: number;
  quantity: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export default function CartSidebar({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity,
  onRemoveItem 
}: CartSidebarProps) {
  const router = useRouter();
  const totalAmount = cartItems.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);
  const totalSavings = cartItems.reduce((sum, item) => 
    sum + (item.price - item.discountedPrice) * item.quantity, 0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shopping Cart</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              >
                <IoClose className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 pb-32">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4 px-4">
                  {cartItems.map((item) => (
                    <motion.div 
                      key={item.id} 
                      className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg relative group"
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <Image
                          src={item.mainImage}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            ₹{item.discountedPrice.toLocaleString()}
                          </span>
                          {item.price > item.discountedPrice && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                              ₹{item.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                              disabled={item.quantity <= 1}
                            >
                              <HiMinus className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-900 dark:text-white w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            >
                              <HiPlus className="w-4 h-4" />
                            </button>
                          </div>
                          <motion.button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <HiTrash className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-4 mb-20">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Total Savings</span>
                    <span className="text-green-500">-₹{totalSavings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-gray-900 dark:text-white">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <button 
                  className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-brown-800 dark:via-brown-700 dark:to-brown-900 text-white py-3 rounded-full font-medium"
                  onClick={() => {
                    onClose();
                    router.push('/pages/shop/checkout');
                  }}
                >
                  Checkout Now
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
