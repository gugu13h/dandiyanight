import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToAllBookings } from '../../services/bookingService';
import { logAdminAction } from '../../services/adminService';
import { subscribeToTickets, updateSweetDistribution } from '../../services/ticketService';
import toast from 'react-hot-toast';
import { Check, Gift, Undo2, X } from 'lucide-react';

const SWEET_TICKET_COUNT = 120;
const UNAVAILABLE_BOOKING_STATUSES = new Set(['CANCELLED', 'PAYMENT_FAILED', 'EXPIRED']);

export default function AdminSweetDistribution() {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [ticketsLoaded, setTicketsLoaded] = useState(false);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);
  const [selectedTicketNumber, setSelectedTicketNumber] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribeTickets = subscribeToTickets((data) => {
      setTickets(data);
      setTicketsLoaded(true);
    });
    const unsubscribeBookings = subscribeToAllBookings((data) => {
      setBookings(data);
      setBookingsLoaded(true);
    });
    return () => {
      unsubscribeTickets();
      unsubscribeBookings();
    };
  }, []);

  const ticketByNumber = new Map(tickets.map((ticket) => [Number(ticket.ticketNumber), ticket]));
  const bookingById = new Map(bookings.map((booking) => [booking.bookingId || booking.id, booking]));
  const bookingByTicket = new Map();
  bookings.forEach((booking) => {
    if (
      (booking.eventId || 'default') !== 'default' ||
      UNAVAILABLE_BOOKING_STATUSES.has(booking.status)
    ) return;

    (booking.ticketNumbers || []).forEach((rawTicketNumber) => {
      const number = Number(rawTicketNumber);
      if (
        number >= 1 && number <= SWEET_TICKET_COUNT &&
        !bookingByTicket.has(number)
      ) {
        bookingByTicket.set(number, booking);
      }
    });
  });
  tickets.forEach((ticket) => {
    const number = Number(ticket.ticketNumber);
    const booking = bookingById.get(ticket.bookingId);
    if (
      number >= 1 && number <= SWEET_TICKET_COUNT && booking &&
      !UNAVAILABLE_BOOKING_STATUSES.has(booking.status)
    ) {
      bookingByTicket.set(number, booking);
    }
  });

  const selectedTicket = selectedTicketNumber === null
    ? null
    : ticketByNumber.get(selectedTicketNumber);
  const selectedBooking = selectedTicketNumber === null
    ? null
    : bookingByTicket.get(selectedTicketNumber);
  const selectedTicketReceived = selectedTicket?.sweetReceived === true;
  const loading = !ticketsLoaded || !bookingsLoaded;
  const receivedCount = tickets.filter((ticket) => (
    Number(ticket.ticketNumber) <= SWEET_TICKET_COUNT && ticket.sweetReceived === true
  )).length;

  const handleToggleReceived = async () => {
    if (!selectedTicketNumber || !selectedBooking || saving) return;
    const received = !selectedTicketReceived;
    setSaving(true);
    try {
      await updateSweetDistribution(selectedTicketNumber, received, currentUser.uid);
      await logAdminAction(
        currentUser.uid,
        received ? 'SWEET_RECEIVED' : 'SWEET_RECEIVED_UNDONE',
        `Ticket #${selectedTicketNumber} for ${selectedBooking.name || 'unknown guest'}`,
        selectedBooking.bookingId
      );
      toast.success(received ? 'Sweet marked as received' : 'Sweet receipt undone');
    } catch (error) {
      toast.error(error.message || 'Unable to update sweet distribution');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading sweet distribution...</p></div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>Sweet Distribution</h1>
        <p>Choose a ticket to view its booking and update sweet collection.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card">
          <span className="stat-label">Ticket Slots</span>
          <span className="stat-value">{SWEET_TICKET_COUNT}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Booked Tickets</span>
          <span className="stat-value">{bookingByTicket.size}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Sweets Received</span>
          <span className="stat-value" style={{ color: 'var(--color-success)' }}>{receivedCount}</span>
        </div>
      </div>

      <div className="card">
        <div className="ticket-legend" style={{ justifyContent: 'flex-start' }}>
          <div className="ticket-legend-item">
            <div className="ticket-legend-color" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
            Sweet not received
          </div>
          <div className="ticket-legend-item">
            <div className="ticket-legend-color" style={{ background: 'rgba(16,185,129,0.2)', borderColor: 'var(--color-success)' }} />
            Sweet received
          </div>
        </div>
        <div className="ticket-grid">
          {Array.from({ length: SWEET_TICKET_COUNT }, (_, index) => index + 1).map((ticketNumber) => {
            const ticket = ticketByNumber.get(ticketNumber);
            const booking = bookingByTicket.get(ticketNumber);
            const received = ticket?.sweetReceived === true;
            return (
              <button
                key={ticketNumber}
                type="button"
                className={`ticket-cell ${received ? 'sweet-received' : 'available'}`}
                style={received ? {
                  background: 'rgba(16,185,129,0.2)',
                  borderColor: 'var(--color-success)',
                  color: 'var(--color-success)',
                } : undefined}
                onClick={() => setSelectedTicketNumber(ticketNumber)}
                title={`Ticket #${ticketNumber}${booking ? ` - ${booking.name || 'Booked'}` : ' - No booking'}`}
                aria-label={`Ticket ${ticketNumber}${received ? ', sweet received' : ''}`}
              >
                {ticketNumber}
              </button>
            );
          })}
        </div>
      </div>

      {selectedTicketNumber !== null && (
        <div className="modal-overlay" onClick={() => setSelectedTicketNumber(null)}>
          <div className="modal-content" style={{ maxWidth: 480 }} onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Ticket #{selectedTicketNumber}</h2>
              <button className="modal-close" onClick={() => setSelectedTicketNumber(null)} aria-label="Close ticket details">
                <X size={18} />
              </button>
            </div>
            {selectedBooking ? (
              <>
                <div className="booking-summary">
                  <div className="booking-summary-row">
                    <span className="booking-summary-label">Booked By</span>
                    <span className="booking-summary-value">{selectedBooking.name || 'Name unavailable'}</span>
                  </div>
                  <div className="booking-summary-row">
                    <span className="booking-summary-label">Booking ID</span>
                    <span className="booking-summary-value">{selectedBooking.bookingId || selectedBooking.id}</span>
                  </div>
                  <div className="booking-summary-row">
                    <span className="booking-summary-label">Mobile</span>
                    <span className="booking-summary-value">{selectedBooking.mobile || 'Not provided'}</span>
                  </div>
                  <div className="booking-summary-row">
                    <span className="booking-summary-label">Booking Status</span>
                    <span className="booking-summary-value">{selectedBooking.status || 'Unknown'}</span>
                  </div>
                  <div className="booking-summary-row">
                    <span className="booking-summary-label">Sweet Status</span>
                    <span className="booking-summary-value">
                      {selectedTicketReceived ? 'Received' : 'Not received'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={selectedTicketReceived ? 'btn btn-outline' : 'btn btn-success'}
                  style={{ width: '100%', marginTop: 'var(--space-lg)' }}
                  onClick={handleToggleReceived}
                  disabled={saving}
                >
                  {selectedTicketReceived
                    ? <><Undo2 size={17} /> Undo Sweet Received</>
                    : <><Gift size={17} /> <Check size={17} /> Mark Sweet Received</>}
                </button>
              </>
            ) : (
              <p style={{ color: 'var(--color-text-secondary)' }}>
                No active booking is linked to this ticket.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}