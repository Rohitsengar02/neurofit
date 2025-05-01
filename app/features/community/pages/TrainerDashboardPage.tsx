'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  FiUsers, FiCalendar, FiPlus, FiBarChart2, 
  FiDollarSign, FiSettings, FiEdit, FiTrash2,
  FiEye, FiClock, FiMessageCircle, FiVideo, FiTag, FiArrowLeft
} from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import * as communityService from '../services/communityService';
import * as contentService from '../services/contentService';
import * as subscriptionService from '../services/subscriptionService';
import * as couponService from '../services/couponService';
import CouponManagement from '../components/CouponManagement';
import { Community, Trainer, LiveSession } from '../utils/types';

const TrainerDashboardPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<LiveSession[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch trainer data
  useEffect(() => {
    const fetchTrainerData = async () => {
      if (!user) {
        router.push('/login?redirect=/community/trainer/dashboard');
        return;
      }
      
      setIsLoading(true);
      try {
        // Get trainer profile
        const trainerData = await communityService.getTrainerByUserId(user.uid);
        
        if (!trainerData) {
          // No trainer profile found, redirect to application page
          router.push('/community/trainer/apply');
          return;
        }
        
        setTrainer(trainerData);
        
        // Get trainer's communities
        const communitiesData = await communityService.getCommunitiesByTrainerId(trainerData.id);
        setCommunities(communitiesData);
        
        // Get upcoming sessions across all communities
        if (communitiesData.length > 0) {
          const allSessions: LiveSession[] = [];
          
          for (const community of communitiesData) {
            const sessions = await contentService.getUpcomingSessions(community.id);
            allSessions.push(...sessions);
          }
          
          // Sort by scheduled date
          allSessions.sort((a, b) => a.scheduledFor.seconds - b.scheduledFor.seconds);
          setUpcomingSessions(allSessions);
        }
      } catch (error) {
        console.error('Error fetching trainer data:', error);
        setError('Failed to load trainer data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrainerData();
  }, [user]);
  
  // Handle creating a new community
  const handleCreateCommunity = () => {
    router.push('/community/trainer/create');
  };
  
  // Handle creating a new session
  const handleCreateSession = (communityId: string) => {
    router.push(`/community/trainer/session/create?communityId=${communityId}`);
  };
  
  // Handle editing a community
  const handleEditCommunity = (communityId: string) => {
    router.push(`/community/trainer/edit/${communityId}`);
  };
  
  // Handle viewing a community
  const handleViewCommunity = (communityId: string) => {
    router.push(`/community/${communityId}`);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user || !trainer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Not a Trainer Yet
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to apply to become a trainer before accessing this dashboard.
          </p>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            onClick={() => router.push('/community/trainer/apply')}
          >
            Apply Now
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              {trainer.profileImage && (
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={trainer.profileImage}
                    alt={trainer.name}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Trainer Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Welcome back, {trainer.name}
                </p>
              </div>
            </div>
            
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              onClick={handleCreateCommunity}
            >
              <FiPlus className="mr-2" />
              Create Community
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
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
                activeTab === 'communities'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('communities')}
            >
              My Communities
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
                activeTab === 'content'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('content')}
            >
              Content Library
            </button>
            <button
              className={`px-4 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'coupons'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('coupons')}
            >
              Coupons
            </button>
            <button
              className={`px-4 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
            <button
              className={`px-4 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard 
                icon={<FiUsers className="text-blue-600 dark:text-blue-400" />}
                title="Total Members"
                value={communities.reduce((total, community) => total + community.memberCount, 0)}
                bgColor="bg-blue-50 dark:bg-blue-900/20"
              />
              <StatsCard 
                icon={<FiDollarSign className="text-green-600 dark:text-green-400" />}
                title="Monthly Revenue"
                value="$0"
                bgColor="bg-green-50 dark:bg-green-900/20"
              />
              <StatsCard 
                icon={<FiCalendar className="text-purple-600 dark:text-purple-400" />}
                title="Upcoming Sessions"
                value={upcomingSessions.length}
                bgColor="bg-purple-50 dark:bg-purple-900/20"
              />
              <StatsCard 
                icon={<FiMessageCircle className="text-orange-600 dark:text-orange-400" />}
                title="Communities"
                value={communities.length}
                bgColor="bg-orange-50 dark:bg-orange-900/20"
              />
            </div>
            
            {/* Communities and Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* My Communities */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    My Communities
                  </h2>
                  <button 
                    className="text-blue-600 dark:text-blue-400 text-sm font-medium"
                    onClick={() => setActiveTab('communities')}
                  >
                    View All
                  </button>
                </div>
                
                {communities.length === 0 ? (
                  <div className="text-center py-10">
                    <FiUsers className="mx-auto text-4xl text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Communities Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Create your first fitness community to start growing your audience.
                    </p>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      onClick={handleCreateCommunity}
                    >
                      Create Community
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {communities.slice(0, 3).map((community) => (
                      <div 
                        key={community.id}
                        className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => handleViewCommunity(community.id)}
                      >
                        {community.logoImage && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden mr-4">
                            <Image
                              src={community.logoImage}
                              alt={community.name}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-grow">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {community.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <FiUsers className="mr-1" />
                            <span>{community.memberCount} members</span>
                          </div>
                        </div>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCommunity(community.id);
                          }}
                        >
                          <FiEdit />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Upcoming Sessions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Upcoming Sessions
                  </h2>
                  <button 
                    className="text-blue-600 dark:text-blue-400 text-sm font-medium"
                    onClick={() => setActiveTab('sessions')}
                  >
                    View All
                  </button>
                </div>
                
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-10">
                    <FiCalendar className="mx-auto text-4xl text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Upcoming Sessions
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Schedule your first live session to engage with your community.
                    </p>
                    {communities.length > 0 && (
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        onClick={() => handleCreateSession(communities[0].id)}
                      >
                        Schedule Session
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.slice(0, 3).map((session) => {
                      const sessionDate = new Date(session.scheduledFor.seconds * 1000);
                      const formattedDate = sessionDate.toLocaleDateString();
                      const formattedTime = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <div 
                          key={session.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => router.push(`/community/trainer/session/${session.id}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {session.title}
                            </h3>
                            <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                              {session.duration} min
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                            {session.description}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <FiCalendar className="mr-1" />
                            <span>{formattedDate}</span>
                            <span className="mx-2">•</span>
                            <FiClock className="mr-1" />
                            <span>{formattedTime}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickActionCard 
                  icon={<FiPlus />}
                  title="Create Community"
                  onClick={handleCreateCommunity}
                />
                <QuickActionCard 
                  icon={<FiCalendar />}
                  title="Schedule Session"
                  onClick={() => communities.length > 0 && handleCreateSession(communities[0].id)}
                  disabled={communities.length === 0}
                />
                <QuickActionCard 
                  icon={<FiVideo />}
                  title="Upload Workout"
                  onClick={() => router.push('/community/trainer/content/create')}
                  disabled={communities.length === 0}
                />
                <QuickActionCard 
                  icon={<FiBarChart2 />}
                  title="View Analytics"
                  onClick={() => setActiveTab('analytics')}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Communities Tab */}
        {activeTab === 'communities' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Communities
              </h2>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
                onClick={handleCreateCommunity}
              >
                <FiPlus className="mr-2" />
                Create Community
              </button>
            </div>
            
            {communities.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                <FiUsers className="mx-auto text-5xl text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No Communities Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Create your first fitness community to start growing your audience and sharing your expertise.
                </p>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  onClick={handleCreateCommunity}
                >
                  Create Your First Community
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community) => (
                  <div 
                    key={community.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                  >
                    {/* Cover Image */}
                    <div className="h-40 relative">
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
                      
                      {/* Logo */}
                      {community.logoImage && (
                        <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-lg border-4 border-white dark:border-gray-800 overflow-hidden">
                          <Image
                            src={community.logoImage}
                            alt={`${community.name} logo`}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 pt-8">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {community.name}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {community.description}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <FiUsers className="mr-1" />
                        <span>{community.memberCount} members</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {community.categories.slice(0, 3).map((category, index) => (
                          <span 
                            key={index} 
                            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                        {community.categories.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{community.categories.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                          onClick={() => handleViewCommunity(community.id)}
                        >
                          <FiEye className="inline mr-1" /> View
                        </button>
                        <button
                          className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          onClick={() => handleEditCommunity(community.id)}
                        >
                          <FiEdit className="inline mr-1" /> Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Discount Coupons
              </h2>
            </div>
            
            {communities.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                <FiTag className="mx-auto text-5xl text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No Communities Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Create your first fitness community to start offering discount coupons to your members.
                </p>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  onClick={handleCreateCommunity}
                >
                  Create Your First Community
                </button>
              </div>
            ) : selectedCommunityId ? (
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        className="mr-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => setSelectedCommunityId(null)}
                      >
                        <FiArrowLeft />
                      </button>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {communities.find(c => c.id === selectedCommunityId)?.name} - Coupons
                      </h3>
                    </div>
                  </div>
                </div>
                
                <CouponManagement communityId={selectedCommunityId} />
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Select a Community to Manage Coupons
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {communities.map((community) => (
                    <div 
                      key={community.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setSelectedCommunityId(community.id)}
                    >
                      <div className="flex items-center">
                        {community.logoImage && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden mr-4">
                            <Image
                              src={community.logoImage}
                              alt={community.name}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {community.name}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <FiUsers className="mr-1" />
                            <span>{community.memberCount} members</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Other tabs would be implemented here */}
        {(activeTab === 'sessions' || activeTab === 'content' || activeTab === 'analytics' || activeTab === 'settings') && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {activeTab === 'sessions' && 'Live Sessions'}
              {activeTab === 'content' && 'Content Library'}
              {activeTab === 'analytics' && 'Analytics Dashboard'}
              {activeTab === 'settings' && 'Account Settings'}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This section is under development. Check back soon!
            </p>
            
            {activeTab === 'sessions' && communities.length > 0 && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                onClick={() => handleCreateSession(communities[0].id)}
              >
                Schedule New Session
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  bgColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, title, value, bgColor }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center">
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mr-4`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ icon, title, onClick, disabled = false }) => {
  return (
    <button
      className={`flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {title}
      </span>
    </button>
  );
};

export default TrainerDashboardPage;
