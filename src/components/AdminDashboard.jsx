import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
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
  const [associates, setAssociates] = useState([]);
  const [associatesLoading, setAssociatesLoading] = useState(false);
  const [associatesError, setAssociatesError] = useState('');
  const [toggleLoading, setToggleLoading] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'associates'

  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch associates on mount
  useEffect(() => {
    if (!loading && !error) {
      fetchAssociates();
    }
    // eslint-disable-next-line
  }, [loading, error]);

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

      const response = await api.post('/auth/add-associate', requestData, {
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

  const fetchAssociates = async () => {
    setAssociatesLoading(true);
    setAssociatesError('');
    try {
      const res = await api.get('/admin/associates');
      if (res.data.success) {
        setAssociates(res.data.associates);
      } else {
        setAssociatesError(res.data.message || 'Failed to fetch associates');
      }
    } catch (err) {
      setAssociatesError(err.response?.data?.message || 'Failed to fetch associates');
    } finally {
      setAssociatesLoading(false);
    }
  };

  const handleToggleActive = async (userId) => {
    setToggleLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-active`);
      if (res.data.success) {
        // Update associate in state
        setAssociates((prev) => prev.map(a => a.user_id === userId ? { ...a, is_active: res.data.is_active } : a));
      } else {
        alert(res.data.message || 'Failed to toggle status');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    } finally {
      setToggleLoading((prev) => ({ ...prev, [userId]: false }));
    }
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #fff 60%, #f8f4f2 100%)', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: 250, background: '#181c2f', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '2px 0 12px rgba(0,0,0,0.07)' }}>
        <div>
          <div style={{ padding: '32px 0 24px 0', textAlign: 'center', borderBottom: '1px solid #23284a' }}>
            <h2 style={{ color: accent, fontWeight: 800, fontSize: 28, letterSpacing: 1, margin: 0 }}>CV‑Connect</h2>
            <div style={{ fontSize: 13, color: '#bdbdbd', marginTop: 4 }}>Admin Panel</div>
          </div>
          <nav style={{ marginTop: 32 }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li>
                <button onClick={() => setActiveTab('dashboard')} style={{ background: 'none', border: 'none', color: '#fff', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', padding: '14px 32px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
                  <i className="bi bi-house-door me-2"></i> Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('associates')} style={{ background: 'none', border: 'none', color: '#fff', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', padding: '14px 32px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
                  <i className="bi bi-building me-2"></i> Associates
                </button>
              </li>
              <li>
                <Link to="/admin/users" style={{ display: 'flex', alignItems: 'center', color: '#fff', textDecoration: 'none', padding: '14px 32px', fontWeight: 600, fontSize: 16 }}>
                  <i className="bi bi-people me-2"></i> Manage Users
                </Link>
              </li>
              <li>
                <Link to="/admin/freelancers" style={{ display: 'flex', alignItems: 'center', color: '#fff', textDecoration: 'none', padding: '14px 32px', fontWeight: 600, fontSize: 16 }}>
                  <i className="bi bi-person-workspace me-2"></i> Freelancers
                </Link>
              </li>
              <li>
                <Link to="/admin/analytics" style={{ display: 'flex', alignItems: 'center', color: '#fff', textDecoration: 'none', padding: '14px 32px', fontWeight: 600, fontSize: 16 }}>
                  <i className="bi bi-graph-up me-2"></i> Analytics
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div style={{ padding: '24px 0', textAlign: 'center', borderTop: '1px solid #23284a' }}>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', margin: '0 auto' }}>
            <i className="bi bi-box-arrow-right me-2"></i> Logout
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <div style={{ flex: 1, minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <div style={{ width: '100%', background: '#fff', boxShadow: '0 2px 12px rgba(253,104,14,0.08)', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minHeight: 70 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: '#444', fontSize: 17 }}>{user?.first_name || 'Admin'} {user?.last_name || ''}</div>
              <div style={{ color: '#888', fontSize: 13 }}>Administrator</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-person-circle" style={{ fontSize: 32, color: accent }}></i>
            </div>
          </div>
        </div>
        {/* Main Dashboard Content */}
        <div style={{ flex: 1, padding: '40px 32px', background: 'transparent', minHeight: 0, overflowY: 'auto' }}>
          {/* Add Associate Form (Dashboard Tab) */}
          {activeTab === 'dashboard' && (
            <div className="row">
              <div className="col-lg-7 mb-4 mb-lg-0">
                <div className="bg-white rounded-4 shadow-sm p-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
                  <h4 style={{ color: accent, fontWeight: 700, marginBottom: 24 }}>Add New Associate</h4>
                  {successMessage && (
                    <div className="sent-message mb-3">{successMessage}</div>
                  )}
                  {errorMessage && (
                    <div className="error-message mb-3">{errorMessage}</div>
                  )}
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
                        <button type="submit" disabled={associateLoading} className="btn dashboard-btn" style={{ background: accent, color: '#fff', border: 'none', borderRadius: 30, fontWeight: 600, fontSize: 16, padding: '12px 32px', transition: 'transform 0.18s, box-shadow 0.18s' }}>
                          {associateLoading ? 'Adding Associate...' : 'Add Associate'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          {/* Associates Table (Associates Tab) */}
          {activeTab === 'associates' && (
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)', maxWidth: 1200, margin: '0 auto' }}>
              <h5 style={{ color: accent, fontWeight: 700, marginBottom: 18 }}>All Associates</h5>
              {associatesLoading ? (
                <div>Loading associates...</div>
              ) : associatesError ? (
                <div style={{ color: '#df1529', fontWeight: 500 }}>{associatesError}</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-bordered" style={{ minWidth: 700 }}>
                    <thead style={{ background: '#f8f9fa' }}>
                      <tr>
                        <th>Email</th>
                        <th>Contact Person</th>
                        <th>Industry</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Last Login</th>
                        <th>Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {associates.map(a => (
                        <tr key={a.associate_id}>
                          <td>{a.email}</td>
                          <td>{a.contact_person}</td>
                          <td>{a.industry}</td>
                          <td>{a.phone}</td>
                          <td>{a.verified ? 'Verified' : 'Unverified'}</td>
                          <td>{a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}</td>
                          <td>{a.last_login ? new Date(a.last_login).toLocaleDateString() : ''}</td>
                          <td>
                            <button
                              className="btn btn-sm dashboard-btn"
                              style={{ background: a.is_active ? '#059652' : '#df1529', color: '#fff', borderRadius: 20, fontWeight: 600, fontSize: 14, padding: '6px 18px', minWidth: 90, transition: 'transform 0.18s, box-shadow 0.18s' }}
                              onClick={() => handleToggleActive(a.user_id)}
                              disabled={toggleLoading[a.user_id]}
                            >
                              {toggleLoading[a.user_id] ? '...' : a.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {/* Optionally, add more admin widgets or info here */}
        </div>
      </div>
      {/* Animation Styles */}
      <style>{`
        .dashboard-btn:hover, .dashboard-btn:focus {
          transform: scale(1.07);
          box-shadow: 0 4px 24px rgba(253,104,14,0.18);
          z-index: 2;
        }
        .is-invalid {
          border-color: #df1529 !important;
        }
        .invalid-feedback {
          color: #df1529;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard; 