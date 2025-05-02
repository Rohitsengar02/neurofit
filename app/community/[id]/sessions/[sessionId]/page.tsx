'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  FiUsers, FiCalendar, FiClock, FiArrowLeft, 
  FiVideo, FiEdit, FiTrash2, FiPlay, FiPause,
  FiX, FiRefreshCw, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { doc, DocumentSnapshot, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

// Define a toast interface that matches Chakra UI's toast structure
interface ToastOptions {
  title: string;
  description?: string;
  status?: 'info' | 'warning' | 'success' | 'error';
  duration?: number;
  isClosable?: boolean;
}

// Fallback toast implementation
const createToast = (options: ToastOptions): void => {
  console.log('Toast notification:', options);
  // You can replace this with a custom toast implementation
  alert(`${options.title}: ${options.description || ''}`);
};
import GoogleMeetComponent from '../../../../features/community/components/GoogleMeetComponent';
import VideoStreamComponent from '../../../../features/community/components/VideoStreamComponent';
import { useAuth } from '../../../../context/AuthContext';
import * as contentService from '../../../../features/community/services/contentService';
import * as communityService from '../../../../features/community/services/communityService';
import { Community, Session, Trainer } from '../../../../features/community/utils/types';
import { isSessionActive, isSessionCompleted, isSessionUpcoming, getTimeUntilSession, getRemainingSessionTime } from '../../../../features/community/utils/sessionUtils';

// Helper function to extract UID from paths like "liveSessions/uid/trainerId" or "trainers/uid/userId"
function extractUidFromPath(path: string | undefined): string | null {
  if (!path) return null;
  
  // Split the path by '/' and get the middle part (the UID)
  const parts = path.split('/');
  if (parts.length >= 3) {
    return parts[1]; // Return the middle part (UID)
  }
  
  return path; // Return the original path if it doesn't match the expected format
}

// Animation variants for consistent animations throughout the page
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.2 + custom * 0.1,
      ease: 'easeOut'
    }
  })
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const pulse: Variants = {
  hidden: { scale: 0.95, opacity: 0.8 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      yoyo: Infinity,
      duration: 2,
      ease: 'easeInOut'
    }
  }
};

