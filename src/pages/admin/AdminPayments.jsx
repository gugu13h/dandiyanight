// Admin Payments Page - View payment status of all bookings
import { useState, useEffect } from 'react';
import { subscribeToAllBookings } from '../../services/bookingService';
import { formatCurrency, formatTimestamp, getStatusLabel, getStatusColor } from '../../utils/helpers';
import { Search, ExternalLink } from 'lucide-react';

export default function AdminPayments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsub = subscribeToAllBookings((data) => { setBookings(data); setLoading(false); });
    return unsub;
  }, []);

  const filtered = bookings.filter((b) => {
    const matchFilter = filter === 'ALL' || b.status === filter;
    const matchSearch = !searchTerm ||
      b.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalSuccess = bookings.filter((b) => b.status === 'PAYMENT_SUCCESSFUL')
    .reduce((s, b) => s + (b.totalAmount || 0), 0);
  const totalPending = bookings.filter((b) => b.status === 'PAYMENT_PENDING')
    .reduce((s, b) => s + (b.totalAmount || 0), 0);

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading payments...</p></div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>Payments</h1>
        <p>Track payment status across all bookings</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="stat-card">
          <span className="stat-label">Successful Revenue</span>
          <span className="stat-value" style={{ background: 'linear-gradient(135deg, #10b981, #059669)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {formatCurrency(totalSuccess)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Amount</span>
          <span className="stat-value" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {formatCurrency(totalPending)}
          </span>
        </div>
      </div>

      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input placeholder="Search by booking ID or name..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">All</option>
          <option value="PAYMENT_PENDING">Payment Pending</option>
          <option value="PAYMENT_SUCCESSFUL">Successful</option>
          <option value="PAYMENT_FAILED">Failed</option>
        </select>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th><th>Name</th><th>Amount</th><th>Status</th>
              <th>Payment Ref</th><th>Proof</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-muted)' }}>
                No payments found
              </td></tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.bookingId}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>{b.bookingId}</td>
                  <td>{b.name}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>{formatCurrency(b.totalAmount)}</td>
                  <td>
                    <span className={`status-badge ${
                      b.status === 'PAYMENT_SUCCESSFUL' ? 'success' :
                      b.status === 'PAYMENT_FAILED' ? 'failed' :
                      b.status === 'PAYMENT_PENDING' ? 'info' : 'pending'
                    }`}>
                      {getStatusLabel(b.status)}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{b.paymentReference || '-'}</td>
                  <td>
                    {b.paymentProofUrl ? (
                      <a href={b.paymentProofUrl} target="_blank" rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"><ExternalLink size={14} /></a>
                    ) : '-'}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{formatTimestamp(b.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
