'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWind, FaPlay, FaPause, FaCheck } from 'react-icons/fa';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';
import { format } from 'date-fns';

interface BreathingSession {
  date: string;
  technique: string;
  duration: number;
  completed: boolean;
  timestamp: Date;
}

interface BreathingData {
  totalSessions: number;
  weeklyMinutes: number;
  lastSession: Date | null;
  favoriteExercise: string;
}

const BreathingExercises = () => {
  const { user } = useAuth();
  const [breathingData, setBreathingData] = useState<BreathingData>({
    totalSessions: 0,
    weeklyMinutes: 0,
    lastSession: null,
    favoriteExercise: '4-7-8 Breathing'
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [phaseTimer, setPhaseTimer] = useState<number>(0);
  const [showCompletedAnimation, setShowCompletedAnimation] = useState(false);

  // Breathing exercise techniques
  const breathingTechniques = [
    { id: 'box', name: 'Box Breathing', pattern: [4, 4, 4, 4], description: 'Inhale, hold, exhale, hold' },
    { id: '478', name: '4-7-8 Breathing', pattern: [4, 7, 8], description: 'Inhale, hold, exhale' },
    { id: 'deep', name: 'Deep Breathing', pattern: [5, 0, 5], description: 'Inhale, exhale' }
  ];

  useEffect(() => {
    const fetchBreathingData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const breathingDocRef = doc(db, `users/${user.uid}/mentalHealth/breathing`);
        const breathingDoc = await getDoc(breathingDocRef);

        if (breathingDoc.exists()) {
          const data = breathingDoc.data();
          setBreathingData({
            totalSessions: data.totalSessions || 0,
            weeklyMinutes: data.weeklyMinutes || 0,
            lastSession: data.lastSession?.toDate() || null,
            favoriteExercise: data.favoriteExercise || '4-7-8 Breathing'
          });
        } else {
          // Create a new document if it doesn't exist
          const newBreathingData = {
            totalSessions: 0,
            weeklyMinutes: 0,
            lastSession: null,
            favoriteExercise: '4-7-8 Breathing',
            lastUpdated: new Date()
          };
          setBreathingData(newBreathingData);
          await setDoc(breathingDocRef, {
            ...newBreathingData,
            lastUpdated: serverTimestamp()
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching breathing data:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchBreathingData();
    
    // Set up real-time listener for updates
    if (user) {
      const breathingDocRef = doc(db, `users/${user.uid}/mentalHealth/breathing`);
      
      const unsubscribe = onSnapshot(breathingDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setBreathingData({
            totalSessions: data.totalSessions || 0,
            weeklyMinutes: data.weeklyMinutes || 0,
            lastSession: data.lastSession?.toDate() || null,
            favoriteExercise: data.favoriteExercise || '4-7-8 Breathing'
          });
        }
      });
      
      // Clean up listener on unmount
      return () => unsubscribe();
    }
  }, [user]);

  // Timer effect for the breathing exercise
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
        setPhaseTimer(prevPhaseTimer => prevPhaseTimer + 1);
        
        // Update breathing phase based on the active technique
        if (activeExercise) {
          const technique = breathingTechniques.find(t => t.id === activeExercise);
          if (technique) {
            const pattern = technique.pattern;
            
            if (breathPhase === 'inhale' && phaseTimer >= pattern[0]) {
              setBreathPhase('hold');
              setPhaseTimer(0);
            } else if (breathPhase === 'hold') {
              if (pattern[1] === 0 || phaseTimer >= pattern[1]) {
                setBreathPhase('exhale');
                setPhaseTimer(0);
              }
            } else if (breathPhase === 'exhale' && phaseTimer >= pattern[2]) {
              if (pattern.length > 3 && pattern[3] > 0) {
                // For box breathing with a second hold
                setBreathPhase('hold');
                setPhaseTimer(0);
              } else {
                setBreathPhase('inhale');
                setPhaseTimer(0);
              }
            }
          }
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, activeExercise, breathPhase, phaseTimer]);

  const startExercise = (techniqueId: string) => {
    setActiveExercise(techniqueId);
    setTimer(0);
    setPhaseTimer(0);
    setBreathPhase('inhale');
    setIsRunning(true);
  };

  const togglePause = () => {
    setIsRunning(!isRunning);
  };

  const completeExercise = async () => {
    if (!user || updating || !activeExercise) return;

    try {
      setUpdating(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const breathingDocRef = doc(db, `users/${user.uid}/mentalHealth/breathing`);
      const sessionsCollectionRef = collection(db, `users/${user.uid}/mentalHealth/breathing/sessions`);
      
      // Calculate duration in minutes (rounded up)
      const durationMinutes = Math.ceil(timer / 60);
      
      // Get the technique name
      const technique = breathingTechniques.find(t => t.id === activeExercise)?.name || 'Custom';
      
      // Add a new session
      const sessionId = `session_${Date.now()}`;
      await setDoc(doc(sessionsCollectionRef, sessionId), {
        date: today,
        technique: technique,
        duration: durationMinutes,
        completed: true,
        timestamp: serverTimestamp()
      });
      
      // Update the main document
      const newTotalSessions = breathingData.totalSessions + 1;
      const newWeeklyMinutes = breathingData.weeklyMinutes + durationMinutes;
      
      await updateDoc(breathingDocRef, {
        totalSessions: newTotalSessions,
        weeklyMinutes: newWeeklyMinutes,
        lastSession: new Date(),
        lastUpdated: serverTimestamp()
      });

      // Update local state
      setBreathingData({
        ...breathingData,
        totalSessions: newTotalSessions,
        weeklyMinutes: newWeeklyMinutes,
        lastSession: new Date()
      });
      
      // Reset exercise state
      setIsRunning(false);
      setActiveExercise(null);
      setTimer(0);
      
      // Show completion animation
      setShowCompletedAnimation(true);
      setTimeout(() => setShowCompletedAnimation(false), 2000);
      
      setUpdating(false);
    } catch (error) {
      console.error('Error completing breathing exercise:', error);
      setUpdating(false);
    }
  };

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Generate animated particles for background
  const generateParticles = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `particle-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 6,
      duration: 15 + Math.random() * 30,
      delay: Math.random() * 10,
      opacity: 0.1 + Math.random() * 0.3
    }));
  };
  
  const particles = generateParticles(15);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-md overflow-hidden h-full flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-md overflow-hidden h-full relative bg-gradient-to-br from-cyan-500 to-blue-600">
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
              scale: [1, 1.5, 1],
              y: [particle.y, particle.y - 10, particle.y]
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
      
      {/* Completion Animation */}
      <AnimatePresence>
        {showCompletedAnimation && (
          <motion.div 
            className="absolute inset-0 bg-white/20 flex items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/20 rounded-full p-6"
            >
              <FaCheck className="text-white text-4xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Breathing</h3>
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <FaWind className="text-white text-xl" />
          </div>
        </div>

        {!activeExercise ? (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-white font-medium">Weekly Practice</div>
                <div className="text-white font-bold">{breathingData.weeklyMinutes} mins</div>
              </div>
              
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-white/40"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (breathingData.weeklyMinutes / 60) * 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              
              <div className="text-white/70 text-xs mt-1 text-right">Goal: 60 mins/week</div>
            </div>

            <div className="mb-4">
              <div className="text-white font-medium mb-2">Quick Start</div>
              
              <div className="space-y-2">
                {breathingTechniques.map(technique => (
                  <motion.button
                    key={technique.id}
                    onClick={() => startExercise(technique.id)}
                    className="w-full py-2 px-3 bg-white/10 rounded-lg text-white text-sm flex justify-between items-center"
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-left">
                      <div className="font-medium">{technique.name}</div>
                      <div className="text-xs text-white/70">{technique.description}</div>
                    </div>
                    <FaPlay className="text-white/70" />
                  </motion.button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="mb-4">
            <div className="text-center mb-4">
              <div className="text-white font-medium">
                {breathingTechniques.find(t => t.id === activeExercise)?.name}
              </div>
              <div className="text-white/70 text-xs">
                {breathingTechniques.find(t => t.id === activeExercise)?.description}
              </div>
            </div>
            
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-white/10 flex items-center justify-center">
                <div className="text-white text-2xl font-bold">
                  {formatTime(timer)}
                </div>
              </div>
              
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-white/30"
                animate={{
                  scale: breathPhase === 'inhale' ? [1, 1.2] : 
                          breathPhase === 'exhale' ? [1.2, 1] : 1
                }}
                transition={{
                  duration: breathPhase === 'inhale' ? 
                            breathingTechniques.find(t => t.id === activeExercise)?.pattern[0] || 4 : 
                            breathPhase === 'exhale' ? 
                            breathingTechniques.find(t => t.id === activeExercise)?.pattern[2] || 4 : 0.1,
                  ease: "easeInOut",
                  repeat: breathPhase === 'hold' ? 0 : 0
                }}
              />
            </div>
            
            <div className="text-center text-white text-lg font-medium mb-4">
              {breathPhase === 'inhale' ? 'Inhale' : 
               breathPhase === 'hold' ? 'Hold' : 'Exhale'}
            </div>
            
            <div className="flex justify-center space-x-4">
              <motion.button
                onClick={togglePause}
                className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                {isRunning ? <FaPause /> : <FaPlay />}
              </motion.button>
              
              <motion.button
                onClick={completeExercise}
                className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                <FaCheck />
              </motion.button>
            </div>
          </div>
        )}

        {!activeExercise && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              href="/pages/mental-health/breathing"
              className="block w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-center text-sm font-medium"
            >
              View All Exercises
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BreathingExercises;