export default function SessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  // Use our fallback toast implementation
  const toast = createToast;
  
  // State for custom Google Meet link input
  const [customMeetLink, setCustomMeetLink] = useState('');
  
  // State to track if current user is the trainer
  const [isTrainer, setIsTrainer] = useState(false);
  
  // Function to manually refresh session data
  const refreshSessionData = async (): Promise<void> => {
    if (!communityId || !sessionId) return;
    
    setIsRefreshing(true);
    
    try {
      // Clear session cache to force fresh data
      contentService.clearSessionCache(communityId);
      
      // Get fresh session data
      const sessionData = await contentService.getSessionById(sessionId);
      
      if (!sessionData) {
        setError('Session not found');
        return;
      }
      
      setSession(sessionData);
      
      // Load participants data
      const participantsData = await contentService.getSessionParticipants(sessionId);
      setParticipants(participantsData);
      
      // Check if session is live
      setIsLive(sessionData.status === 'live');
      
      // Clear any previous errors
      setError(null);
    } catch (error) {
      console.error('Error refreshing session data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Immediate console log to ensure it shows up
  console.log('🔍 SESSION PAGE LOADED - User:', user?.uid);
  
  const communityId = params.id as string;
  const sessionId = params.sessionId as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [showVideoStream, setShowVideoStream] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeUntilSession, setTimeUntilSession] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  
  // Extract user ID from user object
  const userIdPath = user ? `users/${user.uid}/${user.uid}` : null;
  
  // Simplified approach: if the user ID matches the first part of the userIdPath, they are a trainer
  // This checks if user.uid (e.g. "utfcZtHHAYe5c6LWiXgjajvJJap2") is part of userIdPath ("users/utfcZtHHAYe5c6LWiXgjajvJJap2/utfcZtHHAYe5c6LWiXgjajvJJap2")
  const userIdMatch = user ? userIdPath?.includes(user.uid) : false;
  
  // Log the exact user ID format we're looking for
  console.log('🔑 USER ID PATH:', userIdPath);
  console.log('🔑 USER ID:', user?.uid);
  console.log('🔑 USER ID MATCH:', userIdMatch);
  console.log('🔑 TRAINER USER ID:', trainer?.userId);
  
  // We'll use the isTrainer state variable instead of this constant
  // This code is kept for reference but commented out
  /*
  const isTrainerCheck = user && session && trainer && (
    // Extract the UID from both paths and compare them
    extractUidFromPath(session.trainerId) === extractUidFromPath(trainer.userId) &&
    
    // Also check if the current user's ID matches the extracted UID
    (user.uid === extractUidFromPath(session.trainerId) ||
     user.uid === extractUidFromPath(trainer.userId))
  );
  */
  
  // Helper function to extract UID from paths like "liveSessions/uid/trainerId" or "trainers/uid/userId"
  
  // Log the extracted UIDs for debugging
  console.log('🔑 SESSION TRAINER UID:', extractUidFromPath(session?.trainerId));
  console.log('🔑 TRAINER USER UID:', extractUidFromPath(trainer?.userId));
  console.log('🔑 CURRENT USER UID:', user?.uid);
  
  // Immediate console log after trainer check
  console.log('👤 USER ROLE CHECK:', { 
    userId: user?.uid,
    trainerId: trainer?.userId,
    isTrainer: isTrainer ? 'TRAINER' : 'MEMBER'
  });
  
  // Enhanced debugging for trainer detection
  useEffect(() => {
    console.log('=== USER ROLE DEBUG ===');
    console.log('Current User:', user ? {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    } : 'Not logged in');
    
    console.log('Session Trainer:', trainer ? {
      id: trainer.id,
      userId: trainer.userId,
      name: trainer.name
    } : 'No trainer data');
    
    if (user && trainer) {
      console.log('=== TRAINER DETECTION CHECKS ===');
      console.log('Direct match:', user.uid === trainer.userId);
      console.log('users/ format match:', `users/${user.uid}` === trainer.userId);
      console.log('Contains users/uid:', trainer.userId?.includes(`users/${user.uid}`));
      console.log('Contains trainers/uid:', trainer.userId?.includes(`trainers/${user.uid}`));
      console.log('After replace:', user.uid === trainer.userId?.replace('trainers/', '')?.replace('/userId', ''));
      console.log('Starts/ends check:', trainer.userId?.startsWith('trainers/') && trainer.userId?.endsWith(`/${user.uid}`));
    }
    
    console.log('USER ROLE:', isTrainer ? 'TRAINER' : 'MEMBER');
    console.log('=== END USER ROLE DEBUG ===');
  }, [user, trainer, isTrainer]);
  
  // For debugging
  useEffect(() => {
    if (user && trainer) {
      console.log('User ID:', user.uid);
      console.log('Trainer userId:', trainer.userId);
      console.log('Is Trainer:', isTrainer);
    }
  }, [user, trainer, isTrainer]);
  
  // Set up polling interval for session status updates instead of real-time listener
  useEffect(() => {
    if (!communityId || !sessionId) return;
    
    // Function to refresh session data
    const refreshData = async () => {
      if (isRefreshing) return; // Don't refresh if already refreshing
      
      try {
        // Get fresh session data
        const sessionData = await contentService.getSessionById(sessionId);
        
        if (sessionData) {
          // Check if Google Meet settings have changed
          const meetLinkChanged = session?.meetLink !== sessionData.meetLink;
          const useGoogleMeetChanged = session?.useGoogleMeet !== sessionData.useGoogleMeet;
          
          // Update state with new session data
          setSession(sessionData);
          setIsLive(sessionData.status === 'live');
          
          // Notify member if Google Meet was just enabled by trainer
          if (!isTrainer && (meetLinkChanged || useGoogleMeetChanged) && sessionData.useGoogleMeet) {
            toast({
              title: "Google Meet Available",
              description: "The trainer has set up Google Meet for this session.",
              status: "info",
              duration: 5000,
              isClosable: true,
            });
          }
        }
      } catch (error) {
        console.error('Error refreshing session data:', error);
      }
    };
    
    // Set up polling interval - 15 seconds (more frequent to catch Google Meet updates)
    const intervalId = setInterval(refreshData, 15000);
    
    // Also refresh immediately when component mounts
    refreshData();
    
    return () => clearInterval(intervalId);
  }, [communityId, sessionId, isRefreshing, session?.meetLink, session?.useGoogleMeet, isTrainer]);
  useEffect(() => {
    if (!session) return;
     
    // Function to update session status based on timing
    const updateSessionStatus = async (currentSession: Session) => {
      // If a session is scheduled and its start time has passed but not yet ended, mark it as live
      if (currentSession.status === 'scheduled' && isSessionActive(currentSession)) {
        try {
          await contentService.updateSession(currentSession.id, { status: 'live' });
          console.log(`Session ${currentSession.id} automatically set to live`);
          // Refresh session data
          await refreshSessionData();
        } catch (error) {
          console.error('Error updating session status to live:', error);
        }
      }
      
      // If a session is live but its end time has passed, mark it as completed
      if (currentSession.status === 'live' && isSessionCompleted(currentSession)) {
        try {
          await contentService.updateSession(currentSession.id, { status: 'completed' });
          console.log(`Session ${currentSession.id} automatically set to completed`);
          // Refresh session data
          await refreshSessionData();
        } catch (error) {
          console.error('Error updating session status to completed:', error);
        }
      }
    };
    
    // Check session status immediately
    updateSessionStatus(session);
    
    // Set up polling interval (every 30 seconds)
    const intervalId = setInterval(() => {
      updateSessionStatus(session);
    }, 30000);
    
    // Clean up interval when component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [session, sessionId]);
  
  // Update countdown timer
  useEffect(() => {
    if (!session || session.status !== 'scheduled') return;
    
    const updateCountdown = () => {
      const timeUntil = getTimeUntilSession(session);
      
      // Parse the time string into components
      const regex = /(\d+)d (\d+)h (\d+)m (\d+)s/;
      const match = timeUntil.match(regex);
      
      if (match) {
        setTimeUntilSession({
          days: parseInt(match[1]),
          hours: parseInt(match[2]),
          minutes: parseInt(match[3]),
          seconds: parseInt(match[4])
        });
      }
    };
    
    // Update immediately
    updateCountdown();
    
    // Then update every second
    const intervalId = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(intervalId);
  }, [session]);
  
  // Load session data
  useEffect(() => {
    const loadSessionData = async () => {
      if (!communityId || !sessionId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get session data using the cached version from contentService
        const sessionData = await contentService.getSessionById(sessionId);
        
        if (!sessionData) {
          setError('Session not found');
          setIsLoading(false);
          return;
        }
        
        setSession(sessionData);
        
        // Load community data
        const communityData = await communityService.getCommunityById(communityId);
        setCommunity(communityData);
        
        // Load trainer data
        if (communityData && communityData.trainerId) {
          console.log('📌 COMMUNITY TRAINER ID:', communityData.trainerId);
          
          try {
            // Get trainer data from the community's trainer ID
            const trainerData = await communityService.getTrainerByUserId(communityData.trainerId);
            console.log('📌 RAW TRAINER DATA:', trainerData);
            console.log('📌 SESSION TRAINER ID:', session?.trainerId);
            console.log('📌 CURRENT USER ID:', user?.uid);
            
            // Use the helper function defined at the top of the file to extract UIDs
            
            // Extract UIDs from paths for comparison
            // liveSessions/uid/trainerId compared with trainers/uid/userId
            const sessionTrainerUid = extractUidFromPath(session?.trainerId);
            const trainerUserUid = extractUidFromPath(trainerData?.userId);
            const currentUserUid = user?.uid;
            
            console.log('📌 EXTRACTED UIDs:', {
              sessionTrainerUid,  // from liveSessions/uid/trainerId
              trainerUserUid,    // from trainers/uid/userId
              currentUserUid     // direct user ID
            });
            
            // Check if the current user is the specific trainer who created this session
            const isSessionTrainer = session && trainerData && user && (
              // The session trainer UID matches the trainer user UID
              sessionTrainerUid === trainerUserUid &&
              // And the current user is that trainer
              (currentUserUid === sessionTrainerUid || currentUserUid === trainerUserUid)
            );
            
            console.log('📌 TRAINER COMPARISON:', {
              sessionTrainerUid,
              trainerUserUid,
              currentUserUid,
              isSessionTrainer
            });
            
            // Compare session trainer ID with trainer user ID to determine if they match
            const sessionTrainerMatches = sessionTrainerUid && trainerUserUid && sessionTrainerUid === trainerUserUid;
            
            if (trainerData && sessionTrainerMatches) {
              // If we have trainer data and the IDs match, use the trainer data
              console.log('✅ TRAINER MATCH FOUND:', {
                trainerName: trainerData.name,
                trainerProfileImage: trainerData.profileImage
              });
              
              setTrainer(trainerData);
              
              // Check if current user is the trainer
              const isCurrentUserTrainer = user?.uid && (
                user.uid === sessionTrainerUid || 
                user.uid === trainerUserUid
              );
              
              setIsTrainer(isCurrentUserTrainer || false);
            } else if (trainerData) {
              // If we have trainer data but IDs don't match exactly, still use it
              setTrainer(trainerData);
              console.log('✅ TRAINER DATA FOUND AND SET');
              
              // Check if current user is the trainer
              const isCurrentUserTrainer = user?.uid && (
                user.uid === trainerData.id || 
                user.uid === extractUidFromPath(trainerData.userId)
              );
              
              setIsTrainer(isCurrentUserTrainer || false);
            } else {
              // If trainer data is not found or IDs don't match, check if current user is the session creator
              const isCurrentUserTrainer = session?.trainerId && user?.uid && (
                session.trainerId === user.uid ||
                session.trainerId === `users/${user.uid}` ||
                session.trainerId === `trainers/${user.uid}` ||
                session.trainerId.includes(`${user.uid}`)
              );
              
              console.log('🔍 CHECKING IF CURRENT USER IS TRAINER:', {
                sessionTrainerId: session?.trainerId,
                userId: user?.uid,
                isCurrentUserTrainer
              });
              
              // Create a trainer object based on session data
              // Extract trainer name and profile image from the path if available
              const trainerPathParts = session?.trainerId?.split('/') || [];
              const trainerUid = trainerPathParts[1] || '';
              
              // Try to get trainer name and profile image from the path
              // Format: trainers/uid/name and trainers/uid/profileImage
              const trainerName = trainerPathParts.length >= 3 ? trainerPathParts[2] : 'Session Trainer';
              const trainerProfileImage = trainerPathParts.length >= 4 ? trainerPathParts[3] : '';
              
              console.log('🔍 EXTRACTED TRAINER INFO FROM PATH:', {
                trainerUid,
                trainerName,
                trainerProfileImage
              });
              
              const tempTrainer = {
                id: trainerUid || 'temp-trainer-id',
                userId: session?.trainerId || '',
                name: trainerName || (isCurrentUserTrainer ? user?.displayName || 'Current Trainer' : 'Session Trainer'),
                bio: 'Session trainer',
                specialties: ['Fitness'],
                experience: '3+ years',
                profileImage: trainerProfileImage || (isCurrentUserTrainer ? user?.photoURL || '' : ''),
                verified: true,
                featured: false,
                createdAt: new Date(),
                updatedAt: new Date()
              };
              
              setTrainer(tempTrainer);
              
              // Set trainer status based on this check
              setIsTrainer(isCurrentUserTrainer || false);
              
              console.log('📌 USING TRAINER:', tempTrainer, 'IS_TRAINER:', isCurrentUserTrainer);
            }
            
            // Log trainer data immediately when loaded
            const userIdPath = user ? `users/${user.uid}/${user.uid}` : null;
            const trainerUserId = trainerData?.userId || `trainers/${user?.uid}/userId`;
            
            console.log('👨‍🏫 TRAINER DETECTION DEBUG:', {
              trainerId: trainerData?.id || 'temp-trainer-id',
              trainerUserId: trainerUserId,
              currentUserId: user?.uid,
              // Check if user ID is in trainer ID
              userInTrainerId: trainerUserId?.includes(user?.uid || ''),
              // Check if trainer ID contains "trainers/[uid]/userId"
              correctFormat: trainerUserId?.includes('trainers/') && trainerUserId?.includes('/userId')
            });
            
            // Update trainer status based on the comparison
            setIsTrainer(isSessionTrainer || false);
            console.log('💡 TRAINER STATUS SET:', isSessionTrainer);
          } catch (error) {
            console.error('❌ ERROR LOADING TRAINER DATA:', error);
          }
        }
        
        // Load participants data
        const participantsData = await contentService.getSessionParticipants(sessionId);
        setParticipants(participantsData);
        
        // Check if session is live
        setIsLive(sessionData.status === 'live');
      } catch (error) {
        console.error('Error loading session data:', error);
        setError('Failed to load session data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSessionData().catch(error => {
      console.error('Error in loadSessionData:', error);
      setError('Failed to load session data. Please try again.');
    });
  }, [communityId, sessionId, user]);
  
  const handleStartSession = async () => {
    if (!session) return;
    
    try {
      // Update session status to live in Firestore
      await contentService.updateSessionStatus(session.id, 'live');
      
      console.log(`Session ${session.id} set to live by trainer`);
      
      // Update local state
      setSession({
        ...session,
        status: 'live'
      });
      setIsLive(true);
      
      // Show the video stream automatically when trainer starts the session
      setShowVideoStream(true);
      
      // Refresh session data
      await refreshSessionData();
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start session. Please try again.');
    }
  };
  
  const handleEndSession = async () => {
    if (!isTrainer || !session) return;
    
    try {
      // Update session status in Firestore
      await updateDoc(doc(db, 'sessions', sessionId), {
        status: 'completed',
        updatedAt: serverTimestamp(),
        // Clean up Google Meet data when session ends
        useGoogleMeet: false,
        meetLink: null
      });
      
      // Update local state
      setSession({
        ...session,
        status: 'completed',
        updatedAt: new Date(),
        useGoogleMeet: false,
        meetLink: undefined
      });
      
      setIsLive(false);
      
      // In a real app, you would terminate video streaming here
      
      // Show confirmation to trainer
      toast({
        title: "Session Ended",
        description: "The live session has been ended successfully.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      
      // Refresh session data
      await refreshSessionData();
    } catch (error) {
      console.error('Error ending live session:', error);
      setError('Failed to end live session');
    }
  };
  
  const handleEditSession = () => {
    router.push(`/community/${communityId}/sessions/${sessionId}/edit`);
  };
  
  const handleDeleteSession = async () => {
    if (!session || !isTrainer) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this session?');
    if (!confirmed) return;
    
    try {
      await contentService.deleteSession(sessionId);
      router.push(`/community/trainer/dashboard`);
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('Failed to delete session');
    }
  };
  
  const renderRefreshButton = () => {
    return (
      <button
        onClick={() => {
          refreshSessionData().catch((error: Error) => {
            console.error('Error refreshing session data:', error);
          });
        }}
        disabled={isRefreshing}
        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        <FiRefreshCw className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </button>
    );
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6"
          >
            <motion.div variants={fadeInUp} className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4"></motion.div>
            <motion.div variants={fadeInUp} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl shadow-sm"></motion.div>
            <motion.div variants={fadeInUp} className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></motion.div>
            <motion.div variants={fadeInUp} className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></motion.div>
            <motion.div variants={fadeInUp} className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></motion.div>
            <motion.div 
              variants={pulse} 
              className="flex justify-center items-center mt-8"
            >
              <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }
  
  if (error || !session || !community) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-6"
            >
              <FiX className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {error || 'Session not found'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn't find the session you're looking for. It may have been removed or you might not have access to it.
              </p>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-md"
              onClick={() => router.back()}
            >
              <FiArrowLeft className="inline mr-2" /> Go Back
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }
  
  // Format date and time
  const sessionDate = session.scheduledFor?.toDate ? 
    session.scheduledFor.toDate() : 
    new Date(session.scheduledFor);
  
  const formattedDate = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(sessionDate);
  
  const formattedTime = new Intl.DateTimeFormat('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  }).format(sessionDate);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header with enhanced gradient background */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-6 md:p-10 rounded-b-3xl shadow-lg overflow-hidden"
      >
        {/* Animated background elements */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-full opacity-10"
          initial={{ backgroundPosition: '0% 0%' }}
          animate={{ backgroundPosition: '100% 100%' }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' 
          }}
        />
        <motion.button
          onClick={() => router.back()}
          className="absolute top-6 left-6 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors z-10"
          aria-label="Go back"
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
          whileTap={{ scale: 0.9 }}
        >
          <FiArrowLeft size={20} />
        </motion.button>
        
        <div className="max-w-5xl mx-auto pt-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center text-center"
          >
            {session && (
              <>
                <h1 className="text-2xl md:text-4xl font-bold mb-2">{session.title}</h1>
                <div className="flex flex-wrap justify-center gap-4 mt-4 text-white/80">
                  <div className="flex items-center">
                    <FiCalendar className="mr-2" /> {session.date}
                  </div>
                  <div className="flex items-center">
                    <FiClock className="mr-2" /> {session.time}
                  </div>
                  <div className="flex items-center">
                    <FiUsers className="mr-2" /> {participants.length} Participants
                  </div>
                </div>
                
                {/* Session status badge */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 15 }}
                  whileHover={{ scale: 1.05 }}
                  className={`mt-6 px-6 py-2 rounded-full text-sm font-medium shadow-md ${
                    session.status === 'live' 
                      ? 'bg-red-500 text-white' 
                      : session.status === 'scheduled' 
                        ? 'bg-green-500 text-white' 
                        : session.status === 'completed' 
                          ? 'bg-gray-500 text-white' 
                          : session.status === 'cancelled' 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-yellow-500 text-white'
                  }`}
                >
                  {session.status === 'live' && 'Live Now'}
                  {session.status === 'scheduled' && 'Upcoming'}
                  {session.status === 'completed' && 'Completed'}
                  {session.status === 'cancelled' && 'Cancelled'}
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
      
      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg">
            {error}
          </div>
        ) : session && community ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-0"
          >
            {/* Left column - Session details */}
            <div className="md:col-span-2 space-y-6">
              {/* Session description card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transform transition-all duration-300"
              >
                {/* Cover image */}
                {session.coverImage && (
                  <div className="relative w-full h-48 md:h-64 overflow-hidden">
                    <Image
                      src={session.coverImage}
                      alt={session.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About this session</h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{session.description}</p>
                  
                  {/* Trainer info */}
                  {trainer && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Your Trainer</h3>
                      <div className="flex items-center">
                        {trainer.profileImage ? (
                          <Image
                            src={trainer.profileImage}
                            alt={trainer.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                              {trainer.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="font-medium text-gray-900 dark:text-white">{trainer.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{trainer.specialties?.join(', ') || 'Fitness Trainer'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Refresh button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => {
                        refreshSessionData().catch((error: Error) => {
                          console.error('Error refreshing session data:', error);
                        });
                      }}
                      disabled={isRefreshing}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <FiRefreshCw className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>
              </motion.div>
              
              {/* Live session section */}
              <AnimatePresence>
                {session.status === 'live' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Live Session
                      </h2>
                      
                      {showVideoStream ? (
                        <div className="bg-black rounded-lg overflow-hidden aspect-video mb-4 min-h-[400px]">
                          {/* Toggle between custom implementation and Google Meet */}
                          {session.useGoogleMeet ? (
                            <>
                              <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm">
                                Using Google Meet for this session
                              </div>
                              <GoogleMeetComponent
                                sessionId={sessionId}
                                meetLink={session.meetLink}
                                isTrainer={isTrainer || false}
                                onEndSession={() => {
                                  setShowVideoStream(false);
                                  if (isTrainer) handleEndSession();
                                }}
                              />
                            </>
                          ) : (
                            <VideoStreamComponent
                              sessionId={sessionId}
                              isTrainer={isTrainer || false}
                              userId={user?.uid || 'anonymous'}
                              userName={user?.displayName || 'User'}
                              onEndSession={() => {
                                setShowVideoStream(false);
                                if (isTrainer) handleEndSession();
                              }}
                            />
                          )}
                        </div>
                      ) : isSessionActive(session) ? (
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
                          {session.useGoogleMeet ? (
                            <p className="text-gray-600 dark:text-gray-300">
                              {isTrainer 
                                ? "You've selected Google Meet for this session. Use the 'Start Google Meet' button to begin."
                                : "The trainer has selected Google Meet for this session. Use the 'Join Google Meet' button to join."}
                            </p>
                          ) : (
                            <>
                              <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {isTrainer
                                  ? "You've selected the custom video platform for this session."
                                  : "The trainer has selected the custom video platform for this session."}
                              </p>
                              <button
                                onClick={() => setShowVideoStream(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors inline-flex items-center"
                              >
                                <FiPlay className="mr-2" /> {isTrainer ? "Start Custom Video" : "Join Custom Video"}
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
                          <p className="text-gray-600 dark:text-gray-300">
                            This session is no longer active.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Upcoming session countdown */}
              <AnimatePresence>
                {session.status === 'scheduled' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Session Countdown
                      </h2>
                      
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-center text-white overflow-hidden relative">
                         {/* Animated background pattern */}
                         <motion.div 
                           className="absolute top-0 left-0 w-full h-full opacity-10"
                           initial={{ rotate: 0 }}
                           animate={{ rotate: 360 }}
                           transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                           style={{ 
                             backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' 
                           }}
                         />
                         <motion.h3 
                           initial={{ y: -20, opacity: 0 }}
                           animate={{ y: 0, opacity: 1 }}
                           transition={{ delay: 0.1 }}
                           className="text-lg font-medium mb-4 relative z-10"
                         >
                           Time until session starts
                         </motion.h3>
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 relative z-10">
                           <motion.div 
                             initial={{ scale: 0.8, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             transition={{ delay: 0.2 }}
                             whileHover={{ scale: 1.05 }}
                             className="bg-white/20 backdrop-blur-sm rounded-lg p-3 shadow-lg"
                           >
                             <div className="text-2xl font-bold">{timeUntilSession?.days || 0}</div>
                             <div className="text-xs font-medium">Days</div>
                           </motion.div>
                           <motion.div 
                             initial={{ scale: 0.8, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             transition={{ delay: 0.3 }}
                             whileHover={{ scale: 1.05 }}
                             className="bg-white/20 backdrop-blur-sm rounded-lg p-3 shadow-lg"
                           >
                             <div className="text-2xl font-bold">{timeUntilSession?.hours || 0}</div>
                             <div className="text-xs font-medium">Hours</div>
                           </motion.div>
                           <motion.div 
                             initial={{ scale: 0.8, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             transition={{ delay: 0.4 }}
                             whileHover={{ scale: 1.05 }}
                             className="bg-white/20 backdrop-blur-sm rounded-lg p-3 shadow-lg"
                           >
                             <div className="text-2xl font-bold">{timeUntilSession?.minutes || 0}</div>
                             <div className="text-xs font-medium">Minutes</div>
                           </motion.div>
                           <motion.div 
                             initial={{ scale: 0.8, opacity: 0 }}
                             animate={{ scale: 1, opacity: 1 }}
                             transition={{ delay: 0.5 }}
                             whileHover={{ scale: 1.05 }}
                             className="bg-white/20 backdrop-blur-sm rounded-lg p-3 shadow-lg"
                           >
                             <motion.div 
                               key={timeUntilSession?.seconds}
                               initial={{ scale: 0.8 }}
                               animate={{ scale: 1 }}
                               transition={{ type: "spring", stiffness: 500, damping: 10 }}
                               className="text-2xl font-bold"
                             >
                               {timeUntilSession?.seconds || 0}
                             </motion.div>
                             <div className="text-xs font-medium">Seconds</div>
                           </motion.div>
                         </div>
                        
                        <motion.div
                          className="relative z-10 mt-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          {isSessionActive(session) && (
                            <motion.div
                              className="absolute -inset-1 bg-white/20 rounded-xl blur-md"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            />
                          )}
                          <motion.button
                            onClick={() => {
                              if (isSessionActive(session)) {
                                setShowVideoStream(true);
                              }
                            }}
                            disabled={!isSessionActive(session)}
                            whileHover={{ scale: isSessionActive(session) ? 1.05 : 1 }}
                            whileTap={{ scale: isSessionActive(session) ? 0.95 : 1 }}
                            className={`${
                              isSessionActive(session)
                                ? 'bg-white text-green-600 hover:bg-green-50 shadow-lg'
                                : 'bg-white/50 text-white cursor-not-allowed'
                            } relative z-20 font-medium py-3 px-8 rounded-lg transition-all duration-300 inline-flex items-center`}
                          >
                            {isSessionActive(session) ? (
                              <>
                                <motion.span
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="mr-2 text-green-500"
                                >
                                  <FiPlay />
                                </motion.span>
                                <span>Join Now</span>
                              </>
                            ) : (
                              <>
                                <FiClock className="mr-2" />
                                <span>Not Started Yet</span>
                              </>
                            )}
                          </motion.button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Completed session */}
              <AnimatePresence>
                {session.status === 'completed' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Session Completed
                      </h2>
                      
                      {session.recordingUrl ? (
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Recording Available</h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            This session has ended, but you can watch the recording.
                          </p>
                          <a
                            href={session.recordingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
                          >
                            <FiPlay className="mr-2" /> Watch Recording
                          </a>
                        </div>
                      ) : (
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center">
                          <p className="text-gray-600 dark:text-gray-300">
                            This session has ended. No recording is available.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Right column - Controls and participants */}
            <div className="space-y-6">
              {/* Video Platform selection - Only for trainers */}
              {isTrainer && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Video Platform
                    </h2>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                        <FiVideo className="mr-2" /> Choose Platform
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                        Choose which video platform to use for this live session.
                      </p>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <div className="flex items-center space-x-2 mb-4">
                          <button
                            onClick={() => {
                              // Update session to use Google Meet
                              updateDoc(doc(db, 'sessions', sessionId), {
                                useGoogleMeet: true,
                                lastUpdated: serverTimestamp()
                              })
                              .then(() => {
                                // Update local state
                                setSession(prev => prev ? {...prev, useGoogleMeet: true} : null);
                                
                                // Show confirmation to trainer
                                toast({
                                  title: "Google Meet Enabled",
                                  description: "Members can now join using the same link.",
                                  status: "success",
                                  duration: 3000,
                                  isClosable: true,
                                });
                                
                                // Refresh session data to ensure we have the latest state
                                refreshSessionData().catch(error => {
                                  console.error('Error refreshing after enabling Google Meet:', error);
                                });
                              })
                              .catch(error => {
                                console.error('Error enabling Google Meet:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to enable Google Meet. Please try again.",
                                  status: "error",
                                  duration: 3000,
                                  isClosable: true,
                                });
                              });
                            }}
                            className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${session?.useGoogleMeet ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-2 border-blue-500' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          >
                            <FiVideo className="mr-2" /> Google Meet
                          </button>
                          
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              // Update session to use custom implementation
                              updateDoc(doc(db, 'sessions', sessionId), {
                                useGoogleMeet: false
                              })
                              .then(() => {
                                // Update local state
                                setSession(prev => prev ? {...prev, useGoogleMeet: false} : null);
                              })
                              .catch(error => {
                                console.error('Error disabling Google Meet:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to disable Google Meet. Please try again.",
                                  status: "error",
                                  duration: 3000,
                                  isClosable: true,
                                });
                              });
                            }}
                            className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${session?.useGoogleMeet === false ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-2 border-blue-500' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          >
                            <FiVideo className="mr-2" /> Custom Video
                          </motion.button>
                        </div>
                        
                        {/* Show Join Google Meet button for trainers when Google Meet is selected */}
                        {session?.useGoogleMeet && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 pt-4 border-t border-blue-100 dark:border-blue-800"
                          >
                            {/* Custom Google Meet link input for trainers */}
                            <div className="mb-4">
                              <label htmlFor="custom-meet-link" className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                                Enter your Google Meet link
                              </label>
                              <div className="flex space-x-2">
                                <input
                                  id="custom-meet-link"
                                  type="text"
                                  value={customMeetLink}
                                  onChange={(e) => setCustomMeetLink(e.target.value)}
                                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                  className="flex-1 p-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                  onClick={() => {
                                    if (!customMeetLink) {
                                      toast({
                                        title: "Missing Link",
                                        description: "Please enter a Google Meet link first.",
                                        status: "warning",
                                        duration: 3000,
                                        isClosable: true,
                                      });
                                      return;
                                    }
                                    
                                    // Validate the link (simple check)
                                    if (!customMeetLink.includes('meet.google.com')) {
                                      toast({
                                        title: "Invalid Link",
                                        description: "Please enter a valid Google Meet link.",
                                        status: "error",
                                        duration: 3000,
                                        isClosable: true,
                                      });
                                      return;
                                    }
                                    
                                    // Update the meet link in Firebase
                                    updateDoc(doc(db, 'sessions', sessionId), {
                                      meetLink: customMeetLink,
                                      lastUpdated: serverTimestamp()
                                    })
                                    .then(() => {
                                      // Update local state
                                      setSession(prev => prev ? {...prev, meetLink: customMeetLink} : null);
                                      
                                      // Show confirmation
                                      toast({
                                        title: "Link Shared",
                                        description: "Your Google Meet link has been shared with all participants.",
                                        status: "success",
                                        duration: 3000,
                                        isClosable: true,
                                      });
                                    })
                                    .catch(error => {
                                      console.error('Error updating meet link:', error);
                                      toast({
                                        title: "Error",
                                        description: "Failed to update meet link. Please try again.",
                                        status: "error",
                                        duration: 3000,
                                        isClosable: true,
                                      });
                                    });
                                  }}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                                >
                                  Share
                                </button>
                              </div>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Create a meeting at <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer" className="underline">meet.google.com</a> and paste the link here
                              </p>
                            </div>
                            
                            {session?.meetLink && (
                              <div className="mb-3 p-2 bg-blue-100 dark:bg-blue-800 rounded text-blue-800 dark:text-blue-200 text-sm break-all">
                                <span className="font-medium">Current Meeting Link:</span> {session.meetLink}
                              </div>
                            )}
                            
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => {
                                // Open the saved Google Meet link
                                if (session.meetLink) {
                                  window.open(session.meetLink, '_blank', 'noopener,noreferrer');
                                } else {
                                  // If no custom link is provided, use the default new meeting
                                  window.open('https://meet.google.com/new', '_blank', 'noopener,noreferrer');
                                  
                                  // Update the meet link in Firebase with the default link
                                  updateDoc(doc(db, 'sessions', sessionId), {
                                    meetLink: 'https://meet.google.com/new',
                                    lastUpdated: serverTimestamp()
                                  })
                                  .then(() => {
                                    // Update local state
                                    setSession(prev => prev ? {...prev, meetLink: 'https://meet.google.com/new'} : null);
                                  })
                                  .catch(error => {
                                    console.error('Error updating meet link:', error);
                                    toast({
                                      title: "Error",
                                      description: "Failed to update meet link. Please try again.",
                                      status: "error",
                                      duration: 3000,
                                      isClosable: true,
                                    });
                                  });
                                }
                              }}
                              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                            >
                              <FiVideo className="mr-2" /> {session.meetLink ? 'Join Google Meet' : 'Start Google Meet'}
                            </motion.button>
                            <p className="text-xs text-blue-700 dark:text-blue-400 mt-2 text-center">
                              Meeting will open in a new tab
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Join Google Meet Button - For members only when Google Meet is selected by trainer */}
              {!isTrainer && session?.useGoogleMeet && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Join Video Session
                    </h2>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mb-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                        <FiVideo className="mr-2" /> Google Meet
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                        The trainer has enabled Google Meet for this session.
                      </p>
                      
                      {session?.meetLink && (
                        <div className="mb-3 p-2 bg-blue-100 dark:bg-blue-800 rounded text-blue-800 dark:text-blue-200 text-sm break-all">
                          <span className="font-medium">Meeting Link:</span> {session.meetLink}
                        </div>
                      )}
                      
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          // Open the Google Meet link
                          if (session.meetLink) {
                            window.open(session.meetLink, '_blank', 'noopener,noreferrer');
                          } else {
                            window.open('https://meet.google.com/new', '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <FiVideo className="mr-2" /> Join Google Meet
                      </motion.button>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-2 text-center">
                        Meeting will open in a new tab
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Trainer controls */}
              <AnimatePresence>
                {isTrainer && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="p-6">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Trainer Controls
                      </h2>
                    
                      {/* Session status controls */}
                      <div className="space-y-3">
                        {session.status === 'scheduled' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                            onClick={handleStartSession}
                          >
                            <FiPlay className="mr-2" /> Start Live Session
                          </motion.button>
                        )}
                        
                        {session.status === 'live' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                            onClick={handleEndSession}
                          >
                            <FiPause className="mr-2" /> End Live Session
                          </motion.button>
                        )}
                        
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                            onClick={handleEditSession}
                          >
                            <FiEdit className="mr-2" /> Edit
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                            onClick={handleDeleteSession}
                          >
                            <FiTrash2 className="mr-2" /> Delete
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Participants list */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transform transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      Participants ({participants.length})
                    </h2>
                    <button
                      onClick={() => {
                        refreshSessionData().catch((error: Error) => {
                          console.error('Error refreshing session data:', error);
                        });
                      }}
                      disabled={isRefreshing}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <FiRefreshCw className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                  </div>
                  
                  {participants.length > 0 ? (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                      >
                        {participants.map((participant, index) => (
                          <motion.div
                            variants={fadeInUp}
                            custom={index * 0.5}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                            key={participant.id}
                            className="flex items-center p-3 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 rounded-lg mb-2 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 transition-all duration-200"
                          >
                          {participant.profileImage ? (
                            <Image
                              src={participant.profileImage}
                              alt={participant.name || 'Participant'}
                              width={36}
                              height={36}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-9 h-9 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                                {(participant.name || 'User').charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="ml-3 flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {participant.name || 'Anonymous User'}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              {new Date(participant.joinedAt?.toDate?.() || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-green-500 ml-2"></div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <FiUsers className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p>No participants have joined yet</p>
                      <p className="text-sm mt-2">Be the first to join this session!</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
