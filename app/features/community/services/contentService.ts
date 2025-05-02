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
  Timestamp,
  increment,
  onSnapshot
} from 'firebase/firestore';
import { db, storage } from '../../../lib/firebase';
import { 
  LiveSession, 
  SessionParticipant, 
  WorkoutContent, 
  Challenge, 
  ChallengeParticipant 
} from '../utils/types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Helper function for file uploads
const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

// Session cache to reduce Firebase reads
const sessionCache: {
  [communityId: string]: {
    sessions: LiveSession[];
    timestamp: number;
  }
} = {};

// Cache timeout in milliseconds (5 minutes)
const CACHE_TIMEOUT = 5 * 60 * 1000;

// Live Sessions
export const createLiveSession = async (
  sessionData: Omit<LiveSession, 'id' | 'updatedAt'>
): Promise<LiveSession> => {
  try {
    const sessionsRef = collection(db, 'liveSessions');
    const newSessionData = {
      ...sessionData,
      participantCount: 0,
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(sessionsRef, newSessionData);
    return { id: docRef.id, ...newSessionData } as LiveSession;
  } catch (error) {
    console.error('Error creating live session:', error);
    throw error;
  }
};

// Delete a session
export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    // Delete the session document
    const sessionRef = doc(db, 'liveSessions', sessionId);
    await deleteDoc(sessionRef);
    
    // Delete all participants for this session
    const participantsQuery = query(
      collection(db, 'sessionParticipants'),
      where('sessionId', '==', sessionId)
    );
    
    const participantsSnapshot = await getDocs(participantsQuery);
    
    // Delete each participant document
    const deletePromises = participantsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

// Get all sessions for a community with caching
export const getSessionsByCommunityId = async (communityId: string, status: LiveSession['status'] | 'all' = 'all'): Promise<LiveSession[]> => {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    const cache = sessionCache[communityId];
    
    if (cache && (now - cache.timestamp < CACHE_TIMEOUT)) {
      console.log('Using cached sessions for community:', communityId);
      // Filter the cached sessions based on status
      if (status === 'all') {
        return cache.sessions;
      } else {
        return cache.sessions.filter(session => session.status === status);
      }
    }
    
    // No valid cache, fetch from Firebase
    console.log('Fetching sessions from Firebase for community:', communityId);
    let q;
    
    if (status === 'all') {
      q = query(
        collection(db, 'liveSessions'), 
        where('communityId', '==', communityId),
        orderBy('scheduledFor', 'desc')
      );
    } else {
      q = query(
        collection(db, 'liveSessions'), 
        where('communityId', '==', communityId),
        where('status', '==', status),
        orderBy('scheduledFor', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as LiveSession);
    
    // Update the cache
    sessionCache[communityId] = {
      sessions: status === 'all' ? sessions : [], // Only cache all sessions
      timestamp: now
    };
    
    return sessions;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    // Return cached data if available, even if expired
    if (sessionCache[communityId]) {
      if (status === 'all') {
        return sessionCache[communityId].sessions;
      } else {
        return sessionCache[communityId].sessions.filter(session => session.status === status);
      }
    }
    return [];
  }
};

// Get upcoming sessions with caching
export const getUpcomingSessions = async (communityId: string, limitCount: number = 5): Promise<LiveSession[]> => {
  try {
    // Try to use cached data first
    const now = Date.now();
    const cache = sessionCache[communityId];
    
    if (cache && (now - cache.timestamp < CACHE_TIMEOUT)) {
      console.log('Using cached sessions for upcoming sessions');
      const nowTimestamp = Timestamp.now();
      
      // Filter and process cached sessions
      const liveSessions = cache.sessions.filter(session => session.status === 'live');
      const scheduledSessions = cache.sessions.filter(
        session => session.status === 'scheduled' && 
        session.scheduledFor && 
        session.scheduledFor.seconds > nowTimestamp.seconds
      ).sort((a, b) => a.scheduledFor.seconds - b.scheduledFor.seconds).slice(0, limitCount);
      
      return [...liveSessions, ...scheduledSessions];
    }
    
    // No valid cache, fetch from Firebase with minimal queries
    console.log('Fetching upcoming sessions from Firebase');
    
    // Get all sessions for this community (will be cached)
    const allSessions = await getSessionsByCommunityId(communityId, 'all');
    const nowTimestamp = Timestamp.now();
    
    // Filter and process the sessions
    const liveSessions = allSessions.filter(session => session.status === 'live');
    const scheduledSessions = allSessions.filter(
      session => session.status === 'scheduled' && 
      session.scheduledFor && 
      session.scheduledFor.seconds > nowTimestamp.seconds
    ).sort((a, b) => a.scheduledFor.seconds - b.scheduledFor.seconds).slice(0, limitCount);
    
    return [...liveSessions, ...scheduledSessions];
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    return [];
  }
};

// Get a session by ID with caching
export const getSessionById = async (sessionId: string): Promise<LiveSession | null> => {
  try {
    // Check if the session is in any of our caches
    for (const communityId in sessionCache) {
      const cachedSession = sessionCache[communityId].sessions.find(s => s.id === sessionId);
      if (cachedSession) {
        console.log('Using cached session:', sessionId);
        return cachedSession;
      }
    }
    
    // Not in cache, fetch from Firebase
    console.log('Fetching session from Firebase:', sessionId);
    const sessionRef = doc(db, 'liveSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      return null;
    }
    
    const session = { id: sessionSnap.id, ...sessionSnap.data() } as LiveSession;
    
    // If we have a cache for this community, update it
    if (sessionCache[session.communityId]) {
      // Replace the session in the cache if it exists, otherwise add it
      const sessions = sessionCache[session.communityId].sessions;
      const index = sessions.findIndex(s => s.id === sessionId);
      
      if (index >= 0) {
        sessions[index] = session;
      } else {
        sessions.push(session);
      }
    }
    
    return session;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
};

// Update session status with cache invalidation
export const updateSessionStatus = async (sessionId: string, status: LiveSession['status']): Promise<void> => {
  try {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    await updateDoc(sessionRef, {
      status,
      updatedAt: serverTimestamp()
    });
    
    // Update the session in all caches
    for (const communityId in sessionCache) {
      const sessions = sessionCache[communityId].sessions;
      const index = sessions.findIndex(s => s.id === sessionId);
      
      if (index >= 0) {
        sessions[index] = { ...sessions[index], status };
      }
    }
  } catch (error) {
    console.error('Error updating session status:', error);
    throw error;
  }
};

// Update session with cache invalidation
export const updateSession = async (
  sessionId: string, 
  sessionData: Partial<Omit<LiveSession, 'id' | 'communityId' | 'trainerId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    await updateDoc(sessionRef, {
      ...sessionData,
      updatedAt: serverTimestamp()
    });
    
    // Update the session in all caches
    for (const communityId in sessionCache) {
      const sessions = sessionCache[communityId].sessions;
      const index = sessions.findIndex(s => s.id === sessionId);
      
      if (index >= 0) {
        sessions[index] = { ...sessions[index], ...sessionData };
      }
    }
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
};

// Clear the session cache for a community
export const clearSessionCache = (communityId?: string) => {
  if (communityId) {
    delete sessionCache[communityId];
  } else {
    // Clear all caches
    Object.keys(sessionCache).forEach(key => delete sessionCache[key]);
  }
};

// Listen for live session updates in real-time
// NOTE: These functions are no longer used to avoid Firebase quota issues
// Instead, we use polling with regular queries
export const listenToLiveSessions = (
  communityId: string,
  callback: (sessions: LiveSession[]) => void
): (() => void) => {
  console.warn('listenToLiveSessions is deprecated due to Firebase quota concerns. Use polling instead.');
  // Return a no-op function
  return () => {};
};

// Listen for scheduled sessions that are about to go live
// NOTE: These functions are no longer used to avoid Firebase quota issues
// Instead, we use polling with regular queries
export const listenToScheduledSessions = (
  communityId: string,
  callback: (sessions: LiveSession[]) => void
): (() => void) => {
  console.warn('listenToScheduledSessions is deprecated due to Firebase quota concerns. Use polling instead.');
  // Return a no-op function
  return () => {};
};

export const createSession = async (
  communityId: string, 
  trainerId: string, 
  sessionData: Omit<LiveSession, 'id' | 'communityId' | 'trainerId' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<LiveSession> => {
  const newSession = {
    ...sessionData,
    communityId,
    trainerId,
    status: 'scheduled',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, 'liveSessions'), newSession);
  
  // Clear the cache for this community
  clearSessionCache(communityId);
  
  return { 
    id: docRef.id, 
    ...newSession, 
    createdAt: Timestamp.now(), 
    updatedAt: Timestamp.now(),
    status: 'scheduled' as const
  } as LiveSession;
};

export const uploadSessionCoverImage = async (sessionId: string, file: File): Promise<string> => {
  const path = `sessions/${sessionId}/cover-${Date.now()}`;
  const imageUrl = await uploadFile(file, path);
  
  const sessionRef = doc(db, 'liveSessions', sessionId);
  await updateDoc(sessionRef, {
    coverImage: imageUrl,
    updatedAt: serverTimestamp()
  });
  
  // Get the session to find its community ID
  const sessionSnap = await getDoc(sessionRef);
  if (sessionSnap.exists()) {
    const session = sessionSnap.data() as LiveSession;
    clearSessionCache(session.communityId);
  }
  
  return imageUrl;
};

// Session participants
export const registerForSession = async (sessionId: string, userId: string): Promise<SessionParticipant> => {
  const newParticipant = {
    sessionId,
    userId,
    status: 'registered',
  };
  
  const docRef = await addDoc(collection(db, 'sessionParticipants'), newParticipant);
  return { id: docRef.id, ...newParticipant, status: 'registered' as const } as SessionParticipant;
};

export const markSessionAttendance = async (participantId: string): Promise<void> => {
  const participantRef = doc(db, 'sessionParticipants', participantId);
  await updateDoc(participantRef, {
    joinedAt: serverTimestamp(),
    status: 'attended'
  });
};

export const getSessionParticipants = async (sessionId: string): Promise<SessionParticipant[]> => {
  const q = query(
    collection(db, 'sessionParticipants'), 
    where('sessionId', '==', sessionId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as SessionParticipant);
};

export const getUserSessionRegistration = async (sessionId: string, userId: string): Promise<SessionParticipant | null> => {
  const q = query(
    collection(db, 'sessionParticipants'), 
    where('sessionId', '==', sessionId),
    where('userId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as SessionParticipant;
};

// Workout content services
export const getWorkoutsByCommunityId = async (communityId: string): Promise<WorkoutContent[]> => {
  const q = query(
    collection(db, 'workoutContent'), 
    where('communityId', '==', communityId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as WorkoutContent);
};

// ... rest of the functions ...
