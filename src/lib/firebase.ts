import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { firebaseConfig } from '#config/firebase';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Caché en IndexedDB: lee y guarda sin señal, sincroniza al volver.
export const db = initializeFirestore(app, {
	localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
