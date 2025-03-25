'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaDumbbell, FaAppleAlt, FaBrain, FaBed, FaRunning } from 'react-icons/fa';
import { useAuth } from '@/app/context/AuthContext';
import { db } from '@/app/firebase/config';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { generateHealthRecommendations, HealthRecommendation } from '@/app/services/aiRecommendations';

// Stored in Firebase
interface StoredRecommendation extends HealthRecommendation {
  id: string;
  timestamp: number;
}

// Used in component with UI elements
interface DisplayRecommendation extends StoredRecommendation {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const AiRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<DisplayRecommendation[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  const getIconByType = (type: HealthRecommendation['type']): React.ComponentType<{ className?: string }> => {
    switch (type) {
      case 'workout':
        return FaDumbbell;
      case 'nutrition':
        return FaAppleAlt;
      case 'mental':
        return FaBrain;
      case 'sleep':
        return FaBed;
      case 'cardio':
        return FaRunning;
      default:
        return FaDumbbell;
    }
  };

  const getColorByType = (type: HealthRecommendation['type']): string => {
    switch (type) {
      case 'workout':
        return 'from-orange-400 to-red-600';
      case 'nutrition':
        return 'from-green-400 to-emerald-600';
      case 'mental':
        return 'from-blue-400 to-indigo-600';
      case 'sleep':
        return 'from-purple-400 to-violet-600';
      case 'cardio':
        return 'from-rose-400 to-pink-600';
      default:
        return 'from-teal-400 to-cyan-600';
    }
  };

  const updateRecommendations = async () => {
    if (!user) return;

    const now = Date.now();
    const recommendationsRef = doc(db, `users/${user.uid}/userData/aiRecommendations`);
    const docSnap = await getDoc(recommendationsRef);

    // Check if 24 hours have passed since last update
    if (!docSnap.exists() || now - lastUpdate > 24 * 60 * 60 * 1000) {
      try {
        // Get user profile data for personalized recommendations
        const userProfileRef = doc(db, `users/${user.uid}/userData/profile`);
        const userProfileSnap = await getDoc(userProfileRef);
        const userProfile = userProfileSnap.exists() ? userProfileSnap.data() : undefined;

        // Generate new recommendations using Gemini
        const newRecommendations = await generateHealthRecommendations(userProfile);
        
        // Format recommendations for storage (without UI elements)
        const storedRecommendations: StoredRecommendation[] = newRecommendations.map((rec, index) => ({
          ...rec,
          id: `rec_${index + 1}`,
          timestamp: now
        }));

        // Save to Firebase (only data, no UI elements)
        await setDoc(recommendationsRef, {
          recommendations: storedRecommendations,
          lastUpdate: now
        });

        // Format for display with UI elements
        const displayRecommendations: DisplayRecommendation[] = storedRecommendations.map(rec => ({
          ...rec,
          icon: getIconByType(rec.type),
          color: getColorByType(rec.type)
        }));

        setRecommendations(displayRecommendations);
        setLastUpdate(now);
      } catch (error) {
        console.error('Error generating recommendations:', error);
      }
    }
  };

  useEffect(() => {
    if (!user) return;

    // Listen for real-time updates
    const unsubscribe = onSnapshot(
      doc(db, `users/${user.uid}/userData/aiRecommendations`),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          // Convert stored data to display format with UI elements
          const displayRecommendations: DisplayRecommendation[] = (data.recommendations || []).map((rec: StoredRecommendation) => ({
            ...rec,
            icon: getIconByType(rec.type),
            color: getColorByType(rec.type)
          }));
          setRecommendations(displayRecommendations);
          setLastUpdate(data.lastUpdate || 0);
        }
      }
    );

    // Initial check for recommendations
    updateRecommendations();

    return () => unsubscribe();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-800 rounded-2xl p-6 text-white"
    >
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            className="p-2 bg-white/20 backdrop-blur-sm rounded-xl"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaBrain className="w-6 h-6" />
          </motion.div>
          <h3 className="text-lg font-semibold">AI Recommendations</h3>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="relative z-10 space-y-4">
        {recommendations.map((recommendation, index) => {
          const Icon = recommendation.icon;
          return (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${recommendation.color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium mb-1">{recommendation.title}</div>
                  <div className="text-sm opacity-80">{recommendation.description}</div>
                  <div className="text-xs mt-2 opacity-60">{recommendation.type}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AiRecommendations;
