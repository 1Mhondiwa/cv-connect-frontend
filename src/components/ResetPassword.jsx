import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const accent = '#fd680e';

const ResetPassword = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const [token, setToken] = useState(query.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, strength: 'weak', color: '#dc3545' });

  // Password strength validation
  const validatePasswordStrength = (password) => {
    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;

    // Uppercase check
    if (/[A-Z]/.test(password)) score += 1;

    // Lowercase check
    if (/[a-z]/.test(password)) score += 1;

    // Number check
    if (/\d/.test(password)) score += 1;

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

    // Common password check
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123'];
    if (!commonPasswords.includes(password.toLowerCase())) score += 1;

    // Sequential check
    const sequentialPatterns = ['123', 'abc', 'qwe'];
    const hasSequential = sequentialPatterns.some(pattern => 
      password.toLowerCase().includes(pattern)
    );
    if (!hasSequential) score += 1;

    // Repeated characters check
    if (!/(.)\1{2,}/.test(password)) score += 1;

    let strength = 'weak';
    let color = '#dc3545';
    
    if (score >= 7) {
      strength = 'strong';
      color = '#28a745';
    } else if (score >= 5) {
      strength = 'medium';
      color = '#ffc107';
    }

    return { score, strength, color };
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const strength = validatePasswordStrength(value);
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    if (!token.trim()) {
      setErrorMessage('Reset token is required.');
      return;
    }
    if (!password || !confirmPassword) {
      setErrorMessage('Please enter and confirm your new password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/reset-password', { token: token.trim(), password });
      if (response.data.success) {
        setSuccessMessage('Password updated successfully! You can now log in.');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setErrorMessage(response.data.message || 'Failed to reset password.');
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #fff 60%, #f8f4f2 100%)',
        position: 'relative',
        padding: '40px 0'
      }}
    >
      <div
        className="container"
        style={{ maxWidth: 1100, zIndex: 2 }}
      >
        <div className="row g-0 align-items-stretch" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.07)', borderRadius: 32, overflow: 'hidden', background: '#fff' }}>
          {/* Left: Form */}
          <div className="col-lg-6 d-flex align-items-center" style={{ padding: '32px 28px', minHeight: 420 }}>
            <div style={{ width: '100%' }}>
              <h2 style={{ fontWeight: 700, color: accent, marginBottom: 8, textAlign: 'left' }}>Reset Password</h2>
              <p style={{ color: '#888', fontSize: 16, marginBottom: 28, textAlign: 'left' }}>
                Enter your new password below. If you have a reset token, it should be pre-filled.
              </p>
              {errorMessage && <div style={{ color: '#fff', background: '#df1529', borderRadius: 8, padding: '10px 0', marginBottom: 16, textAlign: 'center', fontWeight: 500 }}>{errorMessage}</div>}
              {successMessage && <div style={{ color: '#fff', background: '#059652', borderRadius: 8, padding: '10px 0', marginBottom: 16, textAlign: 'center', fontWeight: 500 }}>{successMessage}</div>}
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="mb-3">
                  <label htmlFor="token" style={{ fontWeight: 500, color: '#444', marginBottom: 4 }}>Reset Token</label>
                  <input
                    type="text"
                    className="form-control"
                    id="token"
                    name="token"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="Enter reset token"
                    style={{ borderRadius: 12, border: '1.5px solid #eee', fontSize: 16, padding: '10px 14px' }}
                    disabled={!!query.get('token')}
                    autoFocus
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" style={{ fontWeight: 500, color: '#444', marginBottom: 4 }}>New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    style={{ borderRadius: 12, border: '1.5px solid #eee', fontSize: 16, padding: '10px 14px' }}
                    disabled={loading}
                  />
                  {/* Password strength indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="d-flex align-items-center mb-1">
                        <div className="me-2" style={{ fontSize: 12, fontWeight: 600, color: passwordStrength.color }}>
                          {passwordStrength.strength.toUpperCase()}
                        </div>
                        <div className="flex-grow-1">
                          <div className="progress" style={{ height: 4 }}>
                            <div 
                              className="progress-bar" 
                              style={{ 
                                width: `${(passwordStrength.score / 8) * 100}%`, 
                                backgroundColor: passwordStrength.color 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <small className="text-muted" style={{ fontSize: 11 }}>
                        Requirements: 8+ chars, uppercase, lowercase, number, special char
                      </small>
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmPassword" style={{ fontWeight: 500, color: '#444', marginBottom: 4 }}>Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    style={{ borderRadius: 12, border: '1.5px solid #eee', fontSize: 16, padding: '10px 14px' }}
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  className="btn w-100 reset-password-cta"
                  style={{
                    background: accent,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 18,
                    border: 'none',
                    borderRadius: 30,
                    padding: '12px 0',
                    marginTop: 8,
                    marginBottom: 8,
                    boxShadow: '0 2px 12px rgba(253,104,14,0.08)',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                    letterSpacing: 0.5
                  }}
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: 18, fontSize: 15 }}>
                Remember your password?{' '}
                <Link to="/login" style={{ color: accent, fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
              </div>
            </div>
          </div>
          {/* Right: Info/Feature Cards */}
          <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(120deg, #f8f4f2 60%, #eaf0fa 100%)', minHeight: 420 }}>
            <div style={{ width: '90%', maxWidth: 370 }}>
              {/* Stat Card */}
              <div style={{
                background: '#fff',
                borderRadius: 18,
                boxShadow: '0 2px 16px rgba(253,104,14,0.08)',
                padding: '28px 24px',
                marginBottom: 28,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8
              }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: accent, marginBottom: 2 }}>Set New Password</div>
                <div style={{ fontSize: 16, color: '#444', fontWeight: 600 }}>Choose a strong password to secure your account.</div>
              </div>
              {/* Password Tips Card */}
              <div style={{
                background: '#fff',
                borderRadius: 18,
                boxShadow: '0 2px 16px rgba(253,104,14,0.08)',
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 8
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: accent, marginBottom: 4 }}>
                  Password Tips
                </div>
                <div style={{ fontSize: 15, color: '#444', fontWeight: 500, marginBottom: 4 }}>
                  Use at least 6 characters. Include uppercase, lowercase, numbers, and symbols for better security.
                </div>
                <div style={{ fontSize: 13, color: '#888' }}>
                  <i className="bi bi-lock-fill" style={{ color: accent, fontSize: 16, marginRight: 6 }}></i>
                  Strong password required
                </div>
              </div>
            </div>
          </div>
        </div>
        <style>{`
          .reset-password-cta:hover, .reset-password-cta:focus {
            transform: scale(1.07);
            box-shadow: 0 4px 24px rgba(253,104,14,0.18);
            z-index: 2;
          }
        `}</style>
      </div>
    </section>
  );
};

export default ResetPassword; 