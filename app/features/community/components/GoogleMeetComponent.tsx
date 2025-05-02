'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiMaximize2, FiX, FiVideo, FiCopy } from 'react-icons/fi';

interface GoogleMeetProps {
  sessionId: string;
  meetLink?: string;
  isTrainer: boolean;
  onEndSession?: () => void;
}

const GoogleMeetComponent: React.FC<GoogleMeetProps> = ({
  sessionId,
  meetLink,
  isTrainer,
  onEndSession
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [generatedMeetLink, setGeneratedMeetLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Function to toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(err => console.error('Error attempting to enable fullscreen:', err));
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch(err => console.error('Error attempting to exit fullscreen:', err));
      }
    }
  };
  
  // Generate or retrieve Google Meet link
  useEffect(() => {
    const getMeetLink = async () => {
      try {
        // If a meet link was provided as a prop, use it
        if (meetLink && meetLink !== 'https://meet.google.com/new') {
          setGeneratedMeetLink(meetLink);
          return;
        }
        
        // Check if we have a stored link for this session in Firebase
        const { db } = await import('../../../../lib/firebase');
        const { doc, getDoc, setDoc, updateDoc } = await import('firebase/firestore');
        
        const sessionRef = doc(db, 'sessions', sessionId);
        const sessionDoc = await getDoc(sessionRef);
        
        if (sessionDoc.exists() && sessionDoc.data().meetLink && sessionDoc.data().meetLink !== 'https://meet.google.com/new') {
          // Use existing meet link
          setGeneratedMeetLink(sessionDoc.data().meetLink);
        } else if (isTrainer) {
          // Only trainers can create new links
          // For now, we'll use the "new" URL which will redirect to a unique meeting
          // The trainer will need to copy and save the actual URL after redirection
          setGeneratedMeetLink('https://meet.google.com/new');
        } else {
          // Participants should wait for the trainer to set up the meeting
          setGeneratedMeetLink(null);
        }
      } catch (error) {
        console.error('Error getting or creating Meet link:', error);
      }
    };
    
    getMeetLink();
  }, [sessionId, meetLink, isTrainer]);
  
  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Function to open Google Meet in a new tab
  const openGoogleMeet = () => {
    // Always use the reliable new meeting URL
    window.open('https://meet.google.com/new', '_blank', 'noopener,noreferrer');
  };
  
  // Function to copy the meet link to clipboard
  const copyMeetLink = async () => {
    if (generatedMeetLink) {
      try {
        await navigator.clipboard.writeText(generatedMeetLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };
  
  // Function for trainers to save the actual meet link
  const saveActualMeetLink = async () => {
    try {
      const actualLink = prompt('After joining the Google Meet, please paste the actual meeting URL here:');
      if (actualLink && actualLink.includes('meet.google.com')) {
        // Save the actual link to Firebase
        const { db } = await import('../../../../lib/firebase');
        const { doc, updateDoc } = await import('firebase/firestore');
        
        await updateDoc(doc(db, 'sessions', sessionId), {
          meetLink: actualLink
        });
        
        // Update local state
        setGeneratedMeetLink(actualLink);
        alert('Meeting link saved successfully!');
      } else {
        alert('Please enter a valid Google Meet URL');
      }
    } catch (error) {
      console.error('Error saving meet link:', error);
      alert('Failed to save meeting link');
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] bg-gray-800 rounded-lg overflow-hidden flex flex-col items-center justify-center p-6"
    >
      <div className="text-center">
        <div className="mb-6">
          <div className="text-white text-xl font-bold mb-2">Google Meet Session</div>
          
          {isTrainer ? (
            <div>
              <p className="text-gray-300 mb-4">
                As the trainer, you can start a Google Meet session for this live session.
              </p>
              <div className="bg-blue-600 text-white p-3 rounded-lg mb-4">
                <span className="font-medium">Click the button below to start a new Google Meet session</span>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-300 mb-4">
                Join the Google Meet session for this live class.
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={openGoogleMeet}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center mx-auto"
        >
          <FiVideo className="mr-2" /> {isTrainer ? 'Start Google Meet' : 'Join Google Meet'}
        </button>
        
        {isTrainer && onEndSession && (
          <button 
            onClick={onEndSession}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center mx-auto"
          >
            <FiX className="mr-2" /> End Session
          </button>
        )}
      </div>
    </div>
  );
};

export default GoogleMeetComponent;
