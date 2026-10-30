import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '#config/firebase';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Sin persistencia offline todavía (llega en MVP 2).
export const db = getFirestore(app);
