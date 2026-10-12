import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import rawConfig from '../../firebase-applet-config.json';

// Support Vercel / environment variables with fallback to user's configured project
const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyBMVhHFet1tEuGKFLI1tnIbuyFYwgcviio" || rawConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "aitracker-2adfa8f5.firebaseapp.com" || rawConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || "aitracker-2adfa8f5" || rawConfig.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "aitracker-2adfa8f5.firebasestorage.app" || rawConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "768651391579" || rawConfig.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || "1:768651391579:web:e5363e29654415e127c57e" || rawConfig.appId,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();

