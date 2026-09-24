// Book Tickets Page - Complete ticket booking flow
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscribeToEvent } from '../services/eventService';
import { subscribeToTickets, releaseExpiredReservations } from '../services/ticketService';
import { createBooking, updatePaymentProof } from '../services/bookingService';
import { createNotification } from '../services/notificationService';
import { uploadCloudinaryImage } from '../services/cloudinaryService';
import { formatCurrency, validateEmail, validateMobile, validateName, validateAddress } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  Ticket,
  User,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

const STEPS = ['Personal Details', 'Select Tickets', 'Review & Confirm'];

export default function BookTicketsPage() {
  const { currentUser, userProfile, register, login } = useAuth();

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [paymentReceiptFile, setPaymentReceiptFile] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
  });
  const [errors, setErrors] = useState({});

  // Load event data
  useEffect(() => {
    const unsubscribe = subscribeToEvent('default', (e) => {
      setEvent(e);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Load tickets real-time
  useEffect(() => {
    const unsubscribe = subscribeToTickets((t) => setTickets(t));
    return unsubscribe;
  }, []);

  // Pre-fill form from user profile
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        mobile: userProfile.mobile || '',
        address: userProfile.address || '',
      });
    }
  }, [userProfile]);

  // Clean up expired reservations periodically
  useEffect(() => {
    releaseExpiredReservations().catch((error) => {
      console.warn('Could not clean up expired reservations:', error);
    });
    const interval = setInterval(() => {
      releaseExpiredReservations().catch((error) => {
        console.warn('Could not clean up expired reservations:', error);
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleReceiptChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowed.includes(selected.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error('Receipt must be under 5MB');
      return;
    }
    setPaymentReceiptFile(selected);
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!validateName(formData.name)) newErrors.name = 'Name is required (min 2 characters)';
    if (!validateEmail(formData.email)) newErrors.email = 'Valid email is required';
    if (!validateMobile(formData.mobile)) newErrors.mobile = 'Valid 10-digit Indian mobile number required';
    if (!validateAddress(formData.address)) newErrors.address = 'Address is required (min 5 characters)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleTicket = useCallback((ticketNum) => {
    setSelectedTickets((prev) => {
      if (prev.includes(ticketNum)) {
        return prev.filter((t) => t !== ticketNum);
      }
      return [...prev, ticketNum];
    });
  }, []);

  const handleNext = () => {
    if (currentStep === 0 && !validateStep1()) return;
    if (currentStep === 1 && selectedTickets.length === 0) {
      toast.error('Please select at least one ticket');
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let bookingUser = currentUser;

      if (!bookingUser) {
        try {
          bookingUser = await register(
            formData.email,
            formData.mobile,
            formData.name,
            formData.mobile,
            formData.address
          );
        } catch (error) {
          if (error.code !== 'auth/email-already-in-use') throw error;
          bookingUser = await login(formData.email, formData.mobile);
        }
      }

      const bookingId = await createBooking(
        bookingUser.uid,
        {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          address: formData.address,
          eventId: 'default',
          pricePerTicket: event.ticketPrice,
          paymentMethod,
        },
        selectedTickets.sort((a, b) => a - b)
      );

      if (paymentMethod === 'ONLINE' && paymentReceiptFile) {
        try {
          const receiptUrl = await uploadCloudinaryImage(
            paymentReceiptFile,
            `dandiya-nights/payment-proofs/${bookingId}`
          );
          await updatePaymentProof(bookingId, receiptUrl, null, 'PAYMENT_PENDING');
        } catch (receiptError) {
          console.error('Optional receipt upload failed:', receiptError);
          toast.error('Booking created, but receipt upload failed. You can upload it later from Payment.');
        }
      }

      // Create notification
      await createNotification(
        bookingUser.uid,
        'Booking Submitted',
        `Your booking ${bookingId} has been submitted successfully. Tickets: ${selectedTickets.sort((a, b) => a - b).join(', ')}`,
        'booking'
      );

      setBookingResult({
        bookingId,
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        paymentMethod,
        tickets: selectedTickets.sort((a, b) => a - b),
        total: event.ticketPrice * selectedTickets.length,
        pricePerTicket: event.ticketPrice,
      });
      setBookingComplete(true);
      toast.success('Booking submitted successfully!');
    } catch (error) {
      console.error('Booking error:', error);
      const messages = {
        'auth/invalid-credential': 'This email already exists. Use the mobile number used when the account was created.',
        'auth/weak-password': 'The mobile number must be at least 6 digits.',
      };
      toast.error(messages[error.code] || error.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading booking page...</p>
        </div>
      </div>
    );
  }

  // Booking closed
  if (event?.bookingStatus === 'BOOKING_CLOSED') {
    return (
      <div className="page-wrapper">
        <section className="section">
          <div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
            <div className="card">
              <AlertTriangle size={48} style={{ color: 'var(--color-warning)', margin: '0 auto var(--space-lg)' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 'var(--space-md)' }}>
                Bookings Closed
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                Bookings are currently closed. Please check back later or contact us for more information.
              </p>
              <Link to="/" className="btn btn-primary">Back to Home</Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Check if sold out
  const availableCount = tickets.filter((t) => t.status === 'AVAILABLE').length;
  if (availableCount === 0 && tickets.length > 0 && !bookingComplete) {
    return (
      <div className="page-wrapper">
        <section className="section">
          <div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
            <div className="card">
              <Ticket size={48} style={{ color: 'var(--color-error)', margin: '0 auto var(--space-lg)' }} />
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                marginBottom: 'var(--space-md)',
                color: 'var(--color-error)',
              }}>
                SOLD OUT
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                All tickets have been booked. Check back later as some tickets may become available.
              </p>
              <Link to="/" className="btn btn-primary">Back to Home</Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Booking complete confirmation
  if (bookingComplete && bookingResult) {
    return (
      <div className="page-wrapper">
        <section className="section">
          <div className="confirmation-screen">
            <div className="confirmation-icon">
              <CheckCircle2 size={40} style={{ color: 'var(--color-success)' }} />
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              marginBottom: 'var(--space-sm)',
              color: 'var(--color-text)',
            }}>
              Thank You!
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)' }}>
              Your booking request has been received successfully.<br />
              Your selected tickets have been reserved temporarily.
            </p>

            <div className="booking-summary" style={{ textAlign: 'left', marginBottom: 'var(--space-xl)' }}>
              <div className="booking-summary-row">
                <span className="booking-summary-label">Booking ID</span>
                <span className="booking-summary-value" style={{ color: 'var(--color-primary-light)' }}>
                  {bookingResult.bookingId}
                </span>
              </div>
              <div className="booking-summary-row">
                <span className="booking-summary-label">Name</span>
                <span className="booking-summary-value">{bookingResult.name}</span>
              </div>
              <div className="booking-summary-row">
                <span className="booking-summary-label">Tickets</span>
                <span className="booking-summary-value">
                  {bookingResult.tickets.join(', ')}
                </span>
              </div>
              <div className="booking-summary-row">
                <span className="booking-summary-label">Number of Tickets</span>
                <span className="booking-summary-value">{bookingResult.tickets.length}</span>
              </div>
              <div className="booking-summary-row">
                <span className="booking-summary-label">Total Amount</span>
                <span className="booking-summary-value booking-summary-total">
                  {formatCurrency(bookingResult.total)}
                </span>
              </div>
              <div className="booking-summary-row">
                <span className="booking-summary-label">Status</span>
                <span className="status-badge pending">Registration Pending</span>
              </div>
            </div>

            <div style={{
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-lg)',
              marginBottom: 'var(--space-xl)',
              textAlign: 'left',
            }}>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.8 }}>
                📌 Please keep your Booking ID <strong>{bookingResult.bookingId}</strong> for future reference.<br />
                🔐 Login email: <strong>{bookingResult.email}</strong><br />
                🔑 Login password: your mobile number ({bookingResult.mobile})<br />
                📞 We will contact you with payment instructions after your registration is reviewed.<br />
                ⏰ Your selected tickets are temporarily reserved.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/dashboard" className="btn btn-primary">
                Go to My Dashboard
              </Link>
              <Link to="/" className="btn btn-outline">
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <h1 className="section-title">Book Your Tickets</h1>
          <div className="section-divider" />

          {/* Account information */}
          {!currentUser && (
            <div style={{
              background: 'rgba(249,168,37,0.08)',
              border: '1px solid rgba(249,168,37,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-lg)',
              marginBottom: 'var(--space-xl)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              flexWrap: 'wrap',
            }}>
              <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} />
              <span style={{ color: 'var(--color-text-secondary)', flex: 1 }}>
                Your account will be created automatically when you confirm your booking. Use your email and mobile number to log in later.
              </span>
            </div>
          )}

          {/* Step Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-sm)',
            marginBottom: 'var(--space-2xl)',
          }}>
            {STEPS.map((step, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: index <= currentStep ? 'var(--gradient-primary)' : 'var(--color-surface)',
                  color: index <= currentStep ? 'white' : 'var(--color-text-muted)',
                  border: index <= currentStep ? 'none' : '1px solid var(--color-border)',
                  transition: 'var(--transition-normal)',
                }}>
                  {index + 1}
                </div>
                <span style={{
                  fontSize: '0.85rem',
                  color: index <= currentStep ? 'var(--color-text)' : 'var(--color-text-muted)',
                  display: window.innerWidth < 640 && index !== currentStep ? 'none' : 'inline',
                }}>
                  {step}
                </span>
                {index < STEPS.length - 1 && (
                  <div style={{
                    width: 40,
                    height: 2,
                    background: index < currentStep ? 'var(--color-primary)' : 'var(--color-border)',
                    transition: 'var(--transition-normal)',
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Personal Details */}
          {currentStep === 0 && (
            <div className="card">
              <h2 style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '1.3rem',
                fontWeight: 700,
                marginBottom: 'var(--space-xl)',
              }}>
                Personal Details
              </h2>

              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  <User size={14} style={{ display: 'inline', marginRight: 6 }} />
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  <Mail size={14} style={{ display: 'inline', marginRight: 6 }} />
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mobile">
                  <Phone size={14} style={{ display: 'inline', marginRight: 6 }} />
                  Mobile Number *
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  className={`form-input ${errors.mobile ? 'error' : ''}`}
                  placeholder="9876543210"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  maxLength={10}
                />
                {errors.mobile && <span className="form-error">{errors.mobile}</span>}
                <span className="form-hint">10-digit Indian mobile number</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">
                  <MapPin size={14} style={{ display: 'inline', marginRight: 6 }} />
                  Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  className={`form-input ${errors.address ? 'error' : ''}`}
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                />
                {errors.address && <span className="form-error">{errors.address}</span>}
              </div>
            </div>
          )}

          {/* Step 2: Ticket Selection */}
          {currentStep === 1 && (
            <div className="card">
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-lg)',
                flexWrap: 'wrap',
                gap: 'var(--space-md)',
              }}>
                <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.3rem', fontWeight: 700 }}>
                  Select Your Tickets
                </h2>
                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    Available: {availableCount} / {tickets.length}
                  </span>
                  <span style={{
                    color: 'var(--color-secondary)',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                  }}>
                    {formatCurrency(event?.ticketPrice || 0)} / ticket
                  </span>
                </div>
              </div>

              {/* Ticket Legend */}
              <div className="ticket-legend">
                <div className="ticket-legend-item">
                  <div className="ticket-legend-color" style={{
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }} />
                  Available
                </div>
                <div className="ticket-legend-item">
                  <div className="ticket-legend-color" style={{
                    background: 'linear-gradient(135deg, #e63946, #ff6f00)',
                    borderColor: '#e63946',
                  }} />
                  Selected
                </div>
                <div className="ticket-legend-item">
                  <div className="ticket-legend-color" style={{
                    background: 'rgba(59,130,246,0.15)',
                    borderColor: 'rgba(59,130,246,0.3)',
                  }} />
                  Reserved
                </div>
                <div className="ticket-legend-item">
                  <div className="ticket-legend-color" style={{
                    background: 'rgba(16,185,129,0.15)',
                    borderColor: 'rgba(16,185,129,0.3)',
                  }} />
                  Booked
                </div>
              </div>

              {/* Ticket Grid */}
              <div className="ticket-grid">
                {tickets.map((ticket) => {
                  const isSelected = selectedTickets.includes(ticket.ticketNumber);
                  const isAvailable = ticket.status === 'AVAILABLE' ||
                    (ticket.status === 'RESERVED' && ticket.reservedUntil?.toDate() < new Date());

                  let className = 'ticket-cell ';
                  if (isSelected) {
                    className += 'selected';
                  } else if (isAvailable) {
                    className += 'available';
                  } else if (ticket.status === 'RESERVED' || ticket.status === 'PAYMENT_PENDING') {
                    className += 'reserved';
                  } else if (ticket.status === 'APPROVED' || ticket.status === 'CHECKED_IN') {
                    className += 'approved';
                  } else {
                    className += 'unavailable';
                  }

                  return (
                    <button
                      key={ticket.ticketNumber}
                      className={className}
                      onClick={() => isAvailable && toggleTicket(ticket.ticketNumber)}
                      disabled={!isAvailable && !isSelected}
                      aria-label={`Ticket ${ticket.ticketNumber} - ${isSelected ? 'Selected' : isAvailable ? 'Available' : 'Unavailable'}`}
                    >
                      {ticket.ticketNumber}
                    </button>
                  );
                })}
              </div>

              {/* Selected Tickets Summary */}
              {selectedTickets.length > 0 && (
                <div style={{
                  marginTop: 'var(--space-lg)',
                  padding: 'var(--space-lg)',
                  background: 'rgba(230,57,70,0.05)',
                  border: '1px solid rgba(230,57,70,0.15)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                        Selected Tickets
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {selectedTickets.sort((a, b) => a - b).join(', ')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                        {selectedTickets.length} ticket{selectedTickets.length > 1 ? 's' : ''} × {formatCurrency(event?.ticketPrice || 0)}
                      </div>
                      <div style={{
                        fontSize: '1.3rem',
                        fontWeight: 800,
                        color: 'var(--color-secondary)',
                      }}>
                        {formatCurrency((event?.ticketPrice || 0) * selectedTickets.length)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {currentStep === 2 && (
            <div className="card">
              <h2 style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '1.3rem',
                fontWeight: 700,
                marginBottom: 'var(--space-xl)',
              }}>
                Review Your Booking
              </h2>

              <div className="booking-summary">
                <div className="booking-summary-row">
                  <span className="booking-summary-label">Name</span>
                  <span className="booking-summary-value">{formData.name}</span>
                </div>
                <div className="booking-summary-row">
                  <span className="booking-summary-label">Mobile</span>
                  <span className="booking-summary-value">{formData.mobile}</span>
                </div>
                <div className="booking-summary-row">
                  <span className="booking-summary-label">Email</span>
                  <span className="booking-summary-value">{formData.email}</span>
                </div>
                <div className="booking-summary-row">
                  <span className="booking-summary-label">Selected Tickets</span>
                  <span className="booking-summary-value">
                    {selectedTickets.sort((a, b) => a - b).join(', ')}
                  </span>
                </div>
                <div className="booking-summary-row">
                  <span className="booking-summary-label">Number of Tickets</span>
                  <span className="booking-summary-value">{selectedTickets.length}</span>
                </div>
                <div className="booking-summary-row">
                  <span className="booking-summary-label">Price per Ticket</span>
                  <span className="booking-summary-value">{formatCurrency(event?.ticketPrice || 0)}</span>
                </div>
                <div className="booking-summary-row">
                  <span className="booking-summary-label">Total Amount</span>
                  <span className="booking-summary-value booking-summary-total">
                    {formatCurrency((event?.ticketPrice || 0) * selectedTickets.length)}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-md)' }}>Payment Method</h3>
                <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                  {[
                    ['ONLINE', 'Pay Online'],
                    ['CASH', 'Pay by Cash'],
                  ].map(([value, label]) => (
                    <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                      <input type="radio" name="paymentMethod" value={value}
                        checked={paymentMethod === value} onChange={(e) => setPaymentMethod(e.target.value)} />
                      {label}
                    </label>
                  ))}
                </div>

                {paymentMethod === 'ONLINE' && (
                  <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-lg)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontWeight: 600, marginBottom: 'var(--space-md)' }}>Scan to pay online</p>
                    <img src="/payment-qr.svg" alt="Dummy payment QR code"
                      style={{ display: 'block', width: 220, maxWidth: '100%', background: 'white', padding: 8, borderRadius: 'var(--radius-md)' }} />
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 'var(--space-md)' }}>
                      After payment, you may upload the receipt below. Uploading it is optional; the admin will verify the payment manually.
                    </p>
                    <label htmlFor="booking-payment-receipt" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', marginTop: 'var(--space-sm)' }}>
                      <Ticket size={14} /> Choose Receipt
                    </label>
                    <input id="booking-payment-receipt" type="file" accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleReceiptChange} style={{ display: 'none' }} />
                    {paymentReceiptFile && <p style={{ color: 'var(--color-success)', fontSize: '0.8rem', marginTop: 'var(--space-sm)' }}>Selected: {paymentReceiptFile.name}</p>}
                  </div>
                )}
                {paymentMethod === 'CASH' && (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 'var(--space-md)' }}>
                    You selected cash payment. The admin will verify and update this request manually.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 'var(--space-xl)',
            gap: 'var(--space-md)',
          }}>
            {currentStep > 0 ? (
              <button onClick={handleBack} className="btn btn-outline">
                <ChevronLeft size={18} /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < STEPS.length - 1 ? (
              <button onClick={handleNext} className="btn btn-primary">
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="btn btn-primary btn-lg btn-glow"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} /> Confirm Booking
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
