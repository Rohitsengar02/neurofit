'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMic, FiMicOff, FiVideo, FiVideoOff, 
  FiUsers, FiMessageSquare, FiX, FiMaximize,
  FiCamera, FiPhoneOff
} from 'react-icons/fi';
import Peer from 'peerjs';

interface Participant {
  id: string;
  displayName: string;
  stream?: MediaStream | null;
  audio: boolean;
  video: boolean;
}

interface VideoStreamProps {
  sessionId: string;
  isTrainer: boolean;
  userId: string;
  userName: string;
  onEndSession?: () => void;
}

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
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{sender: string, message: string}[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<{[key: string]: any}>({});
  const streamContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize peer connection
  // Check if device is mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

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
      // Create a unique peer ID using session ID, user ID and a random string to avoid conflicts
      const randomString = Math.random().toString(36).substring(2, 8);
      const peerId = `${sessionId}-${userId}-${randomString}`;
      
      // Initialize the Peer object
      const peer = new Peer(peerId, {
        // Use the free public PeerJS server
        // No configuration needed for the default server
        debug: 3
      });
      
      peerRef.current = peer;
      
      // Handle peer open event
      peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        
        // Add self to participants list
        setParticipants(prev => [
          ...prev,
          {
            id: userId,
            displayName: userName,
            stream: localStream,
            audio: isAudioEnabled,
            video: isVideoEnabled
          }
        ]);
        
        // If trainer, create a room and wait for connections
        if (isTrainer) {
          console.log('Trainer ready to accept connections');
        }
      });
      
      // Handle incoming calls
      peer.on('call', (call) => {
        // Answer the call with our local stream
        call.answer(localStream!);
        
        // Handle incoming stream
        call.on('stream', (remoteStream) => {
          const callerId = call.peer.split('-')[1]; // Extract user ID from peer ID
          
          // Add the remote participant if not already in the list
          setParticipants(prev => {
            if (!prev.find(p => p.id === callerId)) {
              return [
                ...prev,
                {
                  id: callerId,
                  displayName: `Participant ${callerId.substring(0, 5)}`,
                  stream: remoteStream,
                  audio: true,
                  video: true
                }
              ];
            }
            return prev;
          });
          
          // Store the connection
          connectionsRef.current[callerId] = call;
        });
      });
      
      // Handle errors
      peer.on('error', (err) => {
        console.error('Peer connection error:', err);
        alert(`Connection error: ${err.type}`);
      });
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
      // Stop all tracks in the local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      // Close all peer connections
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      
      // Close all connections
      Object.values(connectionsRef.current).forEach((conn: any) => {
        if (conn.close) conn.close();
      });
    };
  }, [sessionId, userId, userName, isTrainer, isFrontCamera]);
  
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
            // Add the trainer to participants if not already there
            setParticipants(prev => {
              if (!prev.find(p => p.id === 'trainer')) {
                return [
                  ...prev,
                  {
                    id: 'trainer',
                    displayName: 'Trainer',
                    stream: remoteStream,
                    audio: true,
                    video: true
                  }
                ];
              }
              return prev;
            });
            
            // Store the connection
            connectionsRef.current['trainer'] = call;
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
    // Stop current stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Get new stream with different camera
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: !isFrontCamera ? 'user' : 'environment' },
        audio: true
      });
      
      setLocalStream(newStream);
      setIsFrontCamera(!isFrontCamera);
      
      // Update local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
      }
      
      // Update all existing connections with the new stream
      Object.values(connectionsRef.current).forEach((conn: any) => {
        if (conn.peerConnection) {
          // Replace tracks in the peer connection
          const senders = conn.peerConnection.getSenders();
          senders.forEach((sender: RTCRtpSender) => {
            if (sender.track?.kind === 'video') {
              const videoTrack = newStream.getVideoTracks()[0];
              if (videoTrack) {
                sender.replaceTrack(videoTrack);
              }
            }
          });
        }
      });
    } catch (err) {
      console.error('Failed to switch camera', err);
      alert('Could not switch camera. Please check permissions.');
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
      
      // In a real app, you would broadcast this message to all participants
      // For now, we'll just add it to the local chat
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
  
  return (
    <div 
      ref={streamContainerRef}
      className="relative w-full h-full bg-black rounded-lg overflow-hidden flex flex-col"
    >
      {/* Main video area */}
      <div className="relative flex-1 flex flex-wrap">
        {/* Local video (self view) */}
        <div className={`${participants.length > 1 ? 'absolute top-2 right-2 w-1/4 h-1/4 z-10' : 'w-full h-full'}`}>
          <div className="relative w-full h-full rounded overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted // Always mute local video to prevent feedback
              className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
            />
            
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">
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
            
            <div className="absolute bottom-2 right-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
              You
            </div>
          </div>
        </div>
        
        {/* Participant videos */}
        {participants
          .filter(p => p.id !== userId) // Exclude self
          .map(participant => (
            <div 
              key={participant.id}
              className={`${participants.length > 2 ? 'w-1/2 h-1/2' : 'w-full h-full'}`}
            >
              <div className="relative w-full h-full p-1">
                {participant.stream ? (
                  <video
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover rounded ${!participant.video ? 'hidden' : ''}`}
                    ref={el => {
                      if (el && participant.stream) {
                        el.srcObject = participant.stream;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center">
                    <div className="animate-pulse">Connecting...</div>
                  </div>
                )}
                
                {participant.stream && !participant.video && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded">
                    <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-3xl text-white font-bold">
                        {participant.displayName.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Audio/video status indicators */}
                <div className="absolute bottom-3 left-3 flex space-x-2">
                  {!participant.audio && (
                    <div className="bg-red-500 rounded-full p-1">
                      <FiMicOff className="text-white" />
                    </div>
                  )}
                  {!participant.video && (
                    <div className="bg-red-500 rounded-full p-1">
                      <FiVideoOff className="text-white" />
                    </div>
                  )}
                </div>
                
                <div className="absolute bottom-3 right-3 text-white bg-black/50 px-2 py-1 rounded">
                  {participant.displayName}
                </div>
              </div>
            </div>
          ))}
      </div>
      
      {/* Control bar */}
      <motion.div 
        className={`bg-gray-900 ${isMobile() ? 'p-4 pb-6 fixed bottom-0 left-0 right-0 z-40' : 'p-3'} flex items-center justify-between`}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleAudio}
            className={`p-3 rounded-full ${isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} transition-colors`}
          >
            {isAudioEnabled ? (
              <FiMic className="text-white text-xl" />
            ) : (
              <FiMicOff className="text-white text-xl" />
            )}
          </button>
          
          <button 
            onClick={toggleVideo}
            className={`p-3 rounded-full ${isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} transition-colors`}
          >
            {isVideoEnabled ? (
              <FiVideo className="text-white text-xl" />
            ) : (
              <FiVideoOff className="text-white text-xl" />
            )}
          </button>
          
          <button 
            onClick={switchCamera}
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <FiCamera className="text-white text-xl" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowParticipants(!showParticipants)}
            className={`p-3 rounded-full ${showParticipants ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
          >
            <FiUsers className="text-white text-xl" />
          </button>
          
          <button 
            onClick={() => setShowChat(!showChat)}
            className={`p-3 rounded-full ${showChat ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
          >
            <FiMessageSquare className="text-white text-xl" />
          </button>
          
          <button 
            onClick={toggleFullscreen}
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <FiMaximize className="text-white text-xl" />
          </button>
          
          {/* End Live Button - More prominent on mobile */}
          <button 
            onClick={handleEndSession}
            className={`${isMobile() ? 'p-4 fixed bottom-20 right-4 z-50 shadow-lg' : 'p-3'} rounded-full bg-red-600 hover:bg-red-700 transition-colors flex items-center`}
          >
            <FiPhoneOff className="text-white text-xl" />
            {isMobile() && <span className="text-white font-bold ml-2">End Live</span>}
          </button>
        </div>
      </motion.div>
      
      {/* Participants panel */}
      {showParticipants && (
        <motion.div 
          className="absolute top-0 right-0 h-full w-64 bg-gray-900/90 backdrop-blur-sm p-4 z-20 overflow-y-auto"
          initial={{ x: 300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold">Participants ({participants.length})</h3>
            <button 
              onClick={() => setShowParticipants(false)}
              className="text-gray-400 hover:text-white"
            >
              <FiX />
            </button>
          </div>
          
          <div className="space-y-3">
            {participants.map(participant => (
              <div 
                key={participant.id}
                className="flex items-center p-2 rounded bg-gray-800"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                  <span className="text-white font-bold">
                    {participant.displayName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    {participant.displayName} {participant.id === userId && '(You)'}
                  </p>
                </div>
                <div className="flex space-x-1">
                  {!participant.audio && <FiMicOff className="text-red-500" />}
                  {!participant.video && <FiVideoOff className="text-red-500" />}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Chat panel */}
      {showChat && (
        <motion.div 
          className="absolute top-0 right-0 h-full w-72 bg-gray-900/90 backdrop-blur-sm flex flex-col z-20"
          initial={{ x: 300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h3 className="text-white font-bold">Chat</h3>
            <button 
              onClick={() => setShowChat(false)}
              className="text-gray-400 hover:text-white"
            >
              <FiX />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <p className="text-gray-500 text-center">No messages yet</p>
            ) : (
              chatMessages.map((msg, index) => (
                <div 
                  key={index}
                  className={`max-w-[85%] ${msg.sender === userName ? 'ml-auto bg-blue-600 text-white' : 'bg-gray-700 text-white'} rounded-lg p-2`}
                >
                  <p className="text-xs font-bold">{msg.sender}</p>
                  <p className="text-sm">{msg.message}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="p-3 border-t border-gray-800">
            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 text-white rounded-l-lg px-3 py-2 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg"
              >
                Send
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VideoStreamComponent;
