// Navbar Component
import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, Shield, LogOut } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/event', label: 'Event Details' },
    { to: '/venue', label: 'Venue' },
    { to: '/book', label: 'Book Tickets' },
    { to: '/contact', label: 'Contact' },
  ];

  // Hide main navbar on admin and dashboard routes
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
  if (isDashboard) return null;

  return (
    <>
      <nav className="navbar" style={scrolled ? { background: 'rgba(10,10,15,0.95)' } : {}}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">🪔</span>
            Dandiya Nights
          </Link>

          <div className="navbar-links">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => isActive ? 'active' : ''}
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="navbar-actions">
            {currentUser ? (
              <>
                {isAdmin ? (
                  <Link to="/admin" className="btn btn-sm btn-secondary" style={{ gap: '6px' }}>
                    <Shield size={14} /> Admin
                  </Link>
                ) : (
                  <Link to="/dashboard" className="btn btn-sm btn-secondary" style={{ gap: '6px' }}>
                    <User size={14} /> Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="btn btn-sm btn-ghost" title="Logout">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-outline" style={{ gap: '6px' }}>
                  <User size={14} /> Login
                </Link>
                <Link to="/admin/login" className="btn btn-sm btn-ghost" style={{ fontSize: '0.8rem' }}>
                  <Shield size={12} /> Admin
                </Link>
              </>
            )}
            <button
              className="navbar-hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => isActive ? 'active' : ''}
            end={link.to === '/'}
          >
            {link.label}
          </NavLink>
        ))}
        <Link to="/volunteers">Volunteers</Link>
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '8px 0' }} />
        {currentUser ? (
          <>
            {isAdmin ? (
              <Link to="/admin" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                <Shield size={16} /> Admin Dashboard
              </Link>
            ) : (
              <Link to="/dashboard" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                <User size={16} /> My Dashboard
              </Link>
            )}
            <button onClick={handleLogout} className="btn btn-ghost" style={{ textAlign: 'center' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textAlign: 'center' }}>🔑 User Login</Link>
            <Link to="/admin/login" style={{ textAlign: 'center' }}>🛡️ Admin Login</Link>
          </>
        )}
      </div>
    </>
  );
}
