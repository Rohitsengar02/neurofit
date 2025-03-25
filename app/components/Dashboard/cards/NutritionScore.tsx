'use client';

import React, { useEffect, useState } from 'react';
import { motion as m } from 'framer-motion';
import { FaAppleAlt, FaCarrot, FaFish, FaEgg, FaArrowRight } from 'react-icons/fa';
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
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#005766] via-[#007080] to-[#003C47] rounded-xl p-4 sm:p-6 shadow-lg relative overflow-hidden"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          Nutrition Score
        </h3>
        <button
          onClick={() => router.push('/nutrition')}
          className="flex items-center gap-2 text-teal-300 hover:text-teal-200 transition-colors text-sm"
        >
          View Details
          <FaArrowRight className="w-4 h-4" />
        </button>
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
  );
};

export default NutritionScore;