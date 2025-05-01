// Community feature types

export interface Trainer {
  id: string;
  userId: string;
  name: string;
  bio: string;
  specialties: string[];
  experience: string;
  profileImage: string;
  coverImage?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
  };
  verified: boolean;
  featured: boolean;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

export interface Community {
  id: string;
  trainerId: string;
  name: string;
  description: string;
  coverImage?: string;
  logoImage?: string;
  memberCount: number;
  categories: string[];
  tags: string[];
  featured: boolean;
  isPrivate: boolean;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

export interface SubscriptionTier {
  id: string;
  communityId: string;
  name: string;
  description: string;
  price: number; // Monthly price in USD
  features: string[];
  includedInHigherTiers: boolean;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  tierId: string;
  joinedAt: any; // Firestore timestamp
  status: 'active' | 'pending' | 'cancelled';
  expiresAt: any; // Firestore timestamp
}

export interface LiveSession {
  id: string;
  communityId: string;
  trainerId: string;
  title: string;
  description: string;
  coverImage?: string;
  scheduledFor: any; // Firestore timestamp
  duration: number; // In minutes
  maxParticipants?: number;
  participantCount?: number; // Number of participants registered
  requiredTiers?: string[]; // Array of tier IDs
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  recordingUrl?: string;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

export interface SessionParticipant {
  id: string;
  sessionId: string;
  userId: string;
  joinedAt?: any; // Firestore timestamp
  leftAt?: any; // Firestore timestamp
  status: 'registered' | 'attended' | 'no-show';
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  authorType: 'trainer' | 'member';
  content: string;
  mediaUrls?: string[];
  likes: number;
  comments: number;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorType: 'trainer' | 'member';
  content: string;
  likes: number;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

export interface WorkoutContent {
  id: string;
  communityId: string;
  trainerId: string;
  title: string;
  description: string;
  coverImage?: string;
  videoUrl?: string;
  duration: number; // In minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  categories: string[];
  requiredTiers: string[]; // Array of tier IDs
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

export interface Challenge {
  id: string;
  communityId: string;
  title: string;
  description: string;
  coverImage?: string;
  startDate: any; // Firestore timestamp
  endDate: any; // Firestore timestamp
  participantCount: number;
  requiredTiers: string[]; // Array of tier IDs
  status: 'upcoming' | 'active' | 'completed';
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  userId: string;
  progress: number; // Percentage of completion
  completed: boolean;
  joinedAt: any; // Firestore timestamp
  completedAt?: any; // Firestore timestamp
}

export interface Coupon {
  id: string;
  communityId: string;
  code: string;
  discountPercentage: number;
  maxUses: number;
  usedCount: number;
  expiresAt: any; // Firestore timestamp
  isActive: boolean;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  communityId: string;
  tierId: string;
  usedAt: any; // Firestore timestamp
  discountAmount: number;
}
