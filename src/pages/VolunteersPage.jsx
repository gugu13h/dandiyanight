import { Heart, Users } from 'lucide-react';

const volunteers = [
  'Deepak Parmanik',
  'Gaurav Prabhakar',
  'Sibu Parmanik',
  'Amit Biraj',
  'Vishal Kumar Yadav',
  'Sumit',
  'Aditya',
  'Nirmal',
  'Viraj',
];

export default function VolunteersPage() {
  return (
    <div className="page-wrapper">
      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <h1 className="section-title">Our Volunteers</h1>
          <div className="section-divider" />
          <p className="section-subtitle">
            The people helping make Dandiya Nights a memorable celebration.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 'var(--space-lg)',
          }}>
            {volunteers.map((volunteer) => (
              <div key={volunteer} className="card" style={{ textAlign: 'center' }}>
                <Users size={26} style={{ color: 'var(--color-primary-light)', marginBottom: 'var(--space-sm)' }} />
                <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: '1rem', fontWeight: 700 }}>
                  {volunteer}
                </h2>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
            <Heart size={22} style={{ color: 'var(--color-secondary)', marginBottom: 'var(--space-sm)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>Thank you for your support and dedication.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
