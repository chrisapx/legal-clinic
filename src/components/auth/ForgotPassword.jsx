import { useState } from 'react';
import { Link } from 'react-router-dom';
import { passwordResetAPI } from '../../services/api';
import '../../styles/design-system.css';
import './Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await passwordResetAPI.initiate(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-container">
        <div className="card auth-card">
          <div className="auth-header" style={{ background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-600) 100%)' }}>
            <div className="auth-logo">📧</div>
            <h1>Check Your Email</h1>
          </div>

          <div className="auth-content">
            <p style={{ textAlign: 'center', color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)' }}>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p style={{ textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
              Please check your email and click the link to reset your password.
              The link will expire in 1 hour.
            </p>
            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
              <Link to="/login" className="btn btn-primary">
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
          <div className="auth-logo">🔐</div>
          <h1>Forgot Password?</h1>
          <p>No worries, we'll send you reset instructions</p>
        </div>

        <div className="auth-content">
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
