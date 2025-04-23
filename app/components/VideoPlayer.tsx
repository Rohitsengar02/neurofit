'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaExpand, FaCompress, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  title,
  autoplay = false,
  loop = true,
  controls = true,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const videoRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clean up interval on unmount
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  // Handle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    
    if (videoRef.current && videoRef.current.contentWindow) {
      const message = !isPlaying 
        ? JSON.stringify({ event: 'command', func: 'playVideo' })
        : JSON.stringify({ event: 'command', func: 'pauseVideo' });
      
      videoRef.current.contentWindow.postMessage(message, '*');
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (videoRef.current && videoRef.current.contentWindow) {
      const message = isMuted
        ? JSON.stringify({ event: 'command', func: 'unMute' })
        : JSON.stringify({ event: 'command', func: 'mute' });
      
      videoRef.current.contentWindow.postMessage(message, '*');
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  return (
    <motion.div 
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* YouTube iframe */}
      <iframe
        ref={videoRef}
        className="w-full aspect-video"
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0&mute=${isMuted ? 1 : 0}`}
        title={title || "YouTube video player"}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      
      {/* Custom controls overlay */}
      {controls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex flex-col opacity-0 hover:opacity-100 transition-opacity">
          {/* Progress bar */}
          <div className="w-full h-1 bg-gray-600 rounded-full mb-2 cursor-pointer">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Play/Pause button */}
              <button 
                onClick={togglePlay}
                className="text-white hover:text-blue-400 transition"
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              
              {/* Mute/Unmute button */}
              <button 
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition"
              >
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              
              {/* Time display */}
              <div className="text-white text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            {/* Fullscreen button */}
            <button 
              onClick={toggleFullscreen}
              className="text-white hover:text-blue-400 transition"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VideoPlayer;
