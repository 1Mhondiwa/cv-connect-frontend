import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';

const accent = '#fd680e';

const AssociateTempPasswordChange = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, strength: 'weak', color: '#dc3545' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and is an associate
    if (!user || user.user_type !== 'associate') {
      navigate('/login');
      return;
    }

    // Check if user has already changed their temporary password
    if (user.has_changed_temp_password) {
      navigate('/associate/dashboard');
      return;
    }
  }, [user, navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
    setSuccess('');

    // Update password strength for new password
    if (name === 'newPassword') {
      updatePasswordStrength(value);
    }
  };

  const updatePasswordStrength = (password) => {
    let score = 0;
    let strength = 'weak';
    let color = '#dc3545';

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score >= 4) {
      strength = 'strong';
      color = '#28a745';
    } else if (score >= 3) {
      strength = 'medium';
      color = '#ffc107';
    }

    setPasswordStrength({ score, strength, color });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.newPassword || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (passwordStrength.score < 4) {
      setError('Password is too weak. Please choose a stronger password.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/associate/change-password', {
        newPassword: form.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess('Password changed successfully! Redirecting to dashboard...');
        
        // Update user data in AuthContext and localStorage
        const updatedUser = { ...user, has_changed_temp_password: true };
        updateUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setTimeout(() => {
          navigate('/associate/dashboard');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to change password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || user.user_type !== 'associate') {
    return null;
  }

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
        style={{ maxWidth: 600, zIndex: 2 }}
      >
        <div className="row g-0 align-items-stretch" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.07)', borderRadius: 32, overflow: 'hidden', background: '#fff' }}>
          <div className="col-12 d-flex align-items-center" style={{ padding: '40px 32px', minHeight: 500 }}>
            <div style={{ width: '100%' }}>
              <div className="text-center mb-4">
                <h2 style={{ fontWeight: 700, color: accent, marginBottom: 16 }}>Welcome to CV-Connect!</h2>
                <p style={{ color: '#666', fontSize: 16, marginBottom: 8 }}>
                  Your associate account has been approved by ESC.
                </p>
                <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
                  For security reasons, please change your temporary password to a new password of your choice.
                </p>
              </div>

              {error && (
                <div style={{ color: '#fff', background: '#df1529', borderRadius: 8, padding: '12px 16px', marginBottom: 20, textAlign: 'center', fontWeight: 500 }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{ color: '#fff', background: '#059652', borderRadius: 8, padding: '12px 16px', marginBottom: 20, textAlign: 'center', fontWeight: 500 }}>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="mb-3">
                  <label htmlFor="newPassword" style={{ fontWeight: 500, color: '#444', marginBottom: 8 }}>
                    New Password <span style={{ color: '#df1529' }}>*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="form-control"
                      id="newPassword"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      placeholder="Enter your new password"
                      style={{ borderRadius: 12, border: '1.5px solid #eee', fontSize: 16, padding: '12px 16px', paddingRight: '50px' }}
                      required
                    />
                    <button
                      type="button"
                      className="btn position-absolute"
                      style={{
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#666'
                      }}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <i className={`bi ${showNewPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  
                  {/* Password strength indicator */}
                  {form.newPassword && (
                    <div className="mt-2">
                      <div className="d-flex align-items-center mb-1">
                        <small style={{ color: '#666', marginRight: 8 }}>Password strength:</small>
                        <span style={{ color: passwordStrength.color, fontWeight: 600, textTransform: 'capitalize' }}>
                          {passwordStrength.strength}
                        </span>
                      </div>
                      <div className="progress" style={{ height: '4px', borderRadius: '2px' }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                            backgroundColor: passwordStrength.color
                          }}
                        ></div>
                      </div>
                      <small style={{ color: '#888', fontSize: '12px' }}>
                        Include uppercase, lowercase, numbers, and special characters for a strong password
                      </small>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" style={{ fontWeight: 500, color: '#444', marginBottom: 8 }}>
                    Confirm New Password <span style={{ color: '#df1529' }}>*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your new password"
                      style={{ borderRadius: 12, border: '1.5px solid #eee', fontSize: 16, padding: '12px 16px', paddingRight: '50px' }}
                      required
                    />
                    <button
                      type="button"
                      className="btn position-absolute"
                      style={{
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#666'
                      }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn"
                    style={{
                      background: accent,
                      color: '#fff',
                      borderRadius: 12,
                      padding: '14px 24px',
                      fontWeight: 600,
                      fontSize: 16,
                      border: 'none'
                    }}
                    disabled={loading || passwordStrength.score < 4}
                  >
                    {loading ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Changing Password...
                      </span>
                    ) : (
                      'Change Password & Continue'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    style={{
                      borderRadius: 12,
                      padding: '12px 24px',
                      fontWeight: 500,
                      fontSize: 14,
                      border: '1.5px solid #ddd'
                    }}
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                <small style={{ color: '#888', fontSize: '12px' }}>
                  By continuing, you agree to our terms of service and privacy policy.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AssociateTempPasswordChange;
