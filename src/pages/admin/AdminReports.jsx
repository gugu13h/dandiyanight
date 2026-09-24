import { useEffect, useState } from 'react';
import { subscribeToAllBookings } from '../../services/bookingService';
import { formatCurrency } from '../../utils/helpers';

export default function AdminReports() {
  const [bookings, setBookings] = useState(null);
  useEffect(() => subscribeToAllBookings(setBookings), []);
  if (!bookings) return <div className="loading-container"><div className="spinner" /><p>Loading reports...</p></div>;
  const successful = bookings.filter((booking) => booking.status === 'PAYMENT_SUCCESSFUL');
  const revenue = successful.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
  const tickets = successful.reduce((sum, booking) => sum + (booking.ticketCount || 0), 0);
  const rows = [['Total Bookings', bookings.length], ['Successful Bookings', successful.length], ['Tickets Sold', tickets], ['Revenue', formatCurrency(revenue)]];
  return <div><div className="dashboard-header"><h1>Reports</h1><p>Summary of booking and revenue performance</p></div><div className="stats-grid">{rows.map(([label, value]) => <div className="stat-card" key={label}><span className="stat-label">{label}</span><span className="stat-value">{value}</span></div>)}</div></div>;
}
