'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
  getDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { format } from 'date-fns';
import { FiSend, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: Timestamp;
  likes: number;
  user: {
    name: string;
    photoURL: string;
  };
}

interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const commentsQuery = query(
        collection(db, `posts/${postId}/comments`),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(commentsQuery);
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch user data for each comment
      const commentsWithUserData = await Promise.all(
        commentsData.map(async (comment: any) => {
          const userDocRef = doc(db, 'users', comment.userId);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data();

          return {
            ...comment,
            user: {
              name: userData?.displayName || 'Unknown User',
              photoURL: userData?.photoURL || '/default-avatar.png'
            }
          } as Comment;
        })
      );

      setComments(commentsWithUserData);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      const commentData = {
        userId: user.uid,
        content: newComment.trim(),
        createdAt: serverTimestamp(),
        likes: 0,
        user: {
          name: userData?.displayName || user.displayName || 'Unknown User',
          photoURL: userData?.photoURL || user.photoURL || '/default-avatar.png'
        }
      };

      const docRef = await addDoc(collection(db, `posts/${postId}/comments`), commentData);

      const newCommentObj: Comment = {
        id: docRef.id,
        ...commentData,
        createdAt: Timestamp.now(),
      } as Comment;

      setComments(prev => [newCommentObj, ...prev]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) {
      toast.error('Please sign in to delete comments');
      return;
    }

    try {
      setDeletingCommentId(commentId);
      const comment = comments.find(c => c.id === commentId);
      
      if (comment?.userId !== user.uid) {
        toast.error('You can only delete your own comments');
        return;
      }

      await deleteDoc(doc(db, `posts/${postId}/comments/${commentId}`));
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !newComment.trim()}
          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full disabled:opacity-50"
        >
          <FiSend className="w-5 h-5" />
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4 mt-6">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex space-x-3 group"
            >
              <div className="flex-shrink-0">
                <Image
                  src={comment.user.photoURL}
                  alt={comment.user.name}
                  width={50}
                  height={50}
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-3 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {comment.user.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {format(comment.createdAt.toDate(), 'PPp')}
                      </span>
                      {user && comment.userId === user.uid && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingCommentId === comment.id}
                          className="p-1 text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{comment.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
