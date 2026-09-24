// User Dashboard Home
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscribeToUserBookings } from '../../services/bookingService';
import { subscribeToEvent } from '../../services/eventService';
import { subscribeToNotifications } from '../../services/notificationService';
import { formatCurrency, formatDate, formatTime, getStatusLabel, getStatusColor } from '../../utils/helpers';
import { Calendar, Clock, MapPin, Ticket, Bell, BookOpen } from 'lucide-react';

export default function UserDashboardHome() {
  const { currentUser, userProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [event, setEvent] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const unsub1 = subscribeToUserBookings(currentUser.uid, setBookings);
    const unsub2 = subscribeToEvent('default', setEvent);
    const unsub3 = subscribeToNotifications(currentUser.uid, setNotifications);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeBooking = bookings.find((b) => ['REGISTRATION_PENDING', 'PAYMENT_PENDING', 'PAYMENT_PROOF_SUBMITTED', 'PAYMENT_SUCCESSFUL'].includes(b.status));
  const totalTickets = bookings.reduce((sum, b) => sum + (b.ticketCount || 0), 0);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Welcome, {userProfile?.name || 'User'}! 🪔</h1>
        <p>Manage your bookings and tickets for Dandiya Nights.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><BookOpen size={24} /></div>
          <div className="stat-value">{bookings.length}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Ticket size={24} /></div>
          <div className="stat-value">{totalTickets}</div>
          <div className="stat-label">Total Tickets</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Bell size={24} /></div>
          <div className="stat-value">{unreadCount}</div>
          <div className="stat-label">Unread Notifications</div>
        </div>
      </div>

      {/* Upcoming Event */}
      {event && (
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.2rem', fontWeight: 700,
            marginBottom: 'var(--space-lg)', color: 'var(--color-secondary)' }}>
            🎉 Upcoming Event
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <Calendar size={16} style={{ color: 'var(--color-primary-light)' }} />
              <span>{formatDate(event.date)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <Clock size={16} style={{ color: 'var(--color-primary-light)' }} />
              <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <MapPin size={16} style={{ color: 'var(--color-primary-light)' }} />
              <span>{event.venue}</span>
            </div>
          </div>
          {!activeBooking && (
            <Link to="/book" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
              <Ticket size={16} /> Book Tickets
            </Link>
          )}
        </div>
      )}

      {/* Active Booking */}
      {activeBooking && (
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.2rem', fontWeight: 700,
            marginBottom: 'var(--space-lg)' }}>
            Active Booking
          </h2>
          <div className="booking-summary">
            <div className="booking-summary-row">
              <span className="booking-summary-label">Booking ID</span>
              <span className="booking-summary-value" style={{ color: 'var(--color-primary-light)' }}>
                {activeBooking.bookingId}
              </span>
            </div>
            <div className="booking-summary-row">
              <span className="booking-summary-label">Tickets</span>
              <span className="booking-summary-value">
                {activeBooking.ticketNumbers?.join(', ')}
              </span>
            </div>
            <div className="booking-summary-row">
              <span className="booking-summary-label">Amount</span>
              <span className="booking-summary-value">{formatCurrency(activeBooking.totalAmount)}</span>
            </div>
            <div className="booking-summary-row">
              <span className="booking-summary-label">Status</span>
              <span className="status-badge" style={{
                background: `${getStatusColor(activeBooking.status)}20`,
                color: getStatusColor(activeBooking.status),
                border: `1px solid ${getStatusColor(activeBooking.status)}40`,
              }}>
                {getStatusLabel(activeBooking.status)}
              </span>
            </div>
          </div>
          <Link to="/dashboard/bookings" className="btn btn-outline" style={{ marginTop: 'var(--space-lg)' }}>
            View All Bookings
          </Link>
        </div>
      )}

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
        <Link to="/dashboard/bookings" className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
          <BookOpen size={24} style={{ color: 'var(--color-primary-light)', marginBottom: 'var(--space-sm)' }} />
          <div style={{ fontWeight: 600 }}>My Bookings</div>
        </Link>
        <Link to="/dashboard/tickets" className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
          <Ticket size={24} style={{ color: 'var(--color-secondary)', marginBottom: 'var(--space-sm)' }} />
          <div style={{ fontWeight: 600 }}>My Tickets</div>
        </Link>
        <Link to="/dashboard/notifications" className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
          <Bell size={24} style={{ color: 'var(--color-info)', marginBottom: 'var(--space-sm)' }} />
          <div style={{ fontWeight: 600 }}>Notifications {unreadCount > 0 && `(${unreadCount})`}</div>
        </Link>
      </div>
    </div>
  );
}
