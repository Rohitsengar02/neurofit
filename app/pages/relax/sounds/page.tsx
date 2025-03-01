'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaPlay, FaPause, FaEllipsisV, FaBrain, FaChevronLeft, FaChevronRight, FaTimes, FaLeaf, FaWind } from 'react-icons/fa';
import { BsMoonStars, BsWind } from 'react-icons/bs';
import { GiMeditation, GiLotus } from 'react-icons/gi';
import { fetchVideos, type YouTubeVideo, type VideoCategory } from '@/app/services/youtube';
import VideoPlayer from '@/app/components/VideoPlayer';

interface SoundCategory {
  id: VideoCategory;
  name: string;
  icon: React.ElementType;
  description: string;
  gradient: string;
}

interface SoundItem {
  id: string;
  title: string;
  artist: string;
  image: string;
  duration: string;
  audioSrc: string;
}

interface Banner {
  id: string;
  title: string;
  description: string;
  image: string;
  color: string;
}

const banners = [
  {
    title: 'Discover Inner Peace',
    description: 'Explore our collection of meditation and mindfulness content',
    image: '/images/meditation-bg.jpg', // Serene meditation scene with lotus and calm water
    color: 'from-purple-600 to-blue-500'
  },
  {
    title: 'Sleep Better Tonight',
    description: 'Soothing sounds and stories for a peaceful night\'s rest',
    image: '/images/sleep-bg.jpg', // Starry night sky with moon
    color: 'from-indigo-600 to-purple-500'
  },
  {
    title: 'Focus & Productivity',
    description: 'Enhance your concentration with ambient sounds',
    image: '/images/focus-bg.jpg', // Abstract flowing patterns or peaceful workspace
    color: 'from-blue-600 to-cyan-500'
  }
];

const categories: SoundCategory[] = [
  { 
    id: 'focus' as VideoCategory, 
    name: 'Focus', 
    icon: FaBrain,
    description: 'Boost your concentration',
    gradient: 'from-blue-500 to-indigo-500'
  },
  { 
    id: 'sleep' as VideoCategory, 
    name: 'Sleep', 
    icon: BsMoonStars,
    description: 'Peaceful night rest',
    gradient: 'from-purple-500 to-pink-500'
  },
  { 
    id: 'meditate' as VideoCategory, 
    name: 'Meditate', 
    icon: GiMeditation,
    description: 'Find inner peace',
    gradient: 'from-amber-500 to-orange-500'
  },
  { 
    id: 'nature' as VideoCategory, 
    name: 'Nature', 
    icon: FaLeaf,
    description: 'Calming nature sounds',
    gradient: 'from-green-500 to-emerald-500'
  },
  { 
    id: 'yoga' as VideoCategory, 
    name: 'Yoga', 
    icon: GiLotus,
    description: 'Mind-body harmony',
    gradient: 'from-rose-500 to-red-500'
  },
  { 
    id: 'breath' as VideoCategory, 
    name: 'Breathing', 
    icon: BsWind,
    description: 'Conscious breathing',
    gradient: 'from-cyan-500 to-blue-500'
  },
];

const featuredSounds: SoundItem[] = [
  {
    id: 'rain-leaves',
    title: 'Rain on Leaves',
    artist: 'Nature Sounds',
    image: '/images/relax/rain-leaves.jpg',
    duration: '3:30',
    audioSrc: '/sounds/rain-leaves.mp3'
  },
  {
    id: 'deep-rest',
    title: 'Deep Rest',
    artist: 'Calm Mind',
    image: '/images/relax/deep-rest.jpg',
    duration: '5:00',
    audioSrc: '/sounds/deep-rest.mp3'
  },
  {
    id: 'in-balance',
    title: 'In Balance',
    artist: 'Sarah Flow',
    image: '/images/relax/in-balance.jpg',
    duration: '4:15',
    audioSrc: '/sounds/in-balance.mp3'
  },
  {
    id: 'breathe-love',
    title: 'Breathe of Love',
    artist: 'Suzanne Teng',
    image: '/images/relax/breathe-love.jpg',
    duration: '6:20',
    audioSrc: '/sounds/breathe-love.mp3'
  },
  {
    id: 'at-ease',
    title: 'At Ease',
    artist: 'Mind Space',
    image: '/images/relax/at-ease.jpg',
    duration: '4:45',
    audioSrc: '/sounds/at-ease.mp3'
  },
];

const generateLoadingKey = (index: number, prefix: string) => `${prefix}-${index}-${Date.now()}`;

