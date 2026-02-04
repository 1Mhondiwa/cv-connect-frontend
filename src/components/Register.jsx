import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const accent = '#fd680e';

const countryCodes = [
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' }
];

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    countryCode: '+27',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, strength: 'weak', color: '#dc3545' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
    setSuccess('');
    
    // Update password strength for password field
    if (name === 'password') {
      const strength = validatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

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

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.first_name || !form.last_name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.countryCode + form.phone.replace(/\s/g, ''),
        password: form.password
      };
      const response = await axios.post('/api/auth/register', payload);
      if (response.data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setForm({ first_name: '', last_name: '', email: '', countryCode: '+27', phone: '', password: '', confirmPassword: '' });
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0]?.msg || 'Registration failed.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
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
              <div className="d-flex align-items-center mb-3">
                <img 
                  src="/assets/img/cv-connect_logo.png" 
                  alt="CV-Connect Logo" 
                  style={{
                    height: 40,
                    width: 40,
                    marginRight: 12,
                    borderRadius: '50%'
                  }}
                />
                <h2 style={{ fontWeight: 700, color: accent, marginBottom: 0, textAlign: 'left' }}>Sign Up</h2>
              </div>
              <p style={{ color: '#888', fontSize: 16, marginBottom: 28, textAlign: 'left' }}>
                Secure your career journey with CV‑Connect.
              </p>
              {error && <div style={{ color: '#fff', background: '#df1529', borderRadius: 8, padding: '10px 0', marginBottom: 16, textAlign: 'center', fontWeight: 500 }}>{error}</div>}
              {success && <div style={{ color: '#fff', background: '#059652', borderRadius: 8, padding: '10px 0', marginBottom: 16, textAlign: 'center', fontWeight: 500 }}>{success}</div>}
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="mb-3 d-flex" style={{ gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="first_name" style={{ fontWeight: 500, color: '#444', marginBottom: 4 }}>First Name</label>
                  <input 
                    type="text" 
                      className="form-control"
                      id="first_name"
                    name="first_name" 
                      value={form.first_name}
                    onChange={handleChange}
                      placeholder="First name"
                      style={{ borderRadius: 12, border: '1.5px solid #eee', fontSize: 16, padding: '10px 14px' }}
                      autoFocus
                  />
                </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="last_name" style={{ fontWeight: 500, color: '#444', marginBottom: 4 }}>Last Name</label>
                  <input 
                    type="text" 
                      className="form-control"
                      id="last_name"
                    name="last_name" 
                      value={form.last_name}
                    onChange={handleChange}
                      placeholder="Last name"
                      style={{ borderRadius: 12, border: '1.5px solid #eee', fontSize: 16, padding: '10px 14px' }}
                  />
                  </div>
                </div>
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
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" style={{ fontWeight: 500, color: '#444', marginBottom: 4 }}>Phone Number</label>
                  <div className="d-flex" style={{ gap: 8 }}>
                  <select 
                      name="countryCode"
                      className="form-select"
                      value={form.countryCode}
                    onChange={handleChange}
                      style={{
                        borderRadius: 12,
                        border: '1.5px solid #eee',
                        fontSize: 16,
                        padding: '10px 10px',
                        maxWidth: 90,
                        background: '#fafafa',
                        color: '#444',
                        fontWeight: 500
                      }}
                    >
                      {countryCodes.map((country, idx) => (
                        <option key={country.code + idx} value={country.code}>
                          {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <input 
                    type="tel" 
                      className="form-control"
                      id="phone"
                    name="phone" 
                      value={form.phone}
                    onChange={handleChange}
                      placeholder="Phone number"
                      style={{ borderRadius: 12, border: '1.5px solid #eee', fontSize: 16, padding: '10px 14px', flex: 1 }}
                  />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="password" style={{ fontWeight: 500, color: '#444', marginBottom: 4 }}>Password</label>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                    Password must contain: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character, no sequential patterns (123, abc)
                  </div>
                  <div className="position-relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      id="password"
                      name="password" 
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      style={{ borderRadius: 12, border: '1.5px solid #eee', fontSize: 16, padding: '10px 14px', paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      className="btn position-absolute"
                      style={{
                        right: '5px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        fontSize: '16px',
                        padding: '5px'
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  {/* Password strength indicator */}
                  {form.password && (
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
                  <label htmlFor="confirmPassword" style={{ fontWeight: 500, color: '#444', marginBottom: 4 }}>Confirm Password</label>
                  <div className="position-relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      style={{ borderRadius: 12, border: '1.5px solid #eee', fontSize: 16, padding: '10px 14px', paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      className="btn position-absolute"
                      style={{
                        right: '5px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        fontSize: '16px',
                        padding: '5px'
                      }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn w-100 register-cta"
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
                    {loading ? 'Registering...' : 'Register'}
                  </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: 18, fontSize: 15 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: accent, fontWeight: 600, textDecoration: 'none' }}>Login</Link>
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
                <div style={{ fontSize: 28, fontWeight: 700, color: accent, marginBottom: 2 }}>Get started in minutes</div>
                <div style={{ fontSize: 16, color: '#444', fontWeight: 600 }}>Easy registration process</div>
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
          .register-cta:hover, .register-cta:focus {
            transform: scale(1.07);
            box-shadow: 0 4px 24px rgba(253,104,14,0.18);
            z-index: 2;
          }
        `}</style>
      </div>
    </section>
  );
};

export default Register;
