// Admin Ticket Management
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToTickets, initializeTickets } from '../../services/ticketService';
import { subscribeToEvent, updateEvent } from '../../services/eventService';
import { logAdminAction } from '../../services/adminService';
import { formatCurrency, getTicketStatusLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Ticket, Save, Loader2, AlertTriangle } from 'lucide-react';

export default function AdminTickets() {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalTickets, setTotalTickets] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [saving, setSaving] = useState(false);

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
  const availableCount = tickets.filter((t) => t.status === 'AVAILABLE').length;

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
        <h1>Ticket Management</h1>
        <p>Configure ticket quantity, pricing, and view ticket status</p>
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
          <span className="stat-value">{tickets.length}</span>
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
          {tickets.map((ticket) => {
            let className = 'ticket-cell ';
            if (ticket.status === 'AVAILABLE') className += 'available';
            else if (['RESERVED', 'PAYMENT_PENDING'].includes(ticket.status)) className += 'reserved';
            else if (ticket.status === 'APPROVED') className += 'approved';
            else if (ticket.status === 'CHECKED_IN') className += 'checked-in';
            else className += 'unavailable';

            return (
              <div key={ticket.ticketNumber} className={className}
                style={{ cursor: 'default' }} title={`#${ticket.ticketNumber} - ${getTicketStatusLabel(ticket.status)}`}>
                {ticket.ticketNumber}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
