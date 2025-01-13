'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-cards';
import { Pagination, EffectCards } from 'swiper/modules';
import Image from 'next/image';
import { FaRunning, FaDumbbell, FaHeart, FaFire, FaClock, FaSwimmer } from 'react-icons/fa';
import { MdFitnessCenter, MdSelfImprovement } from 'react-icons/md';
import { GiMountainClimbing, GiCycling, GiBoxingGlove } from 'react-icons/gi';

// Workout categories data
const workoutCategories = [
  {
    id: 'cardio',
    name: 'Cardio',
    icon: <FaRunning className="w-6 h-6" />,
    color: 'from-rose-400 to-red-500',
    workouts: [
      {
        id: 'cardio-1',
        title: '30-Day Runner',
        duration: '30-45 min',
        calories: '300-500',
        intensity: 'Progressive',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1740&auto=format&fit=crop',
        type: 'challenge',
        days: 30,
        description: 'Progressive running challenge for endurance'
      },
      {
        id: 'cardio-2',
        title: '21-Day HIIT',
        duration: '20-30 min',
        calories: '250-400',
        intensity: 'High',
        image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1740&auto=format&fit=crop',
        type: 'challenge',
        days: 21,
        description: 'High-intensity interval training challenge'
      },
      {
        id: 'cardio-3',
        title: 'Sprint Intervals',
        duration: '30 min',
        calories: '400',
        intensity: 'High',
        image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'speed',
        description: 'Alternating sprints and recovery periods'
      },
      {
        id: 'cardio-4',
        title: 'Endurance Run',
        duration: '60 min',
        calories: '600',
        intensity: 'Medium',
        image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'endurance',
        description: 'Long-distance endurance building run'
      },
      {
        id: 'cardio-5',
        title: 'Tabata Burn',
        duration: '25 min',
        calories: '300',
        intensity: 'Very High',
        image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'intensity',
        description: '20/10 intervals of high-intensity exercises'
      },
      {
        id: 'cardio-6',
        title: 'Hill Climber',
        duration: '45 min',
        calories: '500',
        intensity: 'High',
        image: 'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'strength-endurance',
        description: 'Uphill and downhill running intervals'
      },
      {
        id: 'cardio-7',
        title: 'Steady State',
        duration: '40 min',
        calories: '350',
        intensity: 'Medium',
        image: 'https://images.unsplash.com/photo-1538583297235-3e83d75c6d74?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'endurance',
        description: 'Consistent pace cardio for fat burning'
      }
    ]
  },
  {
    id: 'strength',
    name: 'Strength',
    icon: <FaDumbbell className="w-6 h-6" />,
    color: 'from-blue-400 to-indigo-500',
    workouts: [
      {
        id: 'strength-1',
        title: '30-Day Transform',
        duration: '45-60 min',
        calories: '400-600',
        intensity: 'Progressive',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1740&auto=format&fit=crop',
        type: 'challenge',
        days: 30,
        description: 'Complete body transformation challenge'
      },
      {
        id: 'strength-2',
        title: '21-Day Shred',
        duration: '40-50 min',
        calories: '450-550',
        intensity: 'High',
        image: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?q=80&w=1740&auto=format&fit=crop',
        type: 'challenge',
        days: 21,
        description: 'Intensive fat burn and muscle build program'
      },
      {
        id: 'strength-3',
        title: 'Full Body Power',
        duration: '60 min',
        calories: '500',
        intensity: 'High',
        image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'full-body',
        description: 'Complete full body workout with compound exercises'
      },
      {
        id: 'strength-4',
        title: 'Leg Day Pro',
        duration: '45 min',
        calories: '450',
        intensity: 'High',
        image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'legs',
        description: 'Intensive leg workout focusing on all major muscle groups'
      },
      {
        id: 'strength-5',
        title: 'Upper Body Beast',
        duration: '50 min',
        calories: '400',
        intensity: 'Medium-High',
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'upper-body',
        description: 'Complete upper body workout targeting all muscle groups'
      },
      {
        id: 'strength-6',
        title: 'Core Crusher',
        duration: '30 min',
        calories: '300',
        intensity: 'Medium',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'core',
        description: 'Intensive core and abs workout'
      },
      {
        id: 'strength-7',
        title: 'Chest & Triceps',
        duration: '45 min',
        calories: '400',
        intensity: 'High',
        image: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'chest-triceps',
        description: 'Focused chest and triceps workout for upper body power'
      },
      {
        id: 'strength-8',
        title: 'Back & Biceps',
        duration: '45 min',
        calories: '400',
        intensity: 'High',
        image: 'https://images.unsplash.com/photo-1603287681836-fd6e0b0e05e9?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'back-biceps',
        description: 'Complete back and biceps workout for strength'
      },
      {
        id: 'strength-9',
        title: 'Shoulders & Arms',
        duration: '40 min',
        calories: '350',
        intensity: 'Medium-High',
        image: 'https://images.unsplash.com/photo-1579758629938-03607ccdb2260?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'shoulders-arms',
        description: 'Focused shoulder and arm workout for definition'
      }
    ]
  },
  {
    id: 'yoga',
    name: 'Yoga',
    icon: <MdSelfImprovement className="w-6 h-6" />,
    color: 'from-purple-400 to-violet-500',
    workouts: [
      {
        id: 'yoga-1',
        title: '30-Day Flexibility',
        duration: '20-40 min',
        calories: '150-250',
        intensity: 'Progressive',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1740&auto=format&fit=crop',
        type: 'challenge',
        days: 30,
        description: 'Journey to improved flexibility and balance'
      },
      {
        id: 'yoga-2',
        title: '21-Day Mindfulness',
        duration: '15-30 min',
        calories: '100-200',
        intensity: 'Low to Medium',
        image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?q=80&w=1740&auto=format&fit=crop',
        type: 'challenge',
        days: 21,
        description: 'Daily yoga and meditation practice'
      },
      {
        id: 'yoga-3',
        title: 'Morning Flow',
        duration: '20 min',
        calories: '150',
        intensity: 'Low',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'energize',
        description: 'Gentle morning yoga to start your day'
      },
      {
        id: 'yoga-4',
        title: 'Power Vinyasa',
        duration: '45 min',
        calories: '300',
        intensity: 'High',
        image: 'https://images.unsplash.com/photo-1593810450967-f9c42742e326?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'strength',
        description: 'Dynamic flowing sequences for strength'
      },
      {
        id: 'yoga-5',
        title: 'Yin Yoga',
        duration: '60 min',
        calories: '150',
        intensity: 'Low',
        image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'flexibility',
        description: 'Deep stretching and relaxation'
      },
      {
        id: 'yoga-6',
        title: 'Core Power',
        duration: '30 min',
        calories: '200',
        intensity: 'Medium',
        image: 'https://images.unsplash.com/photo-1593164842264-854604db2260?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'core',
        description: 'Core-focused yoga poses and flows'
      },
      {
        id: 'yoga-7',
        title: 'Restorative',
        duration: '45 min',
        calories: '100',
        intensity: 'Very Low',
        image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'recovery',
        description: 'Gentle poses for stress relief and recovery'
      },
      {
        id: 'yoga-8',
        title: 'Ashtanga',
        duration: '90 min',
        calories: '400',
        intensity: 'Very High',
        image: 'https://images.unsplash.com/photo-1566501206188-5dd0cf160a0e?q=80&w=1740&auto=format&fit=crop',
        type: 'workout',
        focus: 'traditional',
        description: 'Traditional Ashtanga yoga sequence'
      }
    ]
  },
  {
    id: 'crossfit',
    name: 'CrossFit',
    icon: <MdFitnessCenter className="w-6 h-6" />,
    color: 'from-green-400 to-emerald-500',
    workouts: [
      {
        id: 7,
        title: 'WOD Challenge',
        duration: '40 min',
        calories: '500',
        intensity: 'High',
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1740&auto=format&fit=crop'
      },
      {
        id: 8,
        title: 'MetCon',
        duration: '25 min',
        calories: '350',
        intensity: 'High',
        image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=1740&auto=format&fit=crop'
      }
    ]
  },
  {
    id: 'swimming',
    name: 'Swimming',
    icon: <FaSwimmer className="w-6 h-6" />,
    color: 'from-cyan-400 to-blue-500',
    workouts: [
      {
        id: 9,
        title: 'Freestyle Sprint',
        duration: '30 min',
        calories: '400',
        intensity: 'High',
        image: 'https://images.unsplash.com/photo-1530549387789-b5ef050c2e1e?q=80&w=1740&auto=format&fit=crop'
      },
      {
        id: 10,
        title: 'Mixed Strokes',
        duration: '45 min',
        calories: '500',
        intensity: 'Medium',
        image: 'https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?q=80&w=1740&auto=format&fit=crop'
      }
    ]
  },
  {
    id: 'boxing',
    name: 'Boxing',
    icon: <GiBoxingGlove className="w-6 h-6" />,
    color: 'from-red-400 to-rose-500',
    workouts: [
      {
        id: 11,
        title: 'Boxing HIIT',
        duration: '35 min',
        calories: '450',
        intensity: 'High',
        image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1740&auto=format&fit=crop'
      },
      {
        id: 12,
        title: 'Bag Work',
        duration: '40 min',
        calories: '400',
        intensity: 'Medium',
        image: 'https://images.unsplash.com/photo-1615117972428-28de87cf5d19?q=80&w=1740&auto=format&fit=crop'
      }
    ]
  },
  {
    id: 'climbing',
    name: 'Climbing',
    icon: <GiMountainClimbing className="w-6 h-6" />,
    color: 'from-amber-400 to-orange-500',
    workouts: [
      {
        id: 13,
        title: 'Bouldering',
        duration: '60 min',
        calories: '450',
        intensity: 'High',
        image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1743&auto=format&fit=crop'
      },
      {
        id: 14,
        title: 'Wall Climbing',
        duration: '50 min',
        calories: '400',
        intensity: 'Medium',
        image: 'https://images.unsplash.com/photo-1516592066400-86808b241ecf?q=80&w=1740&auto=format&fit=crop'
      }
    ]
  },
  {
    id: 'cycling',
    name: 'Cycling',
    icon: <GiCycling className="w-6 h-6" />,
    color: 'from-teal-400 to-emerald-500',
    workouts: [
      {
        id: 15,
        title: 'Spin Class',
        duration: '45 min',
        calories: '500',
        intensity: 'High',
        image: 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?q=80&w=1740&auto=format&fit=crop'
      },
      {
        id: 16,
        title: 'Endurance Ride',
        duration: '60 min',
        calories: '600',
        intensity: 'Medium',
        image: 'https://images.unsplash.com/photo-1517649763962-f2b94d7dd0cb?q=80&w=1740&auto=format&fit=crop'
      }
    ]
  }
];

const WorkoutPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(workoutCategories[0]);

  return (
    <div className="bg-gray-50 dark:bg-zinc-900 px-3 pt-6 pb-10 sm:pb-12 lg:pb-16 w-full overflow-x-hidden">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8 max-w-2xl mx-auto px-1"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          What will you do today?
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Choose your workout and start your journey
        </p>
      </motion.div>

      {/* Categories Section */}
      <div className="pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative max-w-7xl mx-auto"
        >
          <Swiper
            slidesPerView="auto"
            spaceBetween={12}
            className="!pb-6 px-3"
            wrapperClass="!items-stretch"
            breakpoints={{
              320: { slidesPerView: 2.2, spaceBetween: 12 },
              480: { slidesPerView: 2.5, spaceBetween: 16 },
              640: { slidesPerView: 3.5, spaceBetween: 20 },
              768: { slidesPerView: 4.5 },
              1024: { slidesPerView: 6.5 },
            }}
          >
            {workoutCategories.map((category, index) => (
              <SwiperSlide key={category.id} className="!h-auto !w-auto">
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`group w-full h-full relative overflow-hidden rounded-2xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm 
                    ${selectedCategory.id === category.id
                      ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20 scale-105 bg-white/90 dark:bg-zinc-800/90'
                      : 'hover:scale-105 shadow-black/5 dark:shadow-black/20 bg-white/80 dark:bg-zinc-800/80 hover:bg-white/90 dark:hover:bg-zinc-800/90'
                    }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="relative flex flex-col items-center gap-3">
                    <div 
                      className={`p-3 sm:p-3.5 rounded-xl bg-gradient-to-br ${category.color} shadow-md shadow-black/10 dark:shadow-black/30 
                        transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 
                        ${selectedCategory.id === category.id ? 'scale-110 rotate-3' : ''}`}
                    >
                      <div className="text-white transform group-hover:scale-110 transition-transform duration-300">
                        {category.icon}
                      </div>
                    </div>
                    <span className={`font-medium text-xs sm:text-sm text-gray-900 dark:text-white transition-all duration-300
                      ${selectedCategory.id === category.id ? 'scale-105' : 'group-hover:scale-105'}`}>
                      {category.name}
                    </span>
                  </div>
                  {selectedCategory.id === category.id && (
                    <motion.div
                      layoutId="categoryHighlight"
                      className="absolute inset-0 bg-purple-500/5 dark:bg-purple-500/10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* Gradient Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 dark:from-zinc-900 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 dark:from-zinc-900 to-transparent pointer-events-none" />
        </motion.div>
      </div>

      {/* Workouts Slider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative max-w-md mx-auto px-4 sm:px-6"
      >
        <Swiper
          modules={[Pagination, EffectCards]}
          effect="cards"
          pagination={{ clickable: true }}
          className="!pb-6 !pt-4 !px-4"
          cardsEffect={{
            slideShadows: true,
            perSlideRotate: 2,
            perSlideOffset: 8,
            rotate: true
          }}
        >
          {selectedCategory.workouts.map((workout) => (
            <SwiperSlide key={workout.id} className="!h-auto">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden shadow-xl shadow-black/10 dark:shadow-black/30 ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-sm"
              >
                <div className="relative h-44 sm:h-52 rounded-t-3xl overflow-hidden">
                  <Image
                    src={workout.image}
                    alt={workout.title}
                    fill
                    className="object-cover rounded-t-3xl transform hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-t-3xl" />
                  {'type' in workout && workout.type === 'challenge' && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-lg shadow-orange-500/30">
                      {workout.days}-Day Challenge
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2 drop-shadow-lg">
                      {workout.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs sm:text-sm drop-shadow-lg">
                      <div className="flex items-center gap-1.5">
                        <FaClock className="w-3.5 h-3.5" />
                        <span>{workout.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FaFire className="w-3.5 h-3.5" />
                        <span>{workout.calories} cal</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3">
                    {'description' in workout && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {workout.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <FaHeart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 drop-shadow-md" />
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Intensity: {workout.intensity}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-purple-500 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-purple-600 transition-colors shadow-lg hover:shadow-xl shadow-purple-500/30 hover:shadow-purple-500/40"
                      >
                        Start
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-5xl mx-auto px-1"
      >
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-2.5 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FaRunning className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Today's Goal</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">5.2 km</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-2.5 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <FaFire className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Calories</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">320 kcal</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-2.5 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <FaClock className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Duration</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">45 min</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-2.5 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <FaHeart className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Heart Rate</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">128 bpm</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WorkoutPage;
