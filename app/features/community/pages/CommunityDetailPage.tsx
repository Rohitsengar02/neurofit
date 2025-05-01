'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiUsers, FiCalendar, FiClock, FiArrowLeft, FiLock, FiTag } from 'react-icons/fi';
import { useCommunity } from '../context/CommunityContext';
import { useAuth } from '../../../context/AuthContext';
import * as communityService from '../services/communityService';
import * as contentService from '../services/contentService';
import * as subscriptionService from '../services/subscriptionService';
import * as couponService from '../services/couponService';
import CouponApplyForm from '../components/CouponApplyForm';
import { Community, LiveSession, SubscriptionTier } from '../utils/types';

const CommunityDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { 
    currentCommunity, 
    setCurrentCommunity,
    currentCommunityTiers,
    isLoadingTiers,
    upcomingSessions,
    isLoadingUpcomingSessions,
    refreshCurrentCommunityTiers,
    refreshUpcomingSessions,
    isUserMemberOfCurrentCommunity,
    getUserMembershipForCurrentCommunity,
    // Add missing trainer-related variables
    trainerProfile,
    isLoadingTrainer
  } = useCommunity();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercentage: number } | null>(null);
  
  // Fetch community data
  useEffect(() => {
    const fetchCommunity = async () => {
      if (!params.id) return;
      
      setIsLoading(true);
      try {
        const communityId = params.id as string;
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
  
  if (isLoading || !currentCommunity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  const isMember = isUserMemberOfCurrentCommunity();
  const membership = getUserMembershipForCurrentCommunity();
  
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
              
              {/* Upcoming Sessions Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Upcoming Live Sessions
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
                        onClick={() => router.push(`/community/${currentCommunity.id}/session/${session.id}`)}
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {activeTab === 'sessions' && 'Live Sessions'}
              {activeTab === 'workouts' && 'Workout Library'}
              {activeTab === 'challenges' && 'Community Challenges'}
              {activeTab === 'feed' && 'Community Feed'}
            </h2>
            
            {isMember ? (
              <p className="text-gray-600 dark:text-gray-400">
                This section is under development. Check back soon!
              </p>
            ) : (
              <div className="max-w-md mx-auto">
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
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <FiCalendar className="text-blue-600 dark:text-blue-400 text-xl" />
        </div>
        
        <div className="flex-grow">
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
            {session.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {session.description.length > 100 
              ? `${session.description.substring(0, 100)}...` 
              : session.description}
          </p>
          
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center mr-4">
              <FiCalendar className="mr-1" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center">
              <FiClock className="mr-1" />
              <span>{formattedTime} • {session.duration} min</span>
            </div>
          </div>
        </div>
        
        {!isMember && (
          <div className="bg-gray-200 dark:bg-gray-600 rounded-full p-2">
            <FiLock className="text-gray-500 dark:text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityDetailPage;
