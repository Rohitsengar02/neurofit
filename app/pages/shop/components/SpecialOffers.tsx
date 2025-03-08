'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { db } from '@/app/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { FiArrowRight, FiPercent, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Link from 'next/link';

interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  offerPercentage: number;
}

export default function SpecialOffers() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef);
  const controls = useAnimation();

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  useEffect(() => {
    if (!autoScroll || banners.length === 0) return;
    
    const interval = setInterval(() => {
      scrollTo('next');
    }, 5000);

    return () => clearInterval(interval);
  }, [autoScroll, currentIndex, banners.length]);

  const fetchBanners = async () => {
    try {
      const bannersRef = collection(db, 'products');
      const snapshot = await getDocs(bannersRef);
      const fetchedBanners: Banner[] = [];

      for (const doc of snapshot.docs) {
        const bannersCollectionRef = collection(doc.ref, 'banners');
        const bannersSnapshot = await getDocs(bannersCollectionRef);
        
        bannersSnapshot.docs.forEach((bannerDoc) => {
          const data = bannerDoc.data();
          fetchedBanners.push({
            id: bannerDoc.id,
            title: data.title || '',
            description: data.description || '',
            imageUrl: data.imageUrl || '',
            offerPercentage: data.offerPercentage || 0,
          });
        });
      }

      setBanners(fetchedBanners);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollTo = (direction: 'prev' | 'next') => {
    if (!sliderRef.current || banners.length === 0) return;
    
    const scrollAmount = sliderRef.current.offsetWidth;
    let newIndex = direction === 'next' 
      ? (currentIndex + 1) % (banners.length * 2) 
      : (currentIndex - 1 + banners.length * 2) % (banners.length * 2);

    // Handle infinite scroll effect
    if (newIndex >= banners.length) {
      newIndex = newIndex % banners.length;
    }
    
    sliderRef.current.scrollTo({
      left: newIndex * scrollAmount,
      behavior: 'smooth'
    });
    
    setCurrentIndex(newIndex);
  };

  // Duplicate banners for infinite scroll effect
  const allBanners = [...banners, ...banners];

  return (
    <div ref={containerRef} className="-mt-[15px] ">
      {loading ? (
        <div className="h-48 sm:h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
      ) : banners.length === 0 ? (
        <div className="h-48 sm:h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">No special offers available</p>
        </div>
      ) : (
        <div 
          className="relative group rounded-2xl overflow-hidden"
          style={{
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 20px 60px -10px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={() => setAutoScroll(false)}
          onMouseLeave={() => setAutoScroll(true)}
        >
          {/* Navigation Buttons */}
          <button
            onClick={() => scrollTo('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white dark:hover:bg-gray-800"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scrollTo('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white dark:hover:bg-gray-800"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>

          {/* Slider Container */}
          <div 
            ref={sliderRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            <div className="flex">
              {allBanners.map((banner, index) => (
                <div
                  key={`${banner.id}-${index}`}
                  className="flex-none w-full"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <Link href={`/shop/product/${banner.id}`}>
                    <motion.div 
                      className="relative h-48 sm:h-64 overflow-hidden cursor-pointer rounded-2xl"
                      style={{
                        backgroundImage: `url(${banner.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* Dynamic Shadow based on image */}
                      <div 
                        className="absolute inset-0 opacity-75"
                        style={{
                          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)',
                          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))'
                        }}
                      />
                      
                      {/* Content */}
                      <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between z-10">
                        <div>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center space-x-2 mb-2"
                          >
                            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center shadow-lg">
                              <FiPercent className="mr-1" />
                              {banner.offerPercentage}% OFF
                            </div>
                          </motion.div>
                          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg">{banner.title}</h3>
                          <p className="text-gray-200 text-sm sm:text-base line-clamp-2 max-w-xl drop-shadow">{banner.description}</p>
                        </div>
                        
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="flex items-center text-white group"
                        >
                          <span className="text-sm sm:text-base font-medium drop-shadow-lg">Shop Now</span>
                          <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </motion.div>
                      </div>
                    </motion.div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!sliderRef.current) return;
                  const newIndex = index % banners.length;
                  sliderRef.current.scrollTo({
                    left: newIndex * sliderRef.current.offsetWidth,
                    behavior: 'smooth'
                  });
                  setCurrentIndex(newIndex);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 shadow-lg ${
                  index === currentIndex % banners.length
                    ? 'bg-white w-6' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
