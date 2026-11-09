import { getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredConfig = [
  ['NEXT_PUBLIC_FIREBASE_API_KEY', firebaseConfig.apiKey],
  ['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', firebaseConfig.authDomain],
  ['NEXT_PUBLIC_FIREBASE_PROJECT_ID', firebaseConfig.projectId],
  ['NEXT_PUBLIC_FIREBASE_APP_ID', firebaseConfig.appId],
] as const;

let appCheckInitialized = false;

export function getFirebaseApp(): FirebaseApp {
  const missingConfig = requiredConfig
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missingConfig.length > 0) {
    throw new Error(
      `Configure as variáveis do Firebase: ${missingConfig.join(', ')}.`,
    );
  }

  return getApps()[0] ?? initializeApp(firebaseConfig);
}

export function getFirebaseAuth() {
  const app = getFirebaseApp();

  if (
    typeof window !== 'undefined' &&
    !appCheckInitialized &&
    process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY
  ) {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(
        process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY,
      ),
      isTokenAutoRefreshEnabled: true,
    });
    appCheckInitialized = true;
  }

  return getAuth(app);
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}
