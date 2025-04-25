'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMoon, FaPlus, FaBed, FaChartLine, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';
import { format, subDays } from 'date-fns';

interface SleepEntry {
  id: string;
  date: string;
  hoursSlept: number;
  quality: number; // 1-10
  deepSleepPercentage: number;
  remSleepPercentage: number;
  lightSleepPercentage: number;
  timestamp: Date;
}

interface SleepData {
  weeklyAverage: number;
  qualityAverage: number;
  lastEntry: Date | null;
  recentEntries: SleepEntry[];
  trend: 'improving' | 'worsening' | 'stable';
}

const SleepQualityInsights = () => {
  const { user } = useAuth();
  const [sleepData, setSleepData] = useState<SleepData>({
    weeklyAverage: 0,
    qualityAverage: 0,
    lastEntry: null,
    recentEntries: [],
    trend: 'stable'
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [hoursSlept, setHoursSlept] = useState(7.5);
  const [quality, setQuality] = useState(7);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showSleepAnalysis, setShowSleepAnalysis] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedEntries, setSelectedEntries] = useState<SleepEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Generate animated stars for background
  const generateStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `star-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 5,
      opacity: 0.3 + Math.random() * 0.7
    }));
  };
  
  const stars = generateStars(30);

  // Fetch sleep entries for a specific date
  const fetchSleepEntriesForDate = async (date: string) => {
    if (!user) return;
    
    setLoadingEntries(true);
    try {
      // Use the correct path that matches our Firestore rules
      const entriesCollectionRef = collection(db, `users/${user.uid}/mentalHealth/sleep/entries`);
      const entriesQuery = query(entriesCollectionRef, orderBy('timestamp', 'desc'));
      
      try {
        const entriesSnapshot = await getDocs(entriesQuery);
        
        const allEntries: SleepEntry[] = [];
        entriesSnapshot.forEach(doc => {
          const data = doc.data();
          allEntries.push({
            id: doc.id,
            date: data.date,
            hoursSlept: data.hoursSlept,
            quality: data.quality,
            deepSleepPercentage: data.deepSleepPercentage || 25,
            remSleepPercentage: data.remSleepPercentage || 25,
            lightSleepPercentage: data.lightSleepPercentage || 50,
            timestamp: data.timestamp.toDate()
          });
        });
        
        // Filter entries for the selected date
        const entriesForDate = allEntries.filter(entry => entry.date === date);
        setSelectedEntries(entriesForDate);
      } catch (error) {
        console.error('Error accessing sleep entries:', error);
      }
    } catch (err) {
      console.error('Error fetching sleep entries for date:', err);
    } finally {
      setLoadingEntries(false);
    }
  };
  
  // Generate calendar dates
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    const seenDates = new Set(); // Track dates we've already added
    
    // Generate dates for the last 30 days
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Only add the date if we haven't seen it before
      if (!seenDates.has(dateStr)) {
        seenDates.add(dateStr);
        dates.push(date);
      }
    }
    
    return dates;
  };
  
  // Format date for display
  const formatDateForDisplay = (date: Date) => {
    return format(date, 'EEE, MMM d');
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
    const formattedDate = format(date, 'yyyy-MM-dd');
    setSelectedDate(formattedDate);
    fetchSleepEntriesForDate(formattedDate);
  };

  useEffect(() => {
    const fetchSleepData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const sleepDocRef = doc(db, `users/${user.uid}/mentalHealth/sleep`);
        const sleepDoc = await getDoc(sleepDocRef);

        // Get recent entries
        const entriesCollectionRef = collection(db, `users/${user.uid}/mentalHealth/sleep/entries`);
        const entriesQuery = query(entriesCollectionRef, orderBy('timestamp', 'desc'), limit(7));
        const entriesSnapshot = await getDocs(entriesQuery);
        
        const recentEntries: SleepEntry[] = [];
        entriesSnapshot.forEach(doc => {
          const data = doc.data();
          recentEntries.push({
            id: doc.id,
            date: data.date,
            hoursSlept: data.hoursSlept,
            quality: data.quality,
            deepSleepPercentage: data.deepSleepPercentage || 25,
            remSleepPercentage: data.remSleepPercentage || 25,
            lightSleepPercentage: data.lightSleepPercentage || 50,
            timestamp: data.timestamp.toDate()
          });
        });

        // Calculate weekly average
        let weeklyAverage = 0;
        let qualityAverage = 0;
        
        if (recentEntries.length > 0) {
          weeklyAverage = recentEntries.reduce((sum, entry) => sum + entry.hoursSlept, 0) / recentEntries.length;
          qualityAverage = recentEntries.reduce((sum, entry) => sum + entry.quality, 0) / recentEntries.length;
        }

        // Calculate trend
        let trend: 'improving' | 'worsening' | 'stable' = 'stable';
        if (recentEntries.length >= 3) {
          const oldAvg = recentEntries.slice(Math.max(recentEntries.length - 3, 0)).reduce((sum, entry) => sum + entry.quality, 0) / Math.min(3, recentEntries.length);
          const newAvg = recentEntries.slice(0, 3).reduce((sum, entry) => sum + entry.quality, 0) / Math.min(3, recentEntries.length);
          
          if (newAvg > oldAvg + 0.5) {
            trend = 'improving';
          } else if (newAvg < oldAvg - 0.5) {
            trend = 'worsening';
          }
        }

        if (sleepDoc.exists()) {
          const data = sleepDoc.data();
          setSleepData({
            weeklyAverage,
            qualityAverage,
            lastEntry: data.lastEntry?.toDate() || null,
            recentEntries,
            trend
          });
        } else {
          // Create a new document if it doesn't exist
          const newSleepData = {
            weeklyAverage,
            qualityAverage,
            lastEntry: null,
            lastUpdated: new Date()
          };
          setSleepData({
            ...newSleepData,
            recentEntries,
            trend
          });
          await setDoc(sleepDocRef, {
            ...newSleepData,
            lastUpdated: serverTimestamp()
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sleep data:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchSleepData();
    
    // Set up real-time listener for updates
    if (user) {
      const sleepDocRef = doc(db, `users/${user.uid}/mentalHealth/sleep`);
      
      const unsubscribe = onSnapshot(sleepDocRef, async (doc) => {
        if (doc.exists()) {
          // Get recent entries
          const entriesCollectionRef = collection(db, `users/${user.uid}/mentalHealth/sleep/entries`);
          const entriesQuery = query(entriesCollectionRef, orderBy('timestamp', 'desc'), limit(7));
          const entriesSnapshot = await getDocs(entriesQuery);
          
          const recentEntries: SleepEntry[] = [];
          entriesSnapshot.forEach(doc => {
            const data = doc.data();
            recentEntries.push({
              id: doc.id,
              date: data.date,
              hoursSlept: data.hoursSlept,
              quality: data.quality,
              deepSleepPercentage: data.deepSleepPercentage || 25,
              remSleepPercentage: data.remSleepPercentage || 25,
              lightSleepPercentage: data.lightSleepPercentage || 50,
              timestamp: data.timestamp.toDate()
            });
          });
          
          // Calculate weekly average
          let weeklyAverage = 0;
          let qualityAverage = 0;
          
          if (recentEntries.length > 0) {
            weeklyAverage = recentEntries.reduce((sum, entry) => sum + entry.hoursSlept, 0) / recentEntries.length;
            qualityAverage = recentEntries.reduce((sum, entry) => sum + entry.quality, 0) / recentEntries.length;
          }

          // Calculate trend
          let trend: 'improving' | 'worsening' | 'stable' = 'stable';
          if (recentEntries.length >= 3) {
            const oldAvg = recentEntries.slice(Math.max(recentEntries.length - 3, 0)).reduce((sum, entry) => sum + entry.quality, 0) / Math.min(3, recentEntries.length);
            const newAvg = recentEntries.slice(0, 3).reduce((sum, entry) => sum + entry.quality, 0) / Math.min(3, recentEntries.length);
            
            if (newAvg > oldAvg + 0.5) {
              trend = 'improving';
            } else if (newAvg < oldAvg - 0.5) {
              trend = 'worsening';
            }
          }
          
          const data = doc.data();
          setSleepData({
            weeklyAverage,
            qualityAverage,
            lastEntry: data.lastEntry?.toDate() || null,
            recentEntries,
            trend
          });
        }
      });
      
      // Clean up listener on unmount
      return () => unsubscribe();
    }
  }, [user]);

  const addSleepEntry = async () => {
    if (!user || updating) return;

    try {
      setUpdating(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const sleepDocRef = doc(db, `users/${user.uid}/mentalHealth/sleep`);
      const entriesCollectionRef = collection(db, `users/${user.uid}/mentalHealth/sleep/entries`);
      
      // Generate random sleep phase percentages that add up to 100%
      const deepSleep = Math.floor(20 + Math.random() * 15); // 20-35%
      const remSleep = Math.floor(15 + Math.random() * 15); // 15-30%
      const lightSleep = 100 - deepSleep - remSleep; // Remaining percentage
      
      // First, check if the sleep document exists and create it if it doesn't
      const timestamp = Date.now();
      const entryId = `entry_${timestamp}`;
      
      try {
        const sleepDoc = await getDoc(sleepDocRef);
        if (!sleepDoc.exists()) {
          // Create the sleep document if it doesn't exist
          await setDoc(sleepDocRef, {
            lastUpdated: serverTimestamp()
          });
        }
        
        // Add a new entry with a unique timestamp to prevent duplicate keys
        await setDoc(doc(entriesCollectionRef, entryId), {
          id: entryId, // Include ID in the document data
          date: today,
          hoursSlept: hoursSlept,
          quality: quality,
          deepSleepPercentage: deepSleep,
          remSleepPercentage: remSleep,
          lightSleepPercentage: lightSleep,
          timestamp: serverTimestamp()
        });
        
        // Update the main document
        await updateDoc(sleepDocRef, {
          lastEntry: new Date(),
          lastUpdated: serverTimestamp()
        });
      } catch (error) {
        console.error('Error saving sleep data:', error);
        throw error;
      }

      // Update local state
      const newEntry: SleepEntry = {
        id: entryId,
        date: today,
        hoursSlept: hoursSlept,
        quality: quality,
        deepSleepPercentage: deepSleep,
        remSleepPercentage: remSleep,
        lightSleepPercentage: lightSleep,
        timestamp: new Date()
      };
      
      const updatedEntries = [newEntry, ...sleepData.recentEntries.slice(0, 6)];
      
      // Calculate new weekly average
      const newWeeklyAverage = updatedEntries.reduce((sum, entry) => sum + entry.hoursSlept, 0) / updatedEntries.length;
      const newQualityAverage = updatedEntries.reduce((sum, entry) => sum + entry.quality, 0) / updatedEntries.length;
      
      // Calculate new trend
      let newTrend: 'improving' | 'worsening' | 'stable' = sleepData.trend;
      if (updatedEntries.length >= 3) {
        const oldAvg = updatedEntries.slice(Math.max(updatedEntries.length - 3, 0)).reduce((sum, entry) => sum + entry.quality, 0) / Math.min(3, updatedEntries.length);
        const newAvg = updatedEntries.slice(0, 3).reduce((sum, entry) => sum + entry.quality, 0) / Math.min(3, updatedEntries.length);
        
        if (newAvg > oldAvg + 0.5) {
          newTrend = 'improving';
        } else if (newAvg < oldAvg - 0.5) {
          newTrend = 'worsening';
        }
      }
      
      setSleepData({
        weeklyAverage: newWeeklyAverage,
        qualityAverage: newQualityAverage,
        lastEntry: new Date(),
        recentEntries: updatedEntries,
        trend: newTrend
      });
      
      // Reset form
      setHoursSlept(7.5);
      setQuality(7);
      setShowAddForm(false);
      
      // Show animation
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);
      
      setUpdating(false);
    } catch (error) {
      console.error('Error adding sleep entry:', error);
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-md overflow-hidden h-full flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl shadow-md overflow-hidden h-full relative bg-gradient-to-br from-indigo-600 to-purple-700">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity
            }}
            animate={{
              opacity: [star.opacity, star.opacity * 1.5, star.opacity],
              scale: [1, 1.2, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: star.duration,
              delay: star.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Moon Animation */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/20 blur-md pointer-events-none"></div>
      
      {/* Completion Animation */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div 
            className="absolute inset-0 bg-white/10 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex flex-col items-center"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 20 }}
              transition={{ duration: 0.5 }}
            >
              <FaMoon className="text-white text-4xl mb-2" />
              <div className="text-white font-medium">Sleep Logged!</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Sleep Quality</h3>
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <FaMoon className="text-white text-xl" />
          </div>
        </div>

        {!showAddForm ? (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <div className="text-white font-medium">Weekly Average</div>
                <div className="flex items-center">
                  <div className="text-white font-bold text-xl mr-2">{sleepData.weeklyAverage.toFixed(1)} hrs</div>
                  {sleepData.trend === 'improving' ? (
                    <div className="bg-green-400/30 text-white text-xs px-2 py-0.5 rounded-full">Improving</div>
                  ) : sleepData.trend === 'worsening' ? (
                    <div className="bg-red-400/30 text-white text-xs px-2 py-0.5 rounded-full">Worsening</div>
                  ) : (
                    <div className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">Stable</div>
                  )}
                </div>
              </div>
              
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                <motion.div 
                  className={`h-full ${
                    sleepData.weeklyAverage >= 7 ? 'bg-green-400/70' : 
                    sleepData.weeklyAverage >= 6 ? 'bg-yellow-400/70' : 
                    'bg-red-400/70'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (sleepData.weeklyAverage / 10) * 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              
              {sleepData.recentEntries.length > 0 && (
                <div className="bg-white/10 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-medium">Latest Sleep</div>
                    <div className="text-white/70 text-xs">
                      {sleepData.recentEntries[0].date}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <div className="text-white/80 text-sm">Duration</div>
                    <div className="text-white font-medium">{sleepData.recentEntries[0].hoursSlept} hrs</div>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <div className="text-white/80 text-sm">Quality</div>
                    <div className="text-white font-medium">{sleepData.recentEntries[0].quality}/10</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70">Deep Sleep</span>
                      <span className="text-white/90">{sleepData.recentEntries[0].deepSleepPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-indigo-300"
                        initial={{ width: 0 }}
                        animate={{ width: `${sleepData.recentEntries[0].deepSleepPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70">REM Sleep</span>
                      <span className="text-white/90">{sleepData.recentEntries[0].remSleepPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-purple-300"
                        initial={{ width: 0 }}
                        animate={{ width: `${sleepData.recentEntries[0].remSleepPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70">Light Sleep</span>
                      <span className="text-white/90">{sleepData.recentEntries[0].lightSleepPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-300"
                        initial={{ width: 0 }}
                        animate={{ width: `${sleepData.recentEntries[0].lightSleepPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2 bg-white/20 rounded-lg text-white text-sm font-medium flex items-center justify-center mb-4"
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus className="mr-2" /> Log Last Night's Sleep
            </motion.button>
          </>
        ) : (
          <div className="mb-4">
            <div className="mb-3">
              <div className="text-white font-medium mb-2">Hours Slept</div>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={hoursSlept}
                  onChange={(e) => setHoursSlept(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
                <span className="ml-2 text-white font-bold">{hoursSlept} hrs</span>
              </div>
              <div className="flex justify-between text-white/70 text-xs mt-1">
                <span>0h</span>
                <span>12h</span>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="text-white font-medium mb-2">Sleep Quality (1-10)</div>
              <div className="flex items-center">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
                <span className="ml-2 text-white font-bold">{quality}/10</span>
              </div>
              <div className="flex justify-between text-white/70 text-xs mt-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <motion.button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 bg-white/10 rounded-lg text-white text-sm"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              
              <motion.button
                onClick={addSleepEntry}
                disabled={updating}
                className="flex-1 py-2 bg-white/20 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                Save
              </motion.button>
            </div>
          </div>
        )}

        {!showAddForm && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button 
              onClick={() => {
                setShowSleepAnalysis(true);
                fetchSleepEntriesForDate(selectedDate);
              }}
              className="block w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-center text-sm font-medium"
            >
              View Sleep Analysis
            </button>
          </motion.div>
        )}
      </div>
      </div>

      {/* Sleep Analysis Modal */}
      <AnimatePresence>
        {showSleepAnalysis && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowSleepAnalysis(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="fixed bottom-12 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto z-50"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Sleep Analysis
                  </h3>
                  <button
                    onClick={() => setShowSleepAnalysis(false)}
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
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const isSelected = dateStr === selectedDate;
                      return (
                        <motion.div
                          key={`date-${dateStr}-${index}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.01 }}
                          onClick={() => handleDateSelect(date)}
                          className={`
                            flex-shrink-0 snap-start w-20 h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer
                            ${isSelected 
                              ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-500' 
                              : isToday(date)
                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}
                          `}
                        >
                          <span className={`text-xs ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'}`}>
                            {format(date, 'EEE')}
                          </span>
                          <span className={`text-lg font-bold ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>
                            {date.getDate()}
                          </span>
                          <span className={`text-xs ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'}`}>
                            {format(date, 'MMM')}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Sleep data for selected date */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Sleep Data for {formatDateForDisplay(new Date(selectedDate))}
                  </h4>
                  
                  {loadingEntries ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : selectedEntries.length > 0 ? (
                    <div className="space-y-4">
                      {/* Sleep Summary */}
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                        <h5 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                          Sleep Summary
                        </h5>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Hours Slept</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {selectedEntries[0].hoursSlept.toFixed(1)} hrs
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Quality</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {selectedEntries[0].quality}/10
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Recorded</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {format(selectedEntries[0].timestamp, 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Sleep Cycles */}
                      <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Sleep Cycles
                        </h5>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600 dark:text-gray-300">Deep Sleep</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {selectedEntries[0].deepSleepPercentage}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-indigo-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${selectedEntries[0].deepSleepPercentage}%` }}
                                transition={{ duration: 1 }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600 dark:text-gray-300">REM Sleep</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {selectedEntries[0].remSleepPercentage}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-purple-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${selectedEntries[0].remSleepPercentage}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600 dark:text-gray-300">Light Sleep</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {selectedEntries[0].lightSleepPercentage}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${selectedEntries[0].lightSleepPercentage}%` }}
                                transition={{ duration: 1, delay: 0.4 }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sleep Quality Analysis */}
                      <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Sleep Quality Analysis
                        </h5>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${selectedEntries[0].quality >= 8 ? 'bg-green-500' : selectedEntries[0].quality >= 6 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {selectedEntries[0].quality >= 8 ? 'Excellent sleep quality' : 
                               selectedEntries[0].quality >= 6 ? 'Good sleep quality' : 
                               'Poor sleep quality'}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedEntries[0].hoursSlept >= 7 ? 
                              'You got sufficient sleep hours for optimal health.' : 
                              'You may need more sleep hours for optimal health.'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedEntries[0].deepSleepPercentage >= 25 ? 
                              'Your deep sleep percentage is good, supporting physical recovery.' : 
                              'Your deep sleep percentage is lower than ideal for optimal physical recovery.'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedEntries[0].remSleepPercentage >= 20 ? 
                              'Your REM sleep percentage is good, supporting cognitive function.' : 
                              'Your REM sleep percentage is lower than ideal for optimal cognitive function.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <FaBed className="text-3xl text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">No sleep data recorded for this date</p>
                      <button 
                        onClick={() => {
                          setShowSleepAnalysis(false);
                          setShowAddForm(true);
                        }}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                      >
                        Add sleep data
                      </button>
                    </div>
                  )}
                </div>

                {/* Weekly Trends */}
                {sleepData.recentEntries.length > 0 && (
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Weekly Trends
                    </h5>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Average Hours</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {sleepData.weeklyAverage.toFixed(1)} hrs
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full ${sleepData.weeklyAverage >= 7 ? 'bg-green-500' : sleepData.weeklyAverage >= 6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (sleepData.weeklyAverage / 10) * 100)}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Average Quality</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {sleepData.qualityAverage.toFixed(1)}/10
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full ${sleepData.qualityAverage >= 8 ? 'bg-green-500' : sleepData.qualityAverage >= 6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(sleepData.qualityAverage / 10) * 100}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${sleepData.trend === 'improving' ? 'bg-green-500' : sleepData.trend === 'worsening' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {sleepData.trend === 'improving' ? 'Your sleep quality is improving' : 
                           sleepData.trend === 'worsening' ? 'Your sleep quality is declining' : 
                           'Your sleep quality is stable'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sleep Tips */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
                  <h5 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                    Sleep Improvement Tips
                  </h5>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-0.5">•</span>
                      <span>Maintain a consistent sleep schedule, even on weekends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-0.5">•</span>
                      <span>Avoid caffeine and alcohol close to bedtime</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-0.5">•</span>
                      <span>Create a relaxing bedtime routine</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-0.5">•</span>
                      <span>Keep your bedroom cool, dark, and quiet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-0.5">•</span>
                      <span>Limit screen time at least 1 hour before bed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
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

export default SleepQualityInsights;
