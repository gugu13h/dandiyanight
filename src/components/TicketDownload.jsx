// Ticket Download Component with QR Code and PDF generation
import { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { subscribeToEvent } from '../services/eventService';
import { formatDate, formatTime, formatCurrency, maskMobile } from '../utils/helpers';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function TicketDownload({ booking }) {
  const ticketRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const unsub = subscribeToEvent('default', setEvent);
    return unsub;
  }, []);

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#0f0518',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
      pdf.save(`DandiyaNights-Ticket-${booking.bookingId}.pdf`);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const qrData = JSON.stringify({
    id: booking.bookingId,
    t: booking.ticketNumbers,
    s: booking.status,
  });

  return (
    <div>
      {/* Ticket Preview */}
      <div ref={ticketRef} className="ticket-preview">
        <div className="ticket-header">
          <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>🪔</div>
          <div className="ticket-event-name">{event?.name || 'Dandiya Nights'}</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
            Official Entry Ticket
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          {[
            ['Event Date', event ? formatDate(event.date) : ''],
            ['Event Time', event ? `${formatTime(event.startTime)} - ${formatTime(event.endTime)}` : ''],
            ['Venue', event?.venue || ''],
            ['Customer', booking.name],
            ['Mobile', maskMobile(booking.mobile)],
            ['Booking ID', booking.bookingId],
            ['Ticket Numbers', booking.ticketNumbers?.join(', ')],
            ['Total Tickets', booking.ticketCount],
            ['Amount Paid', formatCurrency(booking.totalAmount)],
            ['Status', '✅ Approved'],
          ].map(([label, value]) => (
            <div key={label} className="ticket-detail-row">
              <span className="ticket-detail-label">{label}</span>
              <span className="ticket-detail-value">{value}</span>
            </div>
          ))}
        </div>

        <div className="qr-section">
          <QRCodeSVG
            value={qrData}
            size={140}
            bgColor="transparent"
            fgColor="#f9a825"
            level="M"
            style={{ margin: '0 auto' }}
          />
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: 'var(--space-sm)' }}>
            Scan QR code at entry for verification
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
        <button onClick={handleDownload} className="btn btn-primary btn-lg" disabled={downloading}>
          {downloading ? (
            <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating PDF...</>
          ) : (
            <><Download size={18} /> Download Ticket PDF</>
          )}
        </button>
      </div>
    </div>
  );
}
