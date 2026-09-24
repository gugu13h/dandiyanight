// Terms & Conditions Page
import { useEffect } from 'react';
import { FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function TermsPage() {
  const { hash } = useLocation();

  useEffect(() => {
    const targetId = hash.slice(1);
    if (!targetId) return;

    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [hash]);

  const sections = [
    {
      title: 'Ticket Booking',
      content: 'All ticket bookings are subject to availability. Tickets are non-transferable unless explicitly authorized by the organizers. Each ticket is valid for one person only. A valid photo ID may be required for entry. Bookings are confirmed only after successful payment verification by the admin.',
    },
    {
      title: 'Payment',
      content: 'Payment must be completed within the specified timeframe after registration approval. Supported payment methods will be communicated by the organizer. The organizer reserves the right to cancel unpaid bookings and release the reserved tickets. All prices are inclusive of applicable taxes unless stated otherwise.',
    },
    {
      id: 'refund',
      title: 'Cancellation & Refund Policy',
      content: 'Cancellation requests must be made at least 48 hours before the event. Refunds, if applicable, will be processed within 7-10 business days. The organizer reserves the right to deduct processing fees. No refunds will be issued for no-shows or late arrivals. In case of event cancellation by the organizer, full refunds will be provided.',
    },
    {
      title: 'Entry Rules',
      content: 'Entry is permitted only with a valid, approved ticket. The organizer reserves the right to deny entry to anyone without a valid ticket or ID. No outside food, drinks, or prohibited items are allowed inside the venue. The organizer may conduct security checks at the entry point.',
    },
    {
      title: 'Ticket Validity',
      content: 'Tickets are valid only for the date and time mentioned on the ticket. Early entry or late entry is at the discretion of the organizer. Each ticket includes a unique QR code for verification. Duplicate or counterfeit tickets will be rejected.',
    },
    {
      title: 'Event Timing',
      content: 'The organizer will make every effort to conduct the event as scheduled. However, the organizer reserves the right to modify event timings, performances, or schedule due to unforeseen circumstances. Attendees are advised to arrive at least 30 minutes before the event start time.',
    },
    {
      title: 'Organizer Rights',
      content: 'The organizer reserves the right to modify, reschedule, or cancel the event due to unforeseen circumstances. The organizer is not responsible for any personal injuries, losses, or damages during the event. Photography and videography by the organizer\'s team may occur during the event. By attending, you consent to being photographed or filmed.',
    },
    {
      title: 'Liability',
      content: 'Attendees are responsible for their personal belongings. The organizer shall not be liable for any loss, damage, or injury sustained during the event. Attendees participate in all activities at their own risk.',
    },
  ];

  return (
    <div className="page-wrapper">
      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <h1 className="section-title">Terms & Conditions</h1>
          <div className="section-divider" />
          <p className="section-subtitle">
            Please read these terms carefully before booking your tickets.
          </p>

          {sections.map((section, index) => (
            <div key={index} id={section.id || ''} className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <FileText size={20} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
                <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.1rem', fontWeight: 700 }}>
                  {index + 1}. {section.title}
                </h2>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, paddingLeft: 'calc(20px + var(--space-md))' }}>
                {section.content}
              </p>
            </div>
          ))}

          <div className="card" style={{ textAlign: 'center', background: 'rgba(249,168,37,0.05)' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              By booking tickets on Dandiya Nights, you agree to abide by these terms and conditions.
              <br />Last updated: September 2026
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
