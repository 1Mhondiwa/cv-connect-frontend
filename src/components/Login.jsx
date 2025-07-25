import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const accent = '#fd680e';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      // Use AuthContext login for consistency
      const result = await authLogin(form.email.trim(), form.password);
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(async () => {
          // Redirect based on user type
          if (result.user.user_type === 'freelancer') {
            try {
              // Fetch freelancer profile to check for CV
              const token = localStorage.getItem('token');
              const profileRes = await api.get('/freelancer/profile', {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (profileRes.data.success) {
                if (!profileRes.data.profile.cv) {
                  navigate('/freelancer/welcome');
                } else {
                  navigate('/freelancer-dashboard');
                }
              } else {
                // Fallback: if profile fetch fails, go to dashboard
                navigate('/freelancer-dashboard');
              }
            } catch (profileErr) {
              // Fallback: if profile fetch fails, go to dashboard
              navigate('/freelancer-dashboard');
            }
          } else if (result.user.user_type === 'associate') {
            navigate('/associate/dashboard');
          } else if (result.user.user_type === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 1200);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
        setError('Login failed. Please check your credentials and try again.');
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
              <h2 style={{ fontWeight: 700, color: accent, marginBottom: 8, textAlign: 'left' }}>Sign In</h2>
              <p style={{ color: '#888', fontSize: 16, marginBottom: 28, textAlign: 'left' }}>
                Welcome back to CV‑Connect. Please log in to continue.
              </p>
              {error && <div style={{ color: '#fff', background: '#df1529', borderRadius: 8, padding: '10px 0', marginBottom: 16, textAlign: 'center', fontWeight: 500 }}>{error}</div>}
              {success && <div style={{ color: '#fff', background: '#059652', borderRadius: 8, padding: '10px 0', marginBottom: 16, textAlign: 'center', fontWeight: 500 }}>{success}</div>}
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="mb-3">
                  <label htmlFor="email" style={{ fontWeight: 500, color: '#444', marginBottom: 4 }}>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@email.com"
                    style={{ borderRadius: 12, border: '1.5px solid #eee', fontSize: 16, padding: '10px 14px' }}
                    autoFocus
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" style={{ fontWeight: 500, color: '#444', marginBottom: 4 }}>Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    style={{ borderRadius: 12, border: '1.5px solid #eee', fontSize: 16, padding: '10px 14px' }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn w-100 login-cta"
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
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: 18, fontSize: 15 }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: accent, fontWeight: 600, textDecoration: 'none' }}>Register</Link>
              </div>
              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 15 }}>
                <Link to="/forgot-password" style={{ color: accent, fontWeight: 600, textDecoration: 'none' }}>Forgot Your Password?</Link>
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
                <div style={{ fontSize: 28, fontWeight: 700, color: accent, marginBottom: 2 }}>Welcome Back!</div>
                <div style={{ fontSize: 16, color: '#444', fontWeight: 600 }}>Access your dashboard and connect instantly.</div>
              </div>
              {/* Data/Privacy Card */}
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
                  Your data, your rules
                </div>
                <div style={{ fontSize: 15, color: '#444', fontWeight: 500, marginBottom: 4 }}>
                  Your data belongs to you. CV‑Connect uses secure encryption and never shares your information without your consent.
                </div>
                <div style={{ fontSize: 13, color: '#888' }}>
                  <i className="bi bi-shield-lock" style={{ color: accent, fontSize: 16, marginRight: 6 }}></i>
                  End-to-end encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
        <style>{`
          .login-cta:hover, .login-cta:focus {
            transform: scale(1.07);
            box-shadow: 0 4px 24px rgba(253,104,14,0.18);
            z-index: 2;
          }
        `}</style>
      </div>
    </section>
  );
};

export default Login;
