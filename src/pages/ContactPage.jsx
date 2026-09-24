// Contact Page
import { useState, useEffect } from 'react';
import { subscribeToEvent } from '../services/eventService';
import { Phone, Mail, MessageCircle, MapPin, Clock, ExternalLink } from 'lucide-react';

export default function ContactPage() {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const unsub = subscribeToEvent('default', (e) => setEvent(e));
    return unsub;
  }, []);

  return (
    <div className="page-wrapper">
      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <h1 className="section-title">Contact Us</h1>
          <div className="section-divider" />
          <p className="section-subtitle">
            Have questions? We're here to help. Reach out to us through any of the channels below.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--space-lg)',
          }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  background: 'rgba(16,185,129,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-success)',
                }}>
                  <Phone size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Phone</div>
                  <a href={`tel:${event?.contactPhone || ''}`}
                    style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                    {event?.contactPhone || 'Loading...'}
                  </a>
                </div>
              </div>

              <a
                href={`tel:${event?.contactPhone || ''}`}
                className="btn btn-success"
                style={{ width: '100%' }}
              >
                <Phone size={16} /> Call Now
              </a>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  background: 'rgba(37,211,102,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#25d366',
                }}>
                  <MessageCircle size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>WhatsApp</div>
                  <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                    {event?.contactWhatsApp || event?.contactPhone || 'Loading...'}
                  </span>
                </div>
              </div>

              <a
                href={`https://wa.me/${(event?.contactWhatsApp || event?.contactPhone || '').replace(/[\s\+\-]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ width: '100%', background: '#25d366', color: 'white' }}
              >
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  background: 'rgba(59,130,246,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-info)',
                }}>
                  <Mail size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Email</div>
                  <a href={`mailto:${event?.contactEmail || ''}`}
                    style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                    {event?.contactEmail || 'Loading...'}
                  </a>
                </div>
              </div>

              <a
                href={`mailto:${event?.contactEmail || ''}`}
                className="btn btn-outline"
                style={{ width: '100%', borderColor: 'var(--color-info)', color: 'var(--color-info)' }}
              >
                <Mail size={16} /> Send Email
              </a>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  background: 'rgba(230,57,70,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-primary-light)',
                }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Venue</div>
                  <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>
                    {event?.venue || 'Loading...'}
                  </span>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                    {event?.address || ''}
                  </div>
                </div>
              </div>

              {event?.googleMapsLink && (
                <a
                  href={event.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <ExternalLink size={16} /> Get Directions
                </a>
              )}
            </div>
          </div>

          {event?.organizerName && (
            <div className="card" style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 4 }}>
                Organized by
              </p>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-secondary)' }}>
                {event.organizerName}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
