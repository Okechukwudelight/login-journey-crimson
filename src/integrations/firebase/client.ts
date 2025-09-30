import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

function assertConfig(): void {
  const entries = Object.entries(firebaseConfig);
  const missing = entries.filter(([, v]) => !v).map(([k]) => k);
  if (missing.length > 0) {
    throw new Error(`Missing Firebase env vars: ${missing.join(', ')}. Set VITE_FIREBASE_* in your .env`);
  }
}

let app: FirebaseApp;
export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    assertConfig();
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
};

export const auth = getAuth(getFirebaseApp());
export const db = getFirestore(getFirebaseApp());


