import { AlertTriangle, MessageCircle, Phone, X } from 'lucide-react';

export default function BookingNoticeModal({ event, onClose }) {
  const phone = event?.contactPhone;
  const whatsapp = event?.contactWhatsApp || phone;
  const whatsappNumber = whatsapp?.replace(/[\s+()-]/g, '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-notice-title"
        style={{ maxWidth: 480, textAlign: 'center' }}
        onClick={(eventClick) => eventClick.stopPropagation()}
      >
        <div className="modal-header" style={{ textAlign: 'left' }}>
          <span />
          <button className="modal-close" onClick={onClose} aria-label="Close booking notice">
            <X size={18} />
          </button>
        </div>
        <AlertTriangle
          size={44}
          style={{ color: 'var(--color-warning)', margin: '0 auto var(--space-md)' }}
        />
        <h2 id="booking-notice-title" style={{ marginBottom: 'var(--space-md)' }}>
          Housefull
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
          Due to the heavy crowd, online booking is temporarily closed. For booking assistance,
          please contact our management team.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
          {phone && (
            <a href={`tel:${phone}`} className="btn btn-success">
              <Phone size={18} /> Call Management
            </a>
          )}
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ background: '#25d366', color: 'white' }}
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}