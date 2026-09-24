// Event Details Page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToEvent } from '../services/eventService';
import { formatDate, formatTime, formatCurrency } from '../utils/helpers';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Shirt,
  AlertCircle,
  Phone,
  Mail,
  Car,
  Info,
  Users,
} from 'lucide-react';

export default function EventDetailsPage() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToEvent('default', (eventData) => {
      setEvent(eventData);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-wrapper">
        <div className="container section">
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No Event Found</h3>
            <p>Event details will be available soon.</p>
          </div>
        </div>
      </div>
    );
  }

  const details = [
    { icon: <Calendar size={20} />, label: 'Date', value: formatDate(event.date) },
    {
      icon: <Calendar size={20} />,
      label: 'All Dates',
      value: event.dates?.map((d) => formatDate(d)).join(' | ') || formatDate(event.date),
      show: event.dates?.length > 1,
    },
    { icon: <Clock size={20} />, label: 'Time', value: `${formatTime(event.startTime)} - ${formatTime(event.endTime)}` },
    { icon: <MapPin size={20} />, label: 'Venue', value: event.venue },
    { icon: <MapPin size={20} />, label: 'Address', value: event.address },
    { icon: <Ticket size={20} />, label: 'Ticket Price', value: formatCurrency(event.ticketPrice) },
    { icon: <Shirt size={20} />, label: 'Dress Code', value: event.dressCode },
    { icon: <AlertCircle size={20} />, label: 'Entry Rules', value: event.entryRules },
    { icon: <Users size={20} />, label: 'Age Restriction', value: event.ageRestriction },
    { icon: <Car size={20} />, label: 'Parking', value: event.parkingInfo },
    { icon: <Phone size={20} />, label: 'Contact', value: event.contactPhone },
    { icon: <Mail size={20} />, label: 'Email', value: event.contactEmail },
  ].filter((d) => d.value && d.show !== false);

  return (
    <div className="page-wrapper">
      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <h1 className="section-title">{event.name || 'Dandiya Nights'}</h1>
          <div className="section-divider" />

          {event.announcements && (
            <div style={{
              background: 'rgba(249,168,37,0.08)',
              border: '1px solid rgba(249,168,37,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-lg)',
              marginBottom: 'var(--space-xl)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-md)',
            }}>
              <Info size={20} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--color-secondary)' }}>Announcement</strong>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>{event.announcements}</p>
              </div>
            </div>
          )}

          <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              marginBottom: 'var(--space-lg)',
              color: 'var(--color-secondary)',
            }}>
              About This Event
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
              {event.description}
            </p>
          </div>

          <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              marginBottom: 'var(--space-lg)',
              color: 'var(--color-secondary)',
            }}>
              Event Details
            </h2>

            {details.map((detail, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-md)',
                padding: 'var(--space-md) 0',
                borderBottom: index < details.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
                <div style={{ color: 'var(--color-primary-light)', flexShrink: 0, marginTop: 2 }}>
                  {detail.icon}
                </div>
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 2 }}>
                    {detail.label}
                  </div>
                  <div style={{ color: 'var(--color-text)' }}>{detail.value}</div>
                </div>
              </div>
            ))}
          </div>

          {event.importantInstructions && (
            <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                marginBottom: 'var(--space-md)',
                color: 'var(--color-secondary)',
              }}>
                Important Instructions
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                {event.importantInstructions}
              </p>
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            {event.bookingStatus === 'BOOKING_CLOSED' ? (
              <div className="btn btn-lg" style={{ background: 'var(--color-surface)', cursor: 'default' }}>
                Bookings Currently Closed
              </div>
            ) : (
              <Link to="/book" className="btn btn-primary btn-lg btn-glow">
                <Ticket size={20} /> Book Your Tickets
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
