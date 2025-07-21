import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const accent = '#fd680e';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/request-reset', { email: email.trim() });
      if (response.data.success) {
        setSuccessMessage(response.data.message || 'If your email exists, you will receive a password reset link.');
        setEmail('');
        // For development: show token if present and redirect
        if (response.data.debug && response.data.debug.reset_token) {
          setSuccessMessage(
            prev => prev + `\n\n[DEV ONLY] Reset token: ${response.data.debug.reset_token}`
          );
          setTimeout(() => {
            navigate(`/reset-password?token=${response.data.debug.reset_token}`);
          }, 1500);
        }
      } else {
        setErrorMessage(response.data.message || 'Failed to request password reset.');
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 'Failed to request password reset. Please try again.'
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
              <h2 style={{ fontWeight: 700, color: accent, marginBottom: 8, textAlign: 'left' }}>Forgot Password</h2>
              <p style={{ color: '#888', fontSize: 16, marginBottom: 28, textAlign: 'left' }}>
                Enter your email address to receive a password reset link.
              </p>
              {errorMessage && <div style={{ color: '#fff', background: '#df1529', borderRadius: 8, padding: '10px 0', marginBottom: 16, textAlign: 'center', fontWeight: 500 }}>{errorMessage}</div>}
              {successMessage && <div style={{ color: '#fff', background: '#059652', borderRadius: 8, padding: '10px 0', marginBottom: 16, textAlign: 'center', fontWeight: 500, whiteSpace: 'pre-line' }}>{successMessage}</div>}
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="mb-3">
                  <label htmlFor="email" style={{ fontWeight: 500, color: '#444', marginBottom: 4 }}>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    style={{ borderRadius: 12, border: '1.5px solid #eee', fontSize: 16, padding: '10px 14px' }}
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="btn w-100 forgot-password-cta"
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
                  {loading ? 'Requesting...' : 'Request Reset Link'}
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
                <div style={{ fontSize: 28, fontWeight: 700, color: accent, marginBottom: 2 }}>Reset Your Password</div>
                <div style={{ fontSize: 16, color: '#444', fontWeight: 600 }}>We'll send you a secure link to reset your password.</div>
              </div>
              {/* Security Card */}
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
                  Secure & Private
                </div>
                <div style={{ fontSize: 15, color: '#444', fontWeight: 500, marginBottom: 4 }}>
                  Your password reset link is encrypted and will expire automatically for your security. We never store your password.
                </div>
                <div style={{ fontSize: 13, color: '#888' }}>
                  <i className="bi bi-shield-check" style={{ color: accent, fontSize: 16, marginRight: 6 }}></i>
                  Secure reset process
                </div>
              </div>
            </div>
          </div>
        </div>
        <style>{`
          .forgot-password-cta:hover, .forgot-password-cta:focus {
            transform: scale(1.07);
            box-shadow: 0 4px 24px rgba(253,104,14,0.18);
            z-index: 2;
          }
        `}</style>
      </div>
    </section>
  );
};

export default ForgotPassword; 