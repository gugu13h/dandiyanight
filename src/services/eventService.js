// Event Service - Firestore operations for event management
import { db } from '../firebase/firebaseConfig';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

const EVENTS_COLLECTION = 'events';
const DEFAULT_EVENT_ID = 'default';
const LEGACY_CONTACT_PHONE = '+91 98765 43210';
const LEGACY_CONTACT_EMAIL = 'info@dandiyanights.com';

// Default event data
const defaultEventData = {
  name: 'Dandiya Nights 2026',
  description: 'Join us for the most spectacular Dandiya & Garba night of the year! Experience the magic of traditional dance, live music, and festive celebrations under the stars.',
  date: '2026-10-15',
  dates: ['2026-10-15', '2026-10-16', '2026-10-17'],
  startTime: '19:00',
  endTime: '23:00',
  venue: 'Grand Celebration Hall',
  address: '123 Festival Road, Cultural District, Mumbai, Maharashtra 400001',
  city: 'Mumbai',
  ticketPrice: 500,
  totalTickets: 100,
  bookingStatus: 'BOOKING_OPEN',
  dressCode: 'Traditional Indian attire (Chaniya Choli / Kurta Pajama recommended)',
  entryRules: 'Valid ticket and ID proof required for entry. No outside food or drinks allowed.',
  ageRestriction: 'Children below 5 years enter free. Ages 5-12 at half price.',
  parkingInfo: 'Free parking available for 200+ vehicles at the venue premises.',
  contactPhone: '+91 7903400303',
  contactEmail: 'gauravprabhakar33@gmail.com',
  contactWhatsApp: '+91 8864022272',
  organizerName: 'Dandiya Nights Entertainment',
  importantInstructions: 'Please arrive 30 minutes before start time. Carry your booking confirmation.',
  nearbyLandmark: 'Near City Central Mall',
  googleMapsLink: 'https://maps.google.com',
  announcements: '',
  createdAt: null,
  updatedAt: null,
};

function normalizeContactDetails(eventData) {
  const normalized = { ...defaultEventData, ...eventData };
  if (normalized.contactPhone === LEGACY_CONTACT_PHONE) {
    normalized.contactPhone = defaultEventData.contactPhone;
  }
  if (normalized.contactWhatsApp === LEGACY_CONTACT_PHONE) {
    normalized.contactWhatsApp = defaultEventData.contactWhatsApp;
  }
  if (normalized.contactEmail === LEGACY_CONTACT_EMAIL) {
    normalized.contactEmail = defaultEventData.contactEmail;
  }
  return normalized;
}

// Get or create default event
export async function getOrCreateEvent(eventId = DEFAULT_EVENT_ID) {
  const eventRef = doc(db, EVENTS_COLLECTION, eventId);
  const eventDoc = await getDoc(eventRef);

  if (eventDoc.exists()) {
    return { id: eventDoc.id, ...normalizeContactDetails(eventDoc.data()) };
  }

  // Create default event
  const eventData = {
    ...defaultEventData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(eventRef, eventData);
  return { id: eventId, ...eventData };
}

// Subscribe to event updates
export function subscribeToEvent(eventId = DEFAULT_EVENT_ID, callback) {
  if (!db) {
    callback({ id: eventId, ...defaultEventData });
    return () => {};
  }

  callback({ id: eventId, ...normalizeContactDetails({ id: eventId }) });
  const eventRef = doc(db, EVENTS_COLLECTION, eventId);

  return onSnapshot(eventRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...normalizeContactDetails(snapshot.data()) });
    } else {
      callback({ id: eventId, ...normalizeContactDetails({ id: eventId }) });
    }
  }, () => {
    callback({ id: eventId, ...normalizeContactDetails({ id: eventId }) });
  });
}

// Update event (admin)
export async function updateEvent(eventId = DEFAULT_EVENT_ID, updateData) {
  const eventRef = doc(db, EVENTS_COLLECTION, eventId);
  await setDoc(eventRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export { DEFAULT_EVENT_ID };
