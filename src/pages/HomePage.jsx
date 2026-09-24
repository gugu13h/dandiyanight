// Home Page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToEvent } from '../services/eventService';
import { formatDate, formatTime, formatCurrency } from '../utils/helpers';
import {
  Calendar,
  Clock,
  MapPin,
  Music,
  Ticket,
  Users,
  Star,
  Sparkles,
  PartyPopper,
  Heart,
} from 'lucide-react';

export default function HomePage() {
  const [event, setEvent] = useState(null);
  const [daysUntilEvent, setDaysUntilEvent] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToEvent('default', (eventData) => {
      setEvent(eventData);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!event?.date) return undefined;

    const eventDate = new Date(`${event.date}T00:00:00`);
    const updateDaysRemaining = () => {
      const remaining = eventDate.getTime() - Date.now();
      setDaysUntilEvent(Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24))));
    };

    updateDaysRemaining();
    const interval = setInterval(updateDaysRemaining, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [event?.date]);

  const features = [
    { icon: <Music size={28} />, title: 'Live Music', desc: 'Enjoy electrifying live Garba and Dandiya music all night long.' },
    { icon: <Users size={28} />, title: 'Cultural Dance', desc: 'Traditional Garba & Dandiya Raas with professional dance coordinators.' },
    { icon: <PartyPopper size={28} />, title: 'Grand Celebrations', desc: 'Spectacular stage decorations, lighting, and festive ambience.' },
    { icon: <Star size={28} />, title: 'Premium Experience', desc: 'Professional event management with world-class arrangements.' },
    { icon: <Sparkles size={28} />, title: 'Food & Refreshments', desc: 'Delicious authentic Gujarati snacks and refreshment stalls.' },
    { icon: <Heart size={28} />, title: 'Memories Forever', desc: 'Professional photography and photo booth for unforgettable memories.' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-decor hero-decor-1" />
        <div className="hero-decor hero-decor-2" />
        <div className="hero-decor hero-decor-3" />

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            {event?.dates?.length > 1
              ? `${event.dates.length} Nights of Celebration`
              : 'An Evening to Remember'}
          </div>

          <h1 className="hero-title">
            Dandiya<br />Nights
          </h1>

          <p className="hero-subtitle">
            Celebrate. Dance. Connect.
          </p>

          {daysUntilEvent !== null && (
            <div className="hero-price" style={{ color: 'var(--color-secondary)' }}>
              <Clock size={20} />
              {daysUntilEvent > 0 ? `${daysUntilEvent} days left` : 'Event day is here'}
            </div>
          )}

          {event && (
            <div className="hero-price">
              <Ticket size={20} />
              Starting at {formatCurrency(event.ticketPrice || 500)} per ticket
            </div>
          )}

          <div className="hero-details">
            <div className="hero-detail-item">
              <Calendar size={16} className="detail-icon" />
              <span>{event ? formatDate(event.date) : 'Coming Soon'}</span>
            </div>
            <div className="hero-detail-item">
              <Clock size={16} className="detail-icon" />
              <span>
                {event
                  ? `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`
                  : 'Evening'}
              </span>
            </div>
            <div className="hero-detail-item">
              <MapPin size={16} className="detail-icon" />
              <span>{event?.venue || 'Venue TBA'}</span>
            </div>
          </div>

          <div className="hero-cta">
            {event?.bookingStatus === 'BOOKING_CLOSED' ? (
              <div className="btn btn-lg" style={{ background: 'var(--color-surface)', cursor: 'default' }}>
                Bookings Currently Closed
              </div>
            ) : (
              <Link to="/book" className="btn btn-primary btn-lg btn-glow">
                <Ticket size={20} />
                Book Now
              </Link>
            )}
            <Link to="/event" className="btn btn-secondary btn-lg">
              View Details
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section" id="about-section">
        <div className="container">
          <h2 className="section-title">Why Dandiya Nights?</h2>
          <div className="section-divider" />
          <p className="section-subtitle">
            Immerse yourself in the vibrant energy of Navratri with our grand Dandiya & Garba celebration.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--space-lg)',
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className="card"
                style={{
                  textAlign: 'center',
                  cursor: 'default',
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(230,57,70,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-lg)',
                  color: 'var(--color-primary-light)',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  marginBottom: 'var(--space-sm)',
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: 'var(--space-3xl) 0',
        background: 'linear-gradient(135deg, rgba(230,57,70,0.08) 0%, rgba(249,168,37,0.05) 100%)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 700,
            marginBottom: 'var(--space-md)',
            color: 'var(--color-text)',
          }}>
            Don't Miss the Biggest Dandiya Night!
          </h2>
          <p style={{
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-xl)',
            maxWidth: 600,
            margin: '0 auto var(--space-xl)',
          }}>
            Limited tickets available. Book now to secure your spot at the most talked-about Garba event of the season.
          </p>
          <Link to="/book" className="btn btn-primary btn-lg btn-glow">
            <Ticket size={20} /> Reserve Your Tickets
          </Link>
        </div>
      </section>
    </>
  );
}
