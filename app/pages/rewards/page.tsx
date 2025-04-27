'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { db } from '@/app/firebase/config';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { FiAward, FiTrendingUp, FiGift, FiActivity, FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';
import { BsFire, BsTrophy, BsLightningCharge } from 'react-icons/bs';
import { IoMdFitness } from 'react-icons/io';
import { RiMentalHealthLine } from 'react-icons/ri';
import Image from 'next/image';

// Types
interface RewardCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  points: number;
}

interface UserReward {
  id: string;
  title: string;
  description: string;
  points: number;
  date: Date;
  category: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  total: number;
  points: number;
  completed: boolean;
}

const RewardsPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [totalNeurons, setTotalNeurons] = useState<number>(0);
  const [recentRewards, setRecentRewards] = useState<UserReward[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch user rewards data
  useEffect(() => {
    const fetchRewardsData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch total neurons
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setTotalNeurons(userData.neurons || 0);
        }
        
        // Fetch recent rewards
        const rewardsRef = collection(db, `users/${user.uid}/rewards`);
        const rewardsQuery = query(rewardsRef, orderBy('date', 'desc'), limit(5));
        const rewardsSnapshot = await getDocs(rewardsQuery);
        
        const rewardsData: UserReward[] = [];
        rewardsSnapshot.forEach((doc) => {
          const data = doc.data();
          rewardsData.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            points: data.points,
            date: data.date.toDate(),
            category: data.category
          });
        });
        
        setRecentRewards(rewardsData);
        
        // For demo purposes, we'll create some sample achievements
        // In a real app, these would come from Firestore
        setAchievements(sampleAchievements);
        
      } catch (error) {
        console.error('Error fetching rewards data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRewardsData();
  }, [user]);

  // Sample reward categories
  const rewardCategories: RewardCategory[] = [
    {
      id: 'workout',
      title: 'Complete Workouts',
      description: 'Earn neurons for every workout you complete',
      icon: <IoMdFitness className="text-2xl" />,
      color: 'from-blue-500 to-blue-600',
      points: 10
    },
    {
      id: 'streak',
      title: 'Daily Streaks',
      description: 'Keep your daily workout streak going',
      icon: <BsFire className="text-2xl" />,
      color: 'from-orange-500 to-red-500',
      points: 5
    },
    {
      id: 'goals',
      title: 'Achieve Goals',
      description: 'Reach your fitness and health goals',
      icon: <FiTrendingUp className="text-2xl" />,
      color: 'from-green-500 to-green-600',
      points: 20
    },
    {
      id: 'challenges',
      title: 'Challenges',
      description: 'Complete special fitness challenges',
      icon: <BsTrophy className="text-2xl" />,
      color: 'from-purple-500 to-purple-600',
      points: 25
    },
    {
      id: 'nutrition',
      title: 'Nutrition Tracking',
      description: 'Log your meals and maintain a balanced diet',
      icon: <FiActivity className="text-2xl" />,
      color: 'from-yellow-500 to-yellow-600',
      points: 5
    },
    {
      id: 'meditation',
      title: 'Meditation Sessions',
      description: 'Complete meditation and mindfulness sessions',
      icon: <RiMentalHealthLine className="text-2xl" />,
      color: 'from-cyan-500 to-cyan-600',
      points: 8
    }
  ];

  // Sample achievements for demo
  const sampleAchievements: Achievement[] = [
    {
      id: 'a1',
      title: 'Workout Warrior',
      description: 'Complete 10 workouts',
      icon: <IoMdFitness className="text-xl" />,
      progress: 7,
      total: 10,
      points: 50,
      completed: false
    },
    {
      id: 'a2',
      title: 'Consistency King',
      description: 'Maintain a 7-day streak',
      icon: <BsFire className="text-xl" />,
      progress: 5,
      total: 7,
      points: 30,
      completed: false
    },
    {
      id: 'a3',
      title: 'Early Bird',
      description: 'Complete 5 workouts before 8 AM',
      icon: <FiClock className="text-xl" />,
      progress: 5,
      total: 5,
      points: 25,
      completed: true
    },
    {
      id: 'a4',
      title: 'Nutrition Master',
      description: 'Log meals for 14 consecutive days',
      icon: <FiActivity className="text-xl" />,
      progress: 10,
      total: 14,
      points: 40,
      completed: false
    }
  ];

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute top-1 left-1 w-14 h-14 rounded-full border-4 border-t-transparent border-r-transparent border-b-indigo-500 border-l-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">Loading your neurons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/neurons-pattern.png')] bg-repeat opacity-10"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Neurons Rewards</h1>
              <p className="text-blue-100 max-w-lg">Earn neurons by completing workouts, maintaining streaks, and achieving your fitness goals!</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center">
                <div className="relative mr-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <BsLightningCharge className="text-white text-2xl" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shadow-md border-2 border-white">N</div>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Total Neurons</p>
                  <h2 className="text-3xl font-bold">{totalNeurons.toLocaleString()}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* How to Earn Neurons */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How to Earn Neurons</h2>
            <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View All</button>
          </div>
          
          <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <div className="flex space-x-4" style={{ minWidth: 'max-content' }}>
              {rewardCategories.map((category) => (
                <div 
                  key={category.id}
                  className="flex-shrink-0 w-64 sm:w-72 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className={`bg-gradient-to-r ${category.color} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="bg-white/20 rounded-lg p-2">
                        {category.icon}
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                        +{category.points} neurons
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{category.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{category.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Rewards */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Rewards</h2>
          
          {recentRewards.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentRewards.map((reward) => (
                  <li key={reward.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-full p-2 mr-4">
                          <FiAward className="text-indigo-600 dark:text-indigo-400 text-xl" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{reward.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{reward.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {reward.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                        +{reward.points} neurons
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center border border-gray-100 dark:border-gray-700">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FiGift className="text-blue-600 dark:text-blue-400 text-2xl" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No rewards yet</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                Complete workouts, maintain streaks, and achieve your fitness goals to earn neurons!
              </p>
            </div>
          )}
        </section>

        {/* Achievements */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Achievements</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement) => {
              const progressPercent = (achievement.progress / achievement.total) * 100;
              
              return (
                <div 
                  key={achievement.id} 
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border ${achievement.completed ? 'border-green-200 dark:border-green-800' : 'border-gray-100 dark:border-gray-700'}`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`rounded-lg p-2 ${achievement.completed ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                        {achievement.icon}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${achievement.completed ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                        {achievement.completed ? (
                          <span className="flex items-center">
                            <FiCheckCircle className="mr-1" /> Completed
                          </span>
                        ) : (
                          <span>{achievement.progress}/{achievement.total}</span>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{achievement.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{achievement.description}</p>
                    
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
                            Progress
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
                            {progressPercent.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100 dark:bg-blue-900/30">
                        <div 
                          style={{ width: `${progressPercent}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${achievement.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-right">
                      <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                        Reward: {achievement.points} neurons
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RewardsPage;
