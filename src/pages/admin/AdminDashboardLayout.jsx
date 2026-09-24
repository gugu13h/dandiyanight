// Admin Dashboard Layout with Sidebar
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, Ticket, Users, CreditCard,
  Settings, Wallet, ScanLine, BarChart3, ScrollText,
  LogOut, Menu, X, ChevronLeft, Shield,
} from 'lucide-react';

export default function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const links = [
    { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
    { to: '/admin/bookings', icon: <BookOpen size={18} />, label: 'Bookings' },
    { to: '/admin/tickets', icon: <Ticket size={18} />, label: 'Tickets' },
    { to: '/admin/users', icon: <Users size={18} />, label: 'Users' },
    { to: '/admin/payments', icon: <CreditCard size={18} />, label: 'Payments' },
    { to: '/admin/event-settings', icon: <Settings size={18} />, label: 'Event Settings' },
    { to: '/admin/payment-settings', icon: <Wallet size={18} />, label: 'Payment Settings' },
    { to: '/admin/check-in', icon: <ScanLine size={18} />, label: 'Check-In' },
    { to: '/admin/reports', icon: <BarChart3 size={18} />, label: 'Reports' },
    { to: '/admin/logs', icon: <ScrollText size={18} />, label: 'Admin Logs' },
  ];

  return (
    <>
      <nav className="navbar" style={{ background: 'rgba(10,10,15,0.95)' }}>
        <div className="navbar-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ padding: '6px' }}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
              background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              <Shield size={20} style={{ WebkitTextFillColor: 'initial', color: 'var(--color-primary-light)' }} />
              Admin Panel
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
              {userProfile?.name}
            </span>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-layout">
        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)} />

        <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-sm)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
              Administrator
            </div>
            <div style={{ fontWeight: 600 }}>{userProfile?.name || 'Admin'}</div>
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

        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
