// User Dashboard Layout with Sidebar
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Ticket, BookOpen, User, Bell, CreditCard,
  HelpCircle, LogOut, Menu, X, ChevronLeft,
} from 'lucide-react';

export default function UserDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const links = [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
    { to: '/dashboard/bookings', icon: <BookOpen size={18} />, label: 'My Bookings' },
    { to: '/dashboard/tickets', icon: <Ticket size={18} />, label: 'My Tickets' },
    { to: '/dashboard/payment', icon: <CreditCard size={18} />, label: 'Payment' },
    { to: '/dashboard/notifications', icon: <Bell size={18} />, label: 'Notifications' },
    { to: '/dashboard/profile', icon: <User size={18} />, label: 'My Profile' },
  ];

  return (
    <>
      {/* Top bar for dashboard */}
      <nav className="navbar" style={{ background: 'rgba(10,10,15,0.95)' }}>
        <div className="navbar-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}
              style={{ padding: '6px' }}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700,
              background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🪔 My Dashboard
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', display: 'none' }}
              className="desktop-only">
              {userProfile?.name}
            </span>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-layout">
        {/* Sidebar overlay (mobile) */}
        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)} />

        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-sm)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Welcome,</div>
            <div style={{ fontWeight: 600, fontSize: '1rem' }}>{userProfile?.name || 'User'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{userProfile?.email}</div>
          </div>

          <nav className="dashboard-sidebar-nav">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end}
                className={({ isActive }) => `dashboard-sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}>
                <span className="link-icon">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: 'var(--space-md) 0' }} />
            <button onClick={handleLogout} className="dashboard-sidebar-link"
              style={{ background: 'none', width: '100%', textAlign: 'left', color: 'var(--color-error)' }}>
              <span className="link-icon"><LogOut size={18} /></span>
              Logout
            </button>
          </nav>
        </aside>

        {/* Mobile sidebar toggle */}
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Main content */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
