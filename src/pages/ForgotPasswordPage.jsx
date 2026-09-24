// Forgot Password Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      const messages = {
        'auth/user-not-found': 'No account found with this email',
        'auth/invalid-email': 'Invalid email address',
      };
      toast.error(messages[error.code] || 'Failed to send reset email. Please try again.');
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

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)',
              border: '2px solid var(--color-success)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto var(--space-xl)',
            }}>
              <CheckCircle2 size={32} style={{ color: 'var(--color-success)' }} />
            </div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-md)' }}>Check Your Email</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)' }}>
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1>Forgot Password</h1>
            <p className="auth-subtitle">Enter your email to receive a password reset link</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="reset-email">
                  <Mail size={14} style={{ display: 'inline', marginRight: 6 }} /> Email Address
                </label>
                <input id="reset-email" type="email" className="form-input"
                  placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? (
                  <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
                ) : (
                  <>Send Reset Link</>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
              <Link to="/login" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                <ArrowLeft size={14} style={{ display: 'inline', marginRight: 4 }} /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
