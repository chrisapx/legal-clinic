import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { passwordResetAPI } from '../../services/api';
import '../../styles/design-system.css';
import './Auth.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid reset link');
        setValidating(false);
        return;
      }

      try {
        const response = await passwordResetAPI.validateToken(token);
        setTokenValid(response.data);
        if (!response.data) {
          setError('This reset link has expired or is invalid');
        }
      } catch (err) {
        setError('Invalid or expired reset link');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await passwordResetAPI.confirm(token, formData.newPassword);
      alert('Password reset successfully! Please login with your new password.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="auth-container">
        <div className="card auth-card">
          <div className="auth-content" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-lg)' }}>⏳</div>
            <p>Validating reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="card auth-card">
          <div className="auth-header" style={{ background: 'linear-gradient(135deg, var(--error-500) 0%, var(--error-600) 100%)' }}>
            <div className="auth-logo">⚠️</div>
            <h1>Invalid Reset Link</h1>
          </div>

          <div className="auth-content">
            <p style={{ textAlign: 'center', color: 'var(--gray-600)', marginBottom: 'var(--spacing-xl)' }}>
              {error || 'This password reset link is invalid or has expired.'}
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
              <Link to="/forgot-password" className="btn btn-primary">
                Request New Link
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div className="auth-header" style={{ background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-600) 100%)' }}>
          <div className="auth-logo">🔑</div>
          <h1>Reset Password</h1>
          <p>Enter your new password below</p>
        </div>

        <div className="auth-content">
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-field">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                className="input"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="At least 8 characters"
                required
                autoFocus
              />
            </div>

            <div className="form-field">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="input"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="auth-footer">
            <Link to="/login" style={{ color: 'var(--primary-600)', textDecoration: 'none', fontWeight: 500 }}>
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
