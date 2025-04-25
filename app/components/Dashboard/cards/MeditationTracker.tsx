'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMinus, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { GiMeditation } from 'react-icons/gi';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';
import { format, subDays } from 'date-fns';

interface MeditationSession {
  date: string;
  minutes: number;
  type: string;
  completed: boolean;
  timestamp: Date;
}

interface MeditationData {
  totalMinutes: number;
  weeklyMinutes: number;
  streak: number;
  lastSession: Date | null;
  goal: number;
}

// Generate animated particles for background
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `particle-${i}`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 15 + Math.random() * 30,
    delay: Math.random() * 10,
    opacity: 0.1 + Math.random() * 0.2
  }));
};

const MeditationTracker = () => {
  const { user } = useAuth();
  const [meditationData, setMeditationData] = useState<MeditationData>({
    totalMinutes: 0,
    weeklyMinutes: 0,
    streak: 0,
    lastSession: null,
    goal: 10 // Default daily goal: 10 minutes
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [showMeditationHistory, setShowMeditationHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSessions, setSelectedSessions] = useState<MeditationSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Generate particles for animation
  const particles = generateParticles(15);

  useEffect(() => {
    const fetchMeditationData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const meditationDocRef = doc(db, `users/${user.uid}/mentalHealth/meditation`);
        const meditationDoc = await getDoc(meditationDocRef);

        if (meditationDoc.exists()) {
          const data = meditationDoc.data();
          setMeditationData({
            totalMinutes: data.totalMinutes || 0,
            weeklyMinutes: data.weeklyMinutes || 0,
            streak: data.streak || 0,
            lastSession: data.lastSession?.toDate() || null,
            goal: data.goal || 10
          });
        } else {
          // Create a new document if it doesn't exist
          const newMeditationData = {
            totalMinutes: 0,
            weeklyMinutes: 0,
            streak: 0,
            lastSession: null,
            goal: 10,
            lastUpdated: new Date()
          };
          setMeditationData(newMeditationData);
          await setDoc(meditationDocRef, {
            ...newMeditationData,
            lastUpdated: serverTimestamp()
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching meditation data:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchMeditationData();
    
    // Set up real-time listener for updates
    if (user) {
      const meditationDocRef = doc(db, `users/${user.uid}/mentalHealth/meditation`);
      
      const unsubscribe = onSnapshot(meditationDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setMeditationData({
            totalMinutes: data.totalMinutes || 0,
            weeklyMinutes: data.weeklyMinutes || 0,
            streak: data.streak || 0,
            lastSession: data.lastSession?.toDate() || null,
            goal: data.goal || 10
          });
        }
      });
      
      // Clean up listener on unmount
      return () => unsubscribe();
    }
  }, [user]);

  const updateMeditationTime = async (minutes: number) => {
    if (!user || updating) return;

    try {
      setUpdating(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const meditationDocRef = doc(db, `users/${user.uid}/mentalHealth/meditation`);
      const sessionsCollectionRef = collection(db, `users/${user.uid}/mentalHealth/meditation/sessions`);
      
      // Check if we need to update the streak
      let newStreak = meditationData.streak;
      const lastSessionDate = meditationData.lastSession 
        ? format(meditationData.lastSession, 'yyyy-MM-dd')
        : null;
        
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      
      if (!lastSessionDate || lastSessionDate === today) {
        // Already meditated today, just update the time
        newStreak = meditationData.streak;
      } else if (lastSessionDate === yesterday) {
        // Meditated yesterday, increment streak
        newStreak = meditationData.streak + 1;
      } else {
        // Missed a day, reset streak
        newStreak = 1;
      }
      
      // Add a new session
      const sessionId = `session_${Date.now()}`;
      await setDoc(doc(sessionsCollectionRef, sessionId), {
        date: today,
        minutes: minutes,
        type: 'mindfulness',
        completed: true,
        timestamp: serverTimestamp()
      });
      
      // Update the main document
      const newTotalMinutes = meditationData.totalMinutes + minutes;
      const newWeeklyMinutes = meditationData.weeklyMinutes + minutes;
      
      await updateDoc(meditationDocRef, {
        totalMinutes: newTotalMinutes,
        weeklyMinutes: newWeeklyMinutes,
        streak: newStreak,
        lastSession: new Date(),
        lastUpdated: serverTimestamp()
      });

      // Update local state
      setMeditationData({
        ...meditationData,
        totalMinutes: newTotalMinutes,
        weeklyMinutes: newWeeklyMinutes,
        streak: newStreak,
        lastSession: new Date()
      });
      
      // Show pulse animation
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 2000);
      
      setUpdating(false);
    } catch (error) {
      console.error('Error updating meditation time:', error);
      setUpdating(false);
    }
  };

  // Fetch meditation sessions for a specific date
  const fetchSessionsForDate = async (date: string) => {
    if (!user) return;
    
    setLoadingSessions(true);
    try {
      // Use the correct path that matches our Firestore rules
      const sessionsCollectionRef = collection(db, `users/${user.uid}/mentalHealth/meditation/sessions`);
      const sessionsQuery = query(sessionsCollectionRef, orderBy('timestamp', 'desc'));
      
      try {
        const sessionsSnapshot = await getDocs(sessionsQuery);
        
        const allSessions: MeditationSession[] = [];
        sessionsSnapshot.forEach(doc => {
          const data = doc.data();
          allSessions.push({
            date: data.date,
            minutes: data.minutes,
            type: data.type,
            completed: data.completed,
            timestamp: data.timestamp.toDate()
          });
        });
        
        // Filter sessions for the selected date
        const sessionsForDate = allSessions.filter(session => session.date === date);
        setSelectedSessions(sessionsForDate);
      } catch (error) {
        console.error('Error accessing meditation sessions:', error);
      }
    } catch (err) {
      console.error('Error fetching meditation sessions for date:', err);
    } finally {
      setLoadingSessions(false);
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
    fetchSessionsForDate(formattedDate);
  };

  const percentageComplete = Math.min(100, (meditationData.weeklyMinutes / (meditationData.goal * 7)) * 100);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-md overflow-hidden h-full flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-md overflow-hidden h-full relative bg-gradient-to-br from-purple-500 to-indigo-600">
      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
              filter: 'blur(1px)'
            }}
            animate={{
              opacity: [particle.opacity, particle.opacity * 2, particle.opacity],
              scale: [1, 1.5, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: particle.duration,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Pulse Animation */}
      <AnimatePresence>
        {showPulse && (
          <motion.div 
            className="absolute inset-0 bg-white rounded-xl"
            initial={{ opacity: 0.5, scale: 0.8 }}
            animate={{ opacity: 0, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
        )}
      </AnimatePresence>
      
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Meditation</h3>
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <GiMeditation className="text-white text-xl" />
          </div>
        </div>

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
                    duration: 4,
                    delay: i * 1.2,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
            
            {/* Progress Circle */}
            <div className="absolute inset-0 rounded-full bg-white/10 overflow-hidden shadow-lg">
              <motion.div 
                initial={{ height: '0%' }}
                animate={{ height: `${percentageComplete}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute bottom-0 w-full bg-white/30"
                style={{ borderRadius: '100% 100% 0 0' }}
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
              </motion.div>
            </div>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div 
                className="text-2xl font-bold text-white"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}
              >
                {meditationData.weeklyMinutes}
              </motion.div>
              <div className="text-xs text-white/80">
                minutes this week
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-sm text-white/80">
            Goal: {meditationData.goal} min/day
          </div>
          <div className="text-xs text-white/60 mt-1">
            {meditationData.streak} day streak
          </div>
        </div>

        <div className="flex justify-center space-x-4 mb-4">
          <motion.button
            onClick={() => updateMeditationTime(5)}
            disabled={updating}
            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white disabled:opacity-50"
            whileTap={{ scale: 0.95 }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
          >
            +5
          </motion.button>
          <motion.button
            onClick={() => updateMeditationTime(10)}
            disabled={updating}
            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white disabled:opacity-50"
            whileTap={{ scale: 0.95 }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
          >
            +10
          </motion.button>
          <motion.button
            onClick={() => updateMeditationTime(15)}
            disabled={updating}
            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white disabled:opacity-50"
            whileTap={{ scale: 0.95 }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
          >
            +15
          </motion.button>
        </div>

        <div className="flex flex-col space-y-2">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button 
              onClick={() => {
                setShowMeditationHistory(true);
                fetchSessionsForDate(selectedDate);
              }}
              className="block w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-center text-sm font-medium"
            >
              <span className="flex items-center justify-center gap-2">
                <FaCalendarAlt className="w-3 h-3" />
                Meditation History
              </span>
            </button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            
          </motion.div>
        </div>
      </div>

      {/* Meditation History Modal */}
      <AnimatePresence>
        {showMeditationHistory && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowMeditationHistory(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                transition: { 
                  type: "spring", 
                  damping: 25, 
                  stiffness: 300,
                  duration: 0.4 
                }
              }}
              exit={{ 
                y: '100%', 
                opacity: 0,
                transition: { duration: 0.3 }
              }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto z-50"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Meditation History
                  </h3>
                  <button
                    onClick={() => setShowMeditationHistory(false)}
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
                              ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500' 
                              : isToday(date)
                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700'
                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}
                          `}
                        >
                          <span className={`text-xs ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}`}>
                            {format(date, 'EEE')}
                          </span>
                          <span className={`text-lg font-bold ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>
                            {date.getDate()}
                          </span>
                          <span className={`text-xs ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}`}>
                            {format(date, 'MMM')}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Meditation data for selected date */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Meditation for {formatDateForDisplay(new Date(selectedDate))}
                  </h4>
                  
                  {loadingSessions ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : selectedSessions.length > 0 ? (
                    <div className="space-y-4">
                      {/* Daily Summary */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                        <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                          Daily Summary
                        </h5>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Minutes</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {selectedSessions.reduce((sum, session) => sum + session.minutes, 0)} mins
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Sessions</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {selectedSessions.length}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Goal</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {meditationData.goal} mins
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Sessions List */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          Sessions
                        </h5>
                        {selectedSessions.map((session, index) => (
                          <div
                            key={`session-${index}`}
                            className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                                  <GiMeditation className="text-purple-600 dark:text-purple-400 text-xl" />
                                </div>
                                <div>
                                  <h6 className="font-semibold text-gray-900 dark:text-white capitalize">
                                    {session.type} Meditation
                                  </h6>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {format(session.timestamp, 'h:mm a')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {session.minutes} mins
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                  {session.completed ? 'Completed' : 'In Progress'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <GiMeditation className="text-3xl text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">No meditation sessions recorded for this date</p>
                      <button 
                        onClick={() => setShowMeditationHistory(false)}
                        className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                      >
                        Add a session
                      </button>
                    </div>
                  )}
                </div>

                {/* Meditation Benefits */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                  <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Benefits of Regular Meditation
                  </h5>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Reduces stress and anxiety</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Improves focus and concentration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Enhances self-awareness and mindfulness</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Promotes better sleep quality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Supports emotional health and well-being</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
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

export default MeditationTracker;
