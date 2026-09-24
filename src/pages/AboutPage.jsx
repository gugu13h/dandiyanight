// About Page
import { Calendar, Music, Users, Star, Sparkles, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="page-wrapper">
      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <h1 className="section-title">About Dandiya Nights</h1>
          <div className="section-divider" />
          <p className="section-subtitle">
            Celebrating the spirit of Navratri with grandeur, tradition, and unforgettable moments.
          </p>

          <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              marginBottom: 'var(--space-md)',
              color: 'var(--color-secondary)',
            }}>
              Our Story
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 2, marginBottom: 'var(--space-md)' }}>
              Dandiya Nights is a premier Garba and Dandiya event that brings together the joy of Navratri with
              modern entertainment. Our events are crafted to offer an authentic cultural experience while ensuring
              every guest enjoys a premium, safe, and memorable celebration.
            </p>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 2 }}>
              With live music, professional dance coordinators, stunning decorations, and delicious food,
              Dandiya Nights creates the perfect atmosphere for celebration. Whether you're an experienced
              Garba dancer or trying it for the first time, our events welcome everyone with open arms.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: 'var(--space-lg)',
          }}>
            {[
              { icon: <Calendar size={24} />, title: 'Multi-Day Event', desc: 'Enjoy multiple nights of celebration during the Navratri festival.' },
              { icon: <Music size={24} />, title: 'Live Performances', desc: 'Top artists and musicians performing live traditional and modern tracks.' },
              { icon: <Users size={24} />, title: 'Community Spirit', desc: 'A place where people of all ages and backgrounds come together.' },
              { icon: <Star size={24} />, title: 'Premium Venue', desc: 'World-class venues with professional sound, lighting, and decor.' },
              { icon: <Sparkles size={24} />, title: 'Cultural Heritage', desc: 'Preserving and celebrating the rich traditions of Navratri.' },
              { icon: <Award size={24} />, title: 'Best Dressed Awards', desc: 'Exciting prizes for the best traditional outfits and dance performers.' },
            ].map((item, index) => (
              <div key={index} className="card" style={{ textAlign: 'center' }}>
                <div style={{
                  color: 'var(--color-primary-light)',
                  marginBottom: 'var(--space-md)',
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: 'var(--space-sm)',
                }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