export default function RelaxSoundsPage() {
  const [activeCategory, setActiveCategory] = useState<VideoCategory>('focus');
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const bannerControls = useAnimation();

  const loadVideos = async (pageToken?: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await fetchVideos(activeCategory, pageToken);
      
      if (pageToken) {
        // Filter out any duplicate videos by ID
        const newVideos = response.videos.filter(
          newVideo => !videos.some(existingVideo => existingVideo.id === newVideo.id)
        );
        setVideos(prev => [...prev, ...newVideos]);
      } else {
        setVideos(response.videos);
      }
      
      setNextPageToken(response.nextPageToken || undefined);
      setHasMore(!!response.nextPageToken);
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load videos. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset and load new videos when category changes
  useEffect(() => {
    setVideos([]);
    setNextPageToken(undefined);
    setHasMore(true);
    loadVideos();
  }, [activeCategory]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadVideos(nextPageToken);
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [nextPageToken, hasMore, isLoading, activeCategory]);

  const nextBanner = async () => {
    await bannerControls.start({ x: '-100%', transition: { duration: 0.5 } });
    setCurrentBanner((prev) => (prev + 1) % banners.length);
    await bannerControls.start({ x: '100%', transition: { duration: 0 } });
    await bannerControls.start({ x: 0, transition: { duration: 0.5 } });
  };

  const prevBanner = async () => {
    await bannerControls.start({ x: '100%', transition: { duration: 0.5 } });
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
    await bannerControls.start({ x: '-100%', transition: { duration: 0 } });
    await bannerControls.start({ x: 0, transition: { duration: 0.5 } });
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleVideoPlay = (videoId: string) => {
    setSelectedVideo(videoId);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Banners Section */}
        <div className="relative mb-12 overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]">
          <div className="relative h-[300px] w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBanner}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${banners[currentBanner].color} opacity-90 shadow-lg`} />
                <Image
                  src={banners[currentBanner].image}
                  alt={banners[currentBanner].title}
                  fill
                  className="object-cover mix-blend-overlay"
                  priority
                />
                <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/50 via-black/30 to-transparent">
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-3xl font-bold text-white mb-3 drop-shadow-lg"
                  >
                    {banners[currentBanner].title}
                  </motion.h2>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-lg text-white/90 drop-shadow-md"
                  >
                    {banners[currentBanner].description}
                  </motion.p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="absolute inset-y-0 left-4 flex items-center">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                whileTap={{ scale: 0.9 }}
                onClick={prevBanner}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)]"
              >
                <FaChevronLeft className="w-6 h-6" />
              </motion.button>
            </div>
            <div className="absolute inset-y-0 right-4 flex items-center">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                whileTap={{ scale: 0.9 }}
                onClick={nextBanner}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)]"
              >
                <FaChevronRight className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
              {banners.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentBanner ? 'bg-white scale-125 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/50'
                  } transition-all duration-300`}
                  whileHover={{ scale: 1.2 }}
                  animate={index === currentBanner ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="relative mb-12">
          {/* Left Scroll Button */}
          <AnimatePresence>
            {showLeftScroll && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => scroll('left')}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 hover:shadow-xl transition-shadow"
              >
                <FaChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Categories Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex space-x-6 overflow-x-auto scrollbar-hide py-4 px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-shrink-0 w-24 h-24 rounded-full overflow-hidden relative
                  ${activeCategory === category.id 
                    ? 'ring-4 ring-offset-4 ring-green-500 dark:ring-offset-gray-900'
                    : 'hover:ring-2 hover:ring-offset-2 hover:ring-green-400/50 dark:ring-offset-gray-900'
                  } transition-all duration-300 shadow-lg`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90`} />
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-2">
                  <category.icon className="w-8 h-8 mb-1" />
                  <h3 className="text-sm font-medium">{category.name}</h3>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right Scroll Button */}
          <AnimatePresence>
            {showRightScroll && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => scroll('right')}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 hover:shadow-xl transition-shadow"
              >
                <FaChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Content Section */}
        <div className="space-y-8">
          <motion.div
            layout
            className="grid grid-cols-1 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {videos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                >
                  <VideoPlayer
                    video={video}
                    onPlay={handleVideoPlay}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading More Indicator */}
            <div ref={observerTarget} className="w-full py-4">
              {isLoading && (
                <div className="flex items-center justify-center space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={generateLoadingKey(i, 'loading-dot')}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{
                        y: ['0%', '-50%', '0%'],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.1,
                        repeat: Infinity
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4"
              >
                <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setError(null);
                    loadVideos(nextPageToken);
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
                >
                  Try Again
                </motion.button>
              </motion.div>
            )}

            {/* End of Results Message */}
            {!hasMore && videos.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4 text-gray-500 dark:text-gray-400"
              >
                No more videos to load
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Video Modal */}
        <AnimatePresence>
          {selectedVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            >
              <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedVideo(null)}
                  className="absolute -top-12 right-0 text-white p-2"
                >
                  <FaTimes className="w-6 h-6" />
                </motion.button>
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-xl"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
