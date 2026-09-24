// Admin Service - Admin-specific Firestore operations
import { db } from '../firebase/firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

const ADMIN_LOGS_COLLECTION = 'adminLogs';
const PAYMENT_SETTINGS_COLLECTION = 'paymentSettings';
const USERS_COLLECTION = 'users';

// Log admin action
export async function logAdminAction(adminUid, action, description, bookingId = null) {
  await addDoc(collection(db, ADMIN_LOGS_COLLECTION), {
    adminUid,
    action,
    description,
    bookingId,
    timestamp: serverTimestamp(),
  });
}

// Subscribe to admin logs
export function subscribeToAdminLogs(callback) {
  const q = query(
    collection(db, ADMIN_LOGS_COLLECTION),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(logs);
  });
}

// Payment Settings
export async function getPaymentSettings() {
  const settingsRef = doc(db, PAYMENT_SETTINGS_COLLECTION, 'default');
  const settingsDoc = await getDoc(settingsRef);

  if (settingsDoc.exists()) {
    return settingsDoc.data();
  }

  // Create default settings
  const defaultSettings = {
    upiId: '',
    qrCodeUrl: '',
    instructions: 'Please make payment using the UPI ID or QR code provided. Send the payment screenshot as proof.',
    contactNumber: '',
    bankDetails: '',
    updatedAt: serverTimestamp(),
  };

  await setDoc(settingsRef, defaultSettings);
  return defaultSettings;
}

export async function updatePaymentSettings(settings) {
  const settingsRef = doc(db, PAYMENT_SETTINGS_COLLECTION, 'default');
  await setDoc(settingsRef, {
    ...settings,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export function subscribeToPaymentSettings(callback) {
  const settingsRef = doc(db, PAYMENT_SETTINGS_COLLECTION, 'default');
  return onSnapshot(settingsRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
}

// Get all users (admin)
export function subscribeToUsers(callback) {
  const q = query(
    collection(db, USERS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(users);
  });
}

// Get user by ID
export async function getUserById(userId) {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() };
  }
  return null;
}

// Verify booking for check-in (by booking ID or ticket number)
export async function verifyBooking(identifier) {
  // Try booking ID first
  const bookingRef = doc(db, 'bookings', identifier);
  const bookingDoc = await getDoc(bookingRef);

  if (bookingDoc.exists()) {
    return { id: bookingDoc.id, ...bookingDoc.data() };
  }

  // Try ticket number
  const ticketQuery = query(
    collection(db, 'tickets'),
    where('ticketNumber', '==', parseInt(identifier))
  );
  const ticketSnapshot = await getDocs(ticketQuery);

  if (!ticketSnapshot.empty) {
    const ticketData = ticketSnapshot.docs[0].data();
    if (ticketData.bookingId) {
      const bDoc = await getDoc(doc(db, 'bookings', ticketData.bookingId));
      if (bDoc.exists()) {
        return { id: bDoc.id, ...bDoc.data() };
      }
    }
  }

  return null;
}
