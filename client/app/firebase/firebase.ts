'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { signInWithPopup, onAuthStateChanged, type User } from 'firebase/auth';

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Helpful sanity check during setup (remove later)
if (Object.values(firebaseConfig).some(v => !v)) {
	console.error('Missing Firebase env vars', firebaseConfig);
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export function signInWithGoogle() {
	return signInWithPopup(auth, provider);
}

export function signOut() {
	return auth.signOut();
}

export function onAuthStateChangedHelper(cb: (user: User | null) => void) {
	return onAuthStateChanged(auth, cb);
}
