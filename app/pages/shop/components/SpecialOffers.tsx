'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import Image from 'next/image';

interface Offer {
  id: string;
  title: string;
  description: string;
  offerPercentage: string;
  imageUrl: string;
}

const SpecialOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const bannersRef = collection(db, 'products/8TcnkctzluwJkpSeeS6B/banners');
        const snapshot = await getDocs(bannersRef);
        const fetchedOffers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Offer[];
        setOffers(fetchedOffers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching offers:', err);
        setError('Failed to load special offers');
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
      },
    }),
  };

  const paginate = (newDirection: number) => {
    if (offers.length === 0) return;
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = offers.length - 1;
      if (nextIndex >= offers.length) nextIndex = 0;
      return nextIndex;
    });
  };

  useEffect(() => {
    if (offers.length === 0) return;
    const timer = setInterval(() => paginate(1), 5000);
    return () => clearInterval(timer);
  }, [offers]);

  if (loading) {
    return (
      <div className="h-[300px] rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading offers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[300px] rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
        <div className="text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (offers.length === 0) {
    return null;
  }

  return (
    <div className="px-0 sm:px-4 py-6">
      <style jsx>{`
        .banner-shadow {
          box-shadow: 
            0 10px 30px -5px rgba(0, 0, 0, 0.15),
            0 20px 60px -10px rgba(0, 0, 0, 0.1);
        }
        .banner-inner-shadow {
          box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      <div className="relative h-[200px] sm:h-[250px] w-full overflow-hidden rounded-[10px] sm:rounded-[2rem] banner-shadow transition-all duration-300 hover:banner-shadow-hover">
        <div className="absolute inset-0 banner-inner-shadow z-10"></div>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            <div className="relative w-full h-full group cursor-pointer">
              {/* Background Image with Zoom Effect */}
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <Image
                  src={offers[currentIndex].imageUrl}
                  alt={offers[currentIndex].title}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
              
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              {/* Navigation Arrows with Glass Effect */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(-1);
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transform hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-20"
                aria-label="Previous offer"
              >
                <FaArrowLeft className="text-white text-sm sm:text-xl" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(1);
                }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transform hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-20"
                aria-label="Next offer"
              >
                <FaArrowRight className="text-white text-sm sm:text-xl" />
              </button>

              {/* Content */}
              <div className="relative h-full flex flex-col justify-center p-4 sm:p-8 md:p-12 z-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-2xl"
                >
                  {/* Discount Badge with Glass Effect */}
                  <motion.div 
                    className="inline-block px-3 sm:px-4 py-1 sm:py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-2 sm:mb-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-lg sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                      {offers[currentIndex].offerPercentage}% OFF
                    </span>
                  </motion.div>

                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 text-white leading-tight drop-shadow-lg">
                    {offers[currentIndex].title}
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6 max-w-xl line-clamp-2 sm:line-clamp-none drop-shadow">
                    {offers[currentIndex].description}
                  </p>

                  <motion.button 
                    className="flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/95 backdrop-blur-md text-gray-900 rounded-full font-semibold hover:bg-white transform hover:scale-105 transition-all shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaShoppingCart className="text-base sm:text-lg" />
                    <span>Shop Now</span>
                  </motion.button>
                </motion.div>
              </div>

              {/* Progress Bar with Glass Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 sm:h-1.5 bg-white/10 backdrop-blur-sm">
                <motion.div
                  className="h-full bg-white/80"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  key={`progress-${currentIndex}`}
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators with Glass Effect */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {offers.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 backdrop-blur-sm ${
                index === currentIndex 
                  ? 'bg-white/90 w-6 sm:w-8 shadow-sm' 
                  : 'bg-white/30 w-1.5 sm:w-2 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecialOffers;
