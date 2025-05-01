import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  Community, 
  Trainer, 
  CommunityMember, 
  SubscriptionTier,
  LiveSession
} from '../utils/types';
import * as communityService from '../services/communityService';
import * as subscriptionService from '../services/subscriptionService';
import * as contentService from '../services/contentService';

interface CommunityContextType {
  // User's trainer profile
  trainerProfile: Trainer | null;
  isLoadingTrainer: boolean;
  // User's communities (as trainer)
  trainerCommunities: Community[];
  isLoadingTrainerCommunities: boolean;
  // User's memberships (as member)
  userMemberships: CommunityMember[];
  isLoadingMemberships: boolean;
  // Featured communities
  featuredCommunities: Community[];
  isLoadingFeatured: boolean;
  // Current community context
  currentCommunity: Community | null;
  setCurrentCommunity: (community: Community | null) => void;
  // Current community tiers
  currentCommunityTiers: SubscriptionTier[];
  isLoadingTiers: boolean;
  // Current community upcoming sessions
  upcomingSessions: LiveSession[];
  isLoadingUpcomingSessions: boolean;
  // Functions
  refreshTrainerProfile: () => Promise<void>;
  refreshTrainerCommunities: () => Promise<void>;
  refreshUserMemberships: () => Promise<void>;
  refreshFeaturedCommunities: () => Promise<void>;
  refreshCurrentCommunityTiers: () => Promise<void>;
  refreshUpcomingSessions: () => Promise<void>;
  // Check if user is a member of current community
  isUserMemberOfCurrentCommunity: () => boolean;
  getUserMembershipForCurrentCommunity: () => CommunityMember | null;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};

interface CommunityProviderProps {
  children: ReactNode;
}

