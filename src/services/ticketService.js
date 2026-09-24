// Ticket Service - Firestore operations for tickets
import { db } from '../firebase/firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';

const TICKETS_COLLECTION = 'tickets';

// Initialize tickets in Firestore
export async function initializeTickets(totalTickets, eventId = 'default') {
  const batch = writeBatch(db);
  const batchSize = 500; // Firestore batch limit
  let currentBatch = writeBatch(db);
  let operationCount = 0;

  for (let i = 1; i <= totalTickets; i++) {
    const ticketRef = doc(db, TICKETS_COLLECTION, `ticket-${i}`);
    const ticketDoc = await getDoc(ticketRef);

    if (!ticketDoc.exists()) {
      currentBatch.set(ticketRef, {
        ticketNumber: i,
        eventId,
        status: 'AVAILABLE',
        bookingId: null,
        userId: null,
        reservedUntil: null,
        approvedAt: null,
        checkedIn: false,
        checkedInAt: null,
      });
      operationCount++;

      if (operationCount >= batchSize) {
        await currentBatch.commit();
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
    }
  }

  if (operationCount > 0) {
    await currentBatch.commit();
  }
}

// Subscribe to all tickets in real-time
export function subscribeToTickets(callback) {
  const q = query(
    collection(db, TICKETS_COLLECTION),
    orderBy('ticketNumber', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(tickets);
  });
}

// Get all tickets once
export async function getAllTickets() {
  const q = query(
    collection(db, TICKETS_COLLECTION),
    orderBy('ticketNumber', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Release expired reservations
export async function releaseExpiredReservations() {
  const now = new Date();
  const q = query(
    collection(db, TICKETS_COLLECTION),
    where('status', '==', 'RESERVED')
  );

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  let count = 0;

  for (const ticketDoc of snapshot.docs) {
    const data = ticketDoc.data();
    if (data.reservedUntil && data.reservedUntil.toDate() < now) {
      batch.update(ticketDoc.ref, {
        status: 'AVAILABLE',
        bookingId: null,
        userId: null,
        reservedUntil: null,
      });
      count++;
    }
  }

  if (count > 0) {
    await batch.commit();
  }

  return count;
}

// Get ticket stats
export async function getTicketStats() {
  const tickets = await getAllTickets();
  const stats = {
    total: tickets.length,
    available: 0,
    reserved: 0,
    paymentPending: 0,
    approved: 0,
    checkedIn: 0,
  };

  tickets.forEach((ticket) => {
    switch (ticket.status) {
      case 'AVAILABLE':
        stats.available++;
        break;
      case 'RESERVED':
        stats.reserved++;
        break;
      case 'PAYMENT_PENDING':
        stats.paymentPending++;
        break;
      case 'APPROVED':
        stats.approved++;
        break;
      case 'CHECKED_IN':
        stats.checkedIn++;
        break;
    }
  });

  return stats;
}
