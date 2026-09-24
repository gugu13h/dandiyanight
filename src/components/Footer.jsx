// Footer Component
import { Link } from 'react-router-dom';

export default function Footer() {
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
              <Link to="/">Home</Link>
              <Link to="/book">Book Tickets</Link>
              <Link to="/event">Event Details</Link>
              <Link to="/venue">Venue</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Account</h4>
            <div className="footer-links">
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/dashboard">My Dashboard</Link>
              <Link to="/forgot-password">Forgot Password</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Legal</h4>
            <div className="footer-links">
              <Link to="/terms">Terms & Conditions</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms#refund">Cancellation & Refund</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Dandiya Nights Entertainment. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
