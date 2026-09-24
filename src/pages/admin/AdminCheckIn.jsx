import { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, CheckCircle2 } from 'lucide-react';
import { verifyBooking } from '../../services/adminService';
import { formatTimestamp } from '../../utils/helpers';

export default function AdminCheckIn() {
  const [identifier, setIdentifier] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setLoading(true);
    setBooking(null);
    try {
      const result = await verifyBooking(identifier.trim());
      if (!result) toast.error('No booking found');
      else setBooking(result);
    } catch {
      toast.error('Unable to verify booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="dashboard-header"><h1>Check-In</h1><p>Verify a booking ID or ticket number at the entrance</p></div>
      <form className="search-filter-bar" onSubmit={handleVerify}>
        <div className="search-input-wrapper"><Search size={16} className="search-icon" /><input placeholder="Booking ID or ticket number" value={identifier} onChange={(e) => setIdentifier(e.target.value)} /></div>
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Checking...' : 'Verify'}</button>
      </form>
      {booking && <div className="card" style={{ maxWidth: 620 }}><div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-lg)' }}><CheckCircle2 color="var(--color-success)" /><h2 style={{ fontSize: '1.2rem' }}>Booking Verified</h2></div><p><strong>{booking.name}</strong></p><p>{booking.bookingId || booking.id}</p><p>{booking.ticketCount || 0} ticket(s)</p><p style={{ color: 'var(--color-text-muted)' }}>{formatTimestamp(booking.createdAt)}</p></div>}
    </div>
  );
}
