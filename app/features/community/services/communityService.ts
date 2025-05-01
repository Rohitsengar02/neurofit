import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db, storage } from '../../../lib/firebase';
import { 
  Community, 
  Trainer, 
  SubscriptionTier, 
  CommunityMember,
  LiveSession,
  SessionParticipant,
  CommunityPost,
  CommunityComment,
  WorkoutContent,
  Challenge,
  ChallengeParticipant
} from '../utils/types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Collection references
const trainersCollection = collection(db, 'trainers');
const communitiesCollection = collection(db, 'communities');
const tiersCollection = collection(db, 'subscriptionTiers');
const membersCollection = collection(db, 'communityMembers');
const sessionsCollection = collection(db, 'liveSessions');
const participantsCollection = collection(db, 'sessionParticipants');
const postsCollection = collection(db, 'communityPosts');
const commentsCollection = collection(db, 'communityComments');
const workoutsCollection = collection(db, 'workoutContent');
const challengesCollection = collection(db, 'challenges');
const challengeParticipantsCollection = collection(db, 'challengeParticipants');

// Import Cloudinary upload service
import { uploadToCloudinary } from '../../../services/cloudinary';

// Helper function for file uploads - now using Cloudinary
const uploadFile = async (file: File, path: string): Promise<string> => {
  // We'll ignore the path parameter since Cloudinary handles file organization differently
  return uploadToCloudinary(file);
};

// Trainer services
export const getTrainerByUserId = async (userId: string): Promise<Trainer | null> => {
  const q = query(trainersCollection, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const trainerDoc = querySnapshot.docs[0];
  return { id: trainerDoc.id, ...trainerDoc.data() } as Trainer;
};

export const createTrainer = async (userId: string, trainerData: Omit<Trainer, 'id' | 'userId' | 'verified' | 'featured' | 'createdAt' | 'updatedAt'>): Promise<Trainer> => {
  const newTrainer = {
    ...trainerData,
    userId,
    verified: false,
    featured: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(trainersCollection, newTrainer);
  return { id: docRef.id, ...newTrainer, createdAt: Timestamp.now(), updatedAt: Timestamp.now() } as Trainer;
};

export const updateTrainer = async (trainerId: string, trainerData: Partial<Omit<Trainer, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const trainerRef = doc(db, 'trainers', trainerId);
  await updateDoc(trainerRef, {
    ...trainerData,
    updatedAt: serverTimestamp()
  });
};

export const uploadTrainerProfileImage = async (trainerId: string, file: File): Promise<string> => {
  const path = `trainers/${trainerId}/profile-${new Date().getTime()}`;
  const imageUrl = await uploadFile(file, path);
  
  const trainerRef = doc(db, 'trainers', trainerId);
  await updateDoc(trainerRef, {
    profileImage: imageUrl,
    updatedAt: serverTimestamp()
  });
  
  return imageUrl;
};

// Community services
export const getCommunityById = async (communityId: string): Promise<Community | null> => {
  const communityRef = doc(db, 'communities', communityId);
  const communitySnap = await getDoc(communityRef);
  
  if (!communitySnap.exists()) {
    return null;
  }
  
  return { id: communitySnap.id, ...communitySnap.data() } as Community;
};

export const getCommunitiesByTrainerId = async (trainerId: string): Promise<Community[]> => {
  const q = query(communitiesCollection, where('trainerId', '==', trainerId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Community);
};

export const getFeaturedCommunities = async (limitCount: number = 10): Promise<Community[]> => {
  const q = query(
    communitiesCollection, 
    where('featured', '==', true),
    where('isPrivate', '==', false),
    orderBy('memberCount', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Community);
};

// Get all communities (not just featured ones)
export const getAllCommunities = async (limitCount: number = 20): Promise<Community[]> => {
  const q = query(
    communitiesCollection, 
    where('isPrivate', '==', false),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Community);
};

export const searchCommunities = async (searchTerm: string, categories: string[] = [], limitCount: number = 20): Promise<Community[]> => {
  // Basic implementation - in a real app, you might want to use Algolia or Firebase Extensions for better search
  let q = query(
    communitiesCollection,
    where('isPrivate', '==', false),
    orderBy('memberCount', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  
  // Client-side filtering (not ideal for production)
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }) as Community)
    .filter(community => {
      const matchesSearch = searchTerm ? 
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        community.description.toLowerCase().includes(searchTerm.toLowerCase()) : 
        true;
        
      const matchesCategories = categories.length > 0 ? 
        categories.some(cat => community.categories.includes(cat)) : 
        true;
        
      return matchesSearch && matchesCategories;
    });
};

export const createCommunity = async (trainerId: string, communityData: Omit<Community, 'id' | 'trainerId' | 'memberCount' | 'featured' | 'createdAt' | 'updatedAt'>): Promise<Community> => {
  const newCommunity = {
    ...communityData,
    trainerId,
    memberCount: 0,
    featured: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(communitiesCollection, newCommunity);
  return { id: docRef.id, ...newCommunity, createdAt: Timestamp.now(), updatedAt: Timestamp.now() } as Community;
};

export const updateCommunity = async (communityId: string, communityData: Partial<Omit<Community, 'id' | 'trainerId' | 'memberCount' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const communityRef = doc(db, 'communities', communityId);
  await updateDoc(communityRef, {
    ...communityData,
    updatedAt: serverTimestamp()
  });
};

export const uploadCommunityImage = async (communityId: string, imageType: 'logo' | 'cover', file: File): Promise<string> => {
  const path = `communities/${communityId}/${imageType}-${new Date().getTime()}`;
  const imageUrl = await uploadFile(file, path);
  
  const communityRef = doc(db, 'communities', communityId);
  await updateDoc(communityRef, {
    [imageType === 'logo' ? 'logoImage' : 'coverImage']: imageUrl,
    updatedAt: serverTimestamp()
  });
  
  return imageUrl;
};
