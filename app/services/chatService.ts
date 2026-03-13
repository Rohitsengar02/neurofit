import { db, auth } from '../utils/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';

export interface ChatMessage {
  id?: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: any;
  senderName: string;
}

export interface ChatSession {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: any;
  updatedAt: any;
  doctorName?: string;
  userName?: string;
  doctorId: string;
  userId: string;
}

// Get or create a chat session between a user and a doctor
export const getOrCreateChatSession = async (userId: string, doctorId: string, userName: string, doctorName: string) => {
  const sessionId = [userId, doctorId].sort().join('_');
  const sessionRef = doc(db, 'chat_sessions', sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) {
    const sessionData: ChatSession = {
      id: sessionId,
      participants: [userId, doctorId],
      lastMessage: '',
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
      doctorId,
      userId,
      doctorName,
      userName
    };
    await setDoc(sessionRef, sessionData);
  }

  return sessionId;
};

// Send a message
export const sendMessage = async (sessionId: string, senderId: string, senderName: string, receiverId: string, text: string) => {
  const messagesRef = collection(db, 'chat_sessions', sessionId, 'messages');
  await addDoc(messagesRef, {
    senderId,
    senderName,
    receiverId,
    text,
    timestamp: serverTimestamp()
  });

  // Update session last message
  const sessionRef = doc(db, 'chat_sessions', sessionId);
  await updateDoc(sessionRef, {
    lastMessage: text,
    lastMessageTime: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// Listen for messages in a session
export const listenToMessages = (sessionId: string, callback: (messages: ChatMessage[]) => void) => {
  const messagesRef = collection(db, 'chat_sessions', sessionId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatMessage[];
    callback(messages);
  });
};

// Listen to all chat sessions for a doctor
export const listenToDoctorSessions = (doctorId: string, callback: (sessions: ChatSession[]) => void) => {
  const sessionsRef = collection(db, 'chat_sessions');
  const q = query(
    sessionsRef, 
    where('doctorId', '==', doctorId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatSession[];
    callback(sessions);
  });
};

// Listen to all chat sessions for a user
export const listenToUserSessions = (userId: string, callback: (sessions: ChatSession[]) => void) => {
  const sessionsRef = collection(db, 'chat_sessions');
  const q = query(
    sessionsRef, 
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatSession[];
    callback(sessions);
  });
};
