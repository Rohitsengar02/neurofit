'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/app/firebase/config';
import { collection, query, where, orderBy, getDocs, addDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { FaStar } from 'react-icons/fa';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: any;
  userName: string;
  userImage: string;
}

interface ReviewSectionProps {
  productId: string;
  onRatingUpdate?: (avgRating: number, totalReviews: number) => void;
}

export default function ReviewSection({ productId, onRatingUpdate }: ReviewSectionProps) {
  const [user] = useAuthState(auth);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / reviews.length;
      onRatingUpdate?.(avgRating, reviews.length);
    } else {
      onRatingUpdate?.(0, 0);
    }
  }, [reviews, onRatingUpdate]);

  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(db, 'reviews');
      const q = query(
        reviewsRef,
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const reviewsData = await Promise.all(
        querySnapshot.docs.map(async (reviewDoc) => {
          const review = reviewDoc.data();
          // Get user details from users collection
          const userRef = doc(db, 'users', review.userId);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.data();
          
          return {
            id: reviewDoc.id,
            ...review,
            userName: userData?.displayName || 'Anonymous',
            userImage: userData?.photoURL || '/default-avatar.png',
          } as Review;
        })
      );
      
      setReviews(reviewsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to submit a review');
      return;
    }
    if (newRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      const reviewData = {
        userId: user.uid,
        productId,
        rating: newRating,
        comment,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'reviews'), reviewData);
      toast.success('Review submitted successfully');
      setNewRating(0);
      setComment('');
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 4);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        Customer Reviews
      </h2>

      {/* Review Form */}
      {user && (
        <form onSubmit={handleSubmitReview} className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Write a Review
          </h3>
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setNewRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl focus:outline-none"
              >
                <FaStar
                  className={`${
                    star <= (hoverRating || newRating)
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </motion.button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this product..."
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            rows={4}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
          >
            Submit Review
          </motion.button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {displayedReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={review.userImage}
                      alt={review.userName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {review.userName}
                    </h4>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
              </motion.div>
            ))}
          </div>

          {/* View All Reviews Button */}
          {reviews.length > 4 && (
            <div className="text-center mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
              >
                {showAllReviews ? 'Show Less' : 'View All Reviews'}
              </motion.button>
            </div>
          )}
        </>
      )}

      {/* Reviews Modal */}
      <AnimatePresence>
        {showAllReviews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAllReviews(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  All Reviews
                </h3>
                <button
                  onClick={() => setShowAllReviews(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={review.userImage}
                          alt={review.userName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {review.userName}
                        </h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
