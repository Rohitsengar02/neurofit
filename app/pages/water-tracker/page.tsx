'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWater, FaPlus, FaMinus, FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import { FaGlassWater, FaDroplet } from 'react-icons/fa6';
import { IoWater, IoSettingsOutline } from 'react-icons/io5';
import { BsEmojiSmile } from 'react-icons/bs';
import { FaHistory, FaCog } from 'react-icons/fa';
import { FaChartBar } from 'react-icons/fa6';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, query, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { format, subDays } from 'date-fns';
import { useRouter } from 'next/navigation';

interface WaterIntake {
  date: string;
  amount: number;
  goal: number;
  lastUpdated: Date;
  dailyAverage?: number;
  weeklyAverage?: number;
}

interface WaterLog {
  id: string;
  amount: number;
  timestamp: Date;
  type?: string; // 'water', 'coffee', 'tea', etc.
}

interface WaterPreferences {
  goalInMl: number;
  reminderEnabled: boolean;
  reminderInterval: number; // in minutes
  preferredAmounts: number[];
}

const WaterTrackerPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [waterIntake, setWaterIntake] = useState<WaterIntake>({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    goal: 2700, // Default goal in ml (2.7L)
    lastUpdated: new Date(),
    dailyAverage: 0,
    weeklyAverage: 0
  });
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState(200);
  const [selectedAmount, setSelectedAmount] = useState(200);
  const [showSplash, setShowSplash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [waterHistory, setWaterHistory] = useState<WaterIntake[]>([]);
  const [preferences, setPreferences] = useState<WaterPreferences>({
    goalInMl: 2700,
    reminderEnabled: false,
    reminderInterval: 60,
    preferredAmounts: [100, 200, 300]
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchWaterData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const today = format(new Date(), 'yyyy-MM-dd');
        
        // Fetch water preferences
        const prefsRef = doc(db, `users/${user.uid}/watertracker`, 'preferences');
        const prefsDoc = await getDoc(prefsRef);
        
        if (prefsDoc.exists()) {
          const prefsData = prefsDoc.data();
          setPreferences({
            goalInMl: prefsData.goalInMl || 2700,
            reminderEnabled: prefsData.reminderEnabled || false,
            reminderInterval: prefsData.reminderInterval || 60,
            preferredAmounts: prefsData.preferredAmounts || [100, 200, 300]
          });
        } else {
          // Create default preferences
          await setDoc(prefsRef, {
            goalInMl: 2700,
            reminderEnabled: false,
            reminderInterval: 60,
            preferredAmounts: [100, 200, 300],
            lastUpdated: serverTimestamp()
          });
        }
        
        // Set up real-time listener for today's water intake
        const waterDocRef = doc(db, `users/${user.uid}/watertracker`, today);
        const waterDoc = await getDoc(waterDocRef);

        if (waterDoc.exists()) {
          const data = waterDoc.data();
          setWaterIntake({
            date: today,
            amount: data.amount || 0,
            goal: data.goal || preferences.goalInMl,
            lastUpdated: data.lastUpdated?.toDate() || new Date(),
            dailyAverage: data.dailyAverage || 0,
            weeklyAverage: data.weeklyAverage || 0
          });
        } else {
          // Create a new document for today
          const newWaterIntake = {
            date: today,
            amount: 0,
            goal: preferences.goalInMl,
            lastUpdated: new Date(),
            dailyAverage: 0,
            weeklyAverage: 0
          };
          setWaterIntake(newWaterIntake);
          await setDoc(waterDocRef, {
            ...newWaterIntake,
            lastUpdated: serverTimestamp()
          });
        }

        // Set up real-time listener for water logs
        const logsRef = collection(db, `users/${user.uid}/watertracker/${today}/logs`);
        const unsubscribeLogs = onSnapshot(
          query(logsRef, orderBy('timestamp', 'desc')),
          (snapshot) => {
            const logs: WaterLog[] = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                amount: data.amount,
                timestamp: data.timestamp?.toDate() || new Date(),
                type: data.type || 'water'
              };
            });
            setWaterLogs(logs);
          },
          (error) => {
            console.error('Error fetching water logs:', error);
          }
        );

        // Fetch water history for the past 7 days
        const historyData: WaterIntake[] = [];
        let totalAmount = 0;
        
        for (let i = 1; i <= 7; i++) {
          const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
          const historyDocRef = doc(db, `users/${user.uid}/watertracker`, date);
          const historyDoc = await getDoc(historyDocRef);
          
          if (historyDoc.exists()) {
            const data = historyDoc.data();
            const amount = data.amount || 0;
            totalAmount += amount;
            
            historyData.push({
              date,
              amount,
              goal: data.goal || preferences.goalInMl,
              lastUpdated: data.lastUpdated?.toDate() || new Date()
            });
          } else {
            historyData.push({
              date,
              amount: 0,
              goal: preferences.goalInMl,
              lastUpdated: new Date()
            });
          }
        }
        
        // Calculate weekly average
        const weeklyAverage = Math.round(totalAmount / 7);
        
        // Update today's document with the weekly average
        await updateDoc(waterDocRef, {
          weeklyAverage,
          lastUpdated: serverTimestamp()
        });
        
        setWaterIntake(prev => ({
          ...prev,
          weeklyAverage
        }));
        
        setWaterHistory(historyData);
        setLoading(false);
        
        return () => {
          unsubscribeLogs();
        };
      } catch (error) {
        console.error('Error fetching water data:', error);
        setLoading(false);
      }
    };

    fetchWaterData();
  }, [user, preferences.goalInMl]);

  const updateWaterIntake = async (amount: number) => {
    if (!user || updating) return;

    try {
      setUpdating(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const waterDocRef = doc(db, `users/${user.uid}/watertracker/${today}`);
      const waterDoc = await getDoc(waterDocRef);
      
      // Generate a unique ID for the log entry
      const logId = Date.now().toString();
      const newLog: WaterLog = {
        id: logId,
        amount,
        timestamp: new Date()
      };
      
      let updatedLogs = [...waterLogs, newLog];
      let newAmount = waterIntake.amount + amount;

      // If the document exists, update it
      if (waterDoc.exists()) {
        await updateDoc(waterDocRef, {
          amount: newAmount,
          logs: updatedLogs.map(log => ({
            id: log.id,
            amount: log.amount,
            timestamp: log.timestamp
          })),
          lastUpdated: serverTimestamp()
        });
      } else {
        // Create a new document for today
        await setDoc(waterDocRef, {
          date: today,
          amount: newAmount,
          goal: waterIntake.goal,
          logs: [{
            id: logId,
            amount,
            timestamp: new Date()
          }],
          lastUpdated: serverTimestamp()
        });
      }

      // Update local state
      setWaterIntake({
        ...waterIntake,
        amount: newAmount
      });
      setWaterLogs(updatedLogs);
      setUpdating(false);
    } catch (error) {
      console.error('Error updating water intake:', error);
      setUpdating(false);
    }
  };
  
  // Function to remove a water log entry
  const handleRemoveWater = async (logId: string) => {
    if (!user || updating) return;
    
    try {
      setUpdating(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const waterDocRef = doc(db, `users/${user.uid}/watertracker/${today}`);
      
      // Find the log to remove
      const logToRemove = waterLogs.find(log => log.id === logId);
      if (!logToRemove) {
        setUpdating(false);
        return;
      }
      
      // Filter out the log and calculate new amount
      const updatedLogs = waterLogs.filter(log => log.id !== logId);
      const newAmount = Math.max(0, waterIntake.amount - logToRemove.amount);
      
      // Update Firestore
      await updateDoc(waterDocRef, {
        amount: newAmount,
        logs: updatedLogs.map(log => ({
          id: log.id,
          amount: log.amount,
          timestamp: log.timestamp
        })),
        lastUpdated: serverTimestamp()
      });
      
      // Update local state
      setWaterIntake({
        ...waterIntake,
        amount: newAmount
      });
      setWaterLogs(updatedLogs);
      setUpdating(false);
    } catch (error) {
      console.error('Error removing water log:', error);
      setUpdating(false);
    }
  };

  const updateWaterGoal = async (newGoal: number) => {
    if (!user || updating) return;

    try {
      setUpdating(true);
      
      // Update preferences
      const prefsRef = doc(db, `users/${user.uid}/watertracker`, 'preferences');
      await updateDoc(prefsRef, {
        goalInMl: newGoal,
        lastUpdated: serverTimestamp()
      });
      
      // Update today's document
      const today = format(new Date(), 'yyyy-MM-dd');
      const waterDocRef = doc(db, `users/${user.uid}/watertracker`, today);

      await updateDoc(waterDocRef, {
        goal: newGoal,
        lastUpdated: serverTimestamp()
      });

      // Update state
      setPreferences({
        ...preferences,
        goalInMl: newGoal
      });
      
      setWaterIntake({
        ...waterIntake,
        goal: newGoal
      });
      
      setUpdating(false);
    } catch (error) {
      console.error('Error updating water goal:', error);
      setUpdating(false);
    }
  };

  // Update preferred amounts
  const updatePreferredAmounts = async (amounts: number[]) => {
    if (!user || updating) return;

    try {
      setUpdating(true);
      
      // Update preferences
      const prefsRef = doc(db, `users/${user.uid}/watertracker`, 'preferences');
      await updateDoc(prefsRef, {
        preferredAmounts: amounts,
        lastUpdated: serverTimestamp()
      });
      
      // Update state
      setPreferences({
        ...preferences,
        preferredAmounts: amounts
      });
      
      setUpdating(false);
    } catch (error) {
      console.error('Error updating preferred amounts:', error);
      setUpdating(false);
    }
  };

  const percentageFilled = Math.min(100, (waterIntake.amount / waterIntake.goal) * 100);
  const glassesCount = Math.floor(waterIntake.amount / 250); // Assuming 250ml per glass
  const remainingAmount = Math.max(0, waterIntake.goal - waterIntake.amount);

  if (loading) {
    return (
      <div className="min-h-screen bg-green-500 flex items-center justify-center">
        <div className="w-10 h-10 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  // Generate random water drops for animation
  const generateWaterDrops = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `drop-${i}`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 7,
      size: 5 + Math.random() * 15,
      opacity: 0.1 + Math.random() * 0.3
    }));
  };

  const waterDrops = generateWaterDrops(20);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-600 pb-20 relative overflow-hidden">
      {/* Animated Water Drops */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {waterDrops.map((drop) => (
          <motion.div
            key={drop.id}
            className="absolute rounded-full bg-white"
            style={{
              left: drop.left,
              width: drop.size,
              height: drop.size * 1.5,
              opacity: drop.opacity,
              filter: 'blur(1px)'
            }}
            initial={{ y: -50, opacity: 0 }}
            animate={{
              y: ['0%', '100%'],
              opacity: [0, drop.opacity, 0]
            }}
            transition={{
              y: {
                duration: drop.duration,
                repeat: Infinity,
                ease: 'linear',
                delay: drop.delay
              },
              opacity: {
                duration: drop.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: drop.delay,
                times: [0, 0.1, 1]
              }
            }}
          />
        ))}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-green-400 opacity-30"></div>
        <div className="absolute top-1/4 -left-20 w-60 h-60 rounded-full bg-green-400 opacity-20"></div>
        <div className="absolute bottom-1/3 right-0 w-40 h-40 rounded-full bg-green-400 opacity-20"></div>
      </div>
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-green-500 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-green-600 text-white"
            >
              <FaArrowLeft />
            </button>
           
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full hover:bg-green-600 text-white"
            >
              <IoSettingsOutline size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Main Water Progress Circle */}
        <div className="relative mb-8" ref={containerRef}>
          <div className="flex flex-col items-center">
            {/* Progress Circle Container */}
            <div className="relative w-64 h-64 mb-4">
              {/* Ripple Effects */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={`ripple-${i}`}
                    className="absolute inset-0 rounded-full border-2 border-white/30"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: [0, 0.2, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      delay: i * 0.8,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
              
              {/* Outer Circle with Glow */}
              <div className="absolute inset-0 rounded-full bg-white/20 overflow-hidden shadow-lg" 
                style={{
                  boxShadow: "0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.2)"
                }}>
              </div>
              
              {/* Water Wave Animation */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div 
                  className="absolute bottom-0 w-full bg-white/30"
                  style={{ 
                    height: `${percentageFilled}%`,
                    borderRadius: '100% 100% 0 0',
                  }}
                >
                  <motion.div 
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      backgroundSize: '200% 100%'
                    }}
                    animate={{
                      backgroundPosition: ['0% 0%', '200% 0%']
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: 'linear'
                    }}
                  />
                </div>
              </div>
              
              {/* Progress Circle */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
                  </linearGradient>
                </defs>
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="#ffffff20" 
                  strokeWidth="8"
                />
                <motion.circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="url(#progressGradient)" 
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${percentageFilled * 2.83} 283`}
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                  initial={{ strokeDasharray: "0 283" }}
                  animate={{ strokeDasharray: `${percentageFilled * 2.83} 283` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              
              {/* Center Content with Glow */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                <motion.div 
                  className="text-5xl font-bold"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}
                >
                  {Math.round(percentageFilled)}%
                </motion.div>
                <div className="text-center">
                  <motion.div 
                    className="text-3xl font-semibold mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {waterIntake.amount} ml
                  </motion.div>
                  <motion.div 
                    className="text-sm opacity-80 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.5 }}
                  >
                    Goal {waterIntake.goal} ml
                  </motion.div>
                </div>
              </div>
            </div>
            
            {/* Daily Average */}
            <div className="flex justify-between w-full max-w-xs text-white mb-4">
              <div className="text-center">
                <div className="text-sm opacity-70">Daily Average</div>
                <div className="text-xl font-semibold">100%</div>
                <div className="text-lg">{waterIntake.dailyAverage || waterIntake.amount} ml</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm opacity-70">Average Volume</div>
                <div className="text-xl font-semibold">{waterIntake.amount} ml</div>
              </div>
            </div>
            
            
          </div>
        </div>

        {/* Amount Selection - Horizontal Scroll */}
        <div className="mb-6">
          <h3 className="text-white text-sm mb-2 opacity-80 text-center">Select Amount</h3>
          <div className="relative overflow-x-auto pb-4 -mx-5 px-5">
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide min-w-full">
              {[50, 100, 150, 200, 250, 300, 350, 400, 450, 500].map((amount) => (
                <motion.div 
                  key={`amount-${amount}`}
                  className={`flex-shrink-0 text-center cursor-pointer px-2 py-3 rounded-xl ${selectedAmount === amount ? 'bg-white/20 text-white' : 'text-white/50'}`}
                  onClick={() => setSelectedAmount(amount)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ y: -2 }}
                >
                  <div className={`${selectedAmount === amount ? 'text-3xl font-bold' : 'text-2xl'} transition-all duration-200`}>
                    {amount}
                  </div>
                  <div className="text-sm">ml</div>
                </motion.div>
              ))}
            </div>
            
            {/* Scroll Indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-green-500 to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-green-500 to-transparent pointer-events-none"></div>
          </div>
          
          {/* Custom Amount Input */}
          <div className="flex items-center justify-center mt-2 space-x-2">
            <input
              type="number"
              min="10"
              max="1000"
              step="10"
              value={customAmount}
              onChange={(e) => setCustomAmount(Number(e.target.value))}
              className="w-20 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-center"
            />
            <span className="text-white/70">ml</span>
          </div>
          
          {/* Drink Button */}
          <div className="flex justify-center mb-8 relative">
            <motion.button
              onClick={() => {
                setShowSplash(true);
                setTimeout(() => setShowSplash(false), 800);
                updateWaterIntake(selectedAmount);
              }}
              disabled={updating}
              className="flex items-center justify-center bg-green-400 hover:bg-green-300 text-white rounded-full w-full max-w-xs py-3 px-6 text-lg font-medium transition-colors relative overflow-hidden"
              whileTap={{ scale: 0.95 }}
              whileHover={{ 
                boxShadow: '0 0 20px rgba(255,255,255,0.3)',
                backgroundColor: '#34d399'
              }}
            >
              <div className="flex items-center relative z-10">
                <FaGlassWater className="mr-2" />
                <span>Drink</span>
              </div>
              
              {/* Animated background */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ backgroundSize: '200% 100%' }}
                animate={{ 
                  backgroundPosition: ['100% 0%', '-100% 0%']
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: 'linear'
                }}
              />
            </motion.button>
            
            {/* Water splash effect */}
            <AnimatePresence>
              {showSplash && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    const distance = 60 + Math.random() * 40;
                    const x = Math.cos(angle) * distance;
                    const y = Math.sin(angle) * distance;
                    const size = 4 + Math.random() * 6;
                    
                    return (
                      <motion.div
                        key={`splash-${i}`}
                        className="absolute top-1/2 left-1/2 bg-white rounded-full"
                        style={{ 
                          width: size,
                          height: size * 1.5,
                          marginLeft: -size/2,
                          marginTop: -size/2,
                          filter: 'blur(1px)'
                        }}
                        initial={{ x: 0, y: 0, opacity: 0.8 }}
                        animate={{ 
                          x: x, 
                          y: y, 
                          opacity: 0,
                          scale: [1, 1.5, 0]
                        }}
                        transition={{ 
                          duration: 0.6 + Math.random() * 0.4, 
                          ease: "easeOut" 
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Water Type Selection */}
          <div className="flex justify-center space-x-4 mb-4">
            <button className="bg-white/10 hover:bg-white/20 p-3 rounded-full">
              <FaDroplet className="text-white" />
            </button>
            <button className="bg-white/10 hover:bg-white/20 p-3 rounded-full">
              <IoWater className="text-white" />
            </button>
            <button className="bg-white/10 hover:bg-white/20 p-3 rounded-full">
              <FaWater className="text-white" />
            </button>
          </div>
        </div>
        
        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowSettings(false)}></div>
              <div className="relative bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Water Settings</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Goal (ml)</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => updateWaterGoal(Math.max(500, preferences.goalInMl - 100))}
                      disabled={updating || preferences.goalInMl <= 500}
                      className="p-2 rounded-lg bg-gray-200 text-gray-800 disabled:opacity-50"
                    >
                      <FaMinus />
                    </button>
                    <div className="flex-1 text-center text-gray-800">
                      {preferences.goalInMl} ml
                    </div>
                    <button
                      onClick={() => updateWaterGoal(preferences.goalInMl + 100)}
                      disabled={updating || preferences.goalInMl >= 5000}
                      className="p-2 rounded-lg bg-gray-200 text-gray-800 disabled:opacity-50"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily and Weekly Logs Section */}
        <div className="mt-8 mb-20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Today's Log</h3>
            <motion.button 
              className="text-white/70 text-sm bg-white/10 px-3 py-1 rounded-full"
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
            >
              <div className="flex items-center">
                <FaCog className="mr-1" size={12} />
                <span>Settings</span>
              </div>
            </motion.button>
          </div>
          
          {/* Today's Log Cards */}
          <div className="mb-8">
            {waterLogs.length > 0 ? (
              <div className="space-y-3">
                {waterLogs.map((log) => (
                  <motion.div 
                    key={log.id}
                    className="p-3 rounded-lg flex items-center justify-between bg-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3">
                        <FaWater className="text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {log.amount}ml added
                        </div>
                        <div className="text-xs text-white/70">
                          {format(log.timestamp, 'h:mm a')}
                        </div>
                      </div>
                    </div>
                    <motion.button 
                      className="text-white/50 hover:text-white/80"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveWater(log.id)}
                    >
                      <FaTimes />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/50 bg-white/5 rounded-lg">
                <FaGlassWater size={32} className="mx-auto mb-2 opacity-30" />
                <p>No water logged today. Add your first glass!</p>
              </div>
            )}
          </div>
          
          {/* Weekly History */}
          <h3 className="text-lg font-semibold text-white mb-4">Weekly History</h3>
          <div className="space-y-3 mb-8">
            {waterHistory.length > 0 ? (
              waterHistory.map((day) => {
                const percentComplete = Math.min(100, (day.amount / day.goal) * 100);
                const isToday = day.date === format(new Date(), 'yyyy-MM-dd');
                
                return (
                  <motion.div 
                    key={day.date}
                    className={`p-4 rounded-lg ${isToday ? 'bg-white/20' : 'bg-white/10'}`}
                    whileHover={{ scale: 1.01, backgroundColor: isToday ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)' }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-white">
                        {format(new Date(day.date), 'EEEE, MMM d')}
                        {isToday && <span className="ml-2 text-xs bg-green-400/20 text-green-300 px-2 py-0.5 rounded-full">Today</span>}
                      </div>
                      <div className="text-sm text-white/80">
                        {day.amount} / {day.goal}ml
                      </div>
                    </div>
                    
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-green-400 to-green-300"
                        style={{ width: '0%' }}
                        animate={{ width: `${percentComplete}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center mt-2 text-xs text-white/60">
                      <div>{Math.round(percentComplete)}% of daily goal</div>
                      <div>{Math.floor(day.amount / 250)} glasses</div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8 text-white/50 bg-white/5 rounded-lg">
                <FaChartBar size={32} className="mx-auto mb-2 opacity-30" />
                <p>No history available yet</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm py-3 px-6 flex justify-around">
          <button className="text-white flex flex-col items-center">
            <FaDroplet size={24} />
            <span className="text-xs mt-1">Water</span>
          </button>
          <button className="text-white/50 flex flex-col items-center">
            <FaHistory size={24} />
            <span className="text-xs mt-1">History</span>
          </button>
          <button 
            className="text-white/50 flex flex-col items-center"
            onClick={() => setShowSettings(true)}
          >
            <FaCog size={24} />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaterTrackerPage;
