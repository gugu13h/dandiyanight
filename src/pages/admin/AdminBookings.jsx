// Admin Bookings Management
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToAllBookings, updateBookingStatus, deleteBooking } from '../../services/bookingService';
import { logAdminAction } from '../../services/adminService';
import { createNotification } from '../../services/notificationService';
import { formatCurrency, formatTimestamp, getStatusLabel, getStatusColor } from '../../utils/helpers';
import { getAllBookingsForExport } from '../../services/bookingService';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import {
  Search, Filter, Eye, CheckCircle2, Clock, XCircle, Ban, Trash2,
  Download, X, ExternalLink,
} from 'lucide-react';

export default function AdminBookings() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [verificationBooking, setVerificationBooking] = useState(null);

  useEffect(() => {
    const unsub = subscribeToAllBookings((data) => {
      setBookings(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleStatusChange = async (booking, newStatus) => {
    if (newStatus === 'PAYMENT_SUCCESSFUL') {
      setVerificationBooking(booking);
      return;
    }
    setProcessing(booking.bookingId);
    try {
      await updateBookingStatus(booking.bookingId, newStatus, currentUser.uid);
      await logAdminAction(currentUser.uid, `STATUS_${newStatus}`,
        `Changed ${booking.bookingId} to ${newStatus}`, booking.bookingId);
      await createNotification(booking.userId, `Booking ${getStatusLabel(newStatus)}`,
        `Your booking ${booking.bookingId} status has been updated to: ${getStatusLabel(newStatus)}`,
        newStatus === 'PAYMENT_SUCCESSFUL' ? 'success' : newStatus.includes('FAIL') ? 'error' : 'info');
      toast.success(`Booking updated to ${getStatusLabel(newStatus)}`);
    } catch (error) {
      toast.error(error.message || 'Failed to update booking');
    } finally {
      setProcessing(null);
    }
  };

  const handleVerifyPayment = async () => {
    if (!verificationBooking) return;
    setProcessing(verificationBooking.bookingId);
    try {
      await updateBookingStatus(verificationBooking.bookingId, 'PAYMENT_SUCCESSFUL', currentUser.uid);
      await logAdminAction(currentUser.uid, 'STATUS_PAYMENT_SUCCESSFUL',
        `Verified payment for ${verificationBooking.bookingId}`, verificationBooking.bookingId);
      await createNotification(verificationBooking.userId, 'Payment Verified',
        `Your payment for booking ${verificationBooking.bookingId} has been verified. Your tickets are ready.`, 'success');
      setVerificationBooking(null);
      toast.success('Payment verified and ticket approved');
    } catch (error) {
      toast.error(error.message || 'Failed to verify payment');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (booking) => {
    if (!window.confirm(`Delete booking ${booking.bookingId}? This will release its tickets.`)) return;
    setProcessing(booking.bookingId);
    try {
      await deleteBooking(booking.bookingId);
      await logAdminAction(currentUser.uid, 'BOOKING_DELETED', `Deleted ${booking.bookingId}`, booking.bookingId);
      setSelectedBooking(null);
      toast.success('Booking deleted');
    } catch (error) {
      toast.error(error.message || 'Failed to delete booking');
    } finally {
      setProcessing(null);
    }
  };

  const handleExport = async () => {
    try {
      const data = await getAllBookingsForExport();
      const csvData = data.map((b) => ({
        'Booking ID': b.bookingId,
        Name: b.name,
        Mobile: b.mobile,
        Email: b.email,
        'Ticket Numbers': b.ticketNumbers?.join('; '),
        'Ticket Count': b.ticketCount,
        'Price/Ticket': b.pricePerTicket,
        'Total Amount': b.totalAmount,
        Status: getStatusLabel(b.status),
        'Booking Date': b.createdAt?.toDate?.()?.toLocaleDateString() || '',
        'Checked In': b.checkedIn ? 'Yes' : 'No',
      }));
      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `dandiya-nights-bookings-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('Bookings exported successfully!');
    } catch (error) {
      toast.error('Failed to export bookings');
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch = !searchTerm ||
      b.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.mobile?.includes(searchTerm) ||
      b.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.ticketNumbers?.some((t) => String(t).includes(searchTerm));
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading bookings...</p></div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h1>Booking Management</h1>
            <p>{filtered.length} booking{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <button onClick={handleExport} className="btn btn-sm btn-outline">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input placeholder="Search by ID, name, mobile, email, ticket..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="REGISTRATION_PENDING">Registration Pending</option>
          <option value="PAYMENT_PENDING">Payment Pending</option>
          <option value="PAYMENT_PROOF_SUBMITTED">Payment Proof Submitted</option>
          <option value="PAYMENT_SUCCESSFUL">Payment Successful</option>
          <option value="PAYMENT_FAILED">Payment Failed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th><th>Name</th><th>Mobile</th><th>Tickets</th>
              <th>Amount</th><th>Payment</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-muted)' }}>
                No bookings found
              </td></tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.bookingId}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>{b.bookingId}</td>
                  <td>{b.name}</td>
                  <td>{b.mobile}</td>
                  <td>{b.ticketNumbers?.join(', ')}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>{formatCurrency(b.totalAmount)}</td>
                  <td>{b.paymentMethod === 'CASH' ? 'Paid by Cash' : 'Paid by Online'}</td>
                  <td>
                    <span className={`status-badge ${
                      b.status === 'PAYMENT_SUCCESSFUL' ? 'success' :
                      b.status === 'PAYMENT_FAILED' ? 'failed' :
                      b.status === 'PAYMENT_PENDING' ? 'info' :
                      b.status === 'CANCELLED' ? 'neutral' : 'pending'
                    }`}>
                      {getStatusLabel(b.status)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button onClick={() => setSelectedBooking(b)} className="btn btn-ghost btn-sm"
                        title="View"><Eye size={14} /></button>
                      {b.status === 'REGISTRATION_PENDING' && b.paymentMethod !== 'CASH' && (
                        <button onClick={() => handleStatusChange(b, 'PAYMENT_PENDING')}
                          className="btn btn-ghost btn-sm" title="Approve → Payment Pending"
                          disabled={processing === b.bookingId}>
                          <Clock size={14} style={{ color: 'var(--color-info)' }} />
                        </button>
                      )}
                      {b.paymentMethod === 'CASH' && b.status === 'REGISTRATION_PENDING' && (
                        <button onClick={() => handleStatusChange(b, 'PAYMENT_SUCCESSFUL')}
                          className="btn btn-ghost btn-sm" title="Verify cash payment"
                          disabled={processing === b.bookingId}>
                          <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                        </button>
                      )}
                      {['PAYMENT_PENDING', 'PAYMENT_PROOF_SUBMITTED'].includes(b.status) && (
                        <button onClick={() => handleStatusChange(b, 'PAYMENT_SUCCESSFUL')}
                          className="btn btn-ghost btn-sm" title="Mark Payment Successful"
                          disabled={processing === b.bookingId}>
                          <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                        </button>
                      )}
                      {['PAYMENT_PENDING'].includes(b.status) && (
                        <button onClick={() => handleStatusChange(b, 'PAYMENT_FAILED')}
                          className="btn btn-ghost btn-sm" title="Mark Payment Failed"
                          disabled={processing === b.bookingId}>
                          <XCircle size={14} style={{ color: 'var(--color-error)' }} />
                        </button>
                      )}
                      {!['CANCELLED', 'PAYMENT_SUCCESSFUL'].includes(b.status) && (
                        <button onClick={() => handleStatusChange(b, 'CANCELLED')}
                          className="btn btn-ghost btn-sm" title="Cancel Booking"
                          disabled={processing === b.bookingId}>
                          <Ban size={14} style={{ color: 'var(--color-text-muted)' }} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(b)} className="btn btn-ghost btn-sm"
                        title="Delete booking" disabled={processing === b.bookingId}>
                        <Trash2 size={14} style={{ color: 'var(--color-error)' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking: {selectedBooking.bookingId}</h2>
              <button className="modal-close" onClick={() => setSelectedBooking(null)}><X size={18} /></button>
            </div>
            <div className="booking-summary">
              {[
                ['Name', selectedBooking.name],
                ['Email', selectedBooking.email],
                ['Mobile', selectedBooking.mobile],
                ['Address', selectedBooking.address],
                ['Tickets', selectedBooking.ticketNumbers?.join(', ')],
                ['Count', selectedBooking.ticketCount],
                ['Price/Ticket', formatCurrency(selectedBooking.pricePerTicket)],
                ['Total', formatCurrency(selectedBooking.totalAmount)],
                ['Status', getStatusLabel(selectedBooking.status)],
                ['Created', formatTimestamp(selectedBooking.createdAt)],
                ['Payment Ref', selectedBooking.paymentReference || '-'],
                ['Checked In', selectedBooking.checkedIn ? '✅ Yes' : '❌ No'],
              ].map(([label, value]) => (
                <div key={label} className="booking-summary-row">
                  <span className="booking-summary-label">{label}</span>
                  <span className="booking-summary-value">{value}</span>
                </div>
              ))}
            </div>
            {selectedBooking.paymentProofUrl && (
              <div style={{ marginTop: 'var(--space-lg)' }}>
                <a href={selectedBooking.paymentProofUrl} target="_blank" rel="noopener noreferrer"
                  className="btn btn-sm btn-outline">
                  <ExternalLink size={14} /> View Payment Proof
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {verificationBooking && (
        <div className="modal-overlay" onClick={() => setVerificationBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Verify Payment</h2>
              <button className="modal-close" onClick={() => setVerificationBooking(null)}><X size={18} /></button>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
              Are you sure you want to verify payment for <strong>{verificationBooking.bookingId}</strong>?
            </p>
            <div className="booking-summary" style={{ marginBottom: 'var(--space-lg)' }}>
              <div className="booking-summary-row">
                <span className="booking-summary-label">Payment Method</span>
                <span className="booking-summary-value">{verificationBooking.paymentMethod === 'CASH' ? 'Paid by Cash' : 'Paid Online'}</span>
              </div>
              {verificationBooking.paymentMethod === 'ONLINE' && verificationBooking.paymentProofUrl ? (
                <div style={{ marginTop: 'var(--space-md)' }}>
                  {!verificationBooking.paymentProofUrl.toLowerCase().includes('.pdf') && (
                    <img src={verificationBooking.paymentProofUrl} alt="Uploaded payment screenshot"
                      style={{ display: 'block', maxWidth: '100%', maxHeight: 320, objectFit: 'contain', marginBottom: 'var(--space-md)', borderRadius: 'var(--radius-md)' }} />
                  )}
                  <a href={verificationBooking.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                    <ExternalLink size={14} /> View Uploaded Screenshot
                  </a>
                </div>
              ) : verificationBooking.paymentMethod === 'ONLINE' ? (
                <p style={{ color: 'var(--color-warning)', marginTop: 'var(--space-md)' }}>
                  User has not uploaded the payment screenshot.
                </p>
              ) : (
                <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-md)' }}>
                  Cash payment will be verified manually.
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setVerificationBooking(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleVerifyPayment} disabled={processing === verificationBooking.bookingId}>
                Verify & Approve Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
