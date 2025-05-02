'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiCalendar, FiClock, FiArrowLeft, 
  FiVideo, FiEdit, FiTrash2, FiPlay, FiPause,
  FiX, FiRefreshCw
} from 'react-icons/fi';
import { doc, DocumentSnapshot } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import VideoStreamComponent from '../../../../features/community/components/VideoStreamComponent';
import { useAuth } from '../../../../context/AuthContext';
import * as contentService from '../../../../features/community/services/contentService';
import * as communityService from '../../../../features/community/services/communityService';
import { LiveSession, Community, Trainer } from '../../../../features/community/utils/types';
import { isSessionActive, isSessionCompleted, isSessionUpcoming, getTimeUntilSession, getRemainingSessionTime } from '../../../../features/community/utils/sessionUtils';

export default function SessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const communityId = params.id as string;
  const sessionId = params.sessionId as string;
  
  const [session, setSession] = useState<LiveSession | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [showVideoStream, setShowVideoStream] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Check if current user is the trainer
  const isTrainer = user && trainer && user.uid === trainer.userId;
  
  // Set up polling interval for session status updates instead of real-time listener
  useEffect(() => {
    if (!session) return;
    
    // Function to update session status based on timing
    const updateSessionStatus = async (currentSession: LiveSession) => {
      // If a session is scheduled and its start time has passed but not yet ended, mark it as live
      if (currentSession.status === 'scheduled' && isSessionActive(currentSession)) {
        try {
          await contentService.updateSession(currentSession.id, { status: 'live' });
          console.log(`Session ${currentSession.id} automatically set to live`);
          // Refresh session data
          refreshSessionData();
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
          refreshSessionData();
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
          const trainerData = await communityService.getTrainerByUserId(communityData.trainerId);
          setTrainer(trainerData);
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
    
    loadSessionData();
  }, [communityId, sessionId]);
  
  // Function to manually refresh session data
  const refreshSessionData = async () => {
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
      setError('Failed to refresh session data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };
  
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
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start session. Please try again.');
    }
  };
  
  const handleEndSession = async () => {
    if (!session || !isTrainer) return;
    
    try {
      // Update session status to 'completed'
      await contentService.updateSessionStatus(sessionId, 'completed');
      
      // Update local state
      setSession({
        ...session,
        status: 'completed'
      });
      
      setIsLive(false);
      
      // In a real app, you would terminate video streaming here
      
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
        onClick={refreshSessionData}
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
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !session || !community) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Session not found'}
          </h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            onClick={() => router.back()}
          >
            <FiArrowLeft className="inline mr-2" /> Go Back
          </button>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <button
          className="mb-6 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          onClick={() => router.back()}
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>
        
        {/* Session Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
          <div className="h-64 relative">
            {community.coverImage ? (
              <Image
                src={community.coverImage}
                alt={community.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white p-6">
                <motion.h1 
                  className="text-3xl md:text-4xl font-bold mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {session.title}
                </motion.h1>
                <motion.p
                  className="text-xl text-white/90"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {community.name}
                </motion.p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Session status badge */}
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                session.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                session.status === 'live' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                session.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {session.status === 'scheduled' ? 'Upcoming' :
                 session.status === 'live' ? 'Live Now' :
                 session.status === 'completed' ? 'Completed' :
                 'Cancelled'}
              </span>
            </div>
            
            {/* Session details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Session Details
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FiCalendar className="mr-2" />
                    <span>{formattedDate}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FiClock className="mr-2" />
                    <span>{formattedTime} • {session.duration} minutes</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FiUsers className="mr-2" />
                    <span>{session.participantCount || 0} / {session.maxParticipants || 'Unlimited'} participants</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {session.description}
                  </p>
                  
                  {/* Testing button to set session status to live - only visible to trainers */}
                  {isTrainer && (
                    <button
                      onClick={() => {
                        if (session) {
                          setSession({
                            ...session,
                            status: 'live'
                          });
                        }
                      }}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      <FiPlay className="inline mr-2" /> Set Session Status to Live (Testing)
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                {isTrainer && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                      Trainer Controls
                    </h3>
                    
                    {session.status === 'scheduled' && (
                      <button
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4 flex items-center justify-center"
                        onClick={handleStartSession}
                      >
                        <FiPlay className="mr-2" /> Start Live Session
                      </button>
                    )}
                    
                    {session.status === 'live' && (
                      <button
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4 flex items-center justify-center"
                        onClick={handleEndSession}
                      >
                        <FiPause className="mr-2" /> End Live Session
                      </button>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                        onClick={handleEditSession}
                      >
                        <FiEdit className="mr-2" /> Edit
                      </button>
                      
                      <button
                        className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                        onClick={handleDeleteSession}
                      >
                        <FiTrash2 className="mr-2" /> Delete
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Live Session Section - Only show when session is marked as live AND is within the scheduled time window */}
                {session.status === 'live' && (
                  <div className="mb-6">
                    {showVideoStream ? (
                      <div className="bg-black rounded-lg overflow-hidden aspect-video mb-4">
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
                      </div>
                    ) : isSessionActive(session) ? (
                      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-8 text-center text-white mb-4 relative overflow-hidden">
                        {/* Animated pulse background */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-64 h-64 bg-white/10 rounded-full animate-pulse"></div>
                        </div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-center mb-4">
                            <div className="relative flex h-4 w-4 mr-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                            </div>
                            <h3 className="text-2xl font-bold">Live Session in Progress</h3>
                          </div>
                          
                          <p className="mb-2">{isTrainer 
                            ? 'Your live session is ready to start. Join now to connect with your participants!' 
                            : 'The trainer has started a live session. Join now to participate!'
                          }</p>
                          
                          <div className="mb-6 flex items-center justify-center text-white/80 text-sm">
                            <FiClock className="mr-1" />
                            <span>{getRemainingSessionTime(session)}</span>
                          </div>
                          
                          <button
                            onClick={() => setShowVideoStream(true)}
                            className="bg-white text-red-600 hover:bg-red-50 font-bold py-4 px-8 rounded-lg text-lg transition-colors flex items-center justify-center mx-auto shadow-lg hover:shadow-xl"
                          >
                            <FiVideo className="mr-2" /> {isTrainer ? 'Start Broadcasting' : 'Join Live Session'}
                          </button>
                          
                          {/* Participant count */}
                          {participants.length > 0 && (
                            <div className="mt-4 flex items-center justify-center text-white/80">
                              <FiUsers className="mr-2" />
                              <span>{participants.length} participant{participants.length !== 1 ? 's' : ''} in this session</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : isSessionCompleted(session) ? (
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Session Has Ended</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          This live session has ended. {isTrainer && 'You can view the participant list below.'}
                        </p>
                        <div className="flex justify-center">
                          <button
                            onClick={() => router.push(`/community/${communityId}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                          >
                            Back to Community
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-8 text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Session Not Started Yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          This session is scheduled to go live soon. Please check back at the scheduled time.
                        </p>
                        <div className="flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                          <FiCalendar className="mr-2" />
                          <span>{new Date(session.scheduledFor.seconds * 1000).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <FiClock className="mr-2" />
                          <span>{new Date(session.scheduledFor.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 font-medium">
                          {getTimeUntilSession(session)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {session.status === 'completed' && session.recordingUrl && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      Session Recording
                    </h3>
                    <div className="bg-black rounded-lg overflow-hidden aspect-video">
                      <video 
                        src={session.recordingUrl} 
                        controls 
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Participants section */}
            {isTrainer && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Participants ({participants.length})
                </h2>
                
                {participants.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">
                    No participants have joined this session yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {participants.map(participant => (
                      <div 
                        key={participant.id}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center"
                      >
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                          {participant.displayName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {participant.displayName || 'Anonymous User'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {participant.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => router.back()} 
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <FiArrowLeft className="mr-2" />
              Back to Community
            </button>
            
            {/* Add refresh button */}
            {renderRefreshButton()}
          </div>
        </div>
      </div>
    </div>
  );
}
