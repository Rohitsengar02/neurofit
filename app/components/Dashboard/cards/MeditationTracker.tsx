'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMinus, FaCalendarAlt } from 'react-icons/fa';
import { GiMeditation } from 'react-icons/gi';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
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

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link 
            href="/pages/mental-health/meditation"
            className="block w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-center text-sm font-medium"
          >
            View Details
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default MeditationTracker;
