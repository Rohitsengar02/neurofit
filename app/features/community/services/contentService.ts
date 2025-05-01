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
  increment
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

// Live session services
export const getSessionsByCommunityId = async (communityId: string, status: LiveSession['status'] | 'all' = 'all'): Promise<LiveSession[]> => {
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
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as LiveSession);
};

export const getUpcomingSessions = async (communityId: string, limitCount: number = 5): Promise<LiveSession[]> => {
  const now = Timestamp.now();
  
  const q = query(
    collection(db, 'liveSessions'), 
    where('communityId', '==', communityId),
    where('scheduledFor', '>', now),
    where('status', '==', 'scheduled'),
    orderBy('scheduledFor', 'asc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as LiveSession);
};

export const getSessionById = async (sessionId: string): Promise<LiveSession | null> => {
  const sessionRef = doc(db, 'liveSessions', sessionId);
  const sessionSnap = await getDoc(sessionRef);
  
  if (!sessionSnap.exists()) {
    return null;
  }
  
  return { id: sessionSnap.id, ...sessionSnap.data() } as LiveSession;
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
  return { 
    id: docRef.id, 
    ...newSession, 
    createdAt: Timestamp.now(), 
    updatedAt: Timestamp.now(),
    status: 'scheduled' as const
  } as LiveSession;
};

export const updateSessionStatus = async (sessionId: string, status: LiveSession['status']): Promise<void> => {
  const sessionRef = doc(db, 'liveSessions', sessionId);
  await updateDoc(sessionRef, {
    status,
    updatedAt: serverTimestamp()
  });
};

export const updateSession = async (
  sessionId: string, 
  sessionData: Partial<Omit<LiveSession, 'id' | 'communityId' | 'trainerId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const sessionRef = doc(db, 'liveSessions', sessionId);
  await updateDoc(sessionRef, {
    ...sessionData,
    updatedAt: serverTimestamp()
  });
};

export const uploadSessionCoverImage = async (sessionId: string, file: File): Promise<string> => {
  const path = `sessions/${sessionId}/cover-${Date.now()}`;
  const imageUrl = await uploadFile(file, path);
  
  const sessionRef = doc(db, 'liveSessions', sessionId);
  await updateDoc(sessionRef, {
    coverImage: imageUrl,
    updatedAt: serverTimestamp()
  });
  
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

export const getWorkoutById = async (workoutId: string): Promise<WorkoutContent | null> => {
  const workoutRef = doc(db, 'workoutContent', workoutId);
  const workoutSnap = await getDoc(workoutRef);
  
  if (!workoutSnap.exists()) {
    return null;
  }
  
  return { id: workoutSnap.id, ...workoutSnap.data() } as WorkoutContent;
};

export const createWorkout = async (
  communityId: string, 
  trainerId: string, 
  workoutData: Omit<WorkoutContent, 'id' | 'communityId' | 'trainerId' | 'createdAt' | 'updatedAt'>
): Promise<WorkoutContent> => {
  const newWorkout = {
    ...workoutData,
    communityId,
    trainerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, 'workoutContent'), newWorkout);
  return { 
    id: docRef.id, 
    ...newWorkout, 
    createdAt: Timestamp.now(), 
    updatedAt: Timestamp.now() 
  } as WorkoutContent;
};

export const updateWorkout = async (
  workoutId: string, 
  workoutData: Partial<Omit<WorkoutContent, 'id' | 'communityId' | 'trainerId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const workoutRef = doc(db, 'workoutContent', workoutId);
  await updateDoc(workoutRef, {
    ...workoutData,
    updatedAt: serverTimestamp()
  });
};

export const uploadWorkoutMedia = async (
  workoutId: string, 
  file: File, 
  type: 'cover' | 'video'
): Promise<string> => {
  const path = `workouts/${workoutId}/${type}-${Date.now()}`;
  const url = await uploadFile(file, path);
  
  const workoutRef = doc(db, 'workoutContent', workoutId);
  await updateDoc(workoutRef, {
    [type === 'cover' ? 'coverImage' : 'videoUrl']: url,
    updatedAt: serverTimestamp()
  });
  
  return url;
};

// Challenge services
export const getChallengesByCommunityId = async (communityId: string, status: Challenge['status'] | 'all' = 'all'): Promise<Challenge[]> => {
  let q;
  
  if (status === 'all') {
    q = query(
      collection(db, 'challenges'), 
      where('communityId', '==', communityId),
      orderBy('startDate', 'desc')
    );
  } else {
    q = query(
      collection(db, 'challenges'), 
      where('communityId', '==', communityId),
      where('status', '==', status),
      orderBy('startDate', 'desc')
    );
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Challenge);
};

export const getChallengeById = async (challengeId: string): Promise<Challenge | null> => {
  const challengeRef = doc(db, 'challenges', challengeId);
  const challengeSnap = await getDoc(challengeRef);
  
  if (!challengeSnap.exists()) {
    return null;
  }
  
  return { id: challengeSnap.id, ...challengeSnap.data() } as Challenge;
};

export const createChallenge = async (
  communityId: string, 
  challengeData: Omit<Challenge, 'id' | 'communityId' | 'participantCount' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<Challenge> => {
  const newChallenge = {
    ...challengeData,
    communityId,
    participantCount: 0,
    status: 'upcoming',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, 'challenges'), newChallenge);
  return { 
    id: docRef.id, 
    ...newChallenge, 
    createdAt: Timestamp.now(), 
    updatedAt: Timestamp.now(),
    status: 'upcoming' as const
  } as Challenge;
};

export const updateChallenge = async (
  challengeId: string, 
  challengeData: Partial<Omit<Challenge, 'id' | 'communityId' | 'participantCount' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const challengeRef = doc(db, 'challenges', challengeId);
  await updateDoc(challengeRef, {
    ...challengeData,
    updatedAt: serverTimestamp()
  });
};

export const uploadChallengeCoverImage = async (challengeId: string, file: File): Promise<string> => {
  const path = `challenges/${challengeId}/cover-${Date.now()}`;
  const imageUrl = await uploadFile(file, path);
  
  const challengeRef = doc(db, 'challenges', challengeId);
  await updateDoc(challengeRef, {
    coverImage: imageUrl,
    updatedAt: serverTimestamp()
  });
  
  return imageUrl;
};

// Challenge participants
export const joinChallenge = async (challengeId: string, userId: string): Promise<ChallengeParticipant> => {
  const newParticipant = {
    challengeId,
    userId,
    progress: 0,
    completed: false,
    joinedAt: serverTimestamp()
  };
  
  // Update challenge participant count
  const challengeRef = doc(db, 'challenges', challengeId);
  await updateDoc(challengeRef, {
    participantCount: increment(1),
    updatedAt: serverTimestamp()
  });
  
  const docRef = await addDoc(collection(db, 'challengeParticipants'), newParticipant);
  return { 
    id: docRef.id, 
    ...newParticipant, 
    joinedAt: Timestamp.now(),
    progress: 0,
    completed: false
  } as ChallengeParticipant;
};

export const updateChallengeProgress = async (
  participantId: string, 
  progress: number, 
  completed: boolean = false
): Promise<void> => {
  const participantRef = doc(db, 'challengeParticipants', participantId);
  
  const updateData: any = {
    progress,
    completed
  };
  
  if (completed) {
    updateData.completedAt = serverTimestamp();
  }
  
  await updateDoc(participantRef, updateData);
};

export const getChallengeParticipants = async (challengeId: string): Promise<ChallengeParticipant[]> => {
  const q = query(
    collection(db, 'challengeParticipants'), 
    where('challengeId', '==', challengeId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ChallengeParticipant);
};

export const getUserChallengeParticipation = async (challengeId: string, userId: string): Promise<ChallengeParticipant | null> => {
  const q = query(
    collection(db, 'challengeParticipants'), 
    where('challengeId', '==', challengeId),
    where('userId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as ChallengeParticipant;
};
