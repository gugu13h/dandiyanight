// User Tickets Page - View approved tickets with download
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToUserBookings } from '../../services/bookingService';
import { formatCurrency, getStatusLabel, getStatusColor } from '../../utils/helpers';
import TicketDownload from '../../components/TicketDownload';
import { Ticket, Download, X } from 'lucide-react';

export default function UserTickets() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
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
    return <div className="loading-container"><div className="spinner" /><p>Loading tickets...</p></div>;
  }

  const approvedBookings = bookings.filter((b) => b.status === 'PAYMENT_SUCCESSFUL');
  const pendingBookings = bookings.filter((b) => ['REGISTRATION_PENDING', 'PAYMENT_PENDING', 'PAYMENT_PROOF_SUBMITTED'].includes(b.status));

  return (
    <div>
      <div className="dashboard-header">
        <h1>My Tickets</h1>
        <p>View and download your approved tickets</p>
      </div>

      {approvedBookings.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.1rem', fontWeight: 700,
            marginBottom: 'var(--space-md)', color: 'var(--color-success)' }}>
            ✅ Approved Tickets
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            {approvedBookings.map((booking) => (
              <div key={booking.bookingId} className="card" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>{booking.bookingId}</div>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                      Tickets: {booking.ticketNumbers?.join(', ')} | {formatCurrency(booking.totalAmount)}
                    </div>
                    {booking.checkedIn && (
                      <div style={{ color: 'var(--color-success)', fontSize: '0.8rem', marginTop: 4 }}>
                        ✅ Checked In
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowTicket(booking)} className="btn btn-sm btn-success">
                    <Download size={14} /> Download Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {pendingBookings.length > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.1rem', fontWeight: 700,
            marginBottom: 'var(--space-md)', color: 'var(--color-warning)' }}>
            ⏳ Pending Tickets
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {pendingBookings.map((booking) => (
              <div key={booking.bookingId} className="card" style={{ opacity: 0.8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{booking.bookingId}</div>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                      Tickets: {booking.ticketNumbers?.join(', ')}
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
              </div>
            ))}
          </div>
        </>
      )}

      {bookings.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <h3>No Tickets</h3>
          <p>You don't have any tickets yet. Book your tickets to get started!</p>
        </div>
      )}

      {showTicket && (
        <div className="modal-overlay" onClick={() => setShowTicket(null)}>
          <div className="modal-content" style={{ maxWidth: 550 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Your Ticket</h2>
              <button className="modal-close" onClick={() => setShowTicket(null)}><X size={18} /></button>
            </div>
            <TicketDownload booking={showTicket} />
          </div>
        </div>
      )}
    </div>
  );
}
