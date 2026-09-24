// Venue Page
import { useState, useEffect } from 'react';
import { subscribeToEvent } from '../services/eventService';
import { formatDate, formatTime } from '../utils/helpers';
import { MapPin, Clock, Car, Landmark, Navigation, Phone } from 'lucide-react';

export default function VenuePage() {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToEvent('default', (e) => setEvent(e));
    return unsubscribe;
  }, []);

  if (!event) {
    return (
      <div className="page-wrapper">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading venue information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <h1 className="section-title">Venue</h1>
          <div className="section-divider" />

          <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              color: 'var(--color-secondary)',
              marginBottom: 'var(--space-lg)',
            }}>
              {event.venue}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                <MapPin size={20} style={{ color: 'var(--color-primary-light)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 2 }}>Address</div>
                  <div>{event.address}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                <Clock size={20} style={{ color: 'var(--color-primary-light)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 2 }}>Event Timing</div>
                  <div>{formatTime(event.startTime)} - {formatTime(event.endTime)}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{formatDate(event.date)}</div>
                </div>
              </div>

              {event.parkingInfo && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                  <Car size={20} style={{ color: 'var(--color-primary-light)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 2 }}>Parking</div>
                    <div>{event.parkingInfo}</div>
                  </div>
                </div>
              )}

              {event.nearbyLandmark && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                  <Landmark size={20} style={{ color: 'var(--color-primary-light)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 2 }}>Nearby Landmark</div>
                    <div>{event.nearbyLandmark}</div>
                  </div>
                </div>
              )}

              {event.contactPhone && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                  <Phone size={20} style={{ color: 'var(--color-primary-light)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 2 }}>Contact</div>
                    <a href={`tel:${event.contactPhone}`} style={{ color: 'var(--color-primary-light)' }}>
                      {event.contactPhone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Embed Area */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              background: 'var(--color-surface)',
              height: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 'var(--space-md)',
              color: 'var(--color-text-secondary)',
            }}>
              <MapPin size={48} style={{ opacity: 0.3 }} />
              <p>Map Preview</p>
              {event.googleMapsLink && (
                <a
                  href={event.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <Navigation size={16} /> Get Directions
                </a>
              )}
            </div>
          </div>

          {event.googleMapsLink && (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
              <a
                href={event.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-lg"
              >
                <Navigation size={18} /> Get Directions on Google Maps
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
