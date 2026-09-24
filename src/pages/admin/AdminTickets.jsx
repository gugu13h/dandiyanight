// Admin Ticket Management
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToTickets, initializeTickets } from '../../services/ticketService';
import { subscribeToEvent, updateEvent } from '../../services/eventService';
import { createBooking, updateBookingStatus } from '../../services/bookingService';
import { logAdminAction } from '../../services/adminService';
import { formatCurrency, getTicketStatusLabel, validateMobile, validateName } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Ticket, Save, Loader2, AlertTriangle, User, Phone, CheckCircle2 } from 'lucide-react';

export default function AdminTickets() {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalTickets, setTotalTickets] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [directName, setDirectName] = useState('');
  const [directMobile, setDirectMobile] = useState('');
  const [selectedDirectTickets, setSelectedDirectTickets] = useState([]);
  const [directBooking, setDirectBooking] = useState(false);

  useEffect(() => {
    const unsub1 = subscribeToTickets((data) => { setTickets(data); setLoading(false); });
    const unsub2 = subscribeToEvent('default', (e) => {
      setEvent(e);
      if (e) {
        setTotalTickets(String(e.totalTickets || 100));
        setTicketPrice(String(e.ticketPrice || 500));
      }
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const soldCount = tickets.filter((t) => ['APPROVED', 'CHECKED_IN'].includes(t.status)).length;
  const reservedCount = tickets.filter((t) => ['RESERVED', 'PAYMENT_PENDING'].includes(t.status)).length;
  const ticketCount = Math.max(1, parseInt(totalTickets, 10) || 100);
  const ticketNumbers = Array.from({ length: ticketCount }, (_, index) => index + 1);
  const ticketByNumber = new Map(tickets.map((ticket) => [ticket.ticketNumber, ticket]));
  const availableCount = ticketNumbers.filter((number) => {
    const ticket = ticketByNumber.get(number);
    return !ticket || ticket.status === 'AVAILABLE';
  }).length;

  const isTicketAvailable = (ticketNumber) => {
    const ticket = ticketByNumber.get(ticketNumber);
    return !ticket || ticket.status === 'AVAILABLE';
  };

  const toggleDirectTicket = (ticketNumber) => {
    if (!isTicketAvailable(ticketNumber)) return;
    setSelectedDirectTickets((current) => current.includes(ticketNumber)
      ? current.filter((number) => number !== ticketNumber)
      : [...current, ticketNumber].sort((first, second) => first - second));
  };

  const handleDirectBooking = async () => {
    if (!validateName(directName)) {
      toast.error('Enter a valid customer name');
      return;
    }
    if (!validateMobile(directMobile)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    if (selectedDirectTickets.length === 0) {
      toast.error('Select at least one ticket');
      return;
    }

    setDirectBooking(true);
    try {
      const bookingId = await createBooking(currentUser.uid, {
        name: directName.trim(),
        email: '',
        mobile: directMobile.trim(),
        address: 'Direct booking by admin',
        eventId: 'default',
        pricePerTicket: Number(ticketPrice) || 0,
        paymentMethod: 'CASH',
      }, selectedDirectTickets);

      await updateBookingStatus(bookingId, 'PAYMENT_SUCCESSFUL', currentUser.uid);
      await logAdminAction(currentUser.uid, 'DIRECT_BOOKING_CREATED',
        `${directName.trim()} - Tickets: ${selectedDirectTickets.join(', ')}`, bookingId);
      setDirectName('');
      setDirectMobile('');
      setSelectedDirectTickets([]);
      toast.success(`Booking ${bookingId} created successfully`);
    } catch (error) {
      toast.error(error.message || 'Unable to create direct booking');
    } finally {
      setDirectBooking(false);
    }
  };

  const handleSave = async () => {
    const newTotal = parseInt(totalTickets);
    const newPrice = parseFloat(ticketPrice);

    if (isNaN(newTotal) || newTotal < 1) { toast.error('Invalid ticket quantity'); return; }
    if (isNaN(newPrice) || newPrice < 0) { toast.error('Invalid ticket price'); return; }
    if (newTotal < soldCount) {
      toast.error(`Cannot reduce below ${soldCount} (already sold/approved)`);
      return;
    }

    setSaving(true);
    try {
      await updateEvent('default', { totalTickets: newTotal, ticketPrice: newPrice });
      if (newTotal > tickets.length) {
        await initializeTickets(newTotal);
      }
      await logAdminAction(currentUser.uid, 'TICKET_CONFIG_CHANGED',
        `Tickets: ${newTotal}, Price: ₹${newPrice}`);
      toast.success('Ticket configuration updated!');
    } catch (error) {
      toast.error('Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading tickets...</p></div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <p>Configure ticket quantity, pricing, and view ticket status</p>
      </div>

      {/* Direct admin booking */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.1rem', fontWeight: 700,
          marginBottom: 'var(--space-sm)' }}>
          Direct Booking
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--space-lg)' }}>
          Enter customer details and select available tickets for an onsite booking.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="direct-booking-name"><User size={14} style={{ display: 'inline', marginRight: 6 }} />Customer Name</label>
            <input id="direct-booking-name" className="form-input" value={directName}
              onChange={(e) => setDirectName(e.target.value)} placeholder="Enter customer name" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="direct-booking-mobile"><Phone size={14} style={{ display: 'inline', marginRight: 6 }} />Mobile Number</label>
            <input id="direct-booking-mobile" className="form-input" value={directMobile}
              onChange={(e) => setDirectMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210" inputMode="numeric" maxLength={10} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
          <strong>Select Tickets ({selectedDirectTickets.length} selected)</strong>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Available: {availableCount} / {ticketCount}
          </span>
        </div>
        <div className="ticket-grid" style={{ marginBottom: 'var(--space-lg)' }}>
          {ticketNumbers.map((ticketNumber) => {
            const available = isTicketAvailable(ticketNumber);
            const selected = selectedDirectTickets.includes(ticketNumber);
            const status = ticketByNumber.get(ticketNumber)?.status;
            return (
              <button key={ticketNumber} type="button"
                className={`ticket-cell ${selected ? 'selected' : available ? 'available' : 'unavailable'}`}
                onClick={() => toggleDirectTicket(ticketNumber)} disabled={!available}
                title={available ? `Select ticket ${ticketNumber}` : getTicketStatusLabel(status)}>
                {ticketNumber}
              </button>
            );
          })}
        </div>
        <button onClick={handleDirectBooking} className="btn btn-primary" disabled={directBooking || selectedDirectTickets.length === 0}>
          {directBooking ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Booking...</>
            : <><CheckCircle2 size={16} /> Book Selected Tickets</>}
        </button>
      </div>

      {/* Config Card */}
      <div className="card" style={{ maxWidth: 600, marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.1rem', fontWeight: 700,
          marginBottom: 'var(--space-lg)' }}>
          Ticket Configuration
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
          <div className="form-group">
            <label className="form-label">Total Tickets</label>
            <input className="form-input" type="number" value={totalTickets}
              onChange={(e) => setTotalTickets(e.target.value)} min={soldCount} />
            <span className="form-hint">Min: {soldCount} (already sold)</span>
          </div>
          <div className="form-group">
            <label className="form-label">Price per Ticket (₹)</label>
            <input className="form-input" type="number" value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)} min={0} />
            <span className="form-hint">Applies to new bookings only</span>
          </div>
        </div>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
          {saving ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
            : <><Save size={16} /> Save Configuration</>}
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card">
          <span className="stat-label">Total</span>
          <span className="stat-value">{ticketCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Available</span>
          <span className="stat-value" style={{ background: 'linear-gradient(135deg, #10b981, #059669)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{availableCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Reserved</span>
          <span className="stat-value" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{reservedCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Sold/Approved</span>
          <span className="stat-value" style={{ background: 'linear-gradient(135deg, #e63946, #dc2626)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{soldCount}</span>
        </div>
      </div>

      {/* Ticket Grid */}
      <div className="card">
        <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.1rem', fontWeight: 700,
          marginBottom: 'var(--space-md)' }}>
          Ticket Map
        </h2>
        <div className="ticket-legend" style={{ marginBottom: 'var(--space-md)' }}>
          {[
            { label: 'Available', bg: 'var(--color-surface)', border: 'var(--color-border)' },
            { label: 'Reserved', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
            { label: 'Approved', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
            { label: 'Checked In', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)' },
          ].map((item) => (
            <div key={item.label} className="ticket-legend-item">
              <div className="ticket-legend-color" style={{ background: item.bg, borderColor: item.border }} />
              {item.label}
            </div>
          ))}
        </div>
        <div className="ticket-grid">
          {ticketNumbers.map((ticketNumber) => {
            const ticket = ticketByNumber.get(ticketNumber);
            const status = ticket?.status || 'AVAILABLE';
            let className = 'ticket-cell ';
            if (status === 'AVAILABLE') className += 'available';
            else if (['RESERVED', 'PAYMENT_PENDING'].includes(status)) className += 'reserved';
            else if (status === 'APPROVED') className += 'approved';
            else if (status === 'CHECKED_IN') className += 'checked-in';
            else className += 'unavailable';

            return (
              <div key={ticketNumber} className={className}
                style={{ cursor: 'default' }} title={`#${ticketNumber} - ${getTicketStatusLabel(status)}`}>
                {ticketNumber}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