export const CommunityProvider: React.FC<CommunityProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // State for trainer profile
  const [trainerProfile, setTrainerProfile] = useState<Trainer | null>(null);
  const [isLoadingTrainer, setIsLoadingTrainer] = useState<boolean>(false);
  
  // State for trainer's communities
  const [trainerCommunities, setTrainerCommunities] = useState<Community[]>([]);
  const [isLoadingTrainerCommunities, setIsLoadingTrainerCommunities] = useState<boolean>(false);
  
  // State for user's memberships
  const [userMemberships, setUserMemberships] = useState<CommunityMember[]>([]);
  const [isLoadingMemberships, setIsLoadingMemberships] = useState<boolean>(false);
  
  // State for featured communities
  const [featuredCommunities, setFeaturedCommunities] = useState<Community[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState<boolean>(false);
  
  // Current community context
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(null);
  
  // Current community tiers
  const [currentCommunityTiers, setCurrentCommunityTiers] = useState<SubscriptionTier[]>([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState<boolean>(false);
  
  // Current community upcoming sessions
  const [upcomingSessions, setUpcomingSessions] = useState<LiveSession[]>([]);
  const [isLoadingUpcomingSessions, setIsLoadingUpcomingSessions] = useState<boolean>(false);
  
  // Load trainer profile if user is logged in
  const refreshTrainerProfile = async () => {
    if (!user) {
      setTrainerProfile(null);
      return;
    }
    
    setIsLoadingTrainer(true);
    try {
      const trainer = await communityService.getTrainerByUserId(user.uid);
      setTrainerProfile(trainer);
    } catch (error) {
      console.error('Error fetching trainer profile:', error);
    } finally {
      setIsLoadingTrainer(false);
    }
  };
  
  // Load trainer's communities
  const refreshTrainerCommunities = async () => {
    if (!trainerProfile) {
      setTrainerCommunities([]);
      return;
    }
    
    setIsLoadingTrainerCommunities(true);
    try {
      const communities = await communityService.getCommunitiesByTrainerId(trainerProfile.id);
      setTrainerCommunities(communities);
    } catch (error) {
      console.error('Error fetching trainer communities:', error);
    } finally {
      setIsLoadingTrainerCommunities(false);
    }
  };
  
  // Load user's memberships
  const refreshUserMemberships = async () => {
    if (!user) {
      setUserMemberships([]);
      return;
    }
    
    setIsLoadingMemberships(true);
    try {
      const memberships = await subscriptionService.getMembershipsByUserId(user.uid);
      setUserMemberships(memberships);
    } catch (error) {
      console.error('Error fetching user memberships:', error);
    } finally {
      setIsLoadingMemberships(false);
    }
  };
  
  // Load featured communities
  const refreshFeaturedCommunities = async () => {
    setIsLoadingFeatured(true);
    try {
      // First try to get all communities
      let communities = await communityService.getAllCommunities();
      
      // If no communities found, fall back to featured ones
      if (communities.length === 0) {
        communities = await communityService.getFeaturedCommunities();
      }
      
      setFeaturedCommunities(communities);
    } catch (error) {
      console.error('Error fetching communities:', error);
      // Try featured as fallback if getAllCommunities fails
      try {
        const featuredCommunities = await communityService.getFeaturedCommunities();
        setFeaturedCommunities(featuredCommunities);
      } catch (fallbackError) {
        console.error('Error fetching featured communities as fallback:', fallbackError);
      }
    } finally {
      setIsLoadingFeatured(false);
    }
  };
  
  // Load current community tiers
  const refreshCurrentCommunityTiers = async () => {
    if (!currentCommunity) {
      setCurrentCommunityTiers([]);
      return;
    }
    
    setIsLoadingTiers(true);
    try {
      const tiers = await subscriptionService.getTiersByCommunityId(currentCommunity.id);
      setCurrentCommunityTiers(tiers);
    } catch (error) {
      console.error('Error fetching community tiers:', error);
    } finally {
      setIsLoadingTiers(false);
    }
  };
  
  // Load upcoming sessions for current community
  const refreshUpcomingSessions = async () => {
    if (!currentCommunity) {
      setUpcomingSessions([]);
      return;
    }
    
    setIsLoadingUpcomingSessions(true);
    try {
      const sessions = await contentService.getUpcomingSessions(currentCommunity.id);
      setUpcomingSessions(sessions);
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
    } finally {
      setIsLoadingUpcomingSessions(false);
    }
  };
  
  // Check if user is a member of current community
  const isUserMemberOfCurrentCommunity = () => {
    if (!user || !currentCommunity) return false;
    
    return userMemberships.some(
      membership => membership.communityId === currentCommunity.id && membership.status === 'active'
    );
  };
  
  // Get user's membership for current community
  const getUserMembershipForCurrentCommunity = () => {
    if (!user || !currentCommunity) return null;
    
    const membership = userMemberships.find(
      m => m.communityId === currentCommunity.id && m.status === 'active'
    );
    
    return membership || null;
  };
  
  // Initial data loading when user changes
  useEffect(() => {
    refreshTrainerProfile();
    refreshUserMemberships();
    refreshFeaturedCommunities();
  }, [user]);
  
  // Load trainer communities when trainer profile changes
  useEffect(() => {
    if (trainerProfile) {
      refreshTrainerCommunities();
    }
  }, [trainerProfile]);
  
  // Load community-specific data when current community changes
  useEffect(() => {
    if (currentCommunity) {
      refreshCurrentCommunityTiers();
      refreshUpcomingSessions();
    }
  }, [currentCommunity]);
  
  const value = {
    trainerProfile,
    isLoadingTrainer,
    trainerCommunities,
    isLoadingTrainerCommunities,
    userMemberships,
    isLoadingMemberships,
    featuredCommunities,
    isLoadingFeatured,
    currentCommunity,
    setCurrentCommunity,
    currentCommunityTiers,
    isLoadingTiers,
    upcomingSessions,
    isLoadingUpcomingSessions,
    refreshTrainerProfile,
    refreshTrainerCommunities,
    refreshUserMemberships,
    refreshFeaturedCommunities,
    refreshCurrentCommunityTiers,
    refreshUpcomingSessions,
    isUserMemberOfCurrentCommunity,
    getUserMembershipForCurrentCommunity
  };
  
  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
};
