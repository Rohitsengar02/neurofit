import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { doc, getDoc, collection, query, where, getDocs, Timestamp, increment, serverTimestamp, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PostCard } from './PostCard';
import { FiGrid, FiBookmark } from 'react-icons/fi';

interface UserData {
  displayName: string;
  photoURL: string;
  bio?: string;
}

interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  likes: number;
  commentsCount: number;
  user: {
    name: string;
    photoURL: string;
  };
  isLiked: boolean;
  isSaved: boolean;
}

interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const [currentUser] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.exists() ? userDoc.data() as UserData : null;
        setUserData(userData);

        if (!userData) return;

        // Fetch user's posts
        const postsQuery = query(collection(db, 'posts'), where('userId', '==', userId));
        const postsSnap = await getDocs(postsQuery);
        const postsData = postsSnap.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          updatedAt: doc.data().updatedAt || doc.data().createdAt,
          commentsCount: doc.data().commentsCount || 0,
          isLiked: false,
          isSaved: false,
          user: {
            name: userData.displayName,
            photoURL: userData.photoURL
          }
        })) as Post[];
        setPosts(postsData);

        // Fetch saved posts
        if (currentUser) {
          const savedPostsQuery = query(collection(db, `users/${userId}/savedPosts`));
          const savedPostsSnap = await getDocs(savedPostsQuery);
          const savedPostsIds = savedPostsSnap.docs.map(doc => doc.id);
          
          const savedPostsData = await Promise.all(
            savedPostsIds.map(async (postId) => {
              const postDoc = await getDoc(doc(db, 'posts', postId));
              if (postDoc.exists()) {
                const data = postDoc.data();
                // Get the post author's data
                const authorDoc = await getDoc(doc(db, 'users', data.userId));
                const authorData = authorDoc.exists() ? authorDoc.data() as UserData : null;
                
                return {
                  ...data,
                  id: postDoc.id,
                  updatedAt: data.updatedAt || data.createdAt,
                  commentsCount: data.commentsCount || 0,
                  isLiked: false,
                  isSaved: true,
                  user: {
                    name: authorData?.displayName || 'Unknown User',
                    photoURL: authorData?.photoURL || '/default-avatar.png'
                  }
                } as Post;
              }
              return null;
            })
          );
          
          setSavedPosts(savedPostsData.filter(Boolean) as Post[]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, currentUser]);

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    
    try {
      const postRef = doc(db, 'posts', postId);
      const likeRef = doc(db, `posts/${postId}/likes/${currentUser.uid}`);
      const likeDoc = await getDoc(likeRef);

      if (likeDoc.exists()) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likes: increment(-1) });
        const updatePosts = (prev: Post[]) => 
          prev.map(p => p.id === postId ? { ...p, isLiked: false, likes: p.likes - 1 } : p);
        setPosts(updatePosts);
        setSavedPosts(updatePosts);
      } else {
        await setDoc(likeRef, { userId: currentUser.uid, createdAt: serverTimestamp() });
        await updateDoc(postRef, { likes: increment(1) });
        const updatePosts = (prev: Post[]) => 
          prev.map(p => p.id === postId ? { ...p, isLiked: true, likes: p.likes + 1 } : p);
        setPosts(updatePosts);
        setSavedPosts(updatePosts);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSave = async (postId: string) => {
    if (!currentUser) return;
    
    try {
      const savedRef = doc(db, `users/${currentUser.uid}/savedPosts/${postId}`);
      const savedDoc = await getDoc(savedRef);

      if (savedDoc.exists()) {
        await deleteDoc(savedRef);
        const updatePosts = (prev: Post[]) => 
          prev.map(p => p.id === postId ? { ...p, isSaved: false } : p);
        setPosts(updatePosts);
        setSavedPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          await setDoc(savedRef, { 
            savedAt: serverTimestamp(),
            postData: postDoc.data()
          });
          const updatePosts = (prev: Post[]) => 
            prev.map(p => p.id === postId ? { ...p, isSaved: true } : p);
          setPosts(updatePosts);
          if (activeTab === 'saved') {
            setSavedPosts(prev => [...prev, { ...postDoc.data(), id: postId, isSaved: true } as Post]);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl p-8 mb-8 border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20"></div>
          <div className="relative flex flex-col items-center space-y-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <Image
                src={userData?.photoURL || '/default-avatar.png'}
                alt={userData?.displayName || 'User'}
                width={120}
                height={120}
                className="rounded-full object-cover ring-4 ring-white dark:ring-gray-700 shadow-lg"
              />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {userData?.displayName || 'Anonymous User'}
              </h1>
              {userData?.bio && (
                <p className="text-gray-600 dark:text-gray-300">{userData.bio}</p>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-xl p-1 flex space-x-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'posts'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FiGrid />
              <span>Posts</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'saved'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FiBookmark />
              <span>Saved</span>
            </button>
          </motion.div>
        </div>

        {/* Posts Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {activeTab === 'posts' ? (
              posts.length > 0 ? (
                posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <PostCard 
                      post={post}
                      onLike={handleLike}
                      onSave={handleSave}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-500 dark:text-gray-400"
                >
                  No posts yet
                </motion.p>
              )
            ) : savedPosts.length > 0 ? (
              savedPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <PostCard 
                    post={post}
                    onLike={handleLike}
                    onSave={handleSave}
                  />
                </motion.div>
              ))
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-500 dark:text-gray-400"
              >
                No saved posts
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
