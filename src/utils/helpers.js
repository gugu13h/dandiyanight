// Validation utilities
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateMobile(mobile) {
  // Indian mobile number: 10 digits, starting with 6-9
  const value = String(mobile || '').trim().replace(/[\s-]/g, '');
  const normalized = value.startsWith('+91')
    ? value.slice(3)
    : value.startsWith('91') && value.length === 12
      ? value.slice(2)
      : value;
  const re = /^[6-9]\d{9}$/;
  return re.test(normalized);
}

export function validateName(name) {
  return name && name.trim().length >= 2;
}

export function validateAddress(address) {
  return address && address.trim().length >= 5;
}

export function validatePassword(password) {
  return password && password.length >= 6;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function maskMobile(mobile) {
  if (!mobile || mobile.length < 4) return mobile;
  return mobile.slice(0, 2) + '****' + mobile.slice(-4);
}

export function getStatusLabel(status) {
  const labels = {
    REGISTRATION_PENDING: 'Registration Pending',
    PAYMENT_PENDING: 'Payment Pending',
    PAYMENT_PROOF_SUBMITTED: 'Payment Proof Submitted',
    PAYMENT_SUCCESSFUL: 'Payment Successful',
    PAYMENT_FAILED: 'Payment Failed',
    CANCELLED: 'Cancelled',
    EXPIRED: 'Expired',
  };
  return labels[status] || status;
}

export function getStatusColor(status) {
  const colors = {
    REGISTRATION_PENDING: '#f59e0b',
    PAYMENT_PENDING: '#3b82f6',
    PAYMENT_PROOF_SUBMITTED: '#8b5cf6',
    PAYMENT_SUCCESSFUL: '#10b981',
    PAYMENT_FAILED: '#ef4444',
    CANCELLED: '#6b7280',
    EXPIRED: '#9ca3af',
  };
  return colors[status] || '#6b7280';
}

export function getTicketStatusLabel(status) {
  const labels = {
    AVAILABLE: 'Available',
    RESERVED: 'Reserved',
    PAYMENT_PENDING: 'Payment Pending',
    APPROVED: 'Approved',
    CHECKED_IN: 'Checked In',
  };
  return labels[status] || status;
}
