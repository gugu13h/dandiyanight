// Booking Service - Firestore operations for bookings
import { db } from '../firebase/firebaseConfig';
import {
  collection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  writeBatch,
  Timestamp,
  limit,
  startAfter,
} from 'firebase/firestore';

const BOOKINGS_COLLECTION = 'bookings';
const TICKETS_COLLECTION = 'tickets';
const COUNTERS_COLLECTION = 'counters';
const EVENTS_COLLECTION = 'events';

// Generate human-readable booking ID: DN-YYYY-NNNN
async function generateBookingId() {
  const year = new Date().getFullYear();
  const counterRef = doc(db, COUNTERS_COLLECTION, 'bookingCounter');

  const newCount = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    let count = 1;
    if (counterDoc.exists()) {
      count = (counterDoc.data().count || 0) + 1;
    }
    transaction.set(counterRef, { count, year }, { merge: true });
    return count;
  });

  return `DN-${year}-${String(newCount).padStart(4, '0')}`;
}

// Reserve tickets and create booking using Firestore transaction
export async function createBooking(userId, bookingData, selectedTickets) {
  const bookingId = await generateBookingId();
  const reservationDuration = 10 * 60 * 1000; // 10 minutes
  const reservationExpiresAt = Timestamp.fromDate(
    new Date(Date.now() + reservationDuration)
  );

  await runTransaction(db, async (transaction) => {
    // Re-check availability in the transaction so an already open booking page
    // cannot submit after an admin closes bookings.
    const eventRef = doc(db, EVENTS_COLLECTION, bookingData.eventId || 'default');
    const eventDoc = await transaction.get(eventRef);
    if (eventDoc.exists() && eventDoc.data().bookingStatus === 'BOOKING_CLOSED') {
      throw new Error('Bookings are currently closed. Please contact the management team for more information.');
    }

    // Check all tickets are available
    const ticketRefs = selectedTickets.map((num) =>
      doc(db, TICKETS_COLLECTION, `ticket-${num}`)
    );

    const ticketDocs = await Promise.all(
      ticketRefs.map((ref) => transaction.get(ref))
    );

    for (let i = 0; i < ticketDocs.length; i++) {
      const ticketDoc = ticketDocs[i];
      if (ticketDoc.exists()) {
        const data = ticketDoc.data();
        if (data.status !== 'AVAILABLE') {
          // Check if reservation has expired
          if (
            data.status === 'RESERVED' &&
            data.reservedUntil &&
            data.reservedUntil.toDate() < new Date()
          ) {
            // Expired reservation, can be reused
            continue;
          }
          throw new Error(
            `Ticket #${selectedTickets[i]} is no longer available. Please select different tickets.`
          );
        }
      }
    }

    // Reserve all tickets
    for (let i = 0; i < ticketRefs.length; i++) {
      transaction.set(ticketRefs[i], {
        ticketNumber: selectedTickets[i],
        eventId: bookingData.eventId || 'default',
        status: 'RESERVED',
        bookingId: bookingId,
        userId: userId,
        reservedUntil: reservationExpiresAt,
        approvedAt: null,
        checkedIn: false,
        checkedInAt: null,
      });
    }

    // Create booking document
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    transaction.set(bookingRef, {
      bookingId,
      userId,
      eventId: bookingData.eventId || 'default',
      name: bookingData.name,
      email: bookingData.email,
      mobile: bookingData.mobile,
      address: bookingData.address,
      ticketNumbers: selectedTickets,
      ticketCount: selectedTickets.length,
      pricePerTicket: bookingData.pricePerTicket,
      totalAmount: bookingData.pricePerTicket * selectedTickets.length,
      paymentMethod: bookingData.paymentMethod || 'ONLINE',
      status: 'REGISTRATION_PENDING',
      paymentStatus: 'PENDING',
      paymentProofUrl: null,
      paymentReference: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      reservationExpiresAt,
      approvedAt: null,
      checkedIn: false,
      checkedInAt: null,
      checkedInBy: null,
    });
  });

  return bookingId;
}

