import React from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaExpand } from 'react-icons/fa';
import { YouTubeVideo } from '../services/youtube';

interface VideoPlayerProps {
  video: YouTubeVideo;
  onPlay: (videoId: string) => void;
}

const formatDuration = (duration: string) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '00:00';

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  const parts = [];
  if (hours) parts.push(hours.padStart(2, '0'));
  parts.push((minutes || '0').padStart(2, '0'));
  parts.push((seconds || '0').padStart(2, '0'));

  return parts.join(':');
};

const formatViews = (views: string) => {
  const num = parseInt(views);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M views`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K views`;
  }
  return `${num} views`;
};

export default function VideoPlayer({ video, onPlay }: VideoPlayerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg"
    >
      <div className="relative group">
        <div className="aspect-video relative overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onPlay(video.id)}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <FaPlay className="w-6 h-6 text-white ml-1" />
            </motion.button>
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-white text-sm">
            {formatDuration(video.duration)}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {video.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{video.channelTitle}</span>
            <span>{formatViews(video.viewCount)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
