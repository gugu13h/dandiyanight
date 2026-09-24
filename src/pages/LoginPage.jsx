// Login Page
import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
  }, [currentUser, isAdmin, navigate]);

  if (currentUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      const messages = {
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-credential': 'Invalid email or password',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/invalid-email': 'Invalid email address',
      };
      toast.error(messages[error.code] || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <Link to="/" style={{ fontSize: '2rem' }}>🪔</Link>
        </div>
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your Dandiya Nights account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              <Mail size={14} style={{ display: 'inline', marginRight: 6 }} />
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              <Lock size={14} style={{ display: 'inline', marginRight: 6 }} />
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ width: '100%', paddingRight: '2.5rem' }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--color-text-muted)',
                  cursor: 'pointer', padding: 4,
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 'var(--space-lg)' }}>
            <Link to="/forgot-password" style={{ color: 'var(--color-primary-light)', fontSize: '0.85rem' }}>
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Signing in...</>
            ) : (
              <><LogIn size={18} /> Sign In</>
            )}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
            Create Account
          </Link>
        </p>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
          <Link to="/admin/login" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            Admin Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
