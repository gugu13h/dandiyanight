// Admin Dashboard Home - Stats overview
import { useState, useEffect } from 'react';
import { subscribeToAllBookings } from '../../services/bookingService';
import { getTicketStats } from '../../services/ticketService';
import { subscribeToUsers } from '../../services/adminService';
import { formatCurrency } from '../../utils/helpers';
import {
  Ticket, BookOpen, Users, CreditCard, CheckCircle2,
  AlertCircle, XCircle, Clock, DollarSign, BarChart3,
} from 'lucide-react';

export default function AdminDashboardHome() {
  const [bookings, setBookings] = useState([]);
  const [ticketStats, setTicketStats] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub1 = subscribeToAllBookings((data) => {
      setBookings(data);
      setLoading(false);
    });
    const unsub2 = subscribeToUsers((users) => setUserCount(users.length));
    getTicketStats().then(setTicketStats);
    return () => { unsub1(); unsub2(); };
  }, []);

  const stats = {
    total: bookings.length,
    regPending: bookings.filter((b) => b.status === 'REGISTRATION_PENDING').length,
    payPending: bookings.filter((b) => b.status === 'PAYMENT_PENDING').length,
    paySuccess: bookings.filter((b) => b.status === 'PAYMENT_SUCCESSFUL').length,
    payFailed: bookings.filter((b) => b.status === 'PAYMENT_FAILED').length,
    cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
    totalRevenue: bookings
      .filter((b) => b.status === 'PAYMENT_SUCCESSFUL')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    pendingRevenue: bookings
      .filter((b) => b.status === 'PAYMENT_PENDING')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    ticketsSold: bookings
      .filter((b) => b.status === 'PAYMENT_SUCCESSFUL')
      .reduce((sum, b) => sum + (b.ticketCount || 0), 0),
    checkedIn: bookings.filter((b) => b.checkedIn).length,
  };

  const statCards = [
    { icon: <Ticket size={20} />, label: 'Total Tickets', value: ticketStats?.total || 0, color: '#6366f1' },
    { icon: <Ticket size={20} />, label: 'Available', value: ticketStats?.available || 0, color: '#10b981' },
    { icon: <BookOpen size={20} />, label: 'Total Bookings', value: stats.total, color: '#3b82f6' },
    { icon: <Clock size={20} />, label: 'Reg. Pending', value: stats.regPending, color: '#f59e0b' },
    { icon: <CreditCard size={20} />, label: 'Pay. Pending', value: stats.payPending, color: '#3b82f6' },
    { icon: <CheckCircle2 size={20} />, label: 'Successful', value: stats.paySuccess, color: '#10b981' },
    { icon: <XCircle size={20} />, label: 'Failed', value: stats.payFailed, color: '#ef4444' },
    { icon: <AlertCircle size={20} />, label: 'Cancelled', value: stats.cancelled, color: '#6b7280' },
    { icon: <Users size={20} />, label: 'Registered Users', value: userCount, color: '#8b5cf6' },
    { icon: <DollarSign size={20} />, label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), color: '#10b981' },
    { icon: <DollarSign size={20} />, label: 'Pending Amount', value: formatCurrency(stats.pendingRevenue), color: '#f59e0b' },
    { icon: <BarChart3 size={20} />, label: 'Tickets Sold', value: stats.ticketsSold, color: '#e63946' },
  ];

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading dashboard...</p></div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of Dandiya Nights event management</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="stat-label">{card.label}</span>
              <span style={{ color: card.color, opacity: 0.7 }}>{card.icon}</span>
            </div>
            <div className="stat-value" style={{
              background: `linear-gradient(135deg, ${card.color}, ${card.color}99)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.1rem', fontWeight: 700,
          marginBottom: 'var(--space-lg)' }}>
          Recent Bookings
        </h2>
        {bookings.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No bookings yet.</p>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th><th>Name</th><th>Tickets</th><th>Amount</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 10).map((b) => (
                  <tr key={b.bookingId}>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>{b.bookingId}</td>
                    <td>{b.name}</td>
                    <td>{b.ticketCount}</td>
                    <td style={{ color: 'var(--color-secondary)' }}>{formatCurrency(b.totalAmount)}</td>
                    <td>
                      <span className={`status-badge ${
                        b.status === 'PAYMENT_SUCCESSFUL' ? 'success' :
                        b.status === 'PAYMENT_FAILED' ? 'failed' :
                        b.status === 'PAYMENT_PENDING' ? 'info' :
                        b.status === 'CANCELLED' ? 'neutral' : 'pending'
                      }`}>
                        {b.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
