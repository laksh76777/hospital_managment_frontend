import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './config';

/**
 * ============================================================================
 * FIRESTORE SERVICE - HEALTHDESK
 * Implements hardened queries and defensive payload handling matching blueprint
 * ============================================================================
 */

// Helper to sanitize text and enforce string length boundaries
const sanitizeText = (val, max = 120) => {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, max);
};

// USER PROFILES
export async function syncUserProfileToFirestore(user) {
  if (!user || !user.uid) return null;
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userRef);

    const email = user.email || '';
    const name = sanitizeText(user.displayName || user.name || email.split('@')[0] || 'User', 120);
    const isOwnerEmail = email.toLowerCase() === 'abc@gmail.com';
    const role = isOwnerEmail ? 'admin' : (user.role || 'patient');

    const userData = {
      uid: user.uid,
      name,
      email,
      role: existingSnap.exists() ? (existingSnap.data().role || role) : role,
      phone: sanitizeText(user.phone || '', 30),
      updatedAt: new Date().toISOString(),
    };

    if (!existingSnap.exists()) {
      userData.createdAt = new Date().toISOString();
      await setDoc(userRef, userData);
    } else {
      await updateDoc(userRef, {
        name: userData.name,
        phone: userData.phone,
        updatedAt: userData.updatedAt,
      });
    }

    return userData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfileFromFirestore(uid) {
  if (!uid) return null;
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// APPOINTMENTS
export async function bookAppointmentInFirestore(appointmentData) {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) {
    throw new Error('You must be signed in to book an appointment.');
  }

  const path = 'appointments';
  try {
    const newDocRef = doc(collection(db, path));
    const now = new Date().toISOString();

    const payload = {
      patientId: currentUid,
      patientName: sanitizeText(appointmentData.patientName || auth.currentUser?.displayName || 'Patient', 120),
      patientEmail: sanitizeText(appointmentData.patientEmail || auth.currentUser?.email || '', 150),
      patientPhone: sanitizeText(appointmentData.patientPhone || '', 30),
      doctorId: sanitizeText(appointmentData.doctorId || '', 128),
      doctorName: sanitizeText(appointmentData.doctorName || appointmentData.doctor || 'Physician', 120),
      department: sanitizeText(appointmentData.department || 'General Medicine', 80),
      date: sanitizeText(appointmentData.date || now.split('T')[0], 30),
      timeSlot: sanitizeText(appointmentData.timeSlot || '10:00 AM', 30),
      notes: sanitizeText(appointmentData.notes || '', 500),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(newDocRef, payload);
    return { id: newDocRef.id, ...payload };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribePatientAppointments(patientId, callback, onError) {
  const path = 'appointments';
  try {
    const q = query(
      collection(db, path),
      where('patientId', '==', patientId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const appts = [];
        snapshot.forEach((docSnap) => {
          appts.push({ id: docSnap.id, ...docSnap.data() });
        });
        // Sort descending by date/createdAt client-side
        appts.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        callback(appts);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeAllAppointments(callback, onError) {
  const path = 'appointments';
  try {
    const q = collection(db, path);
    return onSnapshot(
      q,
      (snapshot) => {
        const appts = [];
        snapshot.forEach((docSnap) => {
          appts.push({ id: docSnap.id, ...docSnap.data() });
        });
        appts.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        callback(appts);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateAppointmentStatusInFirestore(appointmentId, newStatus) {
  const path = `appointments/${appointmentId}`;
  try {
    const apptRef = doc(db, 'appointments', appointmentId);
    await updateDoc(apptRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// DOCTORS & DEPARTMENTS
export async function getDoctorsFromFirestore() {
  const path = 'doctors';
  try {
    const snap = await getDocs(collection(db, path));
    const doctors = [];
    snap.forEach((docSnap) => {
      doctors.push({ id: docSnap.id, ...docSnap.data() });
    });
    return doctors;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
