'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  FiUsers, FiCalendar, FiPlus, FiBarChart2, 
  FiDollarSign, FiSettings, FiEdit, FiTrash2,
  FiEye, FiClock, FiMessageCircle, FiVideo, FiTag, FiArrowLeft,
  FiX, FiCheck
} from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import * as communityService from '../services/communityService';
import * as contentService from '../services/contentService';
import * as subscriptionService from '../services/subscriptionService';
import * as couponService from '../services/couponService';
import CouponManagement from '../components/CouponManagement';
import { Community, Trainer, LiveSession, CommunityWorkout } from '../utils/types';

interface Workout {
  id: string;
  title: string;
  description: string;
  level: string;
  image?: string;
  days: number;
  caloriesPerDay: number;
  [key: string]: any;
}

interface SelectedWorkoutsMap {
  [communityId: string]: Workout[];
}

const TrainerDashboardPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<LiveSession[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [availableWorkouts, setAvailableWorkouts] = useState<Workout[]>([]);
  const [selectedWorkouts, setSelectedWorkouts] = useState<SelectedWorkoutsMap>({});
  const [selectedCommunityForWorkout, setSelectedCommunityForWorkout] = useState<string | null>(null);
  const [currentWorkoutPage, setCurrentWorkoutPage] = useState(1);
  const [workoutsPerPage] = useState(9);
  const [displayedWorkouts, setDisplayedWorkouts] = useState<Workout[]>([]);
  const [totalWorkoutPages, setTotalWorkoutPages] = useState(1);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionFormData, setSessionFormData] = useState({
    title: '',
    description: '',
    scheduledFor: '',
    duration: 30,
    maxParticipants: 20,
    communityId: '',
    requiredTiers: [] as string[],
    useGoogleMeet: false,
    meetLink: ''
  });
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Update displayed workouts when available workouts or pagination changes
  useEffect(() => {
    if (availableWorkouts.length > 0) {
      const indexOfLastWorkout = currentWorkoutPage * workoutsPerPage;
      const indexOfFirstWorkout = indexOfLastWorkout - workoutsPerPage;
      
      // Calculate total pages
      const totalPages = Math.ceil(availableWorkouts.length / workoutsPerPage);
      setTotalWorkoutPages(totalPages);
      
      // Update displayed workouts for current page
      const workoutsToDisplay = availableWorkouts.slice(indexOfFirstWorkout, indexOfLastWorkout);
      setDisplayedWorkouts(workoutsToDisplay);
      
      console.log(`Displaying workouts ${indexOfFirstWorkout + 1} to ${Math.min(indexOfLastWorkout, availableWorkouts.length)} of ${availableWorkouts.length}`);
    }
  }, [availableWorkouts, currentWorkoutPage, workoutsPerPage]);
  
  // Handle pagination controls
  const handlePreviousPage = () => {
    setCurrentWorkoutPage(prev => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    setCurrentWorkoutPage(prev => Math.min(prev + 1, totalWorkoutPages));
  };
  
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
        
        // Fetch available workouts for the workout tab
        console.log('Fetching available workouts in fetchTrainerData...');
        const workouts = await communityService.getAvailableWorkouts();
        console.log(`Fetched ${workouts.length} workouts for trainer dashboard`);
        
        // Process workout data to ensure all required fields
        const processedWorkouts = workouts.map(workout => ({
          ...workout,
          // Ensure image URLs are properly formatted
          image: workout.image || `https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1470&auto=format`,
          // Ensure all required fields have default values
          title: workout.title || 'Untitled Workout',
          description: workout.description || 'No description available',
          level: workout.level || 'beginner',
          days: workout.days || 7,
          caloriesPerDay: workout.caloriesPerDay || 300
        }));
        
        setAvailableWorkouts(processedWorkouts);
      } catch (error) {
        console.error('Error fetching trainer data:', error);
        setError('Failed to load trainer data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrainerData();
  }, [user]);
  
  // Removed duplicate workout fetching useEffect - we already fetch in fetchTrainerData
  
  // Helper function to get appropriate workout image based on level
  const getWorkoutImageByLevel = (level: string = 'beginner'): string => {
    switch(level.toLowerCase()) {
      case 'beginner':
        return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1470&q=80';
      case 'intermediate':
        return 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=1470&q=80';
      case 'advanced':
        return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1470&q=80';
      default:
        return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1470&q=80';
    }
  };
  
  // Handle creating a community
  const handleCreateCommunity = () => {
    router.push('/community/trainer/create');
  };
  
  // Handle creating a new session
  const handleCreateSession = (communityId: string) => {
    setEditingSessionId(null);
    setSessionFormData(prev => ({ ...prev, communityId }));
    setShowSessionForm(true);
  };
  
  // Handle editing an existing session
  const handleEditSession = async (sessionId: string) => {
    try {
      // Find the session in the upcomingSessions array
      const sessionToEdit = upcomingSessions.find(session => session.id === sessionId);
      
      if (!sessionToEdit) {
        console.error('Session not found');
        return;
      }
      
      // Convert Firestore timestamp to string format for datetime-local input
      const sessionDate = sessionToEdit.scheduledFor?.toDate ? 
        sessionToEdit.scheduledFor.toDate() : 
        new Date(sessionToEdit.scheduledFor);
      
      // Format date for datetime-local input (YYYY-MM-DDThh:mm)
      const formattedDate = sessionDate.toISOString().slice(0, 16);
      
      // Set form data with session values
      setSessionFormData({
        title: sessionToEdit.title,
        description: sessionToEdit.description,
        scheduledFor: formattedDate,
        duration: sessionToEdit.duration,
        maxParticipants: sessionToEdit.maxParticipants || 20,
        communityId: sessionToEdit.communityId,
        requiredTiers: sessionToEdit.requiredTiers || [],
        useGoogleMeet: sessionToEdit.useGoogleMeet || false,
        meetLink: sessionToEdit.meetLink || ''
      });
      
      setEditingSessionId(sessionId);
      setShowSessionForm(true);
    } catch (error) {
      console.error('Error preparing session for edit:', error);
      setError('Failed to load session data for editing.');
    }
  };
  
  const handleSessionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    
    // Handle checkbox inputs separately
    if (type === 'checkbox') {
      setSessionFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setSessionFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmitSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid || !sessionFormData.communityId) return;
    
    try {
      // Parse the datetime-local input value to a proper Date object
      const scheduledForDate = new Date(sessionFormData.scheduledFor);
      
      if (editingSessionId) {
        // Update existing session
        await contentService.updateSession(editingSessionId, {
          title: sessionFormData.title,
          description: sessionFormData.description,
          scheduledFor: scheduledForDate,
          duration: Number(sessionFormData.duration),
          maxParticipants: Number(sessionFormData.maxParticipants),
          requiredTiers: sessionFormData.requiredTiers,
          useGoogleMeet: sessionFormData.useGoogleMeet,
          meetLink: sessionFormData.meetLink
        });
        
        console.log(`Session ${editingSessionId} updated successfully`);
      } else {
        // Create new session
        const newSession = {
          title: sessionFormData.title,
          description: sessionFormData.description,
          scheduledFor: scheduledForDate,
          duration: Number(sessionFormData.duration),
          maxParticipants: Number(sessionFormData.maxParticipants),
          communityId: sessionFormData.communityId,
          trainerId: user.uid,
          status: 'scheduled' as const,
          participantCount: 0,
          requiredTiers: sessionFormData.requiredTiers,
          createdAt: new Date(),
          date: scheduledForDate.toLocaleDateString(),
          time: scheduledForDate.toLocaleTimeString(),
          useGoogleMeet: sessionFormData.useGoogleMeet,
          meetLink: sessionFormData.meetLink
        };
        
        const createdSession = await contentService.createLiveSession(newSession);
        console.log(`New session created successfully: ${createdSession.id}`);
      }
      
      // Reset form and refresh sessions
      setShowSessionForm(false);
      setEditingSessionId(null);
      setSessionFormData({
        title: '',
        description: '',
        scheduledFor: '',
        duration: 30,
        maxParticipants: 20,
        communityId: '',
        requiredTiers: [],
        useGoogleMeet: false,
        meetLink: ''
      });
      
      // Refresh upcoming sessions
      const refreshedSessions = await Promise.all(
        communities.map(async (community) => {
          const sessions = await contentService.getUpcomingSessions(community.id, 10);
          return sessions;
        })
      );
      
      setUpcomingSessions(refreshedSessions.flat());
    } catch (error) {
      console.error('Error managing live session:', error);
      setError('Failed to save live session. Please try again.');
    }
  };
  
  // Handle editing a community
  const handleEditCommunity = (communityId: string) => {
    router.push(`/community/trainer/edit/${communityId}`);
  };
  
  // Handle viewing a community
  const handleViewCommunity = (communityId: string) => {
    router.push(`/community/${communityId}`);
  };
  
  // Handle selecting a community for workout assignment
  const handleSelectCommunityForWorkout = (communityId: string) => {
    setSelectedCommunityForWorkout(communityId);
    
    // Initialize selected workouts for this community if not already done
    if (!selectedWorkouts[communityId]) {
      setSelectedWorkouts(prev => ({
        ...prev,
        [communityId]: []
      }));
    }
  };
  
  // Handle workout selection for a community
  const handleSelectWorkout = (workout: Workout) => {
    if (!selectedCommunityForWorkout) return;
    
    console.log('Toggling workout selection:', workout.id, workout.title);
    
    setSelectedWorkouts(prev => {
      const currentSelections = prev[selectedCommunityForWorkout] || [];
      const isAlreadySelected = currentSelections.some(w => w.id === workout.id);
      
      console.log('Current selection status:', isAlreadySelected ? 'selected' : 'not selected');
      
      // If already selected, remove it; otherwise add it
      const updatedSelections = isAlreadySelected
        ? currentSelections.filter(w => w.id !== workout.id)
        : [...currentSelections, workout];
      
      console.log(`Updated selection count: ${updatedSelections.length} workouts`);
      
      return {
        ...prev,
        [selectedCommunityForWorkout]: updatedSelections
      };
    });
  };
  
  // Handle confirming workout selections for a community
  const handleConfirmWorkouts = async () => {
    if (!selectedCommunityForWorkout) return;
    
    const communityWorkouts = selectedWorkouts[selectedCommunityForWorkout];
    if (!communityWorkouts || communityWorkouts.length === 0) return;
    
    setIsLoading(true);
    try {
      // First get the current community data
      const community = await communityService.getCommunityById(selectedCommunityForWorkout);
      if (!community) throw new Error('Community not found');
      
      // Add each selected workout to the community
      for (const workout of communityWorkouts) {
        await communityService.addWorkoutToCommunity(selectedCommunityForWorkout, workout);
      }
      
      // Clear the selections for this community
      setSelectedWorkouts(prev => ({
        ...prev,
        [selectedCommunityForWorkout]: []
      }));
      
      // Refresh the communities to show updated data
      if (trainer) {
        const refreshedCommunities = await communityService.getCommunitiesByTrainerId(trainer.id);
        setCommunities(refreshedCommunities);
      }
      
      // Show success message
      alert(`Workouts added to ${communities.find(c => c.id === selectedCommunityForWorkout)?.name}`);
    } catch (error) {
      console.error('Error adding workouts to community:', error);
      alert('Failed to add workouts to community. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        
        {/* Live Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Live Sessions
              </h2>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
                onClick={() => communities.length > 0 && handleCreateSession(communities[0].id)}
                disabled={communities.length === 0}
              >
                <FiPlus className="mr-2" /> Schedule New Session
              </button>
            </div>
            
            {/* Session Creation Form Modal */}
            {showSessionForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Schedule New Live Session
                      </h3>
                      <button 
                        onClick={() => setShowSessionForm(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <FiX className="text-xl" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleSubmitSession}>
                      <div className="space-y-4">
                        {/* Community Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Community
                          </label>
                          <select
                            name="communityId"
                            value={sessionFormData.communityId}
                            onChange={handleSessionFormChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          >
                            <option value="">Select a community</option>
                            {communities.map(community => (
                              <option key={community.id} value={community.id}>
                                {community.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Title */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Session Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={sessionFormData.title}
                            onChange={handleSessionFormChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="e.g., HIIT Workout with Coach Sarah"
                            required
                          />
                        </div>
                        
                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={sessionFormData.description}
                            onChange={handleSessionFormChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[100px]"
                            placeholder="Describe what participants can expect in this session"
                            required
                          />
                        </div>
                        
                        {/* Google Meet Integration */}
                        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
                            Video Conference Options
                          </h4>
                          
                          <div className="flex items-center mb-3">
                            <input
                              type="checkbox"
                              id="useGoogleMeet"
                              name="useGoogleMeet"
                              checked={sessionFormData.useGoogleMeet}
                              onChange={handleSessionFormChange}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="useGoogleMeet" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              Enable Google Meet for this session
                            </label>
                          </div>
                          
                          {sessionFormData.useGoogleMeet && (
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Google Meet Link (Optional)
                              </label>
                              <input
                                type="text"
                                name="meetLink"
                                value={sessionFormData.meetLink}
                                onChange={handleSessionFormChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                              />
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                You can add a link now or later when the session starts. If left empty, participants will still be able to join via Google Meet when the session is live.
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Date and Time */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Date and Time
                          </label>
                          <input
                            type="datetime-local"
                            name="scheduledFor"
                            value={sessionFormData.scheduledFor}
                            onChange={handleSessionFormChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        
                        {/* Duration */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            name="duration"
                            value={sessionFormData.duration}
                            onChange={handleSessionFormChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            min="5"
                            max="180"
                            required
                          />
                        </div>
                        
                        {/* Max Participants */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Maximum Participants
                          </label>
                          <input
                            type="number"
                            name="maxParticipants"
                            value={sessionFormData.maxParticipants}
                            onChange={handleSessionFormChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            min="1"
                            max="100"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowSessionForm(false)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                          Schedule Session
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
            
            {communities.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                <FiCalendar className="mx-auto text-5xl text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No Communities Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Create your first fitness community to start scheduling live sessions for your members.
                </p>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  onClick={handleCreateCommunity}
                >
                  Create Your First Community
                </button>
              </div>
            ) : upcomingSessions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                <FiCalendar className="mx-auto text-5xl text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No Upcoming Sessions
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  You haven't scheduled any live sessions yet. Create your first session to engage with your community members.
                </p>
                {/* Removed redundant button - users can use the one in the header */}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingSessions.map(session => {
                  const community = communities.find(c => c.id === session.communityId);
                  const sessionDate = session.scheduledFor?.toDate ? session.scheduledFor.toDate() : new Date(session.scheduledFor);
                  const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(sessionDate);
                  const formattedTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(sessionDate);
                  
                  return (
                    <div key={session.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                      <div className="h-40 relative">
                        {community?.coverImage ? (
                          <Image
                            src={community.coverImage}
                            alt={community.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="text-center text-white">
                            <h3 className="text-xl font-bold mb-2">{session.title}</h3>
                            <p className="text-sm">{community?.name || 'Community'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {session.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <FiCalendar className="mr-1" />
                            <span>{formattedDate}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <FiClock className="mr-1" />
                            <span>{formattedTime}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <FiUsers className="mr-1" />
                            <span>{session.participantCount || 0}/{session.maxParticipants} joined</span>
                          </div>
                          <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                            {session.duration} min
                          </span>
                        </div>
                        
                        <div className="mt-6 flex space-x-2">
                          <button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            onClick={() => router.push(`/community/${session.communityId}/sessions/${session.id}`)}
                          >
                            <FiEye className="inline mr-1" /> View Details
                          </button>
                          <button
                            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 font-medium py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => handleEditSession(session.id)}
                          >
                            <FiEdit className="inline mr-1" /> Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
        
        {/* Workouts Tab */}
        {activeTab === 'workouts' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Workout Management
            </h2>
            
            {/* Community Selector */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Select Community
              </h3>
              
              {communities.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You need to create a community first before adding workouts.
                  </p>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    onClick={handleCreateCommunity}
                  >
                    Create Community
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {communities.map((community) => (
                    <div 
                      key={community.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedCommunityForWorkout === community.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      onClick={() => handleSelectCommunityForWorkout(community.id)}
                    >
                      <div className="flex items-center">
                        {community.logoImage && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden mr-3">
                            <Image
                              src={community.logoImage}
                              alt={community.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {community.name}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <FiUsers className="mr-1" />
                            <span>{community.memberCount} members</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Available Workouts */}
            {selectedCommunityForWorkout && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Available Workouts
                  </h3>
                  
                  {/* Confirm button */}
                  {selectedWorkouts[selectedCommunityForWorkout]?.length > 0 && (
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
                      onClick={handleConfirmWorkouts}
                    >
                      <FiCheck className="mr-2" />
                      Confirm Selected Workouts
                    </button>
                  )}
                </div>
                
                {availableWorkouts.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      No workouts available from the database. 
                      The system will use sample workouts until real workout data is added.
                    </p>
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      onClick={async () => {
                        // Refresh available workouts
                        const workouts = await communityService.getAvailableWorkouts();
                        setAvailableWorkouts(workouts);
                      }}
                    >
                      Refresh Workouts
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {displayedWorkouts.map((workout) => {
                        const isSelected = selectedWorkouts[selectedCommunityForWorkout]?.some(w => w.id === workout.id);
                        
                        return (
                          <div 
                            key={workout.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${isSelected 
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400' 
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            onClick={() => handleSelectWorkout(workout)}
                          >
                            <div className="flex items-start">
                              {/* Always show image with fallback */}
                              <div className="w-16 h-16 rounded-lg overflow-hidden mr-3 flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                                <Image
                                  src={workout.imageUrl || workout.image || getWorkoutImageByLevel(workout.level)}
                                  alt={workout.title || 'Workout'}
                                  width={64}
                                  height={64}
                                  className="object-cover h-full w-full"
                                />
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {workout.title || 'Untitled Workout'}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {workout.description || 'No description available'}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                    {workout.days || 7} days
                                  </span>
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
                                    {workout.caloriesPerDay || 300} cal/day
                                  </span>
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                                    {workout.level || 'beginner'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                  {isSelected ? <FiCheck size={14} /> : <FiPlus size={14} />}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center mt-6">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {availableWorkouts.length > 0 ? (currentWorkoutPage - 1) * workoutsPerPage + 1 : 0} to {Math.min(currentWorkoutPage * workoutsPerPage, availableWorkouts.length)} of {availableWorkouts.length} workouts
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          className={`px-3 py-1 rounded-md border ${currentWorkoutPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'} dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700`}
                          onClick={handlePreviousPage}
                          disabled={currentWorkoutPage === 1}
                        >
                          Previous
                        </button>
                        
                        <div className="flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md">
                          <span className="text-gray-700 dark:text-gray-300">{currentWorkoutPage}</span>
                          <span className="mx-1 text-gray-500">/</span>
                          <span className="text-gray-700 dark:text-gray-300">{totalWorkoutPages}</span>
                        </div>
                        
                        <button
                          className={`px-3 py-1 rounded-md border ${currentWorkoutPage === totalWorkoutPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-50'} dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700`}
                          onClick={handleNextPage}
                          disabled={currentWorkoutPage === totalWorkoutPages}
                        >
                          Next
                        </button>
                      </div>
                      
                      <div>
                        <button 
                          onClick={() => setCurrentWorkoutPage(1)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          disabled={currentWorkoutPage === 1}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </>
                )}
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
