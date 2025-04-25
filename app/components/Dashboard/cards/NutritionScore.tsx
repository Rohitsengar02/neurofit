'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { FaAppleAlt, FaCarrot, FaFish, FaEgg, FaArrowRight, FaCalendarAlt, FaUtensils, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '@/app/context/AuthContext';
import { db } from '@/app/firebase/config';
import { collection, doc, getDoc, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';

interface DailyMeal {
  foodName: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
  addedAt: any;
}

interface DailyMeals {
  date: string;
  meals: Record<string, DailyMeal>;
}

interface WeeklyData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const NutritionScore = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [todaysMeals, setTodaysMeals] = useState<DailyMeals | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMealsHistory, setShowMealsHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [datesMeals, setDatesMeals] = useState<Record<string, DailyMeals>>({});
  const [loadingMeals, setLoadingMeals] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Calculate daily targets
  const dailyTargets = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 65
  };

  // Subscribe to real-time updates for today's meals
  useEffect(() => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const mealsRef = doc(db, `users/${user.uid}/nutrition`, today);

    const unsubscribe = onSnapshot(mealsRef, (doc) => {
      if (doc.exists()) {
        setTodaysMeals(doc.data() as DailyMeals);
      } else {
        setTodaysMeals(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch weekly data
  useEffect(() => {
    const fetchWeeklyData = async () => {
      if (!user) return;

      try {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          dates.push(date.toISOString().split('T')[0]);
        }

        const weeklyMeals = await Promise.all(
          dates.map(async (date) => {
            const docRef = doc(db, `users/${user.uid}/nutrition`, date);
            const docSnap = await getDoc(docRef);
            return {
              date,
              data: docSnap.exists() ? docSnap.data() as DailyMeals : null
            };
          })
        );

        const formattedData = weeklyMeals.map(({ date, data }) => ({
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          calories: data?.meals ? Object.values(data.meals).reduce((sum, meal) => sum + (meal.calories || 0), 0) : 0,
          protein: data?.meals ? Object.values(data.meals).reduce((sum, meal) => sum + (meal.protein || 0), 0) : 0,
          carbs: data?.meals ? Object.values(data.meals).reduce((sum, meal) => sum + (meal.carbs || 0), 0) : 0,
          fats: data?.meals ? Object.values(data.meals).reduce((sum, meal) => sum + (meal.fats || 0), 0) : 0
        }));

        setWeeklyData(formattedData);
      } catch (err) {
        console.error('Error fetching weekly data:', err);
      }
    };

    fetchWeeklyData();
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        fetchWeeklyData();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  // Fetch meals for selected date
  const fetchMealsForDate = async (date: string) => {
    if (!user) return;
    
    setLoadingMeals(true);
    try {
      const mealsRef = doc(db, `users/${user.uid}/nutrition`, date);
      const mealsSnap = await getDoc(mealsRef);
      
      if (mealsSnap.exists()) {
        const mealsData = mealsSnap.data() as DailyMeals;
        setDatesMeals(prev => ({ ...prev, [date]: mealsData }));
      } else {
        setDatesMeals(prev => ({ ...prev, [date]: { date, meals: {} } }));
      }
    } catch (err) {
      console.error('Error fetching meals for date:', err);
    } finally {
      setLoadingMeals(false);
    }
  };

  // Generate calendar dates
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    
    // Generate dates for the last 30 days
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    
    return dates;
  };
  
  // Format date for display
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  // Scroll calendar left
  const scrollLeft = () => {
    if (calendarRef.current) {
      calendarRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  // Scroll calendar right
  const scrollRight = () => {
    if (calendarRef.current) {
      calendarRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
    
    if (!datesMeals[formattedDate]) {
      fetchMealsForDate(formattedDate);
    }
  };

  const todaysMacros = {
    calories: todaysMeals?.meals ? Object.values(todaysMeals.meals).reduce((sum, meal) => sum + (meal.calories || 0), 0) : 0,
    protein: todaysMeals?.meals ? Object.values(todaysMeals.meals).reduce((sum, meal) => sum + (meal.protein || 0), 0) : 0,
    carbs: todaysMeals?.meals ? Object.values(todaysMeals.meals).reduce((sum, meal) => sum + (meal.carbs || 0), 0) : 0,
    fats: todaysMeals?.meals ? Object.values(todaysMeals.meals).reduce((sum, meal) => sum + (meal.fats || 0), 0) : 0
  };

  const calculateScore = () => {
    if (!todaysMeals?.meals) return 0;
    
    const scores = [
      (todaysMacros.calories / dailyTargets.calories) * 100,
      (todaysMacros.protein / dailyTargets.protein) * 100,
      (todaysMacros.carbs / dailyTargets.carbs) * 100,
      (todaysMacros.fats / dailyTargets.fats) * 100
    ];

    return Math.min(100, scores.reduce((a, b) => a + b, 0) / 4);
  };

  const score = calculateScore();

  const floatingVariants = {
    animate: (custom: number) => ({
      y: [0, -10, 0],
      rotate: [0, custom * 10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse" as const,
        delay: custom * 0.2
      }
    })
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 sm:p-6 shadow-lg flex items-center justify-center h-[400px]">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#005766] via-[#007080] to-[#003C47] rounded-xl p-4 sm:p-6 shadow-lg relative overflow-hidden"
      >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          Nutrition Score
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMealsHistory(true)}
            className="flex items-center gap-2 text-teal-300 hover:text-teal-200 transition-colors text-sm"
          >
            Meals History
            <FaCalendarAlt className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push('/nutrition')}
            className="flex items-center gap-2 text-teal-300 hover:text-teal-200 transition-colors text-sm"
          >
            View Details
            <FaArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="relative h-24 sm:h-32 flex items-center justify-center">
          <div className="text-3xl sm:text-4xl font-bold text-teal-300">
            {Math.round(score)}%
          </div>
          <div className="absolute inset-0 opacity-10">
            {[FaAppleAlt, FaCarrot, FaFish, FaEgg].map((Icon, index) => (
              <m.div
                key={index}
                variants={floatingVariants}
                animate="animate"
                custom={index}
                className="absolute text-3xl text-white"
                style={{
                  left: `${20 + index * 20}%`,
                  top: `${20 + ((index % 2) * 40)}%`
                }}
              >
                <Icon />
              </m.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {Object.entries(dailyTargets).map(([macro, target]) => (
            <m.div
              key={macro}
              initial={{ opacity: 0, x: macro === 'calories' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/80 capitalize">{macro}</span>
                <span className="text-sm text-white font-medium">
                  {Math.round(todaysMacros[macro as keyof typeof todaysMacros])}
                  <span className="text-white/60 ml-1">/ {target}{macro === 'calories' ? '' : 'g'}</span>
                </span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <m.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${Math.min(100, (todaysMacros[macro as keyof typeof todaysMacros] / target) * 100)}%` 
                  }}
                  transition={{ duration: 1, delay: 0.8 }}
                  style={{
                    backgroundColor: macro === 'protein' ? '#10B981' :
                      macro === 'carbs' ? '#14B8A6' :
                      macro === 'fats' ? '#0D9488' :
                      '#0F766E'
                  }}
                />
              </div>
            </m.div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/20">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-white/80">Weekly Progress</span>
            <span className="text-white font-medium">Calories</span>
          </div>
          <div className="h-32 sm:h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  width={30}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#F3F4F6'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#2DD4BF" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </m.div>

      {/* Meals History Modal */}
      <AnimatePresence>
        {showMealsHistory && (
          <>
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowMealsHistory(false)}
            />

          {/* Modal */}
          <m.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            className="fixed bottom-12 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto z-50"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Meals History
                </h3>
                <button
                  onClick={() => setShowMealsHistory(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* Calendar */}
              <div className="relative">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Select Date
                  </h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={scrollLeft}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <FaChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={scrollRight}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <FaChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div 
                  ref={calendarRef}
                  className="flex overflow-x-auto pb-4 hide-scrollbar gap-2 snap-x snap-mandatory"
                >
                  {generateCalendarDates().map((date, index) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = dateStr === selectedDate;
                    return (
                      <m.div
                        key={dateStr}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.01 }}
                        onClick={() => handleDateSelect(date)}
                        className={`
                          flex-shrink-0 snap-start w-20 h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer
                          ${isSelected 
                            ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500' 
                            : isToday(date)
                              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700'
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}
                        `}
                      >
                        <span className={`text-xs ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className={`text-lg font-bold ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>
                          {date.getDate()}
                        </span>
                        <span className={`text-xs ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          {date.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </m.div>
                    );
                  })}
                </div>
              </div>

              {/* Meals for selected date */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Meals for {formatDateForDisplay(new Date(selectedDate))}
                </h4>
                
                {loadingMeals ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : datesMeals[selectedDate] && Object.keys(datesMeals[selectedDate].meals).length > 0 ? (
                  <div className="space-y-4">
                    {/* Daily Summary */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                      <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                        Daily Summary
                      </h5>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Calories</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {Object.values(datesMeals[selectedDate].meals).reduce((sum, meal) => sum + meal.calories, 0).toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Protein</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {Object.values(datesMeals[selectedDate].meals).reduce((sum, meal) => sum + meal.protein, 0).toFixed(1)}g
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Carbs</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {Object.values(datesMeals[selectedDate].meals).reduce((sum, meal) => sum + meal.carbs, 0).toFixed(1)}g
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Fats</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {Object.values(datesMeals[selectedDate].meals).reduce((sum, meal) => sum + meal.fats, 0).toFixed(1)}g
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Meals List */}
                    <div className="space-y-3">
                      {Object.entries(datesMeals[selectedDate].meals)
                        .sort(([a], [b]) => Number(b) - Number(a))
                        .map(([timestamp, meal]) => (
                          <div
                            key={timestamp}
                            className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white">
                                  {meal.foodName}
                                </h5>
                                <p className="text-sm text-purple-500 dark:text-purple-300 capitalize">
                                  {meal.mealType}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {meal.calories.toFixed(0)} cal
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(Number(timestamp)).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Protein: </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {meal.protein.toFixed(1)}g
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Carbs: </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {meal.carbs.toFixed(1)}g
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Fats: </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {meal.fats.toFixed(1)}g
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <FaUtensils className="text-3xl text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">No meals recorded for this date</p>
                    <button 
                      onClick={() => router.push('/nutrition')}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                    >
                      Add a meal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </m.div>
        </>
      )}
      </AnimatePresence>
    </>
  );
};

// Add custom CSS for hiding scrollbar while preserving functionality
const styles = `
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
`;

// Add style to document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}

export default NutritionScore;