// Get user's bookings
export function subscribeToUserBookings(userId, callback) {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    bookings.sort((first, second) => {
      const firstTime = first.createdAt?.toMillis?.() || 0;
      const secondTime = second.createdAt?.toMillis?.() || 0;
      return secondTime - firstTime;
    });
    callback(bookings);
  });
}

// Get single booking
export async function getBooking(bookingId) {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const bookingDoc = await getDoc(bookingRef);
  if (bookingDoc.exists()) {
    return { id: bookingDoc.id, ...bookingDoc.data() };
  }
  return null;
}

// Get all bookings (admin)
export function subscribeToAllBookings(callback) {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(bookings);
  });
}

// Update booking status (admin)
export async function updateBookingStatus(bookingId, newStatus, adminUid) {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const bookingDoc = await getDoc(bookingRef);

  if (!bookingDoc.exists()) {
    throw new Error('Booking not found');
  }

  const bookingData = bookingDoc.data();
  const updateData = {
    status: newStatus,
    updatedAt: serverTimestamp(),
  };

  if (newStatus === 'PAYMENT_SUCCESSFUL') {
    updateData.paymentStatus = 'SUCCESSFUL';
    updateData.approvedAt = serverTimestamp();

    // Update ticket statuses to APPROVED
    const batch = writeBatch(db);
    for (const ticketNum of bookingData.ticketNumbers) {
      const ticketRef = doc(db, TICKETS_COLLECTION, `ticket-${ticketNum}`);
      batch.update(ticketRef, {
        status: 'APPROVED',
        approvedAt: serverTimestamp(),
        reservedUntil: null,
      });
    }
    batch.update(bookingRef, updateData);
    await batch.commit();
    return;
  }

  if (newStatus === 'PAYMENT_PENDING') {
    updateData.paymentStatus = 'PENDING';
    // Extend reservation
    const extendedExpiry = Timestamp.fromDate(
      new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    );

    const batch = writeBatch(db);
    for (const ticketNum of bookingData.ticketNumbers) {
      const ticketRef = doc(db, TICKETS_COLLECTION, `ticket-${ticketNum}`);
      batch.update(ticketRef, {
        status: 'PAYMENT_PENDING',
        reservedUntil: extendedExpiry,
      });
    }
    batch.update(bookingRef, updateData);
    await batch.commit();
    return;
  }

  if (
    newStatus === 'PAYMENT_FAILED' ||
    newStatus === 'CANCELLED' ||
    newStatus === 'EXPIRED'
  ) {
    updateData.paymentStatus =
      newStatus === 'PAYMENT_FAILED' ? 'FAILED' : newStatus;

    // Release tickets
    const batch = writeBatch(db);
    for (const ticketNum of bookingData.ticketNumbers) {
      const ticketRef = doc(db, TICKETS_COLLECTION, `ticket-${ticketNum}`);
      batch.update(ticketRef, {
        status: 'AVAILABLE',
        bookingId: null,
        userId: null,
        reservedUntil: null,
        sweetReceived: false,
        sweetReceivedAt: null,
        sweetReceivedBy: null,
      });
    }
    batch.update(bookingRef, updateData);
    await batch.commit();
    return;
  }

  await updateDoc(bookingRef, updateData);
}

