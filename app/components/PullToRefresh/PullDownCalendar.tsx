'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend,
  AreaChart, Area, RadialBarChart, RadialBar
} from 'recharts';
import { 
  FiActivity, 
  FiCoffee, 
  FiHeart, 
  FiTrendingUp,
  FiZap,
  FiSun,
  FiMoon,
  FiTarget,
  FiClock,
  FiAward,
  FiSmile,
  FiCalendar,
  FiBell,
  FiThermometer,
  FiDroplet,
  FiChevronUp,
  FiChevronDown
} from 'react-icons/fi';
import { IconType } from 'react-icons';
import { useLayout } from '@/app/context/LayoutContext';

interface StatItem {
  title: string;
  value: string | number;
  unit: string;
  icon: IconType;
  color: string;
}

interface Section {
  id: string;
  title: string;
  items?: StatItem[];
  chartData?: any[];
  chartType?: string;
}

// Calendar data
const getDays = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      date: date.getDate(),
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      isToday: i === 0
    });
  }
  
  return days;
};

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5'];

const mainSections: Section[] = [
  {
    id: 'daily',
    title: 'Daily Overview',
    items: [
      { title: 'Steps', value: '8,432', unit: 'steps', icon: FiActivity, color: 'from-blue-400 to-blue-600' },
      { title: 'Heart Rate', value: '72', unit: 'bpm', icon: FiHeart, color: 'from-red-400 to-red-600' },
      { title: 'Calories', value: '1,842', unit: 'kcal', icon: FiTrendingUp, color: 'from-green-400 to-green-600' },
      { title: 'Water', value: '2.5', unit: 'L', icon: FiDroplet, color: 'from-cyan-400 to-cyan-600' }
    ],
    chartData: [
      { time: '6AM', steps: 1200, calories: 150, heartRate: 75 },
      { time: '9AM', steps: 3500, calories: 450, heartRate: 85 },
      { time: '12PM', steps: 5200, calories: 850, heartRate: 95 },
      { time: '3PM', steps: 6800, calories: 1200, heartRate: 88 },
      { time: '6PM', steps: 8432, calories: 1842, heartRate: 72 }
    ],
    chartType: 'area'
  },
  {
    id: 'workout',
    title: 'Workout Stats',
    items: [
      { title: 'Duration', value: '45', unit: 'min', icon: FiClock, color: 'from-purple-400 to-purple-600' },
      { title: 'Intensity', value: '75', unit: '%', icon: FiThermometer, color: 'from-orange-400 to-orange-600' }
    ],
    chartData: [
      { name: 'Cardio', value: 45, fill: '#9333EA' },
      { name: 'Strength', value: 30, fill: '#EC4899' },
      { name: 'Flexibility', value: 25, fill: '#3B82F6' },
      { name: 'Recovery', value: 20, fill: '#10B981' }
    ],
    chartType: 'radial'
  },
  {
    id: 'nutrition',
    title: 'Nutrition Tracking',
    items: [
      { title: 'Protein', value: '120', unit: 'g', icon: FiTarget, color: 'from-teal-400 to-teal-600' },
      { title: 'Carbs', value: '250', unit: 'g', icon: FiCoffee, color: 'from-yellow-400 to-yellow-600' }
    ],
    chartData: [
      { name: 'Protein', value: 120, goal: 140, fill: '#14B8A6' },
      { name: 'Carbs', value: 250, goal: 300, fill: '#FBBF24' },
      { name: 'Fats', value: 65, goal: 70, fill: '#EC4899' },
      { name: 'Fiber', value: 28, goal: 30, fill: '#8B5CF6' }
    ],
    chartType: 'bar'
  },
  {
    id: 'sleep',
    title: 'Sleep Analysis',
    items: [
      { title: 'Duration', value: '7.5', unit: 'hrs', icon: FiMoon, color: 'from-indigo-400 to-indigo-600' },
      { title: 'Quality', value: '85', unit: '%', icon: FiSun, color: 'from-pink-400 to-pink-600' }
    ],
    chartData: [
      { name: 'Deep Sleep', value: 35, fill: '#4F46E5' },
      { name: 'Light Sleep', value: 45, fill: '#818CF8' },
      { name: 'REM', value: 20, fill: '#C7D2FE' }
    ],
    chartType: 'pie'
  },
  {
    id: 'goals',
    title: 'Goals & Progress',
    items: [
      { title: 'Weekly Goal', value: '75', unit: '%', icon: FiTarget, color: 'from-emerald-400 to-emerald-600' },
      { title: 'Achievements', value: '12', unit: '', icon: FiAward, color: 'from-amber-400 to-amber-600' }
    ]
  },
  {
    id: 'mood',
    title: 'Mood & Energy',
    items: [
      { title: 'Mood', value: '8.5', unit: '/10', icon: FiSmile, color: 'from-rose-400 to-rose-600' },
      { title: 'Energy', value: '85', unit: '%', icon: FiZap, color: 'from-lime-400 to-lime-600' }
    ]
  },
  {
    id: 'reminders',
    title: 'Reminders',
    items: [
      { title: 'Next Workout', value: '2', unit: 'hrs', icon: FiBell, color: 'from-violet-400 to-violet-600' },
      { title: 'Water Alert', value: '30', unit: 'min', icon: FiDroplet, color: 'from-sky-400 to-sky-600' }
    ]
  }
];

