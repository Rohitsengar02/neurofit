'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBrain, FaPlay, FaChartLine, FaTrophy } from 'react-icons/fa';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, onSnapshot, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';
import { format } from 'date-fns';

interface CognitiveSession {
  id: string;
  date: string;
  gameType: string;
  score: number;
  duration: number;
  timestamp: Date;
}

interface CognitiveData {
  totalSessions: number;
  highScore: number;
  lastSession: Date | null;
  weeklyProgress: number; // Percentage improvement
  recentSessions: CognitiveSession[];
}

// Brain training games
const brainGames = [
  { id: 'memory', name: 'Memory Match', description: 'Test your memory by matching pairs', icon: '🧠' },
  { id: 'reaction', name: 'Reaction Time', description: 'Test your reaction speed', icon: '⚡' },
  { id: 'focus', name: 'Focus Challenge', description: 'Stay focused and avoid distractions', icon: '👁️' }
];

const CognitiveTraining = () => {
  const { user } = useAuth();
  const [cognitiveData, setCognitiveData] = useState<CognitiveData>({
    totalSessions: 0,
    highScore: 0,
    lastSession: null,
    weeklyProgress: 0,
    recentSessions: []
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Generate animated neurons for background
  const generateNeurons = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `neuron-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 5,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 5,
      opacity: 0.1 + Math.random() * 0.3
    }));
  };
  
  const neurons = generateNeurons(15);

  useEffect(() => {
    const fetchCognitiveData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const cognitiveDocRef = doc(db, `users/${user.uid}/mentalHealth/cognitive`);
        const cognitiveDoc = await getDoc(cognitiveDocRef);

        // Get recent sessions
        const sessionsCollectionRef = collection(db, `users/${user.uid}/mentalHealth/cognitive/sessions`);
        const sessionsQuery = query(sessionsCollectionRef, orderBy('timestamp', 'desc'), limit(5));
        const sessionsSnapshot = await getDocs(sessionsQuery);
        
        const recentSessions: CognitiveSession[] = [];
        sessionsSnapshot.forEach(doc => {
          const data = doc.data();
          recentSessions.push({
            id: doc.id,
            date: data.date,
            gameType: data.gameType,
            score: data.score,
            duration: data.duration,
            timestamp: data.timestamp.toDate()
          });
        });

        if (cognitiveDoc.exists()) {
          const data = cognitiveDoc.data();
          setCognitiveData({
            totalSessions: data.totalSessions || 0,
            highScore: data.highScore || 0,
            lastSession: data.lastSession?.toDate() || null,
            weeklyProgress: data.weeklyProgress || 0,
            recentSessions
          });
        } else {
          // Create a new document if it doesn't exist
          const newCognitiveData = {
            totalSessions: 0,
            highScore: 0,
            lastSession: null,
            weeklyProgress: 0,
            lastUpdated: new Date()
          };
          setCognitiveData({
            ...newCognitiveData,
            recentSessions
          });
          await setDoc(cognitiveDocRef, {
            ...newCognitiveData,
            lastUpdated: serverTimestamp()
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cognitive data:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchCognitiveData();
    
    // Set up real-time listener for updates
    if (user) {
      const cognitiveDocRef = doc(db, `users/${user.uid}/mentalHealth/cognitive`);
      
      const unsubscribe = onSnapshot(cognitiveDocRef, async (doc) => {
        if (doc.exists()) {
          // Get recent sessions
          const sessionsCollectionRef = collection(db, `users/${user.uid}/mentalHealth/cognitive/sessions`);
          const sessionsQuery = query(sessionsCollectionRef, orderBy('timestamp', 'desc'), limit(5));
          const sessionsSnapshot = await getDocs(sessionsQuery);
          
          const recentSessions: CognitiveSession[] = [];
          sessionsSnapshot.forEach(doc => {
            const data = doc.data();
            recentSessions.push({
              id: doc.id,
              date: data.date,
              gameType: data.gameType,
              score: data.score,
              duration: data.duration,
              timestamp: data.timestamp.toDate()
            });
          });
          
          const data = doc.data();
          setCognitiveData({
            totalSessions: data.totalSessions || 0,
            highScore: data.highScore || 0,
            lastSession: data.lastSession?.toDate() || null,
            weeklyProgress: data.weeklyProgress || 0,
            recentSessions
          });
        }
      });
      
      // Clean up listener on unmount
      return () => unsubscribe();
    }
  }, [user]);

  // Simulate completing a brain training session
  const simulateGameCompletion = async (gameId: string) => {
    if (!user || updating) return;

    try {
      setUpdating(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const cognitiveDocRef = doc(db, `users/${user.uid}/mentalHealth/cognitive`);
      const sessionsCollectionRef = collection(db, `users/${user.uid}/mentalHealth/cognitive/sessions`);
      
      // Generate random score and duration
      const score = Math.floor(70 + Math.random() * 30); // 70-100
      const duration = Math.floor(2 + Math.random() * 8); // 2-10 minutes
      
      // Get game name
      const gameName = brainGames.find(game => game.id === gameId)?.name || 'Unknown Game';
      
      // Add a new session
      const sessionId = `session_${Date.now()}`;
      await setDoc(doc(sessionsCollectionRef, sessionId), {
        date: today,
        gameType: gameName,
        score: score,
        duration: duration,
        timestamp: serverTimestamp()
      });
      
      // Update the main document
      const newTotalSessions = cognitiveData.totalSessions + 1;
      const newHighScore = Math.max(cognitiveData.highScore, score);
      
      // Calculate progress (random for simulation)
      const newProgress = Math.min(100, cognitiveData.weeklyProgress + Math.floor(Math.random() * 10));
      
      await updateDoc(cognitiveDocRef, {
        totalSessions: newTotalSessions,
        highScore: newHighScore,
        lastSession: new Date(),
        weeklyProgress: newProgress,
        lastUpdated: serverTimestamp()
      });

      // Update local state
      const newSession: CognitiveSession = {
        id: sessionId,
        date: today,
        gameType: gameName,
        score: score,
        duration: duration,
        timestamp: new Date()
      };
      
      setCognitiveData({
        totalSessions: newTotalSessions,
        highScore: newHighScore,
        lastSession: new Date(),
        weeklyProgress: newProgress,
        recentSessions: [newSession, ...cognitiveData.recentSessions.slice(0, 4)]
      });
      
      // Show animation
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);
      
      setUpdating(false);
    } catch (error) {
      console.error('Error simulating game completion:', error);
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md overflow-hidden h-full flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-md overflow-hidden h-full relative bg-gradient-to-br from-emerald-500 to-teal-600">
      {/* Animated Neurons Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {neurons.map((neuron) => (
          <motion.div
            key={neuron.id}
            className="absolute bg-white"
            style={{
              left: `${neuron.x}%`,
              top: `${neuron.y}%`,
              width: neuron.size,
              height: neuron.size,
              opacity: neuron.opacity,
              borderRadius: '50%'
            }}
            animate={{
              opacity: [neuron.opacity, neuron.opacity * 2, neuron.opacity],
              scale: [1, 1.5, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: neuron.duration,
              delay: neuron.delay,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Neuron connections */}
        {neurons.slice(0, 5).map((neuron, i) => (
          <React.Fragment key={`connection-${i}`}>
            {neurons.slice(i + 1, i + 3).map((targetNeuron, j) => (
              <motion.div
                key={`connection-${i}-${j}`}
                className="absolute bg-white/20 h-px"
                style={{
                  left: `${neuron.x}%`,
                  top: `${neuron.y}%`,
                  width: `${Math.sqrt(Math.pow(targetNeuron.x - neuron.x, 2) + Math.pow(targetNeuron.y - neuron.y, 2))}%`,
                  transformOrigin: 'left center',
                  transform: `rotate(${Math.atan2(targetNeuron.y - neuron.y, targetNeuron.x - neuron.x)}rad)`
                }}
                animate={{
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      
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
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaTrophy className="text-yellow-300 text-4xl mb-2" />
              <div className="text-white font-medium">Great job!</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Brain Training</h3>
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <FaBrain className="text-white text-xl" />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-white font-medium">Weekly Progress</div>
            <div className="text-white font-bold">{cognitiveData.weeklyProgress}%</div>
          </div>
          
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
            <motion.div 
              className="h-full bg-white/40"
              initial={{ width: 0 }}
              animate={{ width: `${cognitiveData.weeklyProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          
          <div className="flex justify-between mb-4">
            <div className="text-center">
              <div className="text-white/70 text-xs">Sessions</div>
              <div className="text-white font-medium">{cognitiveData.totalSessions}</div>
            </div>
            
            <div className="text-center">
              <div className="text-white/70 text-xs">High Score</div>
              <div className="text-white font-medium">{cognitiveData.highScore}</div>
            </div>
            
            <div className="text-center">
              <div className="text-white/70 text-xs">Last</div>
              <div className="text-white font-medium">
                {cognitiveData.lastSession ? format(cognitiveData.lastSession, 'MMM d') : '-'}
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            {brainGames.map(game => (
              <motion.button
                key={game.id}
                onClick={() => simulateGameCompletion(game.id)}
                disabled={updating}
                className="w-full py-2 px-3 bg-white/10 rounded-lg text-white text-sm flex justify-between items-center"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <div className="text-xl mr-2">{game.icon}</div>
                  <div className="text-left">
                    <div className="font-medium">{game.name}</div>
                    <div className="text-xs text-white/70">{game.description}</div>
                  </div>
                </div>
                <FaPlay className="text-white/70" />
              </motion.button>
            ))}
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link 
            href="/pages/mental-health/cognitive"
            className="block w-full py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-center text-sm font-medium"
          >
            View All Games
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default CognitiveTraining;
