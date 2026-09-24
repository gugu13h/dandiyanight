// Footer Component
import { Link } from 'react-router-dom';

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">🪔 Dandiya Nights</div>
            <p className="footer-description">
              Experience the most spectacular Dandiya & Garba celebration. Join us for an unforgettable evening of traditional dance, vibrant music, and festive joy.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <div className="footer-links">
              <Link to="/" onClick={scrollToTop}>Home</Link>
              <Link to="/book" onClick={scrollToTop}>Book Tickets</Link>
              <Link to="/event" onClick={scrollToTop}>Event Details</Link>
              <Link to="/venue" onClick={scrollToTop}>Venue</Link>
              <Link to="/contact" onClick={scrollToTop}>Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Account</h4>
            <div className="footer-links">
              <Link to="/login" onClick={scrollToTop}>Login</Link>
              <Link to="/register" onClick={scrollToTop}>Register</Link>
              <Link to="/dashboard" onClick={scrollToTop}>My Dashboard</Link>
              <Link to="/forgot-password" onClick={scrollToTop}>Forgot Password</Link>
            </div>
          </div>

        </div>

        <div style={{
          borderTop: '1px solid var(--color-border)',
          marginTop: 'var(--space-xl)',
          paddingTop: 'var(--space-lg)',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--color-text)', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
            Managing by Gaurav Prabhakar
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Volunteers: Deepak Parmanik, Gaurav Prabhakar, Sibu Parmanik, Amit Biraj, Vishal Kumar Yadav, Sumit, Aditya, Nirmal, Viraj
          </p>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Dandiya Nights Entertainment. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
