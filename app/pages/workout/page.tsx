'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-cards';
import { Pagination, EffectCards } from 'swiper/modules';
import Image from 'next/image';
import { FaRunning, FaDumbbell, FaHeart, FaFire, FaClock, FaSwimmer } from 'react-icons/fa';
import { MdFitnessCenter, MdSelfImprovement } from 'react-icons/md';
import { GiMountainClimbing, GiCycling, GiBoxingGlove, GiTrophyCup, GiWeightLiftingUp, GiHeartBeats } from 'react-icons/gi';
import gsap from 'gsap';

interface BaseWorkout {
  id: string;
  title: string;
  duration: string;
  calories: string;
  intensity: string;
  image: string;
  description: string;
  focus: string;
  type: 'challenge' | 'workout';
}

interface ChallengeWorkout extends BaseWorkout {
  type: 'challenge';
}

interface RegularWorkout extends BaseWorkout {
  type: 'workout';
}

type Workout = ChallengeWorkout | RegularWorkout;

interface WorkoutCategory {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
  workouts: Workout[];
}

const WorkoutCard = ({ workout }: { workout: Workout }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const fallbackImage = "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&auto=format"; // Default workout image

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white dark:bg-gray-800 h-[400px]"
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Image Container - Now covers full card */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={imageError ? fallbackImage : workout.image}
          alt={workout.title}
          fill
          className={`object-cover transition-transform duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          priority={true}
        />
        
        {/* Gradient Overlay - Adjusted for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        
        {/* Challenge Badge */}
        {workout.type === 'challenge' && (
          <motion.div
            initial={{ x: 50 }}
            animate={{ x: 0 }}
            className="absolute top-4 right-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm"
          >
            Challenge
          </motion.div>
        )}

        {/* Intensity Badge */}
        <div className="absolute top-4 left-4">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm
            ${workout.intensity === 'High' ? 'bg-red-500/80 text-white' : 
              workout.intensity === 'Medium' ? 'bg-yellow-500/80 text-white' : 
              'bg-green-500/80 text-white'}`}>
            {workout.intensity}
          </div>
        </div>
      </div>

      {/* Content Container - Positioned at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Title */}
          <h3 className="text-2xl font-bold mb-3 text-white">{workout.title}</h3>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <FaClock className="text-yellow-400 w-4 h-4" />
              </div>
              <span className="text-sm text-white">{workout.duration}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <FaFire className="text-orange-400 w-4 h-4" />
              </div>
              <span className="text-sm text-white">{workout.calories}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <FaHeart className="text-red-400 w-4 h-4" />
              </div>
              <span className="text-sm text-white">{workout.focus}</span>
            </div>
          </div>

          {/* Description */}
          <motion.p 
            className="text-sm text-gray-200 line-clamp-2 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {workout.description}
          </motion.p>

          {/* Start Button */}
          <motion.button
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-semibold text-sm transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Start Workout</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </motion.div>
      </div>

      {/* Loading Skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const workoutCategories: WorkoutCategory[] = [
  {
    id: 'challenges',
    name: 'Challenges',
    icon: <GiTrophyCup className="text-2xl" />,
    color: 'from-amber-400 to-amber-600',
    workouts: [
      {
        id: 'challenge-1',
        title: '30-Day Full-Body Blast',
        duration: '30 days',
        calories: '400/day',
        intensity: 'Medium',
        type: 'challenge',
        focus: 'Full Body',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&auto=format',
        description: 'Build overall strength and endurance with daily sessions.'
      },
      {
        id: 'challenge-2',
        title: '90-Day Warrior',
        duration: '90 days',
        calories: '550/day',
        intensity: 'High',
        type: 'challenge',
        focus: 'Strength',
        image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=300&auto=format',
        description: 'Complete strength transformation.'
      },
      {
        id: 'challenge-3',
        title: '7-Day Quick Burn',
        duration: '7 days',
        calories: '350/day',
        intensity: 'High',
        type: 'challenge',
        focus: 'Fat Burn',
        image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=300&auto=format',
        description: 'Rapid results with an intense full-body regimen.'
      },
      {
        id: 'challenge-4',
        title: '21-Day Lean Core',
        duration: '21 days',
        calories: '300/day',
        intensity: 'Medium',
        type: 'challenge',
        focus: 'Abs/Core',
        image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=400&h=300&auto=format',
        description: 'Sculpt a lean core with progressive exercises.'
      },
      {
        id: 'challenge-5',
        title: '6-Month Fitness Journey',
        duration: '180 days',
        calories: '600/day',
        intensity: 'Variable',
        type: 'challenge',
        focus: 'Overall Fitness',
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=300&auto=format',
        description: 'A holistic approach to achieving peak fitness.'
      },
      {
        id: 'challenge-6',
        title: 'Arm Strength Challenge',
        duration: '30 days',
        calories: '300/day',
        intensity: 'Medium',
        type: 'challenge',
        focus: 'Arms',
        image: 'https://images.unsplash.com/photo-1594737625785-5393a3f671b1?w=400&h=300&auto=format',
        description: 'Target biceps, triceps, and forearms.'
      },
      {
        id: 'challenge-7',
        title: 'Leg Power-Up Challenge',
        duration: '21 days',
        calories: '350/day',
        intensity: 'High',
        type: 'challenge',
        focus: 'Legs',
        image: 'https://images.unsplash.com/photo-1562771242-82dcf394a5a2?w=400&h=300&auto=format',
        description: 'Enhance lower body strength and endurance.'
      },
      {
        id: 'challenge-8',
        title: 'Chest Sculptor',
        duration: '14 days',
        calories: '300/day',
        intensity: 'Medium',
        type: 'challenge',
        focus: 'Chest',
        image: 'https://images.unsplash.com/photo-1517960413843-d05b474e2155?w=400&h=300&auto=format',
        description: 'Define and build chest muscles.'
      }
    ]
  },
  
  {
    id: 'cardio',
    name: 'Cardio',
    icon: <GiHeartBeats className="text-2xl" />,
    color: 'from-orange-400 to-orange-600',
    workouts: [
      {
        id: 'cardio-1',
        title: 'HIIT Sprint Training',
        duration: '30 mins',
        calories: '400',
        intensity: 'High',
        type: 'workout',
        focus: 'Cardio',
        image: 'https://images.unsplash.com/photo-1599058908455-0007f2dcf02d?w=400&h=300&auto=format',
        description: 'High-intensity sprint intervals for maximum calorie burn.'
      },
      {
        id: 'cardio-2',
        title: '30-Day Runner',
        duration: '45 min',
        calories: '500',
        intensity: 'Progressive',
        type: 'workout',
        focus: 'Cardio',
        image: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?w=400&h=300&auto=format',
        description: 'Progressive running program for endurance.'
      },
      {
        id: 'cardio-3',
        title: 'Boxing Cardio',
        duration: '40 min',
        calories: '450',
        intensity: 'High',
        type: 'workout',
        focus: 'Cardio Boxing',
        image: 'https://images.unsplash.com/photo-1542763205-8736a0635cd8?w=400&h=300&auto=format',
        description: 'Boxing-inspired cardio workout.'
      },
      {
        id: 'cardio-4',
        title: 'Mountain Climbers',
        duration: '25 min',
        calories: '300',
        intensity: 'Medium',
        type: 'workout',
        focus: 'HIIT',
        image: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=400&h=300&auto=format',
        description: 'Dynamic mountain climber intervals.'
      },
      {
        id: 'cardio-5',
        title: 'Endurance Run',
        duration: '60 min',
        calories: '600',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Endurance',
        image: 'https://images.unsplash.com/photo-1532907686883-68f473fcd8cc?w=400&h=300&auto=format',
        description: 'Long-distance endurance training.'
      },
      {
        id: 'cardio-6',
        title: 'Speed Training',
        duration: '35 min',
        calories: '400',
        intensity: 'High',
        type: 'workout',
        focus: 'Speed',
        image: 'https://images.unsplash.com/photo-1526401281622-3e83b68b2b5e?w=400&h=300&auto=format',
        description: 'Speed and agility drills.'
      },
      {
        id: 'cardio-7',
        title: 'Stair Master',
        duration: '30 min',
        calories: '350',
        intensity: 'High',
        type: 'workout',
        focus: 'Stairs',
        image: 'https://images.unsplash.com/photo-1616439907331-7d7d791e377e?w=400&h=300&auto=format',
        description: 'Intense stair climbing workout.'
      },
      {
        id: 'cardio-8',
        title: 'Tabata Burn',
        duration: '25 min',
        calories: '300',
        intensity: 'Very High',
        type: 'workout',
        focus: 'Tabata',
        image: 'https://images.unsplash.com/photo-1583473848882-f385e2e2ad1b?w=400&h=300&auto=format',
        description: '20/10 interval training.'
      },
      {
        id: 'cardio-9',
        title: 'Cardio Core',
        duration: '35 mins',
        calories: '400',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Core',
        image: 'https://images.unsplash.com/photo-1583479225825-d0120d2d4671?w=400&h=300&auto=format',
        description: 'Core-focused cardio workout.'
      },
      {
        id: 'cardio-10',
        title: 'Tabata Blast',
        duration: '20 mins',
        calories: '300',
        intensity: 'Very High',
        type: 'workout',
        focus: 'HIIT',
        image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&h=300&auto=format',
        description: 'Intense Tabata intervals.'
      }
    ]
  },
  
  {
    id: 'strength',
    name: 'Strength',
    icon: <GiWeightLiftingUp className="text-2xl" />,
    color: 'from-blue-400 to-blue-600',
    workouts: [
      {
        id: 'strength-1',
        title: 'Power Lifting',
        duration: '60 mins',
        calories: '500',
        intensity: 'High',
        type: 'workout',
        focus: 'Strength',
        image: 'https://images.unsplash.com/photo-1534368420009-621bfab424a8?w=400&h=300&auto=format',
        description: 'Heavy compound lifts for maximum strength'
      },
      {
        id: 'strength-2',
        title: 'Upper Body Power',
        duration: '45 mins',
        calories: '400',
        intensity: 'High',
        type: 'workout',
        focus: 'Upper Body',
        image: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&h=300&auto=format',
        description: 'Chest, shoulders, and arms workout'
      },
      {
        id: 'strength-3',
        title: 'Lower Body Beast',
        duration: '50 mins',
        calories: '450',
        intensity: 'High',
        type: 'workout',
        focus: 'Lower Body',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&auto=format',
        description: 'Legs and glutes focused training'
      },
      {
        id: 'strength-4',
        title: 'Core Power',
        duration: '30 mins',
        calories: '300',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Core',
        image: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=400&h=300&auto=format',
        description: 'Core and abs strengthening'
      },
      {
        id: 'strength-5',
        title: 'Dumbbell Complex',
        duration: '40 mins',
        calories: '400',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Full Body',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&auto=format',
        description: 'Full body dumbbell workout'
      },
      {
        id: 'strength-6',
        title: 'Bodyweight Master',
        duration: '35 mins',
        calories: '350',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Calisthenics',
        image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&h=300&auto=format',
        description: 'Advanced bodyweight exercises'
      },
      {
        id: 'strength-7',
        title: 'Muscle Builder',
        duration: '55 mins',
        calories: '450',
        intensity: 'High',
        type: 'workout',
        focus: 'Hypertrophy',
        image: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=400&h=300&auto=format',
        description: 'Hypertrophy focused training'
      },
      {
        id: 'strength-8',
        title: 'Power Endurance',
        duration: '45 mins',
        calories: '400',
        intensity: 'High',
        type: 'workout',
        focus: 'Strength Endurance',
        image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=300&auto=format',
        description: 'Strength endurance circuits'
      },
      {
        id: 'strength-9',
        title: 'Power Building',
        duration: '55 mins',
        calories: '500',
        intensity: 'Very High',
        type: 'workout',
        focus: 'Power',
        image: 'https://images.unsplash.com/photo-1534368420009-621bfab424a8?w=400&h=300&auto=format',
        description: 'Advanced power building session'
      },
      {
        id: 'strength-10',
        title: 'Giant Sets',
        duration: '45 mins',
        calories: '450',
        intensity: 'High',
        type: 'workout',
        focus: 'Hypertrophy',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&auto=format',
        description: 'Multiple exercise giant sets'
      },
      {
        id: 'strength-11',
        title: 'Compound Focus',
        duration: '50 mins',
        calories: '500',
        intensity: 'High',
        type: 'workout',
        focus: 'Strength',
        image: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&h=300&auto=format',
        description: 'Major compound lifts workout'
      },
      {
        id: 'strength-12',
        title: 'Isolation Builder',
        duration: '40 mins',
        calories: '350',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Isolation',
        image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&auto=format',
        description: 'Targeted isolation exercises'
      },
      {
        id: 'strength-13',
        title: 'Strength Endurance',
        duration: '60 mins',
        calories: '550',
        intensity: 'High',
        type: 'workout',
        focus: 'Endurance',
        image: 'https://images.unsplash.com/photo-1591940743243-eb4f61e2bb72?w=400&h=300&auto=format',
        description: 'High-rep strength endurance'
      }
    ]
  },
  {
    id: 'boxing',
    name: 'Boxing',
    icon: <GiBoxingGlove className="text-2xl" />,
    color: 'from-red-500 to-red-700',
    workouts: [
      {
        id: 'boxing-1',
        title: 'Power Punches',
        duration: '45 mins',
        calories: '500',
        intensity: 'High',
        type: 'workout',
        focus: 'Power',
        image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&h=300&auto=format',
        description: 'Heavy bag power punching workout'
      },
      {
        id: 'boxing-2',
        title: 'Speed Boxing',
        duration: '30 mins',
        calories: '400',
        intensity: 'High',
        type: 'workout',
        focus: 'Speed',
        image: 'https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?w=400&h=300&auto=format',
        description: 'Fast-paced boxing combinations'
      },
      {
        id: 'boxing-3',
        title: 'Boxing Footwork',
        duration: '40 mins',
        calories: '450',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Footwork',
        image: 'https://images.unsplash.com/photo-1636556103793-6ed94fca661f?w=400&h=300&auto=format',
        description: 'Boxing footwork and movement drills'
      },
      {
        id: 'boxing-4',
        title: 'Boxing HIIT',
        duration: '25 mins',
        calories: '350',
        intensity: 'Very High',
        type: 'workout',
        focus: 'Cardio',
        image: 'https://images.unsplash.com/photo-1615117972428-28de87cf5d19?w=400&h=300&auto=format',
        description: 'High-intensity boxing intervals'
      },
      {
        id: 'boxing-5',
        title: 'Technical Boxing',
        duration: '50 mins',
        calories: '400',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Technique',
        image: 'https://images.unsplash.com/photo-1583473848882-f385e2e2ad1b?w=400&h=300&auto=format',
        description: 'Boxing technique refinement'
      },
      {
        id: 'boxing-6',
        title: 'Shadow Boxing',
        duration: '35 mins',
        calories: '300',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Form',
        image: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?w=400&h=300&auto=format',
        description: 'Shadow boxing technique workout'
      },
      {
        id: 'boxing-7',
        title: 'Boxing Core',
        duration: '30 mins',
        calories: '350',
        intensity: 'High',
        type: 'workout',
        focus: 'Core',
        image: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?w=400&h=300&auto=format',
        description: 'Core strengthening for boxing'
      },
      {
        id: 'boxing-8',
        title: 'Heavy Bag',
        duration: '40 mins',
        calories: '450',
        intensity: 'High',
        type: 'workout',
        focus: 'Power',
        image: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?w=400&h=300&auto=format',
        description: 'Heavy bag conditioning workout'
      },
      {
        id: 'boxing-9',
        title: 'Combo Master',
        duration: '45 mins',
        calories: '400',
        intensity: 'High',
        type: 'workout',
        focus: 'Combinations',
        image: 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=400&h=300&auto=format',
        description: 'Advanced boxing combinations'
      },
      {
        id: 'boxing-10',
        title: 'Boxing Endurance',
        duration: '50 mins',
        calories: '500',
        intensity: 'High',
        type: 'workout',
        focus: 'Endurance',
        image: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?w=400&h=300&auto=format',
        description: 'Endurance-focused boxing workout'
      },
      {
        id: 'boxing-11',
        title: 'Power & Speed',
        duration: '40 mins',
        calories: '450',
        intensity: 'Very High',
        type: 'workout',
        focus: 'Mixed',
        image: 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=400&h=300&auto=format',
        description: 'Combined power and speed training'
      },
      {
        id: 'boxing-12',
        title: 'Boxing Skills',
        duration: '45 mins',
        calories: '400',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Skills',
        image: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?w=400&h=300&auto=format',
        description: 'Boxing skills and technique training'
      },
      {
        id: 'boxing-13',
        title: 'Fight Prep',
        duration: '60 mins',
        calories: '600',
        intensity: 'High',
        type: 'workout',
        focus: 'All-Round',
        image: 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=400&h=300&auto=format',
        description: 'Complete boxing preparation workout'
      }
    ]
  },
  {
    id: 'yoga',
    name: 'Yoga',
    icon: <MdSelfImprovement className="text-2xl" />,
    color: 'from-purple-400 to-purple-600',
    workouts: [
      {
        id: 'yoga-1',
        title: 'Power Yoga',
        duration: '45 mins',
        calories: '300',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Strength',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&auto=format',
        description: 'Strength-focused yoga flow'
      },
      {
        id: 'yoga-2',
        title: 'Morning Flow',
        duration: '30 mins',
        calories: '200',
        intensity: 'Low',
        type: 'workout',
        focus: 'Flexibility',
        image: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=300&auto=format',
        description: 'Energizing morning yoga sequence'
      },
      {
        id: 'yoga-3',
        title: 'Core Yoga',
        duration: '40 mins',
        calories: '250',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Core',
        image: 'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?w=400&h=300&auto=format',
        description: 'Core-strengthening yoga poses'
      },
      {
        id: 'yoga-4',
        title: 'Flexibility Flow',
        duration: '50 mins',
        calories: '200',
        intensity: 'Low',
        type: 'workout',
        focus: 'Flexibility',
        image: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400&h=300&auto=format',
        description: 'Deep stretching and flexibility'
      },
      {
        id: 'yoga-5',
        title: 'Balance Practice',
        duration: '35 mins',
        calories: '200',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Balance',
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf1862?w=400&h=300&auto=format',
        description: 'Balance-focused yoga sequence'
      },
      {
        id: 'yoga-6',
        title: 'Strength Flow',
        duration: '45 mins',
        calories: '300',
        intensity: 'High',
        type: 'workout',
        focus: 'Strength',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&auto=format',
        description: 'Dynamic strength-building flow'
      },
      {
        id: 'yoga-7',
        title: 'Mindful Practice',
        duration: '40 mins',
        calories: '150',
        intensity: 'Low',
        type: 'workout',
        focus: 'Mindfulness',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&auto=format',
        description: 'Mindfulness and meditation focus'
      },
      {
        id: 'yoga-8',
        title: 'Power Flow',
        duration: '50 mins',
        calories: '350',
        intensity: 'High',
        type: 'workout',
        focus: 'Power',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&auto=format',
        description: 'Intense power yoga sequence'
      },
      {
        id: 'yoga-9',
        title: 'Gentle Yoga',
        duration: '40 mins',
        calories: '180',
        intensity: 'Low',
        type: 'workout',
        focus: 'Relaxation',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&auto=format',
        description: 'Gentle and relaxing yoga practice'
      },
      {
        id: 'yoga-10',
        title: 'Vinyasa Flow',
        duration: '55 mins',
        calories: '320',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Flow',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&auto=format',
        description: 'Dynamic vinyasa flow sequence'
      },
      {
        id: 'yoga-11',
        title: 'Core Power',
        duration: '45 mins',
        calories: '280',
        intensity: 'High',
        type: 'workout',
        focus: 'Core Strength',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&auto=format',
        description: 'Core-focused power yoga'
      },
      {
        id: 'yoga-12',
        title: 'Yoga Sculpt',
        duration: '50 mins',
        calories: '400',
        intensity: 'High',
        type: 'workout',
        focus: 'Strength',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&auto=format',
        description: 'Yoga with strength training elements'
      },
      {
        id: 'yoga-13',
        title: 'Recovery Flow',
        duration: '35 mins',
        calories: '150',
        intensity: 'Low',
        type: 'workout',
        focus: 'Recovery',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&auto=format',
        description: 'Restorative yoga for recovery'
      }
    ]
  },
  {
    id: 'climbing',
    name: 'Climbing',
    icon: <GiMountainClimbing className="text-2xl" />,
    color: 'from-green-400 to-green-600',
    workouts: [
      {
        id: 'climbing-1',
        title: 'Bouldering Basics',
        duration: '60 mins',
        calories: '450',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Technique',
        image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&h=300&auto=format',
        description: 'Fundamental bouldering techniques'
      },
      {
        id: 'climbing-2',
        title: 'Power Climbing',
        duration: '45 mins',
        calories: '500',
        intensity: 'High',
        type: 'workout',
        focus: 'Power',
        image: 'https://images.unsplash.com/photo-1516592066400-86808b241ecf?w=400&h=300&auto=format',
        description: 'Explosive power climbing workout'
      },
      {
        id: 'climbing-3',
        title: 'Endurance Climb',
        duration: '90 mins',
        calories: '600',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Endurance',
        image: 'https://images.unsplash.com/photo-1578885136359-6726e4141417?w=400&h=300&auto=format',
        description: 'Long-duration climbing session'
      },
      {
        id: 'climbing-4',
        title: 'Technical Routes',
        duration: '75 mins',
        calories: '500',
        intensity: 'High',
        type: 'workout',
        focus: 'Technique',
        image: 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=400&h=300&auto=format',
        description: 'Advanced climbing techniques'
      },
      {
        id: 'climbing-5',
        title: 'Strength Climb',
        duration: '50 mins',
        calories: '450',
        intensity: 'High',
        type: 'workout',
        focus: 'Strength',
        image: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?w=400&h=300&auto=format',
        description: 'Strength-focused climbing workout'
      },
      {
        id: 'climbing-6',
        title: 'Dynamic Moves',
        duration: '40 mins',
        calories: '400',
        intensity: 'Very High',
        type: 'workout',
        focus: 'Power',
        image: 'https://images.unsplash.com/photo-1522079820103-3e6847cd2cb0?w=400&h=300&auto=format',
        description: 'Dynamic climbing movements'
      },
      {
        id: 'climbing-7',
        title: 'Core Climbing',
        duration: '45 mins',
        calories: '400',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Core',
        image: 'https://images.unsplash.com/photo-1583479225825-d0120d2d4671?w=400&h=300&auto=format',
        description: 'Core-focused climbing exercises'
      },
      {
        id: 'climbing-8',
        title: 'Balance Routes',
        duration: '60 mins',
        calories: '450',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Balance',
        image: 'https://images.unsplash.com/photo-1577847094891-99d4e5c25b96?w=400&h=300&auto=format',
        description: 'Balance-intensive climbing routes'
      }
    ]
  },
  {
    id: 'cycling',
    name: 'Cycling',
    icon: <GiCycling className="text-2xl" />,
    color: 'from-cyan-400 to-cyan-600',
    workouts: [
      {
        id: 'cycling-1',
        title: 'Sprint Intervals',
        duration: '30 mins',
        calories: '400',
        intensity: 'Very High',
        type: 'workout',
        focus: 'Speed',
        image: 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=400&h=300&auto=format',
        description: 'High-intensity sprint intervals'
      },
      {
        id: 'cycling-2',
        title: 'Endurance Ride',
        duration: '90 mins',
        calories: '800',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Endurance',
        image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=300&auto=format',
        description: 'Long-distance endurance cycling'
      },
      {
        id: 'cycling-3',
        title: 'Hill Climbs',
        duration: '45 mins',
        calories: '500',
        intensity: 'High',
        type: 'workout',
        focus: 'Strength',
        image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=300&auto=format',
        description: 'Intensive hill climbing session'
      },
      {
        id: 'cycling-4',
        title: 'Power Cycling',
        duration: '40 mins',
        calories: '450',
        intensity: 'High',
        type: 'workout',
        focus: 'Power',
        image: 'https://images.unsplash.com/photo-1520877880798-5ee004e3f11e?w=400&h=300&auto=format',
        description: 'Power-focused cycling workout'
      },
      {
        id: 'cycling-5',
        title: 'Tempo Ride',
        duration: '60 mins',
        calories: '600',
        intensity: 'Medium',
        type: 'workout',
        focus: 'Tempo',
        image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400&h=300&auto=format',
        description: 'Steady-state tempo training'
      },
      {
        id: 'cycling-6',
        title: 'HIIT Cycling',
        duration: '35 mins',
        calories: '400',
        intensity: 'Very High',
        type: 'workout',
        focus: 'HIIT',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&auto=format',
        description: 'High-intensity interval cycling'
      },
      {
        id: 'cycling-7',
        title: 'Recovery Spin',
        duration: '40 mins',
        calories: '300',
        intensity: 'Low',
        type: 'workout',
        focus: 'Recovery',
        image: 'https://images.unsplash.com/photo-1475666675596-99d4e5c25b96?w=400&h=300&auto=format',
        description: 'Light recovery cycling session'
      },
      {
        id: 'cycling-8',
        title: 'Speed Training',
        duration: '45 mins',
        calories: '500',
        intensity: 'High',
        type: 'workout',
        focus: 'Speed',
        image: 'https://images.unsplash.com/photo-1517931524326-bdd55a541177?w=400&h=300&auto=format',
        description: 'Speed-focused cycling drills'
      }
    ]
  }
  // ... other categories follow
];

const WorkoutPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory>(workoutCategories[0]);
  const [activeTab, setActiveTab] = useState('featured');
  const categoriesRef = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    timelineRef.current = gsap.timeline({ paused: true });
    
    categoriesRef.current.forEach((category, index) => {
      if (category) {
        timelineRef.current?.from(category, {
          duration: 0.5,
          opacity: 0,
          y: 50,
          scale: 0.8,
          delay: index * 0.1,
          ease: "back.out(1.7)"
        });
      }
    });

    timelineRef.current.play();

    return () => {
      timelineRef.current?.kill();
    };
  }, []);

  const handleCategoryClick = (category: WorkoutCategory) => {
    setSelectedCategory(category);
    
    gsap.to(`.category-${category.id}`, {
      scale: 1.1,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
  };

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
      <style jsx global>{`
        .category-slider {
          -ms-overflow-style: none;
          scrollbar-width: none;
          padding-left: 1rem;
        }
        
        .category-slider::-webkit-scrollbar {
          display: none;
        }

        @media (min-width: 640px) {
          .category-slider {
            padding-left: 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .category-slider {
            padding-left: 2rem;
          }
        }

        .category-item {
          transition: all 0.3s ease;
          transform-origin: center;
          padding-right: 0.5rem;
        }

        .category-item:hover {
          transform: translateY(-5px);
        }

        .category-item.active {
          position: relative;
        }

        .category-item.active::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 30%;
          height: 3px;
          background: linear-gradient(to right, #8b5cf6, #6366f1);
          border-radius: 4px;
        }
      `}</style>

      <div className="pt-6 sm:pt-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <div className="category-slider flex overflow-x-auto pb-4 snap-x snap-mandatory">
              {workoutCategories.map((category) => (
                <div
                  key={category.id}
                  className={`category-item category-${category.id} snap-start flex-shrink-0 cursor-pointer
                    ${selectedCategory.id === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${category.color}
                      shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-105`}>
                      <div className="text-white">
                        {category.icon}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                      {category.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Gradient Edges */}
            <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-gray-50 dark:from-zinc-900 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-gray-50 dark:from-zinc-900 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'featured'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            Featured Workouts
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'trending'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'programs'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            Programs
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'challenges'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            Challenges
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4">
        {activeTab === 'featured' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedCategory.workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}

        {activeTab === 'trending' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedCategory.workouts.slice(0, 6).map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}

        {activeTab === 'programs' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Premium Programs</h2>
              <p className="text-white/80 mb-4">Access expert-designed workout programs</p>
              <button className="px-6 py-2 bg-white text-purple-500 rounded-xl font-medium hover:bg-gray-100 transition-colors">
                Explore Programs
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCategory.workouts.filter(w => w.type === 'challenge').map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Monthly Challenges</h2>
              <p className="text-white/80 mb-4">Join community challenges and win rewards</p>
              <button className="px-6 py-2 bg-white text-orange-500 rounded-xl font-medium hover:bg-gray-100 transition-colors">
                Join Challenge
              </button>
            </div>
            {/* Challenge cards */}
          </div>
        )}
      </div>

      {/* Workout Tips Section */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Workout Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <FaHeart className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Proper Form</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Maintain proper form throughout your workout to maximize results and prevent injuries.
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
              <FaClock className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Rest Periods</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Take adequate rest between sets to allow your muscles to recover and maintain intensity.
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
              <FaFire className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Progressive Load</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Gradually increase workout intensity to continue challenging your body and seeing results.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-5xl mx-auto px-1"
      >
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-2.5 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FaRunning className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Today&apos;s Goal</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">5.2 km</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-2.5 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
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
            <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
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
            <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <FaHeart className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Heart Rate</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">128 bpm</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Nutrition Tips */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Nutrition Tips</h2>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Pre-Workout</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span>Complex carbohydrates</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span>Lean protein</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span>Hydration</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">During Workout</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span>Stay hydrated</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span>Electrolytes</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span>Energy gels if needed</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Post-Workout</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span>Protein shake</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span>Recovery meal</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span>Replenish glycogen</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WorkoutPage;
