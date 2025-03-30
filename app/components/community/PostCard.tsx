'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { FiHeart, FiMessageSquare, FiBookmark, FiMoreVertical, FiEdit2, FiTrash2, FiX, FiExternalLink } from 'react-icons/fi';
import { HiHeart, HiBookmark } from 'react-icons/hi2';
import { Timestamp, doc, onSnapshot, collection, query, getCountFromServer, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { toast } from 'react-hot-toast';
import { CommentSection } from './CommentSection';

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

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => Promise<void>;
  onSave: (postId: string) => Promise<void>;
  onDelete?: (postId: string) => void;
  onUpdate?: (postId: string, content: string) => void;
  onComment?: (postId: string) => Promise<void>;
  onShare?: (postId: string) => Promise<void>;
}

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

export const PostCard = ({ post: initialPost, onLike, onSave, onDelete, onUpdate, onComment, onShare }: PostCardProps) => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(initialPost.content);
  const [post, setPost] = useState(initialPost);
  const [commentCount, setCommentCount] = useState(0);
  const controls = useAnimation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to real-time updates for post data
    const unsubscribe = onSnapshot(doc(db, 'posts', post.id), async (doc) => {
      if (!doc.exists()) {
        // Post was deleted
        onDelete?.(post.id);
        return;
      }
      
      const data = doc.data();
      
      // Get real-time comment count
      const commentsRef = collection(db, 'posts', post.id, 'comments');
      const snapshot = await getCountFromServer(commentsRef);
      const count = snapshot.data().count;
      
      setPost(prev => ({
        ...prev,
        content: data.content,
        updatedAt: data.updatedAt,
        likes: data.likes || 0,
        commentsCount: count,
      }));
      setCommentCount(count);
    });

    // Initial comment count fetch
    const fetchCommentCount = async () => {
      const commentsRef = collection(db, 'posts', post.id, 'comments');
      const snapshot = await getCountFromServer(commentsRef);
      const count = snapshot.data().count;
      setCommentCount(count);
    };
    fetchCommentCount();

    return () => unsubscribe();
  }, [post.id, onDelete]);

  const handleUserClick = () => {
    router.push(`/pages/community/profile/${post.userId}`);
  };

  const handleCommentClick = async () => {
    setShowComments(true);
    if (onComment) {
      await onComment(post.id);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 100;
    const velocity = 10;

    if (info.offset.y > swipeThreshold || info.velocity.y > velocity) {
      setShowComments(false);
    } else {
      controls.start({ y: "20vh" });
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowMenu(false);
    }
  };

  const handleEdit = async () => {
    if (!user || user.uid !== post.userId) return;
    if (!editedContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    try {
      await updateDoc(doc(db, 'posts', post.id), {
        content: editedContent.trim(),
        updatedAt: new Date(),
      });
      onUpdate?.(post.id, editedContent.trim());
      setIsEditing(false);
      setShowMenu(false);
      toast.success('Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const handleDelete = async () => {
    if (!user || user.uid !== post.userId) return;

    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteDoc(doc(db, 'posts', post.id));
        onDelete?.(post.id);
        toast.success('Post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
      }
    }
    setShowMenu(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href={`/pages/community/profile/${post.userId}`} className="flex items-center space-x-3 group">
            <div className="relative">
              <Image
                src={post.user.photoURL}
                alt={post.user.name}
                width={40}
                height={40}
                className="rounded-full object-cover ring-2 ring-blue-500/50"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                {post.user.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(post.createdAt.toDate(), 'MMM d, yyyy')}
                {post.updatedAt > post.createdAt && ' (edited)'}
              </p>
            </div>
          </Link>

          {/* Post Menu */}
          {user && user.uid === post.userId && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiMoreVertical className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                  >
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="flex items-center space-x-2 w-full p-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        <span>Edit Post</span>
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center space-x-2 w-full p-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span>Delete Post</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
              rows={4}
            />
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(post.content);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap mb-4">
            {formatContentWithLinks(post.content)}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onLike(post.id)}
              className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            >
              {post.isLiked ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <HiHeart className="w-5 h-5 text-red-500" />
                </motion.div>
              ) : (
                <FiHeart className="w-5 h-5" />
              )}
              <span>{post.likes}</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCommentClick}
              className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
            >
              <div className="relative inline-flex">
                <FiMessageSquare className="w-5 h-5" />
              </div>
              <span className="text-sm">
                {commentCount > 0 
                  ? `${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}` 
                  : 'Comment'}
              </span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onSave(post.id)}
              className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400"
            >
              {post.isSaved ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  <HiBookmark className="w-5 h-5 text-yellow-500" />
                </motion.div>
              ) : (
                <FiBookmark className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Comments */}
        <AnimatePresence>
          {showComments && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setShowComments(false)}
              />
              <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.4}
                dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
                onDragEnd={handleDragEnd}
                initial={{ y: "100vh" }}
                animate={{ y: "20vh" }}
                exit={{ y: "100vh" }}
                transition={{ 
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                  mass: 0.8
                }}
                className="fixed left-0 right-0 bottom-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-lg z-50"
                style={{
                  height: "80vh",
                  touchAction: "pan-y",
                  overflowY: "auto",
                  WebkitOverflowScrolling: "touch"
                }}
              >
                <div 
                  className="sticky top-0 bg-white dark:bg-gray-800 pb-4 border-b border-gray-200 dark:border-gray-700 px-4 z-10"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col items-center">
                    <motion.div 
                      className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full my-3 cursor-grab active:cursor-grabbing"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    />
                    <div className="w-full flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">Comments</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({commentCount})
                        </span>
                      </div>
                      <button
                        onClick={() => setShowComments(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4 pb-safe">
                  <CommentSection postId={post.id} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
