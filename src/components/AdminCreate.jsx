import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const AdminCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    secretKey: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  // SECURITY NOTE: This route should not be exposed publicly in production
  // Consider adding additional security measures like IP whitelisting or a hardcoded token

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    // Secret key validation
    if (!formData.secretKey) {
      newErrors.secretKey = 'Secret key is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        email: formData.email.trim(),
        password: formData.password,
        secretKey: formData.secretKey
      };

      const response = await api.post('/auth/create-admin', requestData);

      if (response.data.success) {
        setSuccessMessage('Admin account created successfully! Redirecting to login...');
        
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify({
          user_id: response.data.data.user_id,
          email: response.data.data.email,
          user_type: 'admin'
        }));
        
        // Redirect to admin dashboard after a short delay
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      } else {
        setErrorMessage(response.data.message || 'Admin creation failed');
      }
    } catch (error) {
      console.error('Admin creation error:', error);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.path] = err.msg;
        });
        setErrors(backendErrors);
      } else {
        setErrorMessage('Admin creation failed. Please check your secret key and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="admin-create" className="contact section">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Create Admin Account</h2>
        <p>⚠️ SECURITY: This route should not be exposed publicly</p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Security Warning */}
            <div className="alert alert-warning mb-4" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Security Notice:</strong> This page is for initial admin account creation only. 
              It should be protected and not accessible to the public in production environments.
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="sent-message mb-4">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="error-message mb-4">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="php-email-form" data-aos="fade-up" data-aos-delay="300">
              <div className="row gy-4">
                <div className="col-md-12">
                  <input 
                    type="email" 
                    name="email" 
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="Admin Email" 
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="col-md-6">
                  <div className="position-relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      name="password" 
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Password" 
                      value={formData.password}
                      onChange={handleChange}
                      style={{ paddingRight: '40px' }}
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
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="col-md-6">
                  <div className="position-relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password" 
                      className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
                      placeholder="Confirm Password" 
                      value={formData.confirm_password}
                      onChange={handleChange}
                      style={{ paddingRight: '40px' }}
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
                  {errors.confirm_password && <div className="invalid-feedback">{errors.confirm_password}</div>}
                </div>

                <div className="col-md-12">
                  <div className="position-relative">
                    <input 
                      type={showSecretKey ? "text" : "password"}
                      name="secretKey" 
                      className={`form-control ${errors.secretKey ? 'is-invalid' : ''}`}
                      placeholder="Secret Key (from .env file)" 
                      value={formData.secretKey}
                      onChange={handleChange}
                      style={{ paddingRight: '40px' }}
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
                      onClick={() => setShowSecretKey(!showSecretKey)}
                    >
                      <i className={`bi ${showSecretKey ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  {errors.secretKey && <div className="invalid-feedback">{errors.secretKey}</div>}
                  <small className="form-text text-muted">
                    Enter the ADMIN_SECRET_KEY value from your backend .env file
                  </small>
                </div>

                <div className="col-md-12 text-center">
                  <button type="submit" disabled={loading}>
                    {loading ? 'Creating Admin...' : 'Create Admin Account'}
                  </button>
                </div>

                <div className="col-md-12 text-center">
                  <p>
                    <small className="text-muted">
                      This should only be used for initial setup. Remove or protect this route in production.
                    </small>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminCreate; 