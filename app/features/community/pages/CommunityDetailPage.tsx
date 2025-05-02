'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  FiUsers, FiCalendar, FiClock, FiArrowLeft, 
  FiChevronRight, FiLock, FiPlus, FiFilter,
  FiEdit, FiTrash2, FiX, FiVideo, FiTag,
  FiAlertCircle, FiRefreshCw
} from 'react-icons/fi';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../../../context/AuthContext';
import * as communityService from '../services/communityService';
import * as contentService from '../services/contentService';
import * as subscriptionService from '../services/subscriptionService';
import { isSessionActive, isSessionCompleted, isSessionUpcoming, getTimeUntilSession, getRemainingSessionTime } from '../utils/sessionUtils';
import * as couponService from '../services/couponService';
import CouponApplyForm from '../components/CouponApplyForm';
import { Community, LiveSession, SubscriptionTier } from '../utils/types';

// Helper functions for date and time formatting
const formatDate = (timestamp: any): string => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString();
};

const formatTime = (timestamp: any): string => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const CommunityDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { 
    currentCommunity, 
    setCurrentCommunity,
    currentCommunityTiers,
    isLoadingTiers,
    upcomingSessions: contextUpcomingSessions,
    isLoadingUpcomingSessions: contextIsLoadingUpcomingSessions,
    refreshCurrentCommunityTiers,
    refreshUpcomingSessions: contextRefreshUpcomingSessions,
    isUserMemberOfCurrentCommunity,
    getUserMembershipForCurrentCommunity,
    trainerProfile,
    isLoadingTrainer
  } = useCommunity();
  
  // Local state for sessions to avoid context issues
  const [localUpcomingSessions, setLocalUpcomingSessions] = useState<LiveSession[]>([]);
  const [isLoadingLocalSessions, setIsLoadingLocalSessions] = useState(false);
  
  // Use local state or context state
  const upcomingSessions = localUpcomingSessions.length > 0 ? localUpcomingSessions : contextUpcomingSessions;
  const isLoadingUpcomingSessions = isLoadingLocalSessions || contextIsLoadingUpcomingSessions;
  
  // Check if current user is the trainer of this community
  const isTrainer = user && currentCommunity && trainerProfile && user.uid === currentCommunity.trainerId;
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercentage: number } | null>(null);
  
  // Refresh functions
  const refreshUpcomingSessions = async () => {
    setIsLoadingLocalSessions(true);
    try {
      // Clear the session cache to force a fresh fetch
      const communityId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
      contentService.clearSessionCache(communityId);
      
      if (communityId) {
        const sessions = await contentService.getUpcomingSessions(communityId);
        setLocalUpcomingSessions(sessions);
        console.log('Refreshed upcoming sessions:', sessions);
      }
    } catch (error) {
      console.error('Error refreshing upcoming sessions:', error);
    } finally {
      setIsLoadingLocalSessions(false);
    }
  };

  // Set up polling interval for live and scheduled sessions
  useEffect(() => {
    if (!currentCommunity) return;
    
    // Function to update session status based on timing
    const updateSessionStatus = async (session: LiveSession) => {
      // If a session is scheduled and its start time has passed but not yet ended, mark it as live
      if (session.status === 'scheduled' && isSessionActive(session)) {
        try {
          await contentService.updateSession(session.id, { status: 'live' });
          console.log(`Session ${session.id} automatically set to live`);
          // Refresh sessions after status change
          refreshUpcomingSessions();
        } catch (error) {
          console.error('Error updating session status to live:', error);
        }
      }
      
      // If a session is live but its end time has passed, mark it as completed
      if (session.status === 'live' && isSessionCompleted(session)) {
        try {
          await contentService.updateSession(session.id, { status: 'completed' });
          console.log(`Session ${session.id} automatically set to completed`);
          // Refresh sessions after status change
          refreshUpcomingSessions();
        } catch (error) {
          console.error('Error updating session status to completed:', error);
        }
      }
    };
    
    // Debug log the current sessions
    console.log('Current upcoming sessions:', upcomingSessions);
    
    // Instead of using real-time listeners, set up a polling interval
    // This reduces Firebase usage significantly while still providing updates
    const checkSessionsStatus = async () => {
      // Only check if we have sessions to avoid unnecessary database operations
      if (upcomingSessions && upcomingSessions.length > 0) {
        console.log('Checking status for', upcomingSessions.length, 'sessions');
        
        // Find sessions that might need status updates (scheduled or live)
        const sessionsToCheck = upcomingSessions.filter(
          session => session.status === 'scheduled' || session.status === 'live'
        );
        
        // Only make API calls if there are sessions that might need updates
        if (sessionsToCheck.length > 0) {
          for (const session of sessionsToCheck) {
            await updateSessionStatus(session);
          }
        } else {
          console.log('No sessions need status updates');
        }
      }
    };
    
    // Run initial check
    checkSessionsStatus();
    
    // Set up polling interval (every 120 seconds - reduced from 60s to save quota)
    const intervalId = setInterval(checkSessionsStatus, 120000);
    
    // Clean up interval when component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [currentCommunity, upcomingSessions, params.id]);

  // Fetch community data
  useEffect(() => {
    const fetchCommunity = async () => {
      if (!params.id) return;
      
      setIsLoading(true);
      try {
        const communityId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
        const community = await communityService.getCommunityById(communityId);
        
        if (!community) {
          router.push('/community');
          return;
        }
        
        setCurrentCommunity(community);
      } catch (error) {
        console.error('Error fetching community:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCommunity();
  }, [params.id]);

  // Fetch tiers and sessions when community is set
  useEffect(() => {
    if (currentCommunity) {
      refreshCurrentCommunityTiers();
      refreshUpcomingSessions();
    }
  }, [currentCommunity]);

  // Handle joining community
  const handleJoinCommunity = async () => {
    if (!user || !currentCommunity || !selectedTier) return;
    
    setIsJoining(true);
    try {
      await subscriptionService.createMembership(
        user.uid,
        currentCommunity.id,
        selectedTier,
        1, // 1 month duration
        appliedCoupon?.code // Pass coupon code if available
      );
      
      // Refresh membership status
      window.location.reload();
    } catch (error) {
      console.error('Error joining community:', error);
      alert('Failed to join community. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  // Handle coupon application
  const handleApplyCoupon = (discountPercentage: number, couponCode: string) => {
    if (discountPercentage > 0 && couponCode) {
      setAppliedCoupon({
        code: couponCode,
        discountPercentage
      });
    } else {
      setAppliedCoupon(null);
    }
  };

  // Handle session click
  const handleSessionClick = (session: LiveSession) => {
    if (!isUserMemberOfCurrentCommunity()) {
      // If not a member, show join modal
      // setShowJoinModal(true);
      return;
    }
    
    // Navigate to session detail page
    router.push(`/community/${params.id}/sessions/${session.id}`);
  };

  if (isLoading || !currentCommunity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isMember = isUserMemberOfCurrentCommunity();
  const membership = getUserMembershipForCurrentCommunity();

  // Live Sessions Section
  const renderLiveSessionsSection = () => {
    const liveSessions = upcomingSessions?.filter(session => session.status === 'live') || [];
    
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Live Now</h3>
          <button 
            onClick={refreshUpcomingSessions} 
            className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
            disabled={isLoadingUpcomingSessions}
          >
            {isLoadingUpcomingSessions ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh
              </span>
            )}
          </button>
        </div>
        
        {liveSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveSessions.map(session => (
              <SessionCard 
                key={session.id} 
                session={session} 
                isMember={isMember}
                onClick={() => handleSessionClick(session)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-4">No live sessions at the moment. Check back later or view upcoming sessions below.</p>
        )}
      </div>
    );
  };

  // Upcoming Sessions Section
  const renderUpcomingSessionsSection = () => {
    // Only show scheduled sessions, not live or completed ones
    const scheduledSessions = upcomingSessions?.filter(session => 
      session.status === 'scheduled' && isSessionUpcoming(session)
    ) || [];
    
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Upcoming Sessions</h3>
          <button 
            onClick={refreshUpcomingSessions} 
            className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
            disabled={isLoadingUpcomingSessions}
          >
            {isLoadingUpcomingSessions ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh
              </span>
            )}
          </button>
        </div>
        
        {scheduledSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledSessions.map(session => (
              <SessionCard 
                key={session.id} 
                session={session} 
                isMember={isMember}
                onClick={() => handleSessionClick(session)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-4">No upcoming sessions scheduled at this time.</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Community Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-64 md:h-80 w-full relative">
          <Image
            src={currentCommunity.coverImage || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"}
            alt={currentCommunity.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          <button 
            className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            onClick={() => router.push('/community')}
          >
            <FiArrowLeft size={20} />
          </button>
        </div>
        
        {/* Community Info */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-24 bg-white dark:bg-gray-800 rounded-t-3xl p-6 md:p-8 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              {/* Logo */}
              {currentCommunity.logoImage && (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl border-4 border-white dark:border-gray-800 overflow-hidden -mt-16 md:-mt-24 shadow-lg">
                  <Image
                    src={currentCommunity.logoImage}
                    alt={`${currentCommunity.name} logo`}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              
              <div className="flex-grow">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentCommunity.name}
                </h1>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <FiUsers className="mr-1" />
                    <span>{currentCommunity.memberCount} members</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="mr-1" />
                    <span>Created {new Date(currentCommunity.createdAt.seconds * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              {isMember && (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium">
                  Member
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <p className="text-gray-700 dark:text-gray-300">
                {currentCommunity.description}
              </p>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-2">
              {currentCommunity.categories.map((category) => (
                <span 
                  key={category} 
                  className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-3 py-1 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto pb-1 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            <button
              className={`px-4 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'sessions'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('sessions')}
            >
              Live Sessions
            </button>
            <button
              className={`px-4 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'workouts'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('workouts')}
            >
              Workouts
            </button>
            <button
              className={`px-4 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'challenges'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('challenges')}
            >
              Challenges
            </button>
            <button
              className={`px-4 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'feed'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('feed')}
            >
              Community Feed
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  About This Community
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {currentCommunity.description}
                </p>
                
                {/* Trainer Info */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Your Trainer
                  </h3>
                  {isLoadingTrainer ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  ) : trainerProfile ? (
                    <div className="flex items-center">
                      {trainerProfile.profileImage ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                          <Image 
                            src={trainerProfile.profileImage} 
                            alt={trainerProfile.name} 
                            width={48} 
                            height={48} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-4">
                          {trainerProfile.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{trainerProfile.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {trainerProfile.specialties && trainerProfile.specialties.length > 0 
                            ? trainerProfile.specialties[0] 
                            : "Fitness Expert"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">Trainer information not available</p>
                  )}
                </div>
              </div>
              
              {/* Current Live Sessions */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    <span className="inline-flex items-center">
                      <span className="relative flex h-3 w-3 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                      </span>
                      Live Now
                    </span>
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="text-white text-sm font-medium bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors flex items-center"
                      onClick={refreshUpcomingSessions}
                    >
                      <FiRefreshCw className="mr-1" /> Refresh
                    </button>
                    <button 
                      className="text-white text-sm font-medium bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                      onClick={() => setActiveTab('sessions')}
                    >
                      View All
                    </button>
                  </div>
                </div>
                
                {isLoadingUpcomingSessions ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions
                      .filter(session => session.status === 'live')
                      .map((session) => (
                        <div 
                          key={session.id}
                          className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white hover:bg-white/20 transition-colors"
                        >
                          <div className="flex items-center mb-2">
                            <div className="relative flex h-3 w-3 mr-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                            </div>
                            <h3 className="text-lg font-bold">{session.title}</h3>
                          </div>
                          <p className="text-white/80 text-sm mb-3">{session.description}</p>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <FiUsers className="mr-1" />
                              <span className="text-sm">{session.participantCount || 0} joined</span>
                            </div>
                            <div className="flex items-center text-white/80 text-sm">
                              <FiClock className="mr-1" />
                              <span>{getRemainingSessionTime(session)}</span>
                            </div>
                          </div>
                          <button 
                            className="w-full bg-white text-red-600 font-medium py-2 px-4 rounded-lg text-sm hover:bg-red-50 transition-colors flex items-center justify-center"
                            onClick={() => router.push(`/community/${currentCommunity.id}/sessions/${session.id}`)}
                          >
                            <FiVideo className="mr-1" /> Join Live Session
                          </button>
                        </div>
                      ))
                    }
                    
                    {upcomingSessions.filter(session => session.status === 'live').length === 0 && (
                      <div className="text-center py-6 bg-white/10 rounded-lg p-4">
                        <p className="text-white mb-2">No live sessions right now.</p>
                        {upcomingSessions.filter(session => session.status === 'scheduled' && isSessionUpcoming(session)).length > 0 ? (
                          <div>
                            <p className="text-white/80 text-sm mb-4">Next session starts soon:</p>
                            {upcomingSessions
                              .filter(session => session.status === 'scheduled' && isSessionUpcoming(session))
                              .sort((a, b) => a.scheduledFor.seconds - b.scheduledFor.seconds)
                              .slice(0, 1)
                              .map(session => (
                                <div key={session.id} className="bg-white/10 p-3 rounded-lg mb-2">
                                  <p className="font-medium text-white">{session.title}</p>
                                  <div className="flex items-center justify-center mt-1 text-white/80 text-sm">
                                    <FiCalendar className="mr-1" />
                                    <span>{formatDate(session.scheduledFor)}</span>
                                    <span className="mx-2">•</span>
                                    <FiClock className="mr-1" />
                                    <span>{formatTime(session.scheduledFor)}</span>
                                  </div>
                                  <div className="mt-2 text-white/80 text-sm flex items-center justify-center">
                                    <FiAlertCircle className="mr-1" />
                                    <span>{getTimeUntilSession(session)}</span>
                                  </div>
                                </div>
                              ))
                            }
                            <button
                              className="mt-2 text-white text-sm underline"
                              onClick={() => setActiveTab('sessions')}
                            >
                              View all scheduled sessions
                            </button>
                          </div>
                        ) : (
                          <p className="text-white/80 text-sm">No upcoming sessions scheduled. Check back later.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Scheduled Live Sessions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Scheduled Live Sessions
                  </h2>
                  <button 
                    className="text-blue-600 dark:text-blue-400 text-sm font-medium"
                    onClick={() => setActiveTab('sessions')}
                  >
                    View All
                  </button>
                </div>
                
                {isLoadingUpcomingSessions ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                ) : upcomingSessions.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">No upcoming sessions scheduled yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.slice(0, 3).map((session) => (
                      <SessionCard 
                        key={session.id} 
                        session={session} 
                        isMember={isMember}
                        onClick={() => router.push(`/community/${currentCommunity.id}/sessions/${session.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Membership Status / Join Community */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                {isMember ? (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Your Membership
                    </h2>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                      <p className="text-green-800 dark:text-green-300 font-medium">
                        Active Membership
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Expires: {membership ? new Date(membership.expiresAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                      onClick={() => router.push(`/community/${currentCommunity.id}/sessions`)}
                    >
                      View Upcoming Sessions
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Join This Community
                    </h2>
                    
                    {isLoadingTiers ? (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                      </div>
                    ) : currentCommunityTiers.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400">
                        No subscription tiers available for this community.
                      </p>
                    ) : (
                      <>
                        <div className="space-y-4 mb-6">
                          {currentCommunityTiers.map((tier) => (
                            <div 
                              key={tier.id}
                              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                selectedTier === tier.id
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                              }`}
                              onClick={() => setSelectedTier(tier.id)}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {tier.name}
                                </h3>
                                <span className="text-blue-600 dark:text-blue-400 font-bold">
                                  ${tier.price}/mo
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {tier.description}
                              </p>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {tier.features.slice(0, 2).map((feature, index) => (
                                  <div key={index} className="flex items-center mt-1">
                                    <div className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full mr-2"></div>
                                    <span>{feature}</span>
                                  </div>
                                ))}
                                {tier.features.length > 2 && (
                                  <div className="mt-1 text-blue-600 dark:text-blue-400">
                                    +{tier.features.length - 2} more features
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {selectedTier && (
                          <div className="mb-4">
                            {user && (
                              <CouponApplyForm
                                communityId={currentCommunity.id}
                                userId={user.uid}
                                onApplyCoupon={handleApplyCoupon}
                              />
                            )}
                            
                            {appliedCoupon && currentCommunityTiers.find(t => t.id === selectedTier) && (
                              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="flex items-center text-green-700 dark:text-green-300 font-medium">
                                  <FiTag className="mr-2" />
                                  <span>Coupon applied: {appliedCoupon.code}</span>
                                </div>
                                <div className="mt-2 flex justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Original price:</span>
                                  <span className="text-gray-600 dark:text-gray-400 line-through">
                                    ${currentCommunityTiers.find(t => t.id === selectedTier)?.price?.toFixed(2) || '0.00'}/mo
                                  </span>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>Discounted price:</span>
                                  <span className="text-green-700 dark:text-green-300">
                                    ${((currentCommunityTiers.find(t => t.id === selectedTier)?.price || 0) * (1 - appliedCoupon.discountPercentage / 100)).toFixed(2)}/mo
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                          onClick={handleJoinCommunity}
                          disabled={!selectedTier || isJoining || !user}
                        >
                          {isJoining ? 'Joining...' : user ? 'Join Community' : 'Sign in to Join'}
                        </button>
                        
                        {!user && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                            You need to sign in to join this community
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
              
              {/* Community Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Community Stats
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Members</span>
                    <span className="font-medium text-gray-900 dark:text-white">{currentCommunity.memberCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Live Sessions</span>
                    <span className="font-medium text-gray-900 dark:text-white">{upcomingSessions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(currentCommunity.createdAt.seconds * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Other tabs would be implemented here */}
        {activeTab !== 'overview' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              {activeTab === 'sessions' && 'Live Sessions'}
              {activeTab === 'workouts' && 'Workout Library'}
              {activeTab === 'challenges' && 'Community Challenges'}
              {activeTab === 'feed' && 'Community Feed'}
            </h2>
            
            {isMember ? (
              activeTab === 'sessions' ? (
                <div>
                  {/* Live Sessions Section */}
                  {upcomingSessions.filter(session => session.status === 'live').length > 0 && (
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <div className="relative flex h-3 w-3 mr-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Live Now</h3>
                        <button 
                          className="ml-auto text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center"
                          onClick={refreshUpcomingSessions}
                        >
                          <FiRefreshCw className="mr-1" /> Refresh
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {upcomingSessions
                          .filter(session => session.status === 'live')
                          .map((session) => (
                            <div 
                              key={session.id}
                              className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-4 text-white hover:shadow-lg transition-shadow"
                            >
                              <div className="flex items-center mb-2">
                                <div className="relative flex h-3 w-3 mr-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                </div>
                                <h3 className="text-lg font-bold">{session.title}</h3>
                              </div>
                              <p className="text-white/80 text-sm mb-3">{session.description}</p>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <FiUsers className="mr-1" />
                                  <span className="text-sm">{session.participantCount || 0} joined</span>
                                </div>
                                <button 
                                  className="bg-white text-red-600 font-medium py-2 px-4 rounded-lg text-sm hover:bg-red-50 transition-colors flex items-center"
                                  onClick={() => router.push(`/community/${currentCommunity.id}/sessions/${session.id}`)}
                                >
                                  <FiVideo className="mr-1" /> Join Now
                                </button>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                  
                  {/* Scheduled Sessions Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Scheduled Sessions</h3>
                      
                      {isTrainer && (
                        <button 
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
                          onClick={() => router.push(`/community/${currentCommunity.id}/create-session`)}
                        >
                          <FiPlus className="mr-1" /> New Session
                        </button>
                      )}
                    </div>
                    
                    {isLoadingUpcomingSessions ? (
                      <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                      </div>
                    ) : upcomingSessions.filter(session => session.status === 'scheduled').length === 0 ? (
                      <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                          No scheduled sessions available.
                        </p>
                        {isTrainer && (
                          <button 
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
                            onClick={() => router.push(`/community/${currentCommunity.id}/create-session`)}
                          >
                            <FiPlus className="mr-1" /> Create New Session
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {upcomingSessions
                          .filter(session => session.status === 'scheduled')
                          .sort((a, b) => a.scheduledFor.seconds - b.scheduledFor.seconds)
                          .map((session) => (
                            <div 
                              key={session.id}
                              className={`bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow ${isSessionActive(session) ? 'border-green-500 dark:border-green-500' : ''}`}
                            >
                              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{session.title}</h3>
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{session.description}</p>
                              
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                  <FiCalendar className="mr-1" />
                                  <span className="mr-3">{formatDate(session.scheduledFor)}</span>
                                  <FiClock className="mr-1" />
                                  <span>{formatTime(session.scheduledFor)}</span>
                                </div>
                                {isMember && (
                                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                    <FiUsers className="mr-1" />
                                    <span>{session.participantCount || 0} joined</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center mb-3">
                                <div className={`text-sm px-2 py-1 rounded-full ${isSessionActive(session) 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}
                                >
                                  {isSessionActive(session) 
                                    ? 'Active Now' 
                                    : getTimeUntilSession(session)}
                                </div>
                              </div>
                              
                              <div className="flex justify-end">
                                <button 
                                  className={`${isSessionActive(session) 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-blue-600 hover:bg-blue-700'} 
                                    text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center`}
                                  onClick={() => router.push(`/community/${currentCommunity.id}/sessions/${session.id}`)}
                                >
                                  <FiVideo className="mr-1" /> 
                                  {isSessionActive(session) ? 'Join Now' : 'View Details'}
                                </button>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  This section is under development. Check back soon!
                </p>
              )
            ) : (
              <div className="max-w-md mx-auto text-center">
                <div className="flex justify-center mb-4">
                  <FiLock className="text-gray-400 text-4xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Join the Community
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You need to be a member to access this content. Join now to unlock all features!
                </p>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  onClick={() => setActiveTab('overview')}
                >
                  View Membership Options
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface SessionCardProps {
  session: LiveSession;
  isMember: boolean;
  onClick: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, isMember, onClick }) => {
  const sessionDate = new Date(session.scheduledFor.seconds * 1000);
  const formattedDate = sessionDate.toLocaleDateString();
  const formattedTime = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div 
      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center mb-1">
        {session.status === 'live' && (
          <div className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </div>
        )}
        <h3 className="font-bold">{session.title}</h3>
      </div>
      <p className={`${session.status === 'live' ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'} text-sm mb-3`}>
        {session.description}
      </p>
      <div className="flex justify-between items-center mb-3">
        <div className={`flex items-center ${session.status === 'live' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'} text-sm`}>
          <FiCalendar className="mr-1" />
          <span className="mr-3">{formattedDate}</span>
          <FiClock className="mr-1" />
          <span>{formattedTime}</span>
        </div>
        {isMember && (
          <div className={`flex items-center ${session.status === 'live' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'} text-sm`}>
            <FiUsers className="mr-1" />
            <span>{session.participantCount || 0} joined</span>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button 
          className={`${session.status === 'live' 
            ? 'bg-white text-red-600 hover:bg-red-50' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'} 
            font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center`}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <FiVideo className="mr-1" /> 
          {session.status === 'live' ? 'Join Now' : 'View Session'}
        </button>
      </div>
    </div>
  );
};

export default CommunityDetailPage;
