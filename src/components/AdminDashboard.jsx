import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const accent = '#fd680e';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [associateFormData, setAssociateFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    industry: '',
    contact_person: '',
    phone: '',
    address: '',
    website: ''
  });
  const [associateErrors, setAssociateErrors] = useState({});
  const [associateLoading, setAssociateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.user_type !== 'admin') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }
      setUser(parsedUser);
      setLoading(false);
    } catch (error) {
      setError('Invalid user data');
      setLoading(false);
    }
  };

  const handleAssociateChange = (e) => {
    const { name, value } = e.target;
    setAssociateFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (associateErrors[name]) {
      setAssociateErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateAssociateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!associateFormData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(associateFormData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!associateFormData.password) {
      newErrors.password = 'Password is required';
    } else if (associateFormData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (!associateFormData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (associateFormData.password !== associateFormData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    // Required fields validation
    if (!associateFormData.industry) {
      newErrors.industry = 'Industry is required';
    }
    if (!associateFormData.contact_person) {
      newErrors.contact_person = 'Contact person is required';
    }
    if (!associateFormData.phone) {
      newErrors.phone = 'Phone number is required';
    }

    setAssociateErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAssociateSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateAssociateForm()) {
      return;
    }

    setAssociateLoading(true);

    try {
      const token = localStorage.getItem('token');
      const requestData = {
        email: associateFormData.email.trim(),
        password: associateFormData.password,
        industry: associateFormData.industry.trim(),
        contact_person: associateFormData.contact_person.trim(),
        phone: associateFormData.phone.trim(),
        address: associateFormData.address.trim() || null,
        website: associateFormData.website.trim() || null
      };

      const response = await axios.post('/api/auth/add-associate', requestData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSuccessMessage('Associate added successfully!');
        
        // Clear form
        setAssociateFormData({
          email: '',
          password: '',
          confirm_password: '',
          industry: '',
          contact_person: '',
          phone: '',
          address: '',
          website: ''
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      } else {
        setErrorMessage(response.data.message || 'Failed to add associate');
      }
    } catch (error) {
      console.error('Add associate error:', error);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.path] = err.msg;
        });
        setAssociateErrors(backendErrors);
      } else {
        setErrorMessage('Failed to add associate. Please try again.');
      }
    } finally {
      setAssociateLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <section className="contact section">
        <div className="container text-center" data-aos="fade-up">
          <div className="loading">Loading...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="contact section">
        <div className="container text-center" data-aos="fade-up">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate('/login')} className="btn-get-started">Back to Login</button>
        </div>
      </section>
    );
  }

  return (
    <section id="admin-dashboard" className="services section light-background" style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #fff 60%, #f8f4f2 100%)', position: 'relative', padding: '40px 0' }}>
      {/* Navbar */}
      <nav style={{
        width: '100%',
        background: '#fff',
        boxShadow: '0 2px 12px rgba(253,104,14,0.08)',
        padding: '0.7rem 0',
        marginBottom: 24,
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container d-flex justify-content-between align-items-center">
          <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: accent, fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>
            CV<span style={{ color: '#333' }}>‑Connect</span>
          </Link>
          <button
            className="btn"
            style={{
              background: accent,
              color: '#fff',
              borderRadius: 25,
              padding: '8px 24px',
              fontWeight: 600,
              border: 'none',
              fontSize: 16
            }}
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </div>
      </nav>
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Admin Dashboard</h2>
        <p>
          Manage associates, oversee platform activity, and ensure a secure, trusted network.
        </p>
      </div>

      {/* User Type Display */}
      <div className="container mb-4" data-aos="fade-up" data-aos-delay="50">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card text-center">
              <div className="card-body">
                <i className="bi bi-shield-check fs-1 text-primary mb-3"></i>
                <h4 className="card-title">Account Type</h4>
                <p className="card-text">
                  <span className="badge bg-primary fs-6">Administrator</span>
                </p>
                <p className="text-muted small">You have full administrative privileges</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="sent-message mb-4">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="error-message mb-4">
            {errorMessage}
          </div>
        )}

        {/* Add Associate Form */}
        <div className="row mb-5">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h4>Add New Associate</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleAssociateSubmit} className="php-email-form">
                  <div className="row gy-4">
                    <div className="col-md-12">
                      <input 
                        type="email" 
                        name="email" 
                        className={`form-control ${associateErrors.email ? 'is-invalid' : ''}`}
                        placeholder="Associate Email" 
                        value={associateFormData.email}
                        onChange={handleAssociateChange}
                      />
                      {associateErrors.email && <div className="invalid-feedback">{associateErrors.email}</div>}
                    </div>

                    <div className="col-md-6">
                      <input 
                        type="password" 
                        name="password" 
                        className={`form-control ${associateErrors.password ? 'is-invalid' : ''}`}
                        placeholder="Password" 
                        value={associateFormData.password}
                        onChange={handleAssociateChange}
                      />
                      {associateErrors.password && <div className="invalid-feedback">{associateErrors.password}</div>}
                    </div>

                    <div className="col-md-6">
                      <input 
                        type="password" 
                        name="confirm_password" 
                        className={`form-control ${associateErrors.confirm_password ? 'is-invalid' : ''}`}
                        placeholder="Confirm Password" 
                        value={associateFormData.confirm_password}
                        onChange={handleAssociateChange}
                      />
                      {associateErrors.confirm_password && <div className="invalid-feedback">{associateErrors.confirm_password}</div>}
                    </div>

                    <div className="col-md-6">
                      <input 
                        type="text" 
                        name="industry" 
                        className={`form-control ${associateErrors.industry ? 'is-invalid' : ''}`}
                        placeholder="Industry" 
                        value={associateFormData.industry}
                        onChange={handleAssociateChange}
                      />
                      {associateErrors.industry && <div className="invalid-feedback">{associateErrors.industry}</div>}
                    </div>

                    <div className="col-md-6">
                      <input 
                        type="text" 
                        name="contact_person" 
                        className={`form-control ${associateErrors.contact_person ? 'is-invalid' : ''}`}
                        placeholder="Contact Person" 
                        value={associateFormData.contact_person}
                        onChange={handleAssociateChange}
                      />
                      {associateErrors.contact_person && <div className="invalid-feedback">{associateErrors.contact_person}</div>}
                    </div>

                    <div className="col-md-12">
                      <input 
                        type="tel" 
                        name="phone" 
                        className={`form-control ${associateErrors.phone ? 'is-invalid' : ''}`}
                        placeholder="Phone Number" 
                        value={associateFormData.phone}
                        onChange={handleAssociateChange}
                      />
                      {associateErrors.phone && <div className="invalid-feedback">{associateErrors.phone}</div>}
                    </div>

                    <div className="col-md-6">
                      <input 
                        type="text" 
                        name="address" 
                        className="form-control"
                        placeholder="Address (Optional)" 
                        value={associateFormData.address}
                        onChange={handleAssociateChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <input 
                        type="url" 
                        name="website" 
                        className="form-control"
                        placeholder="Website (Optional)" 
                        value={associateFormData.website}
                        onChange={handleAssociateChange}
                      />
                    </div>

                    <div className="col-md-12 text-center">
                      <button type="submit" disabled={associateLoading}>
                        {associateLoading ? 'Adding Associate...' : 'Add Associate'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h4>Quick Actions</h4>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <Link to="/admin/users" className="btn btn-primary">Manage Users</Link>
                  <Link to="/admin/reports" className="btn btn-outline-primary">View Reports</Link>
                  <Link to="/admin/settings" className="btn btn-outline-secondary">System Settings</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="row gy-4">
          <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
            <div className="service-item position-relative">
              <div className="icon">
                <i className="bi bi-people"></i>
              </div>
              <h3>Total Users</h3>
              <p>Manage all system users</p>
              <Link to="/admin/users" className="stretched-link"></Link>
            </div>
          </div>

          <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
            <div className="service-item position-relative">
              <div className="icon">
                <i className="bi bi-building"></i>
              </div>
              <h3>Associates</h3>
              <p>Manage associate accounts</p>
              <Link to="/admin/associates" className="stretched-link"></Link>
            </div>
          </div>

          <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
            <div className="service-item position-relative">
              <div className="icon">
                <i className="bi bi-person-workspace"></i>
              </div>
              <h3>Freelancers</h3>
              <p>Manage freelancer accounts</p>
              <Link to="/admin/freelancers" className="stretched-link"></Link>
            </div>
          </div>

          <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="400">
            <div className="service-item position-relative">
              <div className="icon">
                <i className="bi bi-graph-up"></i>
              </div>
              <h3>Analytics</h3>
              <p>View system analytics</p>
              <Link to="/admin/analytics" className="stretched-link"></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard; 