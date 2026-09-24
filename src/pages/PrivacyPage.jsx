// Privacy Policy Page
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      content: 'We collect personal information that you voluntarily provide when registering and booking tickets, including: Full Name, Address, Mobile Number, Email Address, Booking Details, and Payment Proof (if uploaded). We may also collect device and browser information for security purposes.',
    },
    {
      title: 'How We Use Your Information',
      items: [
        'Processing and managing ticket bookings',
        'Communicating booking confirmations and updates',
        'Payment verification and processing',
        'Event entry management and check-in',
        'Sending important event-related notifications',
        'Improving our services and user experience',
        'Ensuring event safety and security',
      ],
    },
    {
      title: 'Data Storage & Security',
      content: 'Your data is securely stored using Firebase cloud services with encryption. We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Access to personal data is restricted to authorized personnel only.',
    },
    {
      title: 'Information Sharing',
      content: 'We do not sell, trade, or rent your personal information to third parties. Your information may be shared only with event staff for check-in verification purposes, payment processors for transaction verification, and law enforcement when required by law.',
    },
    {
      title: 'Payment Information',
      content: 'We do not store your complete payment details. Payment proof screenshots and transaction references are stored securely and used solely for payment verification. UPI IDs and bank details displayed are for receiving payments only.',
    },
    {
      title: 'Data Retention',
      content: 'We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including event management and legal compliance. You may request deletion of your data by contacting us.',
    },
    {
      title: 'Your Rights',
      items: [
        'Access your personal data stored with us',
        'Request correction of inaccurate data',
        'Request deletion of your account and data',
        'Opt out of non-essential communications',
        'Download a copy of your booking data',
      ],
    },
    {
      title: 'Contact Us',
      content: 'If you have any questions or concerns about this Privacy Policy or how we handle your data, please contact us through the Contact page on our website.',
    },
  ];

  return (
    <div className="page-wrapper">
      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <h1 className="section-title">Privacy Policy</h1>
          <div className="section-divider" />
          <p className="section-subtitle">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>

          {sections.map((section, index) => (
            <div key={index} className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <Shield size={20} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
                <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1.1rem', fontWeight: 700 }}>
                  {section.title}
                </h2>
              </div>
              <div style={{ paddingLeft: 'calc(20px + var(--space-md))' }}>
                {section.content && (
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>{section.content}</p>
                )}
                {section.items && (
                  <ul style={{ color: 'var(--color-text-secondary)', lineHeight: 2 }}>
                    {section.items.map((item, i) => (
                      <li key={i} style={{ paddingLeft: 'var(--space-md)', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: 'var(--color-secondary)' }}>•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}

          <div className="card" style={{ textAlign: 'center', background: 'rgba(249,168,37,0.05)' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              This privacy policy is effective as of September 2026 and will remain in effect until modified.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
