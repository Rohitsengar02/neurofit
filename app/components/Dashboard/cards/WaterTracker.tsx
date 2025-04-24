'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWater, FaPlus, FaMinus } from 'react-icons/fa';
import { FaDroplet } from 'react-icons/fa6';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';
import { format } from 'date-fns';

interface WaterIntake {
  date: string;
  amount: number;
  goal: number;
  lastUpdated: Date;
}

// Generate random water drops for animation
const generateWaterDrops = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `drop-${i}`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 3,
    size: 3 + Math.random() * 5,
    opacity: 0.1 + Math.random() * 0.3
  }));
};

const WaterTracker = () => {
  const { user } = useAuth();
  const [waterIntake, setWaterIntake] = useState<WaterIntake>({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    goal: 2500, // Default goal: 2500ml (2.5L)
    lastUpdated: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  
  // Generate water drops for animation
  const waterDrops = generateWaterDrops(10);

  useEffect(() => {
    const fetchWaterIntake = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const today = format(new Date(), 'yyyy-MM-dd');
        
        // First check for preferences to get the goal
        const prefsDocRef = doc(db, `users/${user.uid}/watertracker/preferences`);
        const prefsDoc = await getDoc(prefsDocRef);
        
        let waterGoal = 2500; // Default goal
        if (prefsDoc.exists() && prefsDoc.data().goal) {
          waterGoal = prefsDoc.data().goal;
        }
        
        // Then get today's water data
        const waterDocRef = doc(db, `users/${user.uid}/watertracker/${today}`);
        const waterDoc = await getDoc(waterDocRef);

        if (waterDoc.exists()) {
          const data = waterDoc.data();
          setWaterIntake({
            date: today,
            amount: data.amount || 0,
            goal: data.goal || waterGoal,
            lastUpdated: data.lastUpdated?.toDate() || new Date()
          });
        } else {
          // Create a new document for today
          const newWaterIntake = {
            date: today,
            amount: 0,
            goal: waterGoal,
            lastUpdated: new Date()
          };
          setWaterIntake(newWaterIntake);
          await setDoc(waterDocRef, {
            date: today,
            amount: 0,
            goal: waterGoal,
            logs: [],
            lastUpdated: serverTimestamp()
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching water intake:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchWaterIntake();
    
    // Set up real-time listener for updates
    if (user) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const waterDocRef = doc(db, `users/${user.uid}/watertracker/${today}`);
      
      const unsubscribe = onSnapshot(waterDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setWaterIntake({
            date: today,
            amount: data.amount || 0,
            goal: data.goal || waterIntake.goal,
            lastUpdated: data.lastUpdated?.toDate() || new Date()
          });
        }
      });
      
      // Clean up listener on unmount
      return () => unsubscribe();
    }
  }, [user]);

  const updateWaterIntake = async (amount: number) => {
    if (!user || updating) return;

    try {
      setUpdating(true);
      const newAmount = Math.max(0, waterIntake.amount + amount);
      const today = format(new Date(), 'yyyy-MM-dd');
      const waterDocRef = doc(db, `users/${user.uid}/watertracker/${today}`);
      const waterDoc = await getDoc(waterDocRef);
      
      // Generate a unique ID for the log entry
      const logId = Date.now().toString();
      
      if (waterDoc.exists()) {
        // Get existing logs or initialize an empty array
        const existingData = waterDoc.data();
        const logs = existingData.logs || [];
        
        // Add new log entry
        logs.push({
          id: logId,
          amount,
          timestamp: new Date()
        });
        
        // Update document
        await updateDoc(waterDocRef, {
          amount: newAmount,
          logs: logs,
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

      // The onSnapshot listener will update the UI
      // but we also update local state for immediate feedback
      setWaterIntake({
        ...waterIntake,
        amount: newAmount,
        lastUpdated: new Date()
      });
      
      // Show splash animation
      setShowSplash(true);
      setTimeout(() => setShowSplash(false), 800);
      
      setUpdating(false);
    } catch (error) {
      console.error('Error updating water intake:', error);
      setUpdating(false);
    }
  };

  const percentageFilled = Math.min(100, (waterIntake.amount / waterIntake.goal) * 100);
  const glassesCount = Math.floor(waterIntake.amount / 250); // Assuming 250ml per glass

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-md overflow-hidden h-full relative bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600">
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white"></div>
        <div className="absolute top-1/4 -left-20 w-60 h-60 rounded-full bg-white"></div>
        <div className="absolute bottom-1/3 right-0 w-40 h-40 rounded-full bg-white"></div>
      </div>
      
      {/* Animated Water Drops Background - Full Card */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {generateWaterDrops(20).map((drop) => (
          <motion.div
            key={drop.id}
            className="absolute rounded-full bg-white"
            style={{
              left: drop.left,
              width: drop.size,
              height: drop.size * 1.5,
              opacity: drop.opacity,
              filter: 'blur(1px)',
              zIndex: 1
            }}
            initial={{ y: -20, opacity: 0 }}
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
      </div>
      
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Water Intake</h3>
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <FaWater className="text-white text-xl" />
          </div>
        </div>
      </div>

      <div className="p-5 relative z-10">
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
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
            
            {/* Water Splash Animation */}
            <AnimatePresence>
              {showSplash && (
                <motion.div 
                  className="absolute inset-0 z-20 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    const distance = 30 + Math.random() * 20;
                    const x = Math.cos(angle) * distance;
                    const y = Math.sin(angle) * distance;
                    const size = 3 + Math.random() * 4;
                    
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
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Water Drop Container */}
            <div className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900/30 overflow-hidden shadow-lg"
              style={{
                boxShadow: "0 0 15px rgba(59, 130, 246, 0.3), inset 0 0 10px rgba(59, 130, 246, 0.2)"
              }}>
              {/* Water Fill Animation */}
              <motion.div 
                initial={{ height: '0%' }}
                animate={{ height: `${percentageFilled}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute bottom-0 w-full bg-blue-500 dark:bg-blue-600"
                style={{ borderRadius: '100% 100% 0 0' }}
              >
                {/* Water Wave Animation */}
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
              </motion.div>
            </div>
            
            {/* Percentage Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div 
                  className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ textShadow: '0 0 5px rgba(59, 130, 246, 0.3)' }}
                >
                  {Math.round(percentageFilled)}%
                </motion.div>
                <div className="text-xs text-blue-500 dark:text-blue-300">
                  {waterIntake.amount}ml
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Goal: {waterIntake.goal}ml
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {glassesCount} glasses consumed
          </div>
        </div>

        <div className="flex justify-center space-x-4 mb-4 relative">
          <motion.button
            onClick={() => {
              if (waterIntake.amount > 0) {
                updateWaterIntake(-250);
              }
            }}
            disabled={waterIntake.amount <= 0 || updating}
            className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 disabled:opacity-50 relative overflow-hidden"
            whileTap={{ scale: 0.95 }}
            whileHover={{ boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)' }}
          >
            <FaMinus className="relative z-10" />
          </motion.button>
          
          <motion.button
            onClick={() => {
              setShowSplash(true);
              setTimeout(() => setShowSplash(false), 800);
              updateWaterIntake(250);
            }}
            disabled={updating}
            className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 disabled:opacity-50 relative overflow-hidden"
            whileTap={{ scale: 0.95 }}
            whileHover={{ boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)' }}
          >
            <FaPlus className="relative z-10" />
            
            {/* Water splash effect */}
            <AnimatePresence>
              {showSplash && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Multiple water drops */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i / 8) * Math.PI * 2;
                    const x = Math.cos(angle) * 20;
                    const y = Math.sin(angle) * 20;
                    return (
                      <motion.div
                        key={`splash-${i}`}
                        className="absolute w-2 h-2 bg-blue-400 rounded-full"
                        style={{ filter: 'blur(1px)' }}
                        initial={{ x: 0, y: 0, opacity: 0.8 }}
                        animate={{ 
                          x: x, 
                          y: y, 
                          opacity: 0,
                          scale: [1, 1.5, 0]
                        }}
                        transition={{ 
                          duration: 0.8, 
                          ease: "easeOut" 
                        }}
                      />
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link 
            href="/pages/water-tracker"
            className="block w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-center text-sm font-medium shadow-md"
          >
            View Details
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default WaterTracker;
