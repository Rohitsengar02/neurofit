'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { addComment, getComments } from '../../services/social';
import { auth } from '../../utils/firebase';
import type { Comment } from '../../types/social';

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [content, setContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const fetchedComments = await getComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setError('Please sign in to comment');
      return;
    }

    if (!content.trim()) {
      setError('Please enter a comment');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await addComment(postId, content.trim());
      setContent('');
      await loadComments(); // Reload comments to show the new one
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative w-8 h-8 rounded-full overflow-hidden">
          <Image
            src={auth.currentUser?.photoURL || '/default-avatar.png'}
            alt={auth.currentUser?.displayName || 'User'}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <p className="text-center text-gray-500">Loading comments...</p>
      ) : (
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-2 items-start"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={comment.userAvatar || '/default-avatar.png'}
                  alt={comment.username}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                    {comment.username}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">{comment.content}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(comment.createdAt.toDate()).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
}