// Upload payment proof reference
export async function updatePaymentProof(bookingId, proofUrl, reference, nextStatus = 'PAYMENT_PROOF_SUBMITTED') {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const bookingDoc = await getDoc(bookingRef);
  if (!bookingDoc.exists()) throw new Error('Booking not found');

  const bookingData = bookingDoc.data();
  const batch = writeBatch(db);
  for (const ticketNumber of bookingData.ticketNumbers || []) {
    batch.set(doc(db, TICKETS_COLLECTION, `ticket-${ticketNumber}`), {
      ticketNumber,
      eventId: bookingData.eventId || 'default',
      status: 'PAYMENT_PENDING',
      bookingId,
      userId: bookingData.userId,
      reservedUntil: null,
    }, { merge: true });
  }
  batch.update(bookingRef, {
    paymentProofUrl: proofUrl,
    paymentReference: reference,
    status: nextStatus,
    paymentStatus: nextStatus === 'PAYMENT_PROOF_SUBMITTED' ? 'PROOF_SUBMITTED' : 'PENDING',
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function repairTicketsForBookings(bookings) {
  const now = Date.now();
  const ticketBookings = new Map();

  for (const booking of bookings) {
    if ((booking.eventId || 'default') !== 'default') continue;

    let ticketStatus;
    if (booking.status === 'PAYMENT_SUCCESSFUL') {
      ticketStatus = 'APPROVED';
    } else if (['PAYMENT_PENDING', 'PAYMENT_PROOF_SUBMITTED'].includes(booking.status)) {
      ticketStatus = 'PAYMENT_PENDING';
    } else if (booking.status === 'REGISTRATION_PENDING') {
      const expiresAt = booking.reservationExpiresAt?.toDate?.()?.getTime();
      if (expiresAt && expiresAt <= now) continue;
      ticketStatus = 'RESERVED';
    } else {
      continue;
    }

    for (const rawTicketNumber of booking.ticketNumbers || []) {
      const ticketNumber = Number(rawTicketNumber);
      if (Number.isInteger(ticketNumber) && ticketNumber > 0 && !ticketBookings.has(ticketNumber)) {
        ticketBookings.set(ticketNumber, { booking });
      }
    }
  }

  const ticketsSnapshot = await getDocs(collection(db, TICKETS_COLLECTION));
  const ticketNumbersToReconcile = new Set(ticketBookings.keys());
  ticketsSnapshot.docs.forEach((ticketDoc) => {
    const ticketData = ticketDoc.data();
    if (ticketData.status !== 'AVAILABLE') {
      const ticketNumber = Number(ticketData.ticketNumber);
      if (Number.isInteger(ticketNumber) && ticketNumber > 0) {
        ticketNumbersToReconcile.add(ticketNumber);
      }
    }
  });

  const repairs = await Promise.all([...ticketNumbersToReconcile].map(async (ticketNumber) => {
    const ticketRef = doc(db, TICKETS_COLLECTION, `ticket-${ticketNumber}`);
    return runTransaction(db, async (transaction) => {
      const ticketDoc = await transaction.get(ticketRef);
      const ticketData = ticketDoc.exists() ? ticketDoc.data() : null;
      const expectedBooking = ticketBookings.get(ticketNumber);
      const expectedBookingId = expectedBooking
        ? expectedBooking.booking.bookingId || expectedBooking.booking.id
        : null;
      const currentBookingId = ticketData?.bookingId || null;
      const bookingRefs = new Map();

      if (expectedBookingId) {
        bookingRefs.set(expectedBookingId, doc(db, BOOKINGS_COLLECTION, expectedBookingId));
      }
      if (currentBookingId) {
        bookingRefs.set(currentBookingId, doc(db, BOOKINGS_COLLECTION, currentBookingId));
      }

      const bookingDocs = new Map();
      for (const [bookingId, bookingRef] of bookingRefs) {
        bookingDocs.set(bookingId, await transaction.get(bookingRef));
      }

      const isActiveBookingForTicket = (bookingId) => {
        const bookingDoc = bookingDocs.get(bookingId);
        if (!bookingDoc?.exists()) return false;

        const booking = bookingDoc.data();
        if ((booking.eventId || 'default') !== 'default') return false;

        const claimsTicket = (booking.ticketNumbers || [])
          .some((number) => Number(number) === ticketNumber);
        if (!claimsTicket) return false;

        if (booking.status === 'PAYMENT_SUCCESSFUL' ||
            ['PAYMENT_PENDING', 'PAYMENT_PROOF_SUBMITTED'].includes(booking.status)) {
          return true;
        }
        if (booking.status === 'REGISTRATION_PENDING') {
          const expiresAt = booking.reservationExpiresAt?.toDate?.()?.getTime();
          return !expiresAt || expiresAt > Date.now();
        }
        return false;
      };

      if (currentBookingId && isActiveBookingForTicket(currentBookingId)) {
        if (currentBookingId !== expectedBookingId) return false;
      }

      if (expectedBookingId && isActiveBookingForTicket(expectedBookingId)) {
        if (currentBookingId && currentBookingId !== expectedBookingId &&
            isActiveBookingForTicket(currentBookingId)) {
          return false;
        }

        const booking = bookingDocs.get(expectedBookingId).data();
        const ticketStatus = booking.status === 'PAYMENT_SUCCESSFUL'
          ? 'APPROVED'
          : ['PAYMENT_PENDING', 'PAYMENT_PROOF_SUBMITTED'].includes(booking.status)
            ? 'PAYMENT_PENDING'
            : 'RESERVED';

        if (ticketData?.bookingId === expectedBookingId &&
            (ticketData.status === ticketStatus ||
              (ticketStatus === 'APPROVED' && ticketData.status === 'CHECKED_IN'))) {
          return false;
        }

        transaction.set(ticketRef, {
          ticketNumber,
          eventId: booking.eventId || 'default',
          status: ticketStatus,
          bookingId: expectedBookingId,
          userId: booking.userId || null,
          reservedUntil: ticketStatus === 'RESERVED'
            ? booking.reservationExpiresAt || null
            : null,
        }, { merge: true });
        return true;
      }

      if (ticketData && ticketData.status !== 'AVAILABLE') {
        transaction.set(ticketRef, {
          ticketNumber,
          eventId: ticketData.eventId || 'default',
          status: 'AVAILABLE',
          bookingId: null,
          userId: null,
          reservedUntil: null,
          approvedAt: null,
          checkedIn: false,
          checkedInAt: null,
          checkedInBy: null,
          sweetReceived: false,
          sweetReceivedAt: null,
          sweetReceivedBy: null,
        }, { merge: true });
        return true;
      }

      return false;
    });
  }));

  return repairs.filter(Boolean).length;
}

export async function updatePaymentQr(bookingId, qrCodeUrl) {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  await updateDoc(bookingRef, {
    paymentQrCodeUrl: qrCodeUrl,
    updatedAt: serverTimestamp(),
  });
}

// Delete a booking and release its reserved tickets (admin only).
export async function deleteBooking(bookingId) {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const bookingDoc = await getDoc(bookingRef);

  if (!bookingDoc.exists()) {
    throw new Error('Booking not found');
  }

  const bookingData = bookingDoc.data();
  const batch = writeBatch(db);

  for (const ticketNum of bookingData.ticketNumbers || []) {
    batch.set(doc(db, TICKETS_COLLECTION, `ticket-${ticketNum}`), {
      ticketNumber: ticketNum,
      eventId: bookingData.eventId || 'default',
      status: 'AVAILABLE',
      bookingId: null,
      userId: null,
      reservedUntil: null,
      approvedAt: null,
      checkedIn: false,
      checkedInAt: null,
      sweetReceived: false,
      sweetReceivedAt: null,
      sweetReceivedBy: null,
    }, { merge: true });
  }

  batch.delete(bookingRef);
  await batch.commit();
}

// Check-in a booking
export async function checkInBooking(bookingId, adminUid) {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const bookingDoc = await getDoc(bookingRef);

  if (!bookingDoc.exists()) {
    throw new Error('Booking not found');
  }

  const bookingData = bookingDoc.data();

  if (bookingData.status !== 'PAYMENT_SUCCESSFUL') {
    throw new Error('Only approved bookings can be checked in');
  }

  if (bookingData.checkedIn) {
    throw new Error('This booking has already been checked in');
  }

  const batch = writeBatch(db);

  batch.update(bookingRef, {
    checkedIn: true,
    checkedInAt: serverTimestamp(),
    checkedInBy: adminUid,
    updatedAt: serverTimestamp(),
  });

  // Update tickets
  for (const ticketNum of bookingData.ticketNumbers) {
    const ticketRef = doc(db, TICKETS_COLLECTION, `ticket-${ticketNum}`);
    batch.update(ticketRef, {
      checkedIn: true,
      checkedInAt: serverTimestamp(),
      status: 'CHECKED_IN',
    });
  }

  await batch.commit();
}

// Get all bookings as array (for export)
export async function getAllBookingsForExport() {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
