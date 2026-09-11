/**
 * ============================================================================
 * FIREBASE CONSOLE MANUAL SETUP INSTRUCTIONS FOR HEALTHDESK:
 * ============================================================================
 * 
 * 1. Create / Open a Firebase Project:
 *    - Visit https://console.firebase.google.com and sign in with your Google account.
 *    - Click "Add project" and name it (e.g., "healthdesk-hospital").
 * 
 * 2. Enable Email/Password Authentication:
 *    - In the left sidebar, navigate to "Build" -> "Authentication".
 *    - Click "Get started".
 *    - Under the "Sign-in method" tab, select "Email/Password".
 *    - Enable the first switch ("Email/Password") and click "Save".
 * 
 * 3. Register your Web App & Obtain Client Credentials:
 *    - In Project Overview (Gear icon ⚙️ -> Project settings).
 *    - In "General" tab, scroll down to "Your apps" and click the Web icon (</>).
 *    - Register app name "HealthDesk Web".
 *    - Copy the `firebaseConfig` keys into your `.env` file in the client / root:
 *      VITE_FIREBASE_API_KEY="..."
 *      VITE_FIREBASE_AUTH_DOMAIN="..."
 *      VITE_FIREBASE_PROJECT_ID="..."
 *      VITE_FIREBASE_STORAGE_BUCKET="..."
 *      VITE_FIREBASE_MESSAGING_SENDER_ID="..."
 *      VITE_FIREBASE_APP_ID="..."
 * 
 * 4. Generate the Server Service Account Key (for backend token verification):
 *    - In Firebase Console, go to Project settings ⚙️ -> "Service accounts" tab.
 *    - Click "Generate new private key" -> click "Generate key".
 *    - Download the JSON file.
 *    - Copy the contents into FIREBASE_SERVICE_ACCOUNT in your backend `.env` file,
 *      or supply FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.
 * ============================================================================
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig?.apiKey || 'AIzaSyAa_RQue1ST_PB2hehM-Cy3q4QGg5C4A7o',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig?.authDomain || 'powerful-rock-8pp0d.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig?.projectId || 'powerful-rock-8pp0d',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig?.storageBucket || 'powerful-rock-8pp0d.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig?.messagingSenderId || '938492421110',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig?.appId || '1:938492421110:web:16f05282a0435d31f3ddd7',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId
);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore instance
const firestoreDatabaseId = appletConfig?.firestoreDatabaseId || '(default)';
export const db = getFirestore(app, firestoreDatabaseId);

export { app, firebaseConfig };

// Error handling conforming to Firebase skill
export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial connection verification test
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('[HealthDesk Firebase] Connection to Firestore verified successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// Run connection test on boot
testConnection();

export default auth;

