'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiHeart, FiMessageSquare, FiShare2, FiMoreVertical, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../../utils/firebase';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { Post } from '../../types/social';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (updatedPost: Post) => void;
}

export default function PostCard({ post, onPostDeleted, onPostUpdated }: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [showComments, setShowComments] = useState(false);
  const [userPhotoURL, setUserPhotoURL] = useState<string>('/default-avatar.png');
  const [userName, setUserName] = useState<string>('Anonymous');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [loading, setLoading] = useState(false);

  const isOwner = auth.currentUser?.uid === post.userId;

  useEffect(() => {
    const fetchUserData = async () => {
      if (post.userId) {
        const userRef = doc(db, 'users', post.userId);
        try {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserPhotoURL(userData.photoURL || '/default-avatar.png');
            setUserName(userData.displayName || 'Anonymous');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [post.userId]);

  const handleLike = async () => {
    if (!auth.currentUser) return;
    
    try {
      const newLikeCount = isLiked ? likeCount - 1 : likeCount + 1;
      const postRef = doc(db, 'posts', post.id!);
      await updateDoc(postRef, { likes: newLikeCount });
      setLikeCount(newLikeCount);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error updating like count:', error);
    }
  };

  const handleDelete = async () => {
    if (!isOwner || !post.id) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'posts', post.id));
      onPostDeleted?.(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!isOwner || !post.id) return;

    try {
      setLoading(true);
      const postRef = doc(db, 'posts', post.id);
      const updatedPost = { ...post, content: editedContent };
      await updateDoc(postRef, { content: editedContent });
      onPostUpdated?.(updatedPost);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={userPhotoURL}
              alt={userName}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{userName}</h3>
            <p className="text-sm text-gray-500">{new Date(post.createdAt.seconds * 1000).toLocaleString()}</p>
          </div>
        </div>

        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <FiMoreVertical className="text-gray-500" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10"
                >
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    disabled={loading}
                  >
                    <FiEdit2 />
                    <span>Edit Post</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    disabled={loading}
                  >
                    <FiTrash2 />
                    <span>Delete Post</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Post Content */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 dark:text-gray-200 mb-4">{post.content}</p>
      )}

      {/* Post Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {post.mediaUrls.map((url, index) => (
            <div key={url} className="relative aspect-video">
              <Image
                src={url}
                alt={`Post media ${index + 1}`}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 ${
            isLiked ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
          } hover:text-primary`}
        >
          <FiHeart className={isLiked ? 'fill-current' : ''} />
          <span>{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <FiMessageSquare />
          <span>{post.commentsCount}</span>
        </button>

        <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
          <FiShare2 />
          <span>{post.shares}</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <CommentSection postId={post.id!} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
