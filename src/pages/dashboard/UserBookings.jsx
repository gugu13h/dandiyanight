// User Bookings Page
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToUserBookings } from '../../services/bookingService';
import { formatCurrency, formatTimestamp, getStatusLabel, getStatusColor } from '../../utils/helpers';
import { BookOpen, Eye, Download, X } from 'lucide-react';
import TicketDownload from '../../components/TicketDownload';

export default function UserBookings() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showTicket, setShowTicket] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToUserBookings(currentUser.uid, (data) => {
      setBookings(data);
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading bookings...</p></div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>My Bookings</h1>
        <p>View and manage all your ticket bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Bookings Yet</h3>
          <p>You haven't made any bookings. Book your Dandiya Nights tickets now!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {bookings.map((booking) => (
            <div key={booking.bookingId} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Booking ID</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary-light)', fontSize: '1.1rem' }}>
                    {booking.bookingId}
                  </div>
                </div>
                <span className="status-badge" style={{
                  background: `${getStatusColor(booking.status)}20`,
                  color: getStatusColor(booking.status),
                  border: `1px solid ${getStatusColor(booking.status)}40`,
                }}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Tickets</div>
                  <div style={{ fontWeight: 600 }}>{booking.ticketNumbers?.join(', ')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Count</div>
                  <div style={{ fontWeight: 600 }}>{booking.ticketCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Total</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>
                    {formatCurrency(booking.totalAmount)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Booked On</div>
                  <div style={{ fontSize: '0.9rem' }}>{formatTimestamp(booking.createdAt)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                <button onClick={() => setSelectedBooking(booking)} className="btn btn-sm btn-outline">
                  <Eye size={14} /> View Details
                </button>
                {booking.status === 'PAYMENT_SUCCESSFUL' && (
                  <button onClick={() => setShowTicket(booking)} className="btn btn-sm btn-success">
                    <Download size={14} /> Download Ticket
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button className="modal-close" onClick={() => setSelectedBooking(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="booking-summary">
              {[
                ['Booking ID', selectedBooking.bookingId],
                ['Name', selectedBooking.name],
                ['Email', selectedBooking.email],
                ['Mobile', selectedBooking.mobile],
                ['Tickets', selectedBooking.ticketNumbers?.join(', ')],
                ['Count', selectedBooking.ticketCount],
                ['Price/Ticket', formatCurrency(selectedBooking.pricePerTicket)],
                ['Total', formatCurrency(selectedBooking.totalAmount)],
                ['Status', getStatusLabel(selectedBooking.status)],
                ['Booked On', formatTimestamp(selectedBooking.createdAt)],
                ['Check-in', selectedBooking.checkedIn ? `✅ ${formatTimestamp(selectedBooking.checkedInAt)}` : '❌ Not checked in'],
              ].map(([label, value]) => (
                <div key={label} className="booking-summary-row">
                  <span className="booking-summary-label">{label}</span>
                  <span className="booking-summary-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ticket Download Modal */}
      {showTicket && (
        <div className="modal-overlay" onClick={() => setShowTicket(null)}>
          <div className="modal-content" style={{ maxWidth: 550 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Your Ticket</h2>
              <button className="modal-close" onClick={() => setShowTicket(null)}>
                <X size={18} />
              </button>
            </div>
            <TicketDownload booking={showTicket} />
          </div>
        </div>
      )}
    </div>
  );
}
