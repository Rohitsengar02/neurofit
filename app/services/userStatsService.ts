import { db } from '../firebase/config';
import { collection, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { Comment } from './dietService';

export interface UserStats {
  userId: string;
  userName: string;
  userImage: string;
  likedMeals: string[];
  savedMeals: string[];
  comments: {
    mealId: string;
    commentId: string;
    content: string;
    createdAt: Date;
  }[];
  sharedMeals: {
    mealId: string;
    sharedAt: Date;
    platform: string;
  }[];
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  createdAt: Date;
  updatedAt: Date;
}

// Initialize user stats when user first interacts
export const initializeUserStats = async (userId: string, userName: string, userImage: string) => {
  const userStatsRef = doc(db, 'userStats', userId);
  const userStats = await getDoc(userStatsRef);

  if (!userStats.exists()) {
    const newUserStats: UserStats = {
      userId,
      userName,
      userImage,
      likedMeals: [],
      savedMeals: [],
      comments: [],
      sharedMeals: [],
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(userStatsRef, newUserStats);
    return newUserStats;
  }

  return userStats.data() as UserStats;
};

// Like/Unlike a meal
export const toggleLikeMeal = async (userId: string, mealId: string): Promise<boolean> => {
  const userStatsRef = doc(db, 'userStats', userId);
  const userStats = await getDoc(userStatsRef);

  // Initialize user stats if they don't exist
  if (!userStats.exists()) {
    const user = (await getDoc(doc(db, 'users', userId))).data();
    await initializeUserStats(userId, user?.name || 'User', user?.photoURL || '');
    return toggleLikeMeal(userId, mealId); // Retry after initialization
  }

  const data = userStats.data() as UserStats;
  const isLiked = data.likedMeals.includes(mealId);

  await updateDoc(userStatsRef, {
    likedMeals: isLiked ? arrayRemove(mealId) : arrayUnion(mealId),
    totalLikes: data.totalLikes + (isLiked ? -1 : 1),
    updatedAt: new Date()
  });

  // Update meal's like count
  const mealRef = doc(db, 'meals', mealId);
  await updateDoc(mealRef, {
    likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
  });

  return !isLiked;
};

// Save/Unsave a meal
export const toggleSaveMeal = async (userId: string, mealId: string): Promise<boolean> => {
  const userStatsRef = doc(db, 'userStats', userId);
  const userStats = await getDoc(userStatsRef);

  // Initialize user stats if they don't exist
  if (!userStats.exists()) {
    const user = (await getDoc(doc(db, 'users', userId))).data();
    await initializeUserStats(userId, user?.name || 'User', user?.photoURL || '');
    return toggleSaveMeal(userId, mealId); // Retry after initialization
  }

  const data = userStats.data() as UserStats;
  const isSaved = data.savedMeals.includes(mealId);

  await updateDoc(userStatsRef, {
    savedMeals: isSaved ? arrayRemove(mealId) : arrayUnion(mealId),
    updatedAt: new Date()
  });

  return !isSaved;
};

// Add a comment to a meal
export const addComment = async (userId: string, mealId: string, content: string): Promise<Comment> => {
  const userStatsRef = doc(db, 'userStats', userId);
  const userStats = await getDoc(userStatsRef);

  // Initialize user stats if they don't exist
  if (!userStats.exists()) {
    const user = (await getDoc(doc(db, 'users', userId))).data();
    await initializeUserStats(userId, user?.name || 'User', user?.photoURL || '');
    return addComment(userId, mealId, content); // Retry after initialization
  }

  const commentId = Math.random().toString(36).substr(2, 9);
  const comment: Comment = {
    id: commentId,
    userId,
    userName: userStats.data().userName,
    userImage: userStats.data().userImage,
    content,
    createdAt: new Date(),
    likes: 0
  };

  // Add comment to meal
  const mealRef = doc(db, 'meals', mealId);
  await updateDoc(mealRef, {
    comments: arrayUnion(comment)
  });

  // Update user stats
  await updateDoc(userStatsRef, {
    comments: arrayUnion({
      mealId,
      commentId,
      content,
      createdAt: new Date()
    }),
    totalComments: userStats.data().totalComments + 1,
    updatedAt: new Date()
  });

  return comment;
};

// Record a share
export const recordShare = async (userId: string, mealId: string, platform: string): Promise<void> => {
  const userStatsRef = doc(db, 'userStats', userId);
  const userStats = await getDoc(userStatsRef);

  // Initialize user stats if they don't exist
  if (!userStats.exists()) {
    const user = (await getDoc(doc(db, 'users', userId))).data();
    await initializeUserStats(userId, user?.name || 'User', user?.photoURL || '');
    return recordShare(userId, mealId, platform); // Retry after initialization
  }

  await updateDoc(userStatsRef, {
    sharedMeals: arrayUnion({
      mealId,
      sharedAt: new Date(),
      platform
    }),
    totalShares: userStats.data().totalShares + 1,
    updatedAt: new Date()
  });

  // Update meal's share count
  const mealRef = doc(db, 'meals', mealId);
  await updateDoc(mealRef, {
    shares: (await getDoc(mealRef)).data()?.shares + 1 || 1
  });
};

// Get user stats
export const getUserStats = async (userId: string) => {
  const userStatsRef = doc(db, 'userStats', userId);
  const userStats = await getDoc(userStatsRef);

  if (!userStats.exists()) {
    return null;
  }

  return userStats.data() as UserStats;
};

// Get user's liked meals
export const getUserLikedMeals = async (userId: string) => {
  const userStats = await getUserStats(userId);
  if (!userStats) return [];

  const mealsRef = collection(db, 'meals');
  const q = query(mealsRef, where('id', 'in', userStats.likedMeals));
  const meals = await getDocs(q);

  return meals.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get user's saved meals
export const getUserSavedMeals = async (userId: string) => {
  const userStats = await getUserStats(userId);
  if (!userStats) return [];

  const mealsRef = collection(db, 'meals');
  const q = query(mealsRef, where('id', 'in', userStats.savedMeals));
  const meals = await getDocs(q);

  return meals.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
