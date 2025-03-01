'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDumbbell, FaPlay, FaChevronRight, FaTimes, FaCheck, FaStopwatch } from 'react-icons/fa';
import { db } from '@/app/firebase/config';
import { doc, setDoc, collection } from 'firebase/firestore';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';

interface ExerciseData {
  name: string;
  sets: number;
  reps: number;
  description: string;
  videoId?: string;
}

interface SetData {
  weight: number;
  reps: number;
  completed: boolean;
}

interface CurrentExerciseProps {
  exercise: ExerciseData;
  dayNumber: number;
  exerciseIndex: number;
  onNext: () => void;
  userId: string;
}

export default function CurrentExercise({ exercise, dayNumber, exerciseIndex, onNext, userId }: CurrentExerciseProps) {
  const [currentSet, setCurrentSet] = useState(1);
  const [showSetDialog, setShowSetDialog] = useState(false);
  const [setData, setSetData] = useState<SetData[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState('');
  const [videoIds, setVideoIds] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isLastSet, setIsLastSet] = useState(false);

  useEffect(() => {
    fetchYouTubeVideos(exercise.name);
  }, [exercise]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showTimer && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setShowTimer(false);
      if (isLastSet) {
        onNext();
      } else {
        setCurrentSet(prev => prev + 1);
        setTimeLeft(45);
      }
    }
    return () => clearInterval(timer);
  }, [showTimer, timeLeft, isLastSet, onNext]);

  const fetchYouTubeVideos = async (exerciseName: string) => {
    try {
      const response = await fetch(`/api/youtube?q=${encodeURIComponent(exerciseName + ' exercise tutorial horizontal')}&maxResults=5`);
      const data = await response.json();
      const videos = Array.isArray(data.videos) ? data.videos : [data.videoId];
      setVideoIds(videos);
      setCurrentVideoId(videos[0]);
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
    }
  };

  const handleNextVideo = () => {
    const nextIndex = (currentVideoIndex + 1) % videoIds.length;
    setCurrentVideoIndex(nextIndex);
    setCurrentVideoId(videoIds[nextIndex]);
  };

  const handleSetComplete = async (weight: number, reps: number) => {
    const newSetData = [...setData, { weight, reps, completed: true }];
    setSetData(newSetData);
    setShowSetDialog(false);

    if (currentSet === exercise.sets) {
      setIsLastSet(true);
      setTimeLeft(50); // 50 seconds rest before next exercise
    }
    setShowTimer(true);
    await saveExerciseProgress(newSetData);
  };

  const saveExerciseProgress = async (completedSets: SetData[]) => {
    try {
      const exerciseRef = doc(collection(db, 'users', userId, 'workouts'), `day${dayNumber}_ex${exerciseIndex}`);
      await setDoc(exerciseRef, {
        name: exercise.name,
        sets: completedSets,
        completedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Video Section - Takes up most of the screen on mobile */}
      <div className="relative w-full h-[85vh] bg-black">
        {currentVideoId ? (
          <div className="relative w-full h-full">
            <YouTube
              videoId={currentVideoId}
              opts={{
                width: '100%',
                height: '70%',
                playerVars: { 
                  autoplay: 0,
                  rel: 0, // Don't show related videos
                  modestbranding: 1 // Hide YouTube logo
                }
              }}
              className="w-full h-full"
              onStateChange={(event: YouTubeEvent) => {
                // Check if video is in portrait mode (height > width)
                const player: YouTubePlayer = event.target;
                const videoRatio = player.getVideoRatio?.() || 1;
                if (videoRatio > 1) {
                  // If portrait video, skip to next
                  handleNextVideo();
                }
              }}
            />
            {/* Next Video Button */}
            <button
              onClick={handleNextVideo}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors z-10"
            >
              <span>Next Video</span>
              <FaChevronRight />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-white">Loading video...</p>
          </div>
        )}
        {/* Overlay with exercise info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
          <h2 className="text-2xl font-bold mb-1">{exercise.name}</h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <FaDumbbell className="text-purple-400" />
              <span>Set {currentSet}/{exercise.sets}</span>
            </span>
            <span className="flex items-center gap-1">
              <FaPlay className="text-purple-400" />
              <span>{exercise.reps} reps</span>
            </span>
          </div>
        </div>
      </div>

      {/* Exercise Instructions */}
      <div className="p-4 bg-white shadow-lg rounded-t-3xl -mt-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">Instructions</h3>
          <p className="text-gray-700 mb-6">{exercise.description}</p>

          {/* Progress Bars */}
          <div className="mb-6">
            <div className="flex gap-2 mb-2">
              {Array.from({ length: exercise.sets }).map((_, idx) => (
                <motion.div
                  key={idx}
                  className={`h-2 flex-1 rounded-full ${
                    idx < setData.length ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: idx * 0.1 }}
                />
              ))}
            </div>
          </div>

          {/* Timer Display */}
          {showTimer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-600 text-white p-6 rounded-xl mb-6 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <FaStopwatch className="text-xl" />
                <span className="text-lg font-semibold">
                  Rest Timer: {formatTime(timeLeft)}
                </span>
              </div>
              <p className="text-sm opacity-80">
                {isLastSet ? 'Get ready for next exercise' : 'Get ready for next set'}
              </p>
            </motion.div>
          )}

          {/* Action Button */}
          {!showTimer && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
              onClick={() => setShowSetDialog(true)}
            >
              Complete Set {currentSet}
            </motion.button>
          )}
        </div>
      </div>

      {/* Set Completion Dialog */}
      <AnimatePresence>
        {showSetDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Complete Set {currentSet}</h3>
                <button
                  onClick={() => setShowSetDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2"
                    placeholder="Enter weight"
                    onChange={(e) => {
                      const weight = Number(e.target.value);
                      if (weight >= 0) {
                        handleSetComplete(weight, exercise.reps);
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reps completed
                  </label>
                  <input
                    type="number"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2"
                    placeholder={`Target: ${exercise.reps}`}
                    onChange={(e) => {
                      const reps = Number(e.target.value);
                      if (reps > 0) {
                        handleSetComplete(0, reps);
                      }
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
