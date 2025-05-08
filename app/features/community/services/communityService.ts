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

// Upload a gallery image for a community
export const uploadGalleryImage = async (communityId: string, file: File): Promise<string> => {
  const path = `communities/${communityId}/gallery-${new Date().getTime()}`;
  const imageUrl = await uploadFile(file, path);
  
  // Note: we don't update the community document directly here
  // Instead, we collect all gallery image URLs and update them in a batch later
  return imageUrl;
};

// Get available workouts for adding to a community
export const getAvailableWorkouts = async () => {
  try {
    console.log('Fetching available workouts from Firestore');
    
    // First fetch all categories to get their IDs
    const categoriesCollection = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesCollection);
    
    console.log(`Found ${categoriesSnapshot.docs.length} workout categories`);
    
    // If no categories are found, return sample workouts
    if (categoriesSnapshot.docs.length === 0) {
      console.log('No categories found, fetching from workouts collection');
      
      // Try direct workouts collection as fallback
      const workoutsCollection = collection(db, 'workouts');
      const workoutsSnapshot = await getDocs(workoutsCollection);
      
      if (workoutsSnapshot.docs.length === 0) {
        console.log('No workouts found, using sample data');
        return getSampleWorkouts();
      }
      
      // Process workouts from main collection
      return processWorkoutDocs(workoutsSnapshot.docs);
    }
    
    // Array to hold all workouts from all categories
    let allWorkouts: any[] = [];
    
    // Fetch workouts from each category
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      const categoryData = categoryDoc.data();
      console.log(`Fetching workouts for category: ${categoryId} (${categoryData.name || 'Unnamed'})`);
      
      const workoutsRef = collection(db, `categories/${categoryId}/workouts`);
      const workoutsSnapshot = await getDocs(workoutsRef);
      
      console.log(`Found ${workoutsSnapshot.docs.length} workouts in category ${categoryId}`);
      
      // Process and add workouts from this category
      const categoryWorkouts = workoutsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`Processing workout image for ${doc.id}:`, data.imageUrl || data.image);
        
        // Get the image URL directly from the data - check both imageUrl and image fields
        const workoutImage = data.imageUrl || data.image || null;
        
        return {
          id: doc.id,
          categoryId,
          title: data.title || categoryData.name + ' Workout',
          description: data.description || 'A workout from ' + (categoryData.name || 'this category'),
          level: data.level || 'beginner',
          // Use the directly stored Cloudinary URL if available
          image: workoutImage || categoryData.image || getDefaultWorkoutImage(data.level || 'beginner'),
          imageUrl: workoutImage, // Store original image URL explicitly
          days: data.days || 7,
          caloriesPerDay: data.caloriesPerDay || 300,
          ...data
        };
      });
      
      allWorkouts = [...allWorkouts, ...categoryWorkouts];
    }
    
    console.log(`Total workouts found across all categories: ${allWorkouts.length}`);
    
    // If we still don't have any workouts, use sample data
    if (allWorkouts.length === 0) {
      console.log('No workouts found in any category, using sample data');
      return getSampleWorkouts();
    }
    
    return allWorkouts;
    
  } catch (error) {
    console.error('Error fetching available workouts:', error);
    return getSampleWorkouts();
  }
};

// Helper to process workout documents consistently
const processWorkoutDocs = (docs: any[]) => {
  return docs.map(doc => {
    const data = doc.data();
    console.log(`Processing workout: ${doc.id}, Title: ${data.title || 'No title'}`);
    
    return {
      id: doc.id,
      title: data.title || 'Untitled Workout',
      description: data.description || 'No description available',
      level: data.level || 'beginner',
      image: data.image || getDefaultWorkoutImage(data.level || 'beginner'),
      days: data.days || 7,
      caloriesPerDay: data.caloriesPerDay || 300,
      ...data
    };
  });
};

// Get default image based on workout level
const getDefaultWorkoutImage = (level: string) => {
  switch(level.toLowerCase()) {
    case 'beginner':
      return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';
    case 'intermediate':
      return 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';
    case 'advanced':
      return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';
    default:
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';
  }
};

// Return sample workouts as fallback
const getSampleWorkouts = () => {
  return [
    {
      id: 'sample-workout-1',
      title: 'Beginner Full Body Workout',
      description: 'A complete workout for beginners focusing on all major muscle groups.',
      level: 'beginner',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
      days: 7,
      caloriesPerDay: 250
    },
    {
      id: 'sample-workout-2',
      title: 'HIIT Fat Burning Challenge',
      description: 'High-intensity interval training to maximize calorie burn and improve cardiovascular health.',
      level: 'intermediate',
      image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
      days: 14,
      caloriesPerDay: 400
    },
    {
      id: 'sample-workout-3',
      title: 'Advanced Strength Training',
      description: 'Build muscle and increase strength with this advanced weightlifting program.',
      level: 'advanced',
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
      days: 21,
      caloriesPerDay: 500
    },
    {
      id: 'sample-workout-4',
      title: 'Yoga for Flexibility',
      description: 'Improve flexibility and reduce stress with daily yoga sessions.',
      level: 'beginner',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1520&q=80',
      days: 10,
      caloriesPerDay: 150
    },
    {
      id: 'sample-workout-5',
      title: 'Core Strength Challenge',
      description: 'Focus on building core strength with targeted ab workouts and planks.',
      level: 'intermediate',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
      days: 7,
      caloriesPerDay: 300
    }
  ];
};

// Add a workout to a community
export const addWorkoutToCommunity = async (communityId: string, workout: any) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    const communityDoc = await getDoc(communityRef);
    
    if (!communityDoc.exists()) {
      throw new Error('Community not found');
    }
    
    const communityData = communityDoc.data();
    const communityWorkouts = communityData.communityWorkouts || [];
    
    // Create a community workout object
    const communityWorkout = {
      id: `${workout.id}-${Date.now()}`,
      workoutId: workout.id,
      title: workout.title,
      description: workout.description,
      level: workout.level,
      image: workout.image || '/images/default-workout.jpg',
      days: workout.days || 7,
      caloriesPerDay: workout.caloriesPerDay || 300,
      addedAt: serverTimestamp()
    };
    
    // Add the workout to the community
    await updateDoc(communityRef, {
      communityWorkouts: [...communityWorkouts, communityWorkout],
      updatedAt: serverTimestamp()
    });
    
    return communityWorkout;
  } catch (error) {
    console.error('Error adding workout to community:', error);
    throw error;
  }
};

// Remove a workout from a community
export const removeWorkoutFromCommunity = async (communityId: string, workoutId: string) => {
  try {
    const communityRef = doc(db, 'communities', communityId);
    const communityDoc = await getDoc(communityRef);
    
    if (!communityDoc.exists()) {
      throw new Error('Community not found');
    }
    
    const communityData = communityDoc.data();
    const communityWorkouts = communityData.communityWorkouts || [];
    
    // Remove the workout from the community
    const updatedWorkouts = communityWorkouts.filter(
      (workout: any) => workout.id !== workoutId
    );
    
    await updateDoc(communityRef, {
      communityWorkouts: updatedWorkouts,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error removing workout from community:', error);
    throw error;
  }
};
