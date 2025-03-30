'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  where,
  increment,
  setDoc,
  DocumentData,
  QueryDocumentSnapshot,
  Query,
  QueryConstraint,
  Timestamp,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { FiEdit3, FiTrendingUp, FiClock, FiUsers, FiImage, FiVideo, FiSmile, FiExternalLink } from 'react-icons/fi';
import { PostCard } from '@/app/components/community/PostCard';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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

const POSTS_PER_PAGE = 10;

export default function CommunityPage() {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<{ photoURL: string; displayName: string } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to view posts');
      return;
    }

    // Fetch user profile
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setUserProfile({
          photoURL: doc.data()?.photoURL || '/default-avatar.png',
          displayName: doc.data()?.displayName || 'Anonymous User'
        });
      }
    });

    loadPosts();
    return () => unsubscribe();
  }, [user]);

  const loadPosts = async (loadMore = false) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      let postsQuery = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      if (loadMore && lastVisible) {
        postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(10)
        );
      }

      const snapshot = await getDocs(postsQuery);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 10);

      const postsData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          const userData = userDoc.data() as { displayName?: string; photoURL?: string } || {};

          const likeDoc = await getDoc(doc(db, `posts/${docSnapshot.id}/likes/${user.uid}`));
          const saveDoc = await getDoc(doc(db, `users/${user.uid}/savedPosts/${docSnapshot.id}`));

          return {
            id: docSnapshot.id,
            userId: data.userId,
            content: data.content,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt || data.createdAt,
            likes: data.likes || 0,
            commentsCount: data.commentsCount || 0,
            user: {
              name: userData.displayName || 'Unknown User',
              photoURL: userData.photoURL || '/default-avatar.png',
            },
            isLiked: likeDoc.exists(),
            isSaved: saveDoc.exists(),
          } as Post;
        })
      );

      setPosts(prev => loadMore ? [...prev, ...postsData] : postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      toast.error('Please sign in to create a post');
      return;
    }
    if (!content.trim()) return;

    setIsPosting(true);
    try {
      const post = {
        userId: user.uid,
        content: content.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: 0,
        commentsCount: 0,
      };

      await addDoc(collection(db, 'posts'), post);
      setContent('');
      setIsExpanded(false);
      toast.success('Post created successfully!');
      loadPosts(); // Refresh posts
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleCreatePost();
    }
  };

  // Function to detect and format links in text
  const formatContentWithLinks = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 inline-flex items-center space-x-1 group"
          >
            <span className="underline">{part}</span>
            <FiExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const postRef = doc(db, 'posts', postId);
      const likeRef = doc(db, `posts/${postId}/likes/${user.uid}`);
      const likeDoc = await getDoc(likeRef);

      if (likeDoc.exists()) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, {
          likes: increment(-1),
        });
      } else {
        await setDoc(likeRef, {
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
        await updateDoc(postRef, {
          likes: increment(1),
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleSave = async (postId: string) => {
    if (!user) return;

    try {
      const saveRef = doc(db, `users/${user.uid}/savedPosts/${postId}`);
      const saveDoc = await getDoc(saveRef);

      if (saveDoc.exists()) {
        await deleteDoc(saveRef);
        toast.success('Post removed from saved');
      } else {
        await setDoc(saveRef, {
          savedAt: serverTimestamp(),
        });
        toast.success('Post saved successfully');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    }
  };

  const handleShare = async (postId: string) => {
    try {
      await navigator.share({
        url: `${window.location.origin}/community/post/${postId}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleUpdatePost = (postId: string, newContent: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { 
            ...p, 
            content: newContent, 
            updatedAt: Timestamp.fromDate(new Date()) 
          }
        : p
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Community</h1>
          
          {/* Create Post Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-4 mb-6 border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex space-x-4">
              <div className="relative flex-shrink-0">
                <button 
                  onClick={() => user && router.push(`/pages/community/profile/${user.uid}`)}
                  className="transform transition-transform hover:scale-105 focus:outline-none"
                >
                  <Image
                    src={userProfile?.photoURL || '/default-avatar.png'}
                    alt={userProfile?.displayName || 'User'}
                    width={80}
                    height={100}
                    className="rounded-full object-cover ring-2 ring-blue-500/50"
                  />
                </button>
              </div>
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (!isExpanded && e.target.value) {
                      setIsExpanded(true);
                    }
                  }}
                  onFocus={() => setIsExpanded(true)}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder="What's on your mind?"
                  rows={isExpanded ? 4 : 1}
                  className="w-full bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
                />
                
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 flex flex-col space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      
                      <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            setContent('');
                            setIsExpanded(false);
                          }}
                          className="flex-1 sm:flex-none px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreatePost}
                          disabled={!content.trim() || isPosting}
                          className={`flex-1 sm:flex-none px-6 py-2 rounded-xl font-medium transition-colors ${
                            !content.trim() || isPosting
                              ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          {isPosting ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Preview */}
                    {content && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/50 dark:bg-gray-700/50 rounded-xl p-4"
                      >
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Preview
                        </h3>
                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                          {formatContentWithLinks(content)}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <PostCard
                  post={post}
                  onLike={handleLike}
                  onSave={handleSave}
                  onDelete={handleDeletePost}
                  onUpdate={handleUpdatePost}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {!isLoading && hasMore && (
            <div className="flex justify-center">
              <button
                onClick={() => loadPosts(true)}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
