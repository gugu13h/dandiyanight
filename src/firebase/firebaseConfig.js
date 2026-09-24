// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase web configuration is public; environment values still override these defaults.
const firebaseDefaults = {
  apiKey: 'AIzaSyDD5GNV3_-uqpW7Zra52bJcC6i40ztD9rs',
  authDomain: 'ddpproject-511df.firebaseapp.com',
  projectId: 'ddpproject-511df',
  storageBucket: 'ddpproject-511df.firebasestorage.app',
  messagingSenderId: '372226258670',
  appId: '1:372226258670:web:5ef82adc63df75ba6da5ff',
  measurementId: 'G-NMNM57S8MX',
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseDefaults.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseDefaults.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseDefaults.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseDefaults.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseDefaults.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseDefaults.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseDefaults.measurementId,
};

const requiredFirebaseValues = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
];

const hasFirebaseConfig = requiredFirebaseValues.every((value) =>
  value && !value.includes('your_')
);

export const firebaseConfigured = hasFirebaseConfig;
const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export default app;
