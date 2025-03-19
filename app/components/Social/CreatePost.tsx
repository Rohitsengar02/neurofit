'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { FiImage, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { createPost } from '../../services/social';
import { auth } from '../../utils/firebase';
import { uploadToCloudinary } from '../../services/cloudinary';
import type { Post, MediaType } from '../../types/social';
import { Timestamp } from 'firebase/firestore';

interface CreatePostProps {
  onPostCreated?: (newPost: Post) => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Preview the selected images
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setMediaPreview(prev => [...prev, ...newPreviews]);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreview(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Clean up the old preview URL
      URL.revokeObjectURL(prev[index]);
      return newPreviews;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setError('Please sign in to create a post');
      return;
    }

    if (!content.trim() && mediaFiles.length === 0) {
      setError('Please add some content or media to your post');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload media files to Cloudinary if present
      const mediaUrls = await Promise.all(
        mediaFiles.map(file => uploadToCloudinary(file))
      );

      const mediaType: MediaType = mediaFiles.length > 0 ? 'image' : null;

      const postData = {
        content: content.trim(),
        mediaFiles,
        mediaType,
        pollOptions: [],
        visibility: 'public' as const,
        tags: [],
        mediaUrls
      };

      const postId = await createPost(postData);
      setContent('');
      setMediaFiles([]);
      setMediaPreview(prev => {
        prev.forEach(URL.revokeObjectURL);
        return [];
      });

      if (onPostCreated) {
        const now = Timestamp.now();
        onPostCreated({
          id: postId,
          content: postData.content,
          mediaUrls: postData.mediaUrls,
          mediaType,
          pollOptions: postData.pollOptions,
          visibility: postData.visibility,
          tags: postData.tags,
          userId: auth.currentUser.uid,
          username: auth.currentUser.displayName || 'Anonymous',
          userAvatar: auth.currentUser.photoURL || '/default-avatar.png',
          likes: 0,
          commentsCount: 0,
          shares: 0,
          createdAt: now,
          updatedAt: now
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={auth.currentUser?.photoURL || '/default-avatar.png'}
              alt={auth.currentUser?.displayName || 'User'}
              fill
              className="object-cover"
            />
          </div>
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {auth.currentUser?.displayName || 'Anonymous'}
          </span>
        </div>

        {/* Post Content */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          rows={3}
          disabled={loading}
        />

        {/* Media Preview */}
        <AnimatePresence>
          {mediaPreview.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 gap-2"
            >
              {mediaPreview.map((preview, index) => (
                <div key={preview} className="relative aspect-video">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FiImage size={20} />
            <span>Add Photo</span>
          </button>

          <button
            type="submit"
            disabled={loading || (!content.trim() && mediaFiles.length === 0)}
            className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleMediaSelect}
          className="hidden"
        />
      </form>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