const PullDownFitnessStats: React.FC = () => {
  const { isPullDownOpen, setIsPullDownOpen } = useLayout();
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSectionChange = (direction: number) => {
    const newSection = activeSection + direction;
    if (newSection >= 0 && newSection < mainSections.length) {
      setActiveSection(newSection);
    }
  };

  const handleTouchStart = useRef<number>(0);
  const handleTouchMove = useRef<number>(0);

  const handleTouchStartEvent = (e: React.TouchEvent) => {
    handleTouchStart.current = e.touches[0].clientX;
  };

  const handleTouchMoveEvent = (e: React.TouchEvent) => {
    handleTouchMove.current = e.touches[0].clientX;
  };

  const handleTouchEndEvent = () => {
    const difference = handleTouchStart.current - handleTouchMove.current;
    if (Math.abs(difference) > 50) { // minimum swipe distance
      if (difference > 0) {
        // Swipe left
        handleSectionChange(1);
      } else {
        // Swipe right
        handleSectionChange(-1);
      }
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
  }, [activeSection]);

  const days = getDays();

  const renderCalendar = () => (
    <div className="px-4 py-3 bg-white dark:bg-gray-800 shadow-lg mb-4">
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent dark:from-gray-800 z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-gray-800 z-10" />
        
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-3 min-w-min py-1 px-6">
            {days.map((day, index) => (
              <motion.div
                key={day.date}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-shrink-0 w-12 p-2 rounded-xl cursor-pointer transition-colors
                  ${day.isToday 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium opacity-60">
                    {day.dayName.slice(0, 3)}
                  </span>
                  <span className="text-lg font-bold mt-0.5">
                    {day.date}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStatCard = (item: StatItem) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex-shrink-0 w-[280px]"
    >
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/30 p-4 mx-2 h-full">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-8 -mt-8 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-500/10 to-blue-500/10 rounded-full -ml-8 -mb-8 blur-2xl" />
        
        <div className="relative flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className={`bg-gradient-to-br ${item.color} p-2.5 rounded-xl`}>
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.title}</span>
          </div>
          
          <div className="flex-grow" />
          
          <div className="flex items-baseline mt-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              {item.value}
            </span>
            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">{item.unit}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderChart = (section: Section) => {
    if (!section.chartData || !section.chartType) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-500/10 to-blue-500/10 rounded-full -ml-16 -mb-16 blur-3xl" />
        
        <div className="relative">
          {(() => {
            switch (section.chartType) {
              case 'area':
                return (
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={section.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Area type="monotone" dataKey="steps" stroke="#3B82F6" fill="url(#colorSteps)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                );
              case 'radial':
                return (
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={10} data={section.chartData}>
                        <RadialBar background dataKey="value" cornerRadius={12} />
                        <Tooltip />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                );
              case 'bar':
                return (
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={section.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              case 'pie':
                return (
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={section.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {section.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                );
              default:
                return null;
            }
          })()}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {renderCalendar()}
      
      <div className="relative">
        {/* Section Navigation */}
        <div className="px-4 mb-4 flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSectionChange(-1)}
            className={`p-2 rounded-full ${
              activeSection === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
            disabled={activeSection === 0}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          
          <motion.h2 
            className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeSection}
          >
            {mainSections[activeSection].title}
          </motion.h2>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSectionChange(1)}
            className={`p-2 rounded-full ${
              activeSection === mainSections.length - 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
            disabled={activeSection === mainSections.length - 1}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>

        {/* Section Indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {mainSections.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeSection
                  ? 'w-6 bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'w-2 bg-gray-300 dark:bg-gray-700'
              }`}
              whileHover={{ scale: 1.2 }}
              onClick={() => setActiveSection(index)}
            />
          ))}
        </div>

        {/* Sliding Sections Container */}
        <div 
          ref={containerRef}
          className="overflow-hidden"
          onTouchStart={handleTouchStartEvent}
          onTouchMove={handleTouchMoveEvent}
          onTouchEnd={handleTouchEndEvent}
        >
          <motion.div
            className="flex"
            animate={{ x: `-${activeSection * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {mainSections.map((section, sectionIndex) => (
              <div
                key={section.id}
                className="min-w-full pb-20"
              >
                {section.items && (
                  <div className="relative px-4">
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-900 z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent dark:from-gray-900 z-10" />
                    
                    <div className="overflow-x-auto scrollbar-hide pb-4">
                      <div className="flex min-w-min">
                        {section.items.map((item, i) => (
                          <motion.div
                            key={item.title}
                            initial={sectionIndex === activeSection ? { opacity: 0, x: 20 } : false}
                            animate={sectionIndex === activeSection ? { opacity: 1, x: 0 } : false}
                            transition={{ delay: i * 0.1 }}
                          >
                            {renderStatCard(item)}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {section.chartData && section.chartType && (
                  <motion.div
                    className="px-4"
                    initial={sectionIndex === activeSection ? { opacity: 0, y: 20 } : false}
                    animate={sectionIndex === activeSection ? { opacity: 1, y: 0 } : false}
                    transition={{ delay: 0.3 }}
                  >
                    {renderChart(section)}
                  </motion.div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PullDownFitnessStats;
