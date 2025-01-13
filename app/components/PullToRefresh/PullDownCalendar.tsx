'use client';

import React, { useState, useEffect } from 'react';
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
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
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

  const handleSectionSwipe = (direction: number) => {
    const newSection = activeSection + direction;
    if (newSection >= 0 && newSection < mainSections.length) {
      setActiveSection(newSection);
    }
  };

  const days = getDays();

  const renderCalendar = () => (
    <div className="px-3 mb-6">
      <div 
        className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide"
      >
        {days.map((day, index) => (
          <div
            key={index}
            className={`
              relative flex-shrink-0 w-16 h-20 flex flex-col items-center justify-center rounded-2xl
              backdrop-blur-md
              ${day.isToday 
                ? 'bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 text-white shadow-xl shadow-violet-500/30 border border-violet-400/30'
                : 'bg-gradient-to-br from-white/90 to-white/50 dark:from-gray-800/90 dark:to-gray-700/50 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700'
              }
              ${day.isToday ? 'scale-110 z-10' : 'scale-100'}
              transform transition-all duration-300 hover:scale-105
              ${index === 0 ? 'ml-2' : ''} ${index === days.length - 1 ? 'mr-2' : ''}
            `}
          >
            <span 
              className={`text-xs font-medium ${day.isToday ? 'text-violet-200' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {day.month}
            </span>
            <span 
              className={`text-2xl font-bold mt-0.5 ${day.isToday ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}
            >
              {day.date}
            </span>
            <span 
              className={`text-xs font-medium mt-0.5 ${day.isToday ? 'text-violet-200' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {day.day}
            </span>
            {day.isToday && (
              <div
                className="absolute inset-0 rounded-2xl"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderChart = (data: any[] | undefined, type: string = 'line') => {
    if (!data || data.length === 0) return null;

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-lg backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50">
            <p className="font-medium text-gray-800 dark:text-white">{label}</p>
            {payload.map((item: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: item.color }}>
                {item.name}: {item.value}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    switch (type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818CF8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="time" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="steps" 
                stroke="#818CF8" 
                fillOpacity={1} 
                fill="url(#colorSteps)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radial':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart 
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="90%"
              barSize={10}
              data={data}
            >
              <RadialBar
                label={{ fill: '#666', position: 'insideStart' }}
                background
                dataKey="value"
                cornerRadius={10}
                stackId="a"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                  />
                ))}
              </RadialBar>
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                wrapperStyle={{
                  top: '50%',
                  right: 0,
                  transform: 'translate(0, -50%)'
                }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ strokeWidth: 2 }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="#8B5CF6"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
              <Bar 
                dataKey="goal" 
                fill="#E5E7EB"
                opacity={0.3}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="time" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  const renderItems = (items: StatItem[] | undefined) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="grid grid-cols-2 gap-4">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={`${item.title}-${i}`}
              className={`
                bg-gradient-to-br ${item.color} p-4 rounded-2xl text-white 
                shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105
                backdrop-blur-md border border-white/10
              `}
            >
              <div className="flex items-center mb-2">
                <Icon className="text-2xl mr-2" />
                <span className="font-semibold">{item.title}</span>
              </div>
              <div className="text-3xl font-bold">{item.value}</div>
              <div className="text-sm opacity-80">{item.unit}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <motion.div 
        className="fixed inset-x-0 top-0 z-[9999] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-b-[2rem] shadow-2xl border border-gray-100/50 dark:border-gray-800/50"
        style={{ 
          height: '80vh',
          boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.2)',
          WebkitBackdropFilter: 'blur(16px)',
          backdropFilter: 'blur(16px)'
        }}
        initial={{ y: '-100%', opacity: 0 }}
        animate={{ 
          y: isPullDownOpen ? 0 : '-100%',
          opacity: isPullDownOpen ? 1 : 0,
          scale: isPullDownOpen ? 1 : 0.95
        }}
        transition={{ 
          type: "spring",
          damping: 25,
          stiffness: 120,
          duration: 0.6
        }}
      >
        <motion.div 
          className="p-4 h-full overflow-y-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {/* Pull indicator */}
          <motion.div 
            className="w-12 h-1.5 bg-gray-300/50 dark:bg-gray-700/50 rounded-full mx-auto mb-6 backdrop-blur-sm"
            initial={{ width: "20%" }}
            animate={{ width: "50%" }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
          
          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {renderCalendar()}
          </motion.div>

          {/* Content area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 pb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {mainSections[activeSection].title}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSectionSwipe(-1)}
                      disabled={activeSection === 0}
                      className={`p-2 rounded-full backdrop-blur-sm ${
                        activeSection === 0 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-gray-600 hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      ←
                    </button>
                    <button
                      onClick={() => handleSectionSwipe(1)}
                      disabled={activeSection === mainSections.length - 1}
                      className={`p-2 rounded-full backdrop-blur-sm ${
                        activeSection === mainSections.length - 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {mainSections[activeSection]?.items?.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={`${item.title}-${i}`}
                        className={`
                          bg-gradient-to-br ${item.color} p-4 rounded-2xl text-white 
                          shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105
                          backdrop-blur-md border border-white/10
                        `}
                      >
                        <div className="flex items-center mb-2">
                          <Icon className="text-2xl mr-2" />
                          <span className="font-semibold">{item.title}</span>
                        </div>
                        <div className="text-3xl font-bold">{item.value}</div>
                        <div className="text-sm opacity-80">{item.unit}</div>
                      </div>
                    );
                  })}
                </div>

                {(() => {
                  const activeData = mainSections[activeSection];
                  return activeData?.chartData && activeData.chartData.length > 0 ? (
                    <div className="mt-6 p-4 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl backdrop-blur-md border border-gray-100/50 dark:border-gray-700/50">
                      {renderChart(activeData.chartData, activeData.chartType)}
                    </div>
                  ) : null;
                })()}
              </motion.div>
            </AnimatePresence>

            {/* Close Button */}
            <motion.div 
              className="absolute bottom-6 left-0 right-0 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <motion.button
                onClick={() => setIsPullDownOpen(false)}
                className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-8 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-lg flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
                <FiChevronDown className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom Menu Button */}
      <motion.button
        onClick={() => {
          const controls = document.querySelector('.fixed');
          controls?.classList.toggle('translate-y-0');
          controls?.classList.toggle('-translate-y-full');
        }}
        className="fixed bottom-20 right-4 z-50 bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-full shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isPullDownOpen ? <FiChevronDown size={24} /> : <FiChevronUp size={24} />}
      </motion.button>
    </>
  );
};

export default PullDownFitnessStats;
