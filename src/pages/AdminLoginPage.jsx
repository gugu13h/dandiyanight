// Admin Login Page
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Shield, Loader2, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const { loginAsAdmin, currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && isAdmin) navigate('/admin', { replace: true });
  }, [currentUser, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await loginAsAdmin(email, password);
      navigate('/admin', { replace: true });
      toast.success('Admin login successful!');
    } catch (error) {
      const messages = {
        'auth/user-not-found': 'No account found',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-credential': 'Invalid credentials',
        'auth/admin-required': 'This account does not have admin access',
        'auth/not-configured': 'Firebase is not configured on this server. Add the VITE_FIREBASE_* variables.',
        'permission-denied': 'Firestore denied access. Add role: admin to this user profile.',
        'auth/invalid-api-key': 'Firebase API key is invalid',
        'auth/too-many-requests': 'Too many attempts. Try later.',
      };
      toast.error(messages[error.code] || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  if (currentUser && isAdmin) return null;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: 'rgba(230,57,70,0.1)',
            border: '1px solid rgba(230,57,70,0.2)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto',
          }}>
            <Shield size={28} style={{ color: 'var(--color-primary-light)' }} />
          </div>
        </div>
        <h1>Admin Login</h1>
        <p className="auth-subtitle">Access the administration dashboard</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">
              <Mail size={14} style={{ display: 'inline', marginRight: 6 }} /> Admin Email
            </label>
            <input id="admin-email" type="email" className="form-input"
              placeholder="admin@dandiyanights.com" value={email}
              onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              <Lock size={14} style={{ display: 'inline', marginRight: 6 }} /> Password
            </label>
            <div style={{ position: 'relative' }}>
              <input id="admin-password" type={showPassword ? 'text' : 'password'}
                className="form-input" style={{ width: '100%', paddingRight: '2.5rem' }}
                placeholder="Enter admin password" value={password}
                onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</>
            ) : (
              <><Shield size={18} /> Sign In as Admin</>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
          <Link to="/login" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            ← User Login
          </Link>
        </div>
      </div>
    </div>
  );
}
