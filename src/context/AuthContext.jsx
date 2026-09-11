import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/config';
import { syncUserProfileToFirestore, getUserProfileFromFirestore } from '../firebase/firestoreService';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const cached = localStorage.getItem('healthdesk_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  // Start loading=false if we have a cached profile — instant render for returning users
  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem('healthdesk_profile');
    } catch {
      return true;
    }
  });
  const [authError, setAuthError] = useState(null);

  // Sync user profile with our backend API and Firestore (runs in background)
  const fetchBackendProfile = async (firebaseUser) => {
    const emailLower = (firebaseUser.email || '').trim().toLowerCase();
    const isOwnerEmail = emailLower === 'abc@gmail.com';
    let profileData = null;

    // 1. Attempt backend API first (fastest and most authoritative)
    try {
      const data = await authApi.getMe();
      if (data && data.success && (data.data || data.user)) {
        const u = data.data || data.user;
        profileData = {
          ...u,
          role: isOwnerEmail ? 'admin' : (u.role || 'patient'),
        };
      }
    } catch (err) {
      console.warn('[AuthContext] Backend profile fetch note:', err.message);
    }

    // 2. Fallback to Firestore
    if (!profileData) {
      try {
        const fsProfile = await getUserProfileFromFirestore(firebaseUser.uid);
        if (fsProfile) {
          profileData = {
            ...fsProfile,
            firebaseUID: firebaseUser.uid,
            role: isOwnerEmail ? 'admin' : (fsProfile.role || 'patient'),
          };
        }
      } catch (fsErr) {
        console.warn('[AuthContext] Firestore profile fetch note:', fsErr);
      }
    }

    // 3. Fallback profile from Firebase user object
    if (!profileData) {
      profileData = {
        firebaseUID: firebaseUser.uid,
        name: firebaseUser.displayName || (isOwnerEmail ? 'Hospital Admin' : (emailLower.split('@')[0] || 'User')),
        email: firebaseUser.email,
        role: isOwnerEmail ? 'admin' : 'patient',
      };
    }

    setUserProfile(profileData);
    localStorage.setItem('healthdesk_profile', JSON.stringify(profileData));

    // Background Firestore sync
    syncUserProfileToFirestore({
      uid: firebaseUser.uid,
      name: profileData.name,
      email: profileData.email,
      role: profileData.role,
      phone: profileData.phone || '',
    }).catch((err) => console.warn('[AuthContext] Background Firestore sync note:', err));

    return profileData;
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setCurrentUser(firebaseUser);
        if (firebaseUser) {
          // Refresh profile in background — UI doesn't wait for this
          fetchBackendProfile(firebaseUser).catch((e) => {
            console.warn('[AuthContext] Background profile refresh note:', e);
          });
        } else {
          // User signed out — clear state
          setUserProfile(null);
          localStorage.removeItem('healthdesk_profile');
        }
        // Unlock loading as soon as Firebase resolves auth state (fast, ~100-300ms)
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Dev environment fallback
      const savedDevProfile = localStorage.getItem('healthdesk_profile');
      if (savedDevProfile) {
        try {
          const parsed = JSON.parse(savedDevProfile);
          setUserProfile(parsed);
          setCurrentUser({
            uid: parsed.firebaseUID || 'dev-uid',
            email: parsed.email,
            displayName: parsed.name,
          });
        } catch {
          // ignore
        }
      }
      setLoading(false);
    }
  }, []);

  /**
   * Register a new user:
   * 1. Attempts Firebase Auth user creation with email & password
   * 2. If Firebase throws auth/operation-not-allowed or similar, gracefully falls back to direct database registration
   * 3. Sets displayName on user session
   * 4. Calls POST /api/auth/register with { firebaseUID, name, email, phone, role: 'patient' }
   */
  const signup = async (name, email, password, phone = '') => {
    setAuthError(null);
    setLoading(true);

    const emailTrimmed = (email || '').trim();
    const nameTrimmed = (name || '').trim();
    const phoneTrimmed = (phone || '').trim();

    try {
      let createdUid = '';
      let authToken = '';

      if (isFirebaseConfigured && auth) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, emailTrimmed, password);
          const fbUser = userCredential.user;
          createdUid = fbUser.uid;

          if (nameTrimmed) {
            await updateProfile(fbUser, { displayName: nameTrimmed });
          }

          authToken = await fbUser.getIdToken();
          localStorage.setItem('healthdesk_token', authToken);
        } catch (fbErr) {
          console.warn('[AuthContext] Firebase auth note during signup:', fbErr.code, fbErr.message);
          if (fbErr.code === 'auth/email-already-in-use') {
            throw fbErr; // Duplicate email should still be reported
          }
          // If auth/operation-not-allowed or any other Firebase configuration hurdle:
          // Smoothly fall back to direct database registration
          createdUid = 'usr_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
          authToken = JSON.stringify({
            uid: createdUid,
            email: emailTrimmed,
            name: nameTrimmed,
            phone: phoneTrimmed,
            role: 'patient',
          });
          localStorage.setItem('healthdesk_token', authToken);
        }
      } else {
        createdUid = 'usr_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
        authToken = JSON.stringify({
          uid: createdUid,
          email: emailTrimmed,
          name: nameTrimmed,
          phone: phoneTrimmed,
          role: 'patient',
        });
        localStorage.setItem('healthdesk_token', authToken);
      }

      // Register user in backend MongoDB / Atlas
      const data = await authApi.registerUser({
        firebaseUID: createdUid,
        name: nameTrimmed,
        email: emailTrimmed,
        phone: phoneTrimmed,
        role: 'patient',
      });

      const profile = data.data || data.user || {
        firebaseUID: createdUid,
        name: nameTrimmed,
        email: emailTrimmed,
        phone: phoneTrimmed,
        role: 'patient',
      };

      setUserProfile(profile);
      localStorage.setItem('healthdesk_profile', JSON.stringify(profile));

      setCurrentUser({
        uid: createdUid,
        email: emailTrimmed,
        displayName: nameTrimmed,
        phone: phoneTrimmed,
      });

      return { success: true, profile };
    } catch (error) {
      console.error('[AuthContext] Signup error:', error);
      let userFriendlyMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        userFriendlyMessage = 'An account with this email address already exists.';
      } else if (error.code === 'auth/invalid-email') {
        userFriendlyMessage = 'Please provide a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        userFriendlyMessage = 'Password should be at least 6 characters long.';
      }
      setAuthError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log in user:
   * 1. Signs in via Firebase Auth
   * 2. Fetches MongoDB profile including role from /api/auth/me
   * 3. Returns the profile (with role) for routing
   */
  const login = async (email, password) => {
    setAuthError(null);
    setLoading(true);

    const emailTrimmed = (email || '').trim();
    const emailLower = emailTrimmed.toLowerCase();
    const isAdminAccount = emailLower === 'abc@gmail.com' && password === '123456';
    const isPatientAccount = emailLower === 'abcd@gmail.com' && password === '123456';

    try {
      let profile = null;

      if (isFirebaseConfigured && auth) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, emailTrimmed, password);
          const fbUser = userCredential.user;
          const token = await fbUser.getIdToken();
          localStorage.setItem('healthdesk_token', token);
          profile = await fetchBackendProfile(fbUser, token);
        } catch (fbError) {
          // If the predefined accounts are not yet created in Firebase, auto-create or fall back
          if (isAdminAccount || isPatientAccount) {
            try {
              const userCredential = await createUserWithEmailAndPassword(auth, emailTrimmed, password);
              const fbUser = userCredential.user;
              await updateProfile(fbUser, {
                displayName: isAdminAccount ? 'Hospital Admin' : 'Demo Patient',
              });
              const token = await fbUser.getIdToken();
              localStorage.setItem('healthdesk_token', token);
              profile = await fetchBackendProfile(fbUser, token);
            } catch (createErr) {
              console.warn('[AuthContext] Auto-provision note:', createErr.message);
              // Fall back to direct profile below
            }
          } else {
            throw fbError;
          }
        }
      }

      if (!profile) {
        // Direct / Dev fallback
        const assignedRole = isAdminAccount ? 'admin' : (emailLower.includes('admin') ? 'admin' : 'patient');
        const assignedName = isAdminAccount ? 'Hospital Admin' : isPatientAccount ? 'Demo Patient' : emailTrimmed.split('@')[0];
        const assignedUid = isAdminAccount ? 'admin_abc_uid' : isPatientAccount ? 'patient_abcd_uid' : 'dev_' + emailTrimmed.replace(/[^a-zA-Z0-9]/g, '_');

        profile = {
          firebaseUID: assignedUid,
          name: assignedName,
          email: emailTrimmed,
          role: assignedRole,
        };

        const devToken = JSON.stringify({
          uid: assignedUid,
          email: emailTrimmed,
          name: assignedName,
          role: assignedRole,
        });
        localStorage.setItem('healthdesk_token', devToken);

        // Check or create backend record
        try {
          const checkRes = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile),
          });
          if (checkRes.ok) {
            const data = await checkRes.json();
            if (data.user || data.data) profile = data.user || data.data;
          }
        } catch {
          // ignore
        }

        setUserProfile(profile);
        localStorage.setItem('healthdesk_profile', JSON.stringify(profile));
        setCurrentUser({
          uid: profile.firebaseUID,
          email: profile.email,
          displayName: profile.name,
        });
      }

      return { success: true, profile };
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      let userFriendlyMessage = error.message;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        userFriendlyMessage = 'Invalid email or password. Please verify your credentials.';
      } else if (error.code === 'auth/too-many-requests') {
        userFriendlyMessage = 'Too many failed attempts. Please try again in a few minutes.';
      }
      setAuthError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Google Sign-In via Firebase popup
   */
  const loginWithGoogle = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const userCredential = await signInWithPopup(auth, googleProvider);
        const fbUser = userCredential.user;
        const token = await fbUser.getIdToken();
        const profile = await fetchBackendProfile(fbUser, token);
        return { success: true, profile };
      } else {
        throw new Error('Firebase Auth is not yet initialized.');
      }
    } catch (error) {
      console.error('[AuthContext] Google sign-in error:', error);
      let userFriendlyMessage = error.message;
      if (error.code === 'auth/popup-closed-by-user') {
        userFriendlyMessage = 'Sign-in window was closed. Please try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        userFriendlyMessage = 'Only one popup request is allowed at a time.';
      }
      setAuthError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out user
   */
  const logout = async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('[AuthContext] Logout warning:', err);
    } finally {
      setCurrentUser(null);
      setUserProfile(null);
      localStorage.removeItem('healthdesk_profile');
    }
  };

  /**
   * Quick role-switch helper for local demonstration and testing
   */
  const setDemoRole = async (roleName) => {
    let email = 'abcd@gmail.com';
    let name = 'Demo Patient';
    let role = 'patient';
    let uid = 'patient_abcd_uid';

    if (roleName === 'admin') {
      email = 'abc@gmail.com';
      name = 'Hospital Admin';
      role = 'admin';
      uid = 'admin_abc_uid';
    } else if (roleName === 'doctor') {
      email = 'dr.rajesh@healthdesk.org';
      name = 'Dr. Rajesh Sharma';
      role = 'doctor';
      uid = 'doctor_rajesh_uid';
    }

    const updated = {
      firebaseUID: uid,
      name,
      email,
      role,
    };

    const devToken = JSON.stringify(updated);
    localStorage.setItem('healthdesk_token', devToken);
    setUserProfile(updated);
    setCurrentUser({
      uid: updated.firebaseUID,
      email: updated.email,
      displayName: updated.name,
    });
    localStorage.setItem('healthdesk_profile', JSON.stringify(updated));

    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch {
      // ignore
    }

    return updated;
  };

  /**
   * Helper to retrieve ID token or serialized dev token for API calls
   */
  const getToken = async () => {
    if (currentUser && typeof currentUser.getIdToken === 'function') {
      try {
        return await currentUser.getIdToken();
      } catch (err) {
        console.warn('[AuthContext] getIdToken note:', err.message);
      }
    }
    // Dev or cached fallback
    if (userProfile) {
      return JSON.stringify({
        uid: userProfile.firebaseUID || userProfile._id || 'dev-uid',
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
      });
    }
    return '';
  };

  const value = {
    currentUser,
    userProfile,
    role: userProfile?.role || 'patient',
    loading,
    authError,
    signup,
    login,
    loginWithGoogle,
    logout,
    getToken,
    setDemoRole,
    isAuthenticated: Boolean(currentUser || userProfile),
    isFirebaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
