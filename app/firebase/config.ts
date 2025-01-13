import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize collections
const initializeCollections = async (userId: string) => {
  try {
    // Create user document if it doesn't exist
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      currentStreak: 0,
      highestStreak: 0,
      lastWorkoutDate: null,
      createdAt: new Date()
    }, { merge: true });

    // Create user profile document
    const userProfileRef = doc(db, 'userdata', userId);
    await setDoc(userProfileRef, {
      profile: {
        createdAt: new Date()
      }
    }, { merge: true });

    // Ensure workouts collection exists
    const workoutsRef = collection(db, 'workouts');
    
    console.log('Collections initialized successfully');
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
};

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export { app, auth, db, storage, initializeCollections };