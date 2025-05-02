'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMic, FiMicOff, FiVideo, FiVideoOff, 
  FiUsers, FiMessageSquare, FiX, FiMaximize,
  FiCamera, FiPhoneOff, FiChevronRight, FiChevronLeft,
  FiMaximize2
} from 'react-icons/fi';
import Peer from 'peerjs';
import { getUserProfileById } from '../../../utils/userService';

interface Participant {
  id: string;
  displayName: string;
  stream?: MediaStream | null;
  audio: boolean;
  video: boolean;
  photoURL?: string;
  isLoading?: boolean;
}

interface VideoStreamProps {
  sessionId: string;
  isTrainer: boolean;
  userId: string;
  userName: string;
  onEndSession?: () => void;
}

// Function to detect if the device is mobile
const isMobile = (): boolean => {
  if (typeof window !== 'undefined') {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  return false;
};

const VideoStreamComponent: React.FC<VideoStreamProps> = ({
  sessionId,
  isTrainer,
  userId,
  userName,
  onEndSession
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [showParticipantsSidebar, setShowParticipantsSidebar] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{sender: string, message: string, isNotification?: boolean}[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [peerId, setPeerId] = useState<string>('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null); // For main video when trainer
  const selfViewRef = useRef<HTMLVideoElement>(null);   // For self view in participant grid
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<{[key: string]: any}>({});
  const streamContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize peer connection
  // Check if device is mobile
  

  // Function to request fullscreen
  const requestFullScreen = () => {
    try {
      if (streamContainerRef.current) {
        if (streamContainerRef.current.requestFullscreen) {
          streamContainerRef.current.requestFullscreen();
        } else {
          // For Safari and older browsers
          const elem = streamContainerRef.current as any;
          if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
          }
        }
        setIsFullscreen(true);
      }
    } catch (err) {
      console.error('Error attempting to enable fullscreen:', err);
    }
  };

  // Auto fullscreen when component mounts - for all devices
  useEffect(() => {
    // Use a slight delay to ensure the component is fully rendered
    const timer = setTimeout(() => {
      requestFullScreen();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const initPeer = async () => {
      try {
        // Generate a unique ID using sessionId, userId and a random string to avoid collisions
        const randomSuffix = Math.random().toString(36).substring(2, 10);
        const peerId = `${sessionId}-${userId}-${randomSuffix}`;
        console.log('Creating peer with ID:', peerId);
        
        // Initialize the Peer object with debugging enabled
        const peer = new Peer(peerId, {
          debug: 3,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });
        
        // Store the peer ID for reference
        setPeerId(peerId);
        
        // Handle peer open event
        peer.on('open', (id) => {
          console.log('My peer ID is open:', id);
          peerRef.current = peer;
          
          // Add self to participants list
          setParticipants(prev => {
            // Only add self if not already in the list
            if (!prev.find(p => p.id === userId)) {
              return [
                ...prev,
                {
                  id: userId,
                  displayName: userName,
                  stream: localStream,
                  audio: isAudioEnabled,
                  video: isVideoEnabled
                }
              ];
            }
            return prev;
          });
          
          // Register this peer ID in Firebase for others to discover
          registerPeerInFirebase(id);
        });
        
        // Handle peer error event
        peer.on('error', (err) => {
          console.error('Peer connection error:', err);
          
          // If the ID is taken, try again with a different random suffix
          if (err.type === 'unavailable-id') {
            console.log('Peer ID was taken, retrying with a new ID');
            // Destroy the current peer
            peer.destroy();
            // Wait a bit and try again
            setTimeout(initPeer, 500);
            return;
          }
          
          // Don't show alert for disconnection errors as they're common
          if (err.type !== 'peer-unavailable') {
            console.log(`Connection error: ${err.type}`);
          }
        });
        
        // Handle incoming calls
        peer.on('call', (call) => {
          console.log('Received call from:', call.peer);
          
          // Answer the call with our local stream
          if (localStream) {
            call.answer(localStream);
          } else {
            console.error('No local stream to answer call with');
            call.answer(); // Answer without a stream
          }
          
          // Extract the caller's user ID from the peer ID
          // Format is sessionId-userId-randomSuffix
          const peerIdParts = call.peer.split('-');
          // The userId is the second part (index 1) if we have at least 3 parts
          const callerId = peerIdParts.length >= 3 ? peerIdParts[1] : call.peer;
          console.log('Caller ID:', callerId);
          
          // Handle incoming stream
          call.on('stream', (remoteStream) => {
            console.log('Received stream in call from:', callerId);
            
            // Use the common handler for remote streams
            handleRemoteStream(remoteStream, callerId);
          });
          
          // Handle call close
          call.on('close', () => {
            console.log('Call closed from:', callerId);
            
            // Remove the participant from the list
            setParticipants(prev => prev.filter(p => p.id !== callerId));
            
            // Add a notification message that a user left
            setChatMessages(prevMessages => [
              ...prevMessages,
              {
                sender: 'System',
                message: `A participant has left the session`,
                isNotification: true
              }
            ]);
          });
        });
      } catch (err) {
        console.error('Error initializing peer:', err);
      }
    };
    
    // Get user media (camera and microphone)
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: isFrontCamera ? 'user' : 'environment' },
          audio: true
        });
        
        setLocalStream(stream);
        
        // Display local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Initialize peer after getting media
        await initPeer();
      } catch (err) {
        console.error('Failed to get local stream', err);
        alert('Could not access camera or microphone. Please check permissions.');
      }
    };
    
    getMedia();
    
    // Cleanup function
    return () => {
      // Stop all tracks in the local stream (turns off camera and mic)
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.error('Error exiting fullscreen:', err);
        });
      }
      
      // Close peer connections
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      
      // Close all connections
      Object.values(connectionsRef.current).forEach((conn: any) => {
        if (conn.close) conn.close();
      });
    };
  }, [sessionId, userId, userName, isTrainer, isFrontCamera]);
  
  useEffect(() => {
    // Update audio/video status for all peers
    if (localStream) {
      // Update local stream tracks
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isAudioEnabled;
      });
      
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoEnabled;
      });
      
      // Update own participant entry
      setParticipants(prev => 
        prev.map(p => 
          p.id === userId 
            ? { ...p, audio: isAudioEnabled, video: isVideoEnabled } 
            : p
        )
      );
      
      // Broadcast status update to all peers
      Object.values(connectionsRef.current).forEach((conn: any) => {
        if (conn.send) {
          try {
            conn.send({
              type: 'status',
              data: {
                userId,
                audio: isAudioEnabled,
                video: isVideoEnabled
              }
            });
          } catch (err) {
            console.error('Error sending status update:', err);
          }
        }
      });
    }
  }, [isAudioEnabled, isVideoEnabled, userId, localStream]);
  
  useEffect(() => {
    // Update local video when stream changes
    if (localStream) {
      // Update main video reference if it exists
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      
      // Always update self view reference
      if (selfViewRef.current) {
        selfViewRef.current.srcObject = localStream;
      }
      
      console.log("Local stream updated and assigned to video elements");
    }
  }, [localStream]);
  
  // Connect to trainer when joining as a participant
  useEffect(() => {
    const connectToTrainer = async () => {
      if (!isTrainer && localStream && peerRef.current) {
        // Find the trainer in the session
        const trainerId = `${sessionId}-trainer`; // Assuming trainer has a known ID format
        
        try {
          // Call the trainer
          const call = peerRef.current.call(trainerId, localStream);
          
          // Handle the trainer's stream
          call.on('stream', (remoteStream) => {
            // Use the common handler for remote streams
            handleRemoteStream(remoteStream, 'trainer');
          });
        } catch (err) {
          console.error('Failed to connect to trainer', err);
          alert('Could not connect to the trainer. Please try again.');
        }
      }
    };
    
    if (!isTrainer && localStream && peerRef.current) {
      connectToTrainer();
    }
  }, [isTrainer, localStream, sessionId]);
  
  // Function to handle incoming video streams
  const handleRemoteStream = (stream: MediaStream, participantId: string, displayName?: string) => {
    console.log('Handling remote stream from:', participantId, 'with display name:', displayName);
    
    // Fetch user profile if needed
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfileById(participantId);
        if (profile) {
          return {
            displayName: profile.displayName,
            photoURL: profile.photoURL
          };
        }
      } catch (err) {
        console.error('Error fetching profile for stream:', err);
      }
      return null;
    };
    
    // Add the participant with their stream
    const addParticipantWithStream = async () => {
      // Try to get profile info
      const profile = await fetchUserProfile();
      
      // Update participants list with the new stream
      setParticipants(prev => {
        // Check if participant already exists
        const existingParticipant = prev.find(p => p.id === participantId);
        
        if (existingParticipant) {
          // Update existing participant with stream
          return prev.map(p => 
            p.id === participantId 
              ? { 
                  ...p, 
                  stream: stream,
                  displayName: profile?.displayName || displayName || p.displayName,
                  photoURL: profile?.photoURL || p.photoURL
                } 
              : p
          );
        } else {
          // Add new participant with stream
          return [
            ...prev,
            {
              id: participantId,
              displayName: profile?.displayName || displayName || `User-${participantId.substring(0, 5)}`,
              photoURL: profile?.photoURL,
              stream: stream,
              audio: true,
              video: true
            }
          ];
        }
      });
      
      // Add notification
      setChatMessages(prevMessages => [
        ...prevMessages,
        {
          sender: 'System',
          message: `${profile?.displayName || displayName || 'A new participant'} has joined the session`,
          isNotification: true
        }
      ]);
    };
    
    // Add the participant with their stream
    addParticipantWithStream();
  };
  
  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
      
      // Update participant info
      setParticipants(prev => 
        prev.map(p => p.id === userId ? {...p, audio: !isAudioEnabled} : p)
      );
    }
  };
  
  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
      
      // Update participant info
      setParticipants(prev => 
        prev.map(p => p.id === userId ? {...p, video: !isVideoEnabled} : p)
      );
    }
  };
  
  // Switch camera (front/back)
  const switchCamera = async () => {
    if (!localStream) return;
    
    try {
      // Get new stream with different camera BEFORE stopping the current one
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: !isFrontCamera ? 'user' : 'environment' },
        audio: true
      });
      
      // First update all existing connections with the new stream
      // This ensures we maintain the connection while switching
      Object.keys(connectionsRef.current).forEach((peerId) => {
        const conn = connectionsRef.current[peerId];
        if (conn && conn.peerConnection) {
          try {
            // Replace tracks in the peer connection
            const senders = conn.peerConnection.getSenders();
            
            // Replace video track
            const videoTrack = newStream.getVideoTracks()[0];
            if (videoTrack) {
              const videoSender = senders.find((sender: RTCRtpSender) => 
                sender.track && sender.track.kind === 'video'
              );
              if (videoSender) {
                videoSender.replaceTrack(videoTrack);
              }
            }
            
            // Replace audio track
            const audioTrack = newStream.getAudioTracks()[0];
            if (audioTrack) {
              const audioSender = senders.find((sender: RTCRtpSender) => 
                sender.track && sender.track.kind === 'audio'
              );
              if (audioSender) {
                audioSender.replaceTrack(audioTrack);
              }
            }
          } catch (error) {
            console.error('Error replacing tracks:', error);
          }
        }
      });
      
      // Now that connections are updated, stop the old stream
      localStream.getTracks().forEach(track => track.stop());
      
      // Update state and UI
      setLocalStream(newStream);
      setIsFrontCamera(!isFrontCamera);
      
      // Update local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error('Failed to switch camera', err);
      
      // Don't show alert on mobile as it can be disruptive
      // Instead, try to recover gracefully
      try {
        // Try to get a new stream with the current camera setting
        const recoveryStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: isFrontCamera ? 'user' : 'environment' },
          audio: true
        });
        
        setLocalStream(recoveryStream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = recoveryStream;
        }
      } catch (recoveryErr) {
        console.error('Failed to recover camera:', recoveryErr);
        alert('Could not access camera. Please check permissions and try again.');
      }
    }
  };
  
  // Send a chat message
  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        sender: userName,
        message: newMessage.trim()
      };
      
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Broadcast the message to all connected peers
      Object.values(connectionsRef.current).forEach((conn: any) => {
        if (conn.send) {
          try {
            conn.send({
              type: 'chat',
              data: message
            });
          } catch (err) {
            console.error('Error sending chat message:', err);
          }
        }
      });
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      streamContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  // End the session and clean up resources
  const handleEndSession = () => {
    // Stop all tracks in the local stream (turns off camera and mic)
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
    }
    
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error('Error exiting fullscreen:', err);
      });
    }
    
    // Close peer connections
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    
    // Call the parent component's onEndSession callback
    if (onEndSession) {
      onEndSession();
    }
  };
  
  // Fetch user profiles for participants
  useEffect(() => {
    const fetchUserProfiles = async () => {
      // Only fetch profiles for participants that don't have a photoURL
      const participantsToUpdate = participants.filter(p => !p.photoURL && !p.isLoading);
      
      if (participantsToUpdate.length === 0) return;
      
      // Mark participants as loading
      setParticipants(prev => 
        prev.map(p => 
          participantsToUpdate.some(pu => pu.id === p.id) 
            ? { ...p, isLoading: true } 
            : p
        )
      );
      
      // Fetch profiles for each participant
      for (const participant of participantsToUpdate) {
        try {
          const profile = await getUserProfileById(participant.id);
          
          if (profile) {
            // Update participant with profile data
            setParticipants(prev => 
              prev.map(p => 
                p.id === participant.id 
                  ? { 
                      ...p, 
                      displayName: profile.displayName || p.displayName,
                      photoURL: profile.photoURL,
                      isLoading: false 
                    } 
                  : p
              )
            );
          } else {
            // Mark as not loading if profile not found
            setParticipants(prev => 
              prev.map(p => 
                p.id === participant.id 
                  ? { ...p, isLoading: false } 
                  : p
              )
            );
          }
        } catch (error) {
          console.error('Error fetching profile for participant:', participant.id, error);
          
          // Mark as not loading on error
          setParticipants(prev => 
            prev.map(p => 
              p.id === participant.id 
                ? { ...p, isLoading: false } 
                : p
            )
          );
        }
      }
    };
    
    fetchUserProfiles();
  }, [participants]);
  
  // Add a Firebase listener for session participants
  useEffect(() => {
    const listenForParticipants = async () => {
      try {
        // Only start listening if we have a valid peer connection
        if (!peerRef.current) return;
        
        // Import Firebase modules dynamically to avoid SSR issues
        const { db } = await import('../../../utils/firebase');
        const { doc, onSnapshot, collection } = await import('firebase/firestore');
        
        // Reference to the session document
        const sessionRef = doc(db, 'sessions', sessionId);
        
        // Reference to the participants subcollection
        const participantsRef = collection(sessionRef, 'participants');
        
        // Listen for changes in the participants collection
        const unsubscribe = onSnapshot(participantsRef, (snapshot) => {
          console.log('Participants collection changed');
          
          // Get the list of participant IDs and their peer IDs from Firestore
          const participantData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              userId: data.userId || doc.id,
              peerId: data.peerId
            };
          });
          
          console.log('Current participants from Firestore:', participantData);
          
          // For each participant that's not already in our list and not ourselves
          participantData.forEach(async (participant) => {
            // Skip if this is our own ID or if we're already connected
            if (participant.userId === userId || participants.some(p => p.id === participant.userId)) {
              return;
            }
            
            // Skip if we don't have a peer ID for this participant
            if (!participant.peerId) {
              console.log('No peer ID for participant:', participant.userId);
              return;
            }
            
            console.log('New participant detected:', participant.userId, 'with peer ID:', participant.peerId);
            
            // Try to connect to this new participant
            if (peerRef.current && localStream) {
              try {
                console.log('Attempting to call new participant:', participant.peerId);
                
                // Call the new participant with our local stream
                const call = peerRef.current.call(participant.peerId, localStream);
                
                if (call) {
                  console.log('Call initiated to new participant');
                  
                  // Handle the remote stream when it arrives
                  call.on('stream', (remoteStream) => {
                    console.log('Received stream from new participant:', participant.userId);
                    
                    // Use the common handler for remote streams
                    handleRemoteStream(remoteStream, participant.userId);
                  });
                }
              } catch (err) {
                console.error('Error connecting to new participant:', participant.userId, err);
              }
            }
          });
        });
        
        // Clean up the listener when component unmounts
        return () => unsubscribe();
      } catch (err) {
        console.error('Error setting up participant listener:', err);
      }
    };
    
    listenForParticipants();
  }, [sessionId, userId, participants, localStream]);
  
  // Function to register the peer ID in Firebase
  const registerPeerInFirebase = async (peerId: string) => {
    try {
      // Import Firebase modules dynamically to avoid SSR issues
      const { db } = await import('../../../utils/firebase');
      const { doc, setDoc, collection, serverTimestamp } = await import('firebase/firestore');
      
      // Reference to the session document
      const sessionRef = doc(db, 'sessions', sessionId);
      
      // Reference to the participant document
      const participantRef = doc(collection(sessionRef, 'participants'), userId);
      
      // Add this participant to the session's participants collection
      await setDoc(participantRef, {
        userId: userId,
        displayName: userName,
        isTrainer: isTrainer,
        joinedAt: serverTimestamp(),
        peerId: peerId
      });
      
      console.log('Registered peer ID in Firebase:', peerId);
    } catch (err) {
      console.error('Error registering peer in Firebase:', err);
    }
  };
  
  // Render participants sidebar
  const renderParticipantsSidebar = () => {
    return (
      <motion.div 
        className={`absolute top-0 right-0 h-full bg-gray-900/90 backdrop-blur-sm z-20 ${showParticipantsSidebar ? 'w-64' : 'w-0'}`}
        initial={false}
        animate={{ width: showParticipantsSidebar ? 280 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {showParticipantsSidebar && (
          <div className="h-full flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium text-lg flex items-center">
                <FiUsers className="mr-2" /> Participants ({participants.length})
              </h3>
              <button 
                onClick={() => setShowParticipantsSidebar(false)}
                className="text-white/70 hover:text-white"
              >
                <FiX />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {participants.map(participant => (
                <div 
                  key={participant.id} 
                  className="flex items-center mb-3 p-2 rounded-lg hover:bg-white/10"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 mr-3">
                    {participant.photoURL ? (
                      <img 
                        src={participant.photoURL} 
                        alt={participant.displayName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {participant.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {participant.displayName}
                      {participant.id === userId && " (You)"}
                    </p>
                    
                    <div className="flex items-center text-xs text-white/70">
                      {participant.audio ? (
                        <FiMic className="mr-1" />
                      ) : (
                        <FiMicOff className="mr-1 text-red-500" />
                      )}
                      
                      {participant.video ? (
                        <FiVideo className="ml-2 mr-1" />
                      ) : (
                        <FiVideoOff className="ml-2 mr-1 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };
  
  return (
    <div 
      ref={streamContainerRef}
      className="relative w-full h-full bg-black rounded-lg overflow-hidden flex flex-col"
    >
      {/* Main video area with bento grid layout */}
      <div className="relative flex-1 flex flex-col p-2 md:p-4">
        <div className="grid grid-cols-12 gap-2 h-full">
          {/* Trainer video (featured as large) */}
          {participants.length > 0 && (
            <>
              {/* Main large video - Trainer or featured participant */}
              <div className="col-span-12 md:col-span-8 row-span-2 aspect-video md:aspect-auto relative rounded-xl overflow-hidden bg-gray-900">
                {/* Fullscreen button */}
                <button 
                  onClick={toggleFullscreen}
                  className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  title="Fullscreen"
                >
                  <FiMaximize2 size={20} />
                </button>
                
                {isTrainer ? (
                  // If current user is the trainer, show their video prominently
                  <div className="relative w-full h-full">
                    {localStream ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center">
                        <div className="animate-pulse">Starting camera...</div>
                      </div>
                    )}
                    
                    {!isVideoEnabled && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                          <span className="text-2xl md:text-3xl text-white font-bold">
                            {userName.charAt(0)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Audio/video status indicators */}
                    <div className="absolute bottom-3 left-3 flex space-x-2">
                      {!isAudioEnabled && (
                        <div className="bg-red-500 rounded-full p-1.5">
                          <FiMicOff className="text-white" />
                        </div>
                      )}
                      {!isVideoEnabled && (
                        <div className="bg-red-500 rounded-full p-1.5">
                          <FiVideoOff className="text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute bottom-3 right-3 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                      You (Trainer)
                    </div>
                  </div>
                ) : (
                  // If current user is not the trainer, find the trainer's video and show it prominently
                  (() => {
                    // Find the trainer participant
                    const trainerParticipant = participants.find(p => p.id !== userId && (p.id === 'trainer' || p.id.includes('trainer')));
                    
                    // If no explicit trainer is found, use the first participant that's not the current user
                    const featuredParticipant = trainerParticipant || participants.find(p => p.id !== userId);
                    
                    return featuredParticipant ? (
                      <div className="relative w-full h-full">
                        {featuredParticipant.stream ? (
                          <video
                            autoPlay
                            playsInline
                            className={`w-full h-full object-cover ${!featuredParticipant.video ? 'hidden' : ''}`}
                            ref={el => {
                              if (el && featuredParticipant.stream) {
                                el.srcObject = featuredParticipant.stream;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center">
                            <div className="animate-pulse">Connecting to trainer...</div>
                          </div>
                        )}
                        
                        {(!featuredParticipant.stream || !featuredParticipant.video) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                              {featuredParticipant.photoURL ? (
                                <img 
                                  src={featuredParticipant.photoURL} 
                                  alt={featuredParticipant.displayName} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl md:text-3xl text-white font-bold">
                                  {featuredParticipant.displayName.charAt(0)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Audio/video status indicators */}
                        <div className="absolute bottom-3 left-3 flex space-x-2">
                          {!featuredParticipant.audio && (
                            <div className="bg-red-500 rounded-full p-1.5">
                              <FiMicOff className="text-white" />
                            </div>
                          )}
                          {!featuredParticipant.video && (
                            <div className="bg-red-500 rounded-full p-1.5">
                              <FiVideoOff className="text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="absolute bottom-3 right-3 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                          {trainerParticipant ? 'Trainer' : ''} {featuredParticipant.displayName}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center">
                        <div>Waiting for trainer to join...</div>
                      </div>
                    );
                  })()
                )}
              </div>
              
              {/* Grid of participant videos */}
              <div className="col-span-12 md:col-span-4 grid grid-cols-2 gap-2 auto-rows-fr">
                {/* Local video (self view) */}
                <div className="relative rounded-xl overflow-hidden bg-gray-800">
                  {localStream ? (
                    <video
                      ref={selfViewRef}
                      autoPlay
                      playsInline
                      muted // Always mute local video to prevent feedback
                      className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-pulse text-xs">Starting camera...</div>
                    </div>
                  )}
                  
                  {(!localStream || !isVideoEnabled) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                        <span className="text-xl text-white font-bold">
                          {userName.charAt(0)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Audio/video status indicators */}
                  <div className="absolute bottom-2 left-2 flex space-x-1">
                    {!isAudioEnabled && (
                      <div className="bg-red-500 rounded-full p-1">
                        <FiMicOff className="text-white text-xs" />
                      </div>
                    )}
                    {!isVideoEnabled && (
                      <div className="bg-red-500 rounded-full p-1">
                        <FiVideoOff className="text-white text-xs" />
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute bottom-2 right-2 text-white bg-black/50 px-2 py-0.5 rounded-full text-xs">
                    You
                  </div>
                </div>
                
                {/* Other participants */}
                {participants
                  .filter(p => p.id !== userId)
                  .filter((p, i) => {
                    // On mobile, show max 3 other participants
                    // On desktop, show max 5 other participants
                    const isMobileView = window.innerWidth < 768;
                    return isMobileView ? i < 3 : i < 5;
                  })
                  .map((participant) => (
                    <div 
                      key={participant.id}
                      className="relative rounded-xl overflow-hidden bg-gray-800"
                    >
                      {participant.stream ? (
                        <video
                          autoPlay
                          playsInline
                          className={`w-full h-full object-cover ${!participant.video ? 'hidden' : ''}`}
                          ref={el => {
                            if (el && participant.stream) {
                              el.srcObject = participant.stream;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="animate-pulse text-xs">Connecting...</div>
                        </div>
                      )}
                      
                      {(!participant.stream || !participant.video) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                            {participant.photoURL ? (
                              <img 
                                src={participant.photoURL} 
                                alt={participant.displayName} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl text-white font-bold">
                                {participant.displayName.charAt(0)}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Audio/video status indicators */}
                      <div className="absolute bottom-2 left-2 flex space-x-1">
                        {!participant.audio && (
                          <div className="bg-red-500 rounded-full p-1">
                            <FiMicOff className="text-white text-xs" />
                          </div>
                        )}
                        {!participant.video && (
                          <div className="bg-red-500 rounded-full p-1">
                            <FiVideoOff className="text-white text-xs" />
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute bottom-2 right-2 text-white bg-black/50 px-2 py-0.5 rounded-full text-xs">
                        {participant.displayName.length > 8 
                          ? `${participant.displayName.substring(0, 8)}...` 
                          : participant.displayName}
                      </div>
                    </div>
                  ))}
                
                {/* Participant count indicator if there are more participants than shown */}
                {participants.filter(p => p.id !== userId).length > (window.innerWidth < 768 ? 3 : 5) && (
                  <div className="relative rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center">
                    <div className="text-white font-medium">
                      +{participants.filter(p => p.id !== userId).length - (window.innerWidth < 768 ? 3 : 5)} more
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Control bar */}
      <div className="bg-gray-900 p-3 md:p-4 flex items-center justify-between">
        <div className="flex space-x-2">
          {/* Mic toggle */}
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-2 md:p-3 rounded-full ${isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isAudioEnabled ? <FiMic className="text-white" /> : <FiMicOff className="text-white" />}
          </button>
          
          {/* Camera toggle */}
          <button
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            className={`p-2 md:p-3 rounded-full ${isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isVideoEnabled ? <FiVideo className="text-white" /> : <FiVideoOff className="text-white" />}
          </button>
          
          {/* Camera flip (mobile only) */}
          {isMobile() && (
            <button
              onClick={() => setIsFrontCamera(!isFrontCamera)}
              className="p-2 md:p-3 rounded-full bg-gray-700 hover:bg-gray-600"
            >
              <FiCamera className="text-white" />
            </button>
          )}
        </div>
        
        <div className="flex space-x-2">
          {/* Participants button */}
          <button
            onClick={() => setShowParticipantsSidebar(!showParticipantsSidebar)}
            className={`p-2 md:p-3 rounded-full ${showParticipantsSidebar ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <FiUsers className="text-white" />
          </button>
          
          {/* Chat button */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-2 md:p-3 rounded-full ${showChat ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            <FiMessageSquare className="text-white" />
          </button>
          
          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 md:p-3 rounded-full bg-gray-700 hover:bg-gray-600"
          >
            <FiMaximize className="text-white" />
          </button>
          
          {/* End call */}
          <button
            onClick={handleEndSession}
            className="p-2 md:p-3 rounded-full bg-red-600 hover:bg-red-700"
          >
            <FiPhoneOff className="text-white" />
          </button>
        </div>
      </div>
      
      {/* Participants sidebar */}
      {renderParticipantsSidebar()}
      
      {/* Participants toggle button (when sidebar is closed) */}
      {!showParticipantsSidebar && (
        <button
          onClick={() => setShowParticipantsSidebar(true)}
          className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-800/80 hover:bg-gray-700/80 text-white p-2 rounded-l-md"
        >
          <FiChevronLeft />
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 bg-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {participants.length}
          </div>
        </button>
      )}
    </div>
  );
};

export default VideoStreamComponent;
