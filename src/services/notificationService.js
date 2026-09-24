// Notification Service
import { db } from '../firebase/firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

const NOTIFICATIONS_COLLECTION = 'notifications';

// Create a notification
export async function createNotification(userId, title, message, type = 'info') {
  await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: serverTimestamp(),
  });
}

// Subscribe to user notifications
export function subscribeToNotifications(userId, callback) {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    notifications.sort((first, second) => {
      const firstTime = first.createdAt?.toMillis?.() || 0;
      const secondTime = second.createdAt?.toMillis?.() || 0;
      return secondTime - firstTime;
    });
    callback(notifications);
  });
}

// Mark notification as read
export async function markNotificationAsRead(notificationId) {
  const notifRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(notifRef, { read: true });
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId) {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    where('read', '==', false)
  );

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });

  await batch.commit();
}
