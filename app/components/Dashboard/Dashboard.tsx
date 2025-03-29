'use client';
import React, { useRef, useEffect, useState } from 'react';
import { FaWalking, FaUtensils, FaDumbbell, FaTrophy, FaFire, FaTint, FaCalendarAlt, FaRobot, FaMoon, FaHeartbeat, 
  FaWeight, FaFireAlt, FaAppleAlt, FaChartBar, FaCalendarPlus, FaBrain, FaStore, FaUserFriends, 
  FaCog, FaChartLine, FaStethoscope, FaHospital, FaPills, FaUserMd, FaHeart, FaYinYang, FaLeaf, FaSpa, FaBed } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { LayoutProvider, useLayout } from '@/app/context/LayoutContext';

// Import Navigation Components
import Navbar from '../Navigation/Navbar';
import Sidebar from '../Navigation/Sidebar';
import MobileBottomMenu from '../Navigation/MobileBottomMenu';

// Import card components
import StepsTracker from './cards/StepsTracker';
import MacroAnalysis from './cards/MacroAnalysis';
import WorkoutPlan from './cards/WorkoutPlan';
import ActiveChallenges from './cards/ActiveChallenges';
import CaloriesCard from './cards/CaloriesCard';
import HydrationTracker from './cards/HydrationTracker';
import WeeklyFitness from './cards/WeeklyFitness';
import AiRecommendations from './cards/AiRecommendations';
import SleepQuality from './cards/SleepQuality';
import HeartRate from './cards/HeartRate';
import WeightProgress from './cards/WeightProgress';
import ExerciseStreaks from './cards/ExerciseStreaks';
import NutritionGoals from './cards/NutritionGoals';
import ActivityBreakdown from './cards/ActivityBreakdown';
import UpcomingEvents from './cards/UpcomingEvents';
import MindfulnessTracker from './cards/MindfulnessTracker';
import MoodTracker from './cards/MoodTracker';
import FitnessGoals from './cards/FitnessGoals';
import AnimatedWorkoutTimer from './cards/AnimatedWorkoutTimer';
import WorkoutStreak from './cards/WorkoutStreak';
import NutritionScore from './cards/NutritionScore';
import SleepTracker from './cards/SleepTracker';
import CalorieTracker from './cards/CalorieTracker';
import GoalsTracker from './cards/GoalsTracker';
import ActivityStats from './cards/ActivityStats';

import CardModal from './components/CardModal';
import CardPreview from './components/CardPreview';

interface DashboardProps {}

function Dashboard() {
  const [activeSection, setActiveSection] = useState<string>('physical');
  const [userName, setUserName] = useState<string>('User');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const { isExpanded, setIsExpanded, isMobileOpen, setIsMobileOpen } = useLayout();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [showScrollShadow, setShowScrollShadow] = useState(false);

  useEffect(() => {
    setUserName('User');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop } = scrollContainerRef.current;
        setShowScrollShadow(scrollTop > 0);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [scrollContainerRef]); // Add scrollContainerRef to dependency array

  

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  // Animation variants for each item
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Infinite pulse animation for active item
  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const cardComponents = {
    weeklyFitness: WeeklyFitness,
    aiRecommendations: AiRecommendations,
    sleepQuality: SleepQuality,
    heartRate: HeartRate,
    weightProgress: WeightProgress,
    exerciseStreaks: ExerciseStreaks,
  };

  const cardData = [
    {
      id: 'weeklyFitness',
      title: 'Weekly Fitness',
      icon: FaDumbbell,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      stats: [
        { label: 'Calories', value: '2,450' },
        { label: 'Activities', value: '12' },
      ],
    },
    {
      id: 'aiRecommendations',
      title: 'AI Recommendations',
      icon: FaBrain,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      stats: [
        { label: 'New Tips', value: '3' },
        { label: 'Progress', value: '85%' },
      ],
    },
    {
      id: 'sleepQuality',
      title: 'Sleep Quality',
      icon: FaBed,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      stats: [
        { label: 'Hours', value: '7.5' },
        { label: 'Quality', value: '92%' },
      ],
    },
    {
      id: 'heartRate',
      title: 'Heart Rate',
      icon: FaHeartbeat,
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      stats: [
        { label: 'Current', value: '72 bpm' },
        { label: 'Resting', value: '65 bpm' },
      ],
    },
    {
      id: 'weightProgress',
      title: 'Weight Progress',
      icon: FaWeight,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      stats: [
        { label: 'Current', value: '75.5 kg' },
        { label: 'Target', value: '72 kg' },
      ],
    },
    {
      id: 'exerciseStreaks',
      title: 'Exercise Streaks',
      icon: FaFire,
      color: 'bg-gradient-to-br from-amber-500 to-orange-600',
      stats: [
        { label: 'Current', value: '12 days' },
        { label: 'Best', value: '21 days' },
      ],
    },
  ];

  const SelectedComponent = selectedCard ? cardComponents[selectedCard as keyof typeof cardComponents] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation Components */}
      <Navbar setIsMobileOpen={setIsMobileOpen} />
      <Sidebar 
        isExpanded={isExpanded} 
        setIsExpanded={setIsExpanded}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      {/* Main Content */}
      <main className={`transition-all duration-300 pt-16 pb-20 md:pb-6 ${
        isExpanded ? 'md:ml-64' : 'md:ml-20'
      }`}>
        


        {/* Content Sections */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {activeSection === 'physical' && (
              <motion.div
                key="physical"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-4 gap-4"
              >

                <NutritionScore />
                <ActiveChallenges />
                <ActivityStats />
                <AiRecommendations />
               
                <WeightProgress />


                <StepsTracker />
                <WorkoutStreak />
                
                <FitnessGoals />
                <WorkoutPlan />
                
                <WeeklyFitness />
                
                <SleepQuality />
                <HeartRate />
                
               
                
                
              </motion.div>
            )}

            {activeSection === 'mental' && (
              <motion.div
                key="mental"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                <MindfulnessTracker />
                <MoodTracker />
                <div className="text-center text-gray-600 dark:text-gray-300 py-12 col-span-full">
                  More mental health features coming soon...
                </div>
              </motion.div>
            )}

            {(activeSection !== 'physical' && activeSection !== 'mental') && (
              <motion.div
                key="coming-soon"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12"
              >
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
                  Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  This section is under development. Stay tuned for updates!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid of card previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cardData.map((card) => (
              <CardPreview
                key={card.id}
                title={card.title}
                icon={card.icon}
                color={card.color}
                stats={card.stats}
                onClick={() => setSelectedCard(card.id)}
              />
            ))}
          </div>

          {/* Modal */}
          <CardModal
            isOpen={!!selectedCard}
            onClose={() => setSelectedCard(null)}
            title={cardData.find(card => card.id === selectedCard)?.title || ''}
          >
            {SelectedComponent && <SelectedComponent />}
          </CardModal>
        </div>
      </main>

      {/* Mobile Bottom Menu */}
      <div className="md:hidden">
        <MobileBottomMenu />
      </div>
    </div>
  );
}

// Wrap Dashboard with LayoutProvider to ensure context is available
const DashboardWithLayout = () => {
  return (
    <LayoutProvider>
      <Dashboard />
    </LayoutProvider>
  );
};

export { Dashboard };
export default DashboardWithLayout;
