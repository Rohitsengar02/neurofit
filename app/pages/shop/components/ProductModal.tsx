'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaTimes, FaStar, FaHeart, FaShare, FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    description: string;
    rating: number;
    reviews: number;
    category: string;
  };
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Mock additional product images
  const productImages = [
    product.image,
    'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1607081759141-5035e0a710a8?auto=format&fit=crop&q=80',
  ];

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50
    }
  };

  const imageVariants = {
    hover: { scale: 1.05 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="fixed top-4 right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
            >
              <FaTimes className="text-gray-600 dark:text-gray-300" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 md:p-6">
              {/* Left Side - Images */}
              <div className="space-y-4">
                <motion.div 
                  className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700"
                  variants={imageVariants}
                  whileHover="hover"
                >
                  <Image
                    src={productImages[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </motion.div>

                {/* Thumbnail Images */}
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {productImages.map((img, index) => (
                    <motion.button
                      key={index}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden ${
                        selectedImage === index ? 'ring-2 ring-brown-500' : ''
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="sticky top-0 bg-white dark:bg-gray-800 pt-4 md:pt-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-brown-500 font-medium">{product.category}</span>
                    <div className="flex items-center space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsLiked(!isLiked)}
                        className={`p-2 rounded-full ${
                          isLiked ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        <FaHeart />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-full text-gray-400 dark:text-gray-500"
                      >
                        <FaShare />
                      </motion.button>
                    </div>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {product.name}
                  </h2>

                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`${
                            i < product.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          } text-sm md:text-base`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({product.reviews} reviews)
                    </span>
                  </div>
                </motion.div>

                <div className="space-y-6">
                  <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                    {product.description}
                  </p>

                  {/* Additional Product Details */}
                  <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Product Details</h3>
                    <ul className="space-y-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
                      <li>• Made with natural ingredients</li>
                      <li>• High in protein and fiber</li>
                      <li>• No artificial preservatives</li>
                      <li>• Suitable for vegetarians</li>
                    </ul>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700"
                        >
                          <FaMinus className="text-gray-600 dark:text-gray-300" />
                        </motion.button>
                        <span className="text-lg font-semibold text-gray-800 dark:text-white">
                          {quantity}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setQuantity(quantity + 1)}
                          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700"
                        >
                          <FaPlus className="text-gray-600 dark:text-gray-300" />
                        </motion.button>
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-brown-500">
                        ${(product.price * quantity).toFixed(2)}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-6 bg-brown-500 hover:bg-brown-600 text-white rounded-xl flex items-center justify-center space-x-2 transition-colors"
                    >
                      <FaShoppingCart />
                      <span>Add to Cart</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
