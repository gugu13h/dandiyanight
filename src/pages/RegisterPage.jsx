// Register Page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validateMobile, validateName, validateAddress, validatePassword } from '../utils/helpers';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Lock, Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { register, currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', address: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (currentUser) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!validateName(formData.name)) newErrors.name = 'Name is required (min 2 characters)';
    if (!validateEmail(formData.email)) newErrors.email = 'Valid email is required';
    if (!validateMobile(formData.mobile)) newErrors.mobile = 'Valid 10-digit Indian mobile number required';
    if (!validateAddress(formData.address)) newErrors.address = 'Address is required (min 5 characters)';
    if (!validatePassword(formData.password)) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.name, formData.mobile, formData.address);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Register error:', error);
      const messages = {
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
        'auth/invalid-email': 'Invalid email address',
      };
      toast.error(messages[error.code] || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <Link to="/" style={{ fontSize: '2rem' }}>🪔</Link>
        </div>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join Dandiya Nights and book your tickets</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">
              <User size={14} style={{ display: 'inline', marginRight: 6 }} /> Full Name *
            </label>
            <input id="reg-name" name="name" className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your full name" value={formData.name} onChange={handleChange} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              <Mail size={14} style={{ display: 'inline', marginRight: 6 }} /> Email Address *
            </label>
            <input id="reg-email" name="email" type="email" className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="your@email.com" value={formData.email} onChange={handleChange} />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-mobile">
              <Phone size={14} style={{ display: 'inline', marginRight: 6 }} /> Mobile Number *
            </label>
            <input id="reg-mobile" name="mobile" type="tel" className={`form-input ${errors.mobile ? 'error' : ''}`}
              placeholder="9876543210" value={formData.mobile} onChange={handleChange} maxLength={10} />
            {errors.mobile && <span className="form-error">{errors.mobile}</span>}
            <span className="form-hint">10-digit Indian mobile number</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-address">
              <MapPin size={14} style={{ display: 'inline', marginRight: 6 }} /> Address *
            </label>
            <textarea id="reg-address" name="address" className={`form-input ${errors.address ? 'error' : ''}`}
              placeholder="Enter your complete address" value={formData.address} onChange={handleChange} rows={2} />
            {errors.address && <span className="form-error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              <Lock size={14} style={{ display: 'inline', marginRight: 6 }} /> Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`} style={{ width: '100%', paddingRight: '2.5rem' }}
                placeholder="Min 6 characters" value={formData.password} onChange={handleChange} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">
              <Lock size={14} style={{ display: 'inline', marginRight: 6 }} /> Confirm Password *
            </label>
            <input id="reg-confirm" name="confirmPassword" type="password"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} />
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creating Account...</>
            ) : (
              <><UserPlus size={18} /> Create Account</>
            )}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
