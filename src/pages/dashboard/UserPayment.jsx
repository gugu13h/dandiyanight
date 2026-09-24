// User Payment Page - Upload payment proof & view payment info
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToUserBookings, updatePaymentProof } from '../../services/bookingService';
import { getPaymentSettings } from '../../services/adminService';
import { uploadCloudinaryImage } from '../../services/cloudinaryService';
import { formatCurrency, getStatusLabel, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Upload, CreditCard, Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function UserPayment() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [file, setFile] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToUserBookings(currentUser.uid, (data) => {
      setBookings(data);
      setLoading(false);
    });
    getPaymentSettings().then(setPaymentSettings).catch(console.error);
    return unsub;
  }, [currentUser]);

  const pendingBookings = bookings.filter((b) =>
    ['PAYMENT_PENDING', 'PAYMENT_PROOF_SUBMITTED', 'REGISTRATION_PENDING'].includes(b.status)
  );

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowed.includes(selected.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    setFile(selected);
  };

  const handleUpload = async (bookingId) => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    setUploading(bookingId);
    try {
      const url = await uploadCloudinaryImage(
        file,
        `dandiya-nights/payment-proofs/${bookingId}`
      );
      await updatePaymentProof(bookingId, url, utrNumber || null);
      toast.success('Payment proof uploaded successfully!');
      setFile(null);
      setUtrNumber('');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload payment proof.');
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading payment info...</p></div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>Payment</h1>
        <p>View payment details and upload payment proof</p>
      </div>

      {/* Payment Information */}
      {paymentSettings && (paymentSettings.upiId || paymentSettings.instructions) && (
        <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
          <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.1rem', fontWeight: 700,
            marginBottom: 'var(--space-lg)', color: 'var(--color-secondary)' }}>
            <CreditCard size={18} style={{ display: 'inline', marginRight: 8 }} />
            Payment Information
          </h2>
          {paymentSettings.upiId && (
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>UPI ID</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)' }}>
                {paymentSettings.upiId}
              </div>
            </div>
          )}
          {paymentSettings.qrCodeUrl && (
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <img src={paymentSettings.qrCodeUrl} alt="Payment QR Code"
                style={{ maxWidth: 200, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
            </div>
          )}
          {paymentSettings.instructions && (
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>
              {paymentSettings.instructions}
            </div>
          )}
          {paymentSettings.contactNumber && (
            <div style={{ marginTop: 'var(--space-md)' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Payment Contact: </span>
              <a href={`tel:${paymentSettings.contactNumber}`} style={{ color: 'var(--color-primary-light)' }}>
                {paymentSettings.contactNumber}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Pending Payment Bookings */}
      {pendingBookings.length > 0 ? (
        <>
          <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.1rem', fontWeight: 700,
            marginBottom: 'var(--space-md)' }}>
            Bookings Awaiting Payment
          </h2>
          {pendingBookings.map((booking) => (
            <div key={booking.bookingId} className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',
                gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>{booking.bookingId}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Tickets: {booking.ticketNumbers?.join(', ')} | {formatCurrency(booking.totalAmount)}
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

              {booking.paymentQrCodeUrl && booking.status === 'PAYMENT_PENDING' && (
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                    Scan this QR code to pay
                  </div>
                  <img src={booking.paymentQrCodeUrl} alt={`Payment QR code for ${booking.bookingId}`}
                    style={{ maxWidth: 220, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                </div>
              )}

              {booking.paymentProofUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                  color: 'var(--color-success)', fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} /> Payment proof uploaded
                  <a href={booking.paymentProofUrl} target="_blank" rel="noopener noreferrer"
                    className="btn btn-sm btn-ghost"><ExternalLink size={14} /> View</a>
                </div>
              ) : booking.status === 'PAYMENT_PENDING' ? (
                <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)',
                  background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
                    Upload Payment Proof
                  </div>
                  <div className="form-group">
                    <label className="form-label">UTR / Transaction Reference (optional)</label>
                    <input className="form-input" placeholder="Enter UTR number"
                      value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Screenshot (JPG, PNG, PDF - Max 5MB)</label>
                    <label htmlFor={`payment-proof-${booking.bookingId}`} className="btn btn-outline btn-sm" style={{ display: 'inline-flex' }}>
                      <Upload size={14} /> Choose Screenshot
                    </label>
                    <input id={`payment-proof-${booking.bookingId}`} type="file" accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange} style={{ display: 'none' }} />
                    {file && <div style={{ color: 'var(--color-success)', fontSize: '0.8rem', marginTop: 'var(--space-sm)' }}>Selected: {file.name}</div>}
                  </div>
                  <button onClick={() => handleUpload(booking.bookingId)} className="btn btn-primary btn-sm"
                    disabled={uploading === booking.bookingId || !file}>
                    {uploading === booking.bookingId ? (
                      <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</>
                    ) : (
                      <><Upload size={14} /> Upload Proof</>
                    )}
                  </button>
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 'var(--space-sm)' }}>
                  Your registration is being reviewed. Payment instructions and a QR code will be provided soon.
                </p>
              )}
            </div>
          ))}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">💳</div>
          <h3>No Pending Payments</h3>
          <p>All your payments are up to date.</p>
        </div>
      )}
    </div>
  );
}
