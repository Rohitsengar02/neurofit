import { LiveSession } from './types';

/**
 * Check if a session is currently active based on its scheduled time and duration
 * @param session The live session to check
 * @returns boolean indicating if the session is currently active
 */
export const isSessionActive = (session: LiveSession): boolean => {
  if (!session || !session.scheduledFor) return false;
  
  const now = new Date();
  
  // Handle both Firestore timestamp and JavaScript Date objects
  let sessionStart: Date;
  if (session.scheduledFor.toDate) {
    // It's a Firestore timestamp
    sessionStart = session.scheduledFor.toDate();
  } else if (session.scheduledFor.seconds) {
    // It's a serialized Firestore timestamp
    sessionStart = new Date(session.scheduledFor.seconds * 1000);
  } else {
    // It's already a Date or timestamp in milliseconds
    sessionStart = new Date(session.scheduledFor);
  }
  
  // Calculate the end time based on duration in minutes
  const sessionEnd = new Date(sessionStart.getTime() + (session.duration * 60 * 1000));
  
  return now >= sessionStart && now <= sessionEnd;
};

/**
 * Check if a session should be marked as completed based on its end time
 * @param session The live session to check
 * @returns boolean indicating if the session should be marked as completed
 */
export const isSessionCompleted = (session: LiveSession): boolean => {
  if (!session || !session.scheduledFor) return false;
  
  const now = new Date();
  
  // Handle both Firestore timestamp and JavaScript Date objects
  let sessionStart: Date;
  if (session.scheduledFor.toDate) {
    // It's a Firestore timestamp
    sessionStart = session.scheduledFor.toDate();
  } else if (session.scheduledFor.seconds) {
    // It's a serialized Firestore timestamp
    sessionStart = new Date(session.scheduledFor.seconds * 1000);
  } else {
    // It's already a Date or timestamp in milliseconds
    sessionStart = new Date(session.scheduledFor);
  }
  
  const sessionEnd = new Date(sessionStart.getTime() + (session.duration * 60 * 1000));
  
  return now > sessionEnd;
};

/**
 * Check if a session is scheduled to start in the future
 * @param session The live session to check
 * @returns boolean indicating if the session is scheduled for the future
 */
export const isSessionUpcoming = (session: LiveSession): boolean => {
  if (!session || !session.scheduledFor) return false;
  
  const now = new Date();
  
  // Handle both Firestore timestamp and JavaScript Date objects
  let sessionStart: Date;
  if (session.scheduledFor.toDate) {
    // It's a Firestore timestamp
    sessionStart = session.scheduledFor.toDate();
  } else if (session.scheduledFor.seconds) {
    // It's a serialized Firestore timestamp
    sessionStart = new Date(session.scheduledFor.seconds * 1000);
  } else {
    // It's already a Date or timestamp in milliseconds
    sessionStart = new Date(session.scheduledFor);
  }
  
  return now < sessionStart;
};

/**
 * Format a session time in a human-readable format
 * @param timestamp Firestore timestamp or Date
 * @returns Formatted time string
 */
export const formatSessionTime = (timestamp: any): string => {
  if (!timestamp) return 'N/A';
  
  // Handle different timestamp formats
  let date: Date;
  if (timestamp.toDate) {
    // It's a Firestore timestamp
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    // It's a serialized Firestore timestamp
    date = new Date(timestamp.seconds * 1000);
  } else {
    // It's already a Date or timestamp in milliseconds
    date = new Date(timestamp);
  }
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Get the remaining time until a session starts
 * @param session The live session
 * @returns String with the remaining time or empty string if session already started
 */
export const getTimeUntilSession = (session: LiveSession): string => {
  if (!session || !session.scheduledFor) return '';
  
  const now = new Date();
  
  // Handle both Firestore timestamp and JavaScript Date objects
  let sessionStart: Date;
  if (session.scheduledFor.toDate) {
    // It's a Firestore timestamp
    sessionStart = session.scheduledFor.toDate();
  } else if (session.scheduledFor.seconds) {
    // It's a serialized Firestore timestamp
    sessionStart = new Date(session.scheduledFor.seconds * 1000);
  } else {
    // It's already a Date or timestamp in milliseconds
    sessionStart = new Date(session.scheduledFor);
  }
  
  if (now >= sessionStart) return '';
  
  const diffMs = sessionStart.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) {
    return `Starts in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
  } else if (diffMins < 1440) { // Less than 24 hours
    const hours = Math.floor(diffMins / 60);
    return `Starts in ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(diffMins / 1440);
    return `Starts in ${days} day${days !== 1 ? 's' : ''}`;
  }
};

/**
 * Get the remaining time of an active session
 * @param session The live session
 * @returns String with the remaining time or empty string if session not active
 */
export const getRemainingSessionTime = (session: LiveSession): string => {
  if (!session || !session.scheduledFor || !isSessionActive(session)) return '';
  
  const now = new Date();
  
  // Handle both Firestore timestamp and JavaScript Date objects
  let sessionStart: Date;
  if (session.scheduledFor.toDate) {
    // It's a Firestore timestamp
    sessionStart = session.scheduledFor.toDate();
  } else if (session.scheduledFor.seconds) {
    // It's a serialized Firestore timestamp
    sessionStart = new Date(session.scheduledFor.seconds * 1000);
  } else {
    // It's already a Date or timestamp in milliseconds
    sessionStart = new Date(session.scheduledFor);
  }
  
  const sessionEnd = new Date(sessionStart.getTime() + (session.duration * 60 * 1000));
  
  const diffMs = sessionEnd.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  return `${diffMins} minute${diffMins !== 1 ? 's' : ''} remaining`;
};
