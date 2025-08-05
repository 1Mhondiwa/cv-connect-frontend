import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';

const accent = '#fd680e';

const ESCAdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Associate request management states
  const [associateRequests, setAssociateRequests] = useState([]);
  const [associateRequestsLoading, setAssociateRequestsLoading] = useState(false);
  const [associateRequestsError, setAssociateRequestsError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    status: 'approved',
    review_notes: '',
    password: ''
  });
  
  // Legacy associate management (keeping for backward compatibility)
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
  
  // Enhanced freelancer management
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'associate-requests', 'associates', 'freelancers'
  const [freelancers, setFreelancers] = useState([]);
  const [freelancersLoading, setFreelancersLoading] = useState(false);
  const [freelancersError, setFreelancersError] = useState('');
  const [freelancerFilters, setFreelancerFilters] = useState({
    availability_status: 'all',
    page: 1,
    limit: 10
  });
  const [availabilityUpdateLoading, setAvailabilityUpdateLoading] = useState({});
  
  // Enhanced statistics
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  
  // Admin profile management
  const [adminImage, setAdminImage] = useState(null);
  const [adminImageUploading, setAdminImageUploading] = useState(false);
  const [adminImageError, setAdminImageError] = useState('');
  const [adminImageSuccess, setAdminImageSuccess] = useState('');
  const adminImageInputRef = useRef(null);

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

  // Fetch freelancers when freelancers tab is activated
  useEffect(() => {
    if (activeTab === 'freelancers') {
      fetchFreelancersWithFilters();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // Fetch associate requests when associate-requests tab is activated
  useEffect(() => {
    if (activeTab === 'associate-requests') {
      fetchAssociateRequests();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // Fetch system stats on dashboard tab
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // Fetch admin image on user load
  useEffect(() => {
    if (user && user.profile_picture_url) {
      setAdminImage(user.profile_picture_url);
    }
  }, [user]);

  // Helper to get image URL
  const getAdminImageUrl = () => {
    if (adminImage) {
      if (adminImage.startsWith('http')) return adminImage;
      return adminImage;
    }
    return null;
  };

  // Upload handler
  const handleAdminImageChange = async (e) => {
    setAdminImageError('');
    setAdminImageSuccess('');
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAdminImageError('Please select a valid image file.');
      return;
    }
    setAdminImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/admin/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setAdminImage(res.data.image_url);
        setAdminImageSuccess('Profile picture updated!');
        setUser((prev) => ({ ...prev, profile_picture_url: res.data.image_url }));
      } else {
        setAdminImageError(res.data.message || 'Failed to upload image.');
      }
    } catch (err) {
      setAdminImageError(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setAdminImageUploading(false);
      if (adminImageInputRef.current) adminImageInputRef.current.value = '';
    }
  };

  // Delete handler
  const handleDeleteAdminImage = async () => {
    setAdminImageError('');
    setAdminImageSuccess('');
    setAdminImageUploading(true);
    try {
      const res = await api.delete('/admin/profile-image');
      if (res.data.success) {
        setAdminImage(null);
        setAdminImageSuccess('Profile picture deleted.');
        setUser((prev) => ({ ...prev, profile_picture_url: null }));
      } else {
        setAdminImageError(res.data.message || 'Failed to delete image.');
      }
    } catch (err) {
      setAdminImageError(err.response?.data?.message || 'Failed to delete image.');
    } finally {
      setAdminImageUploading(false);
    }
  };

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

  const fetchFreelancers = async () => {
    setFreelancersLoading(true);
    setFreelancersError('');
    try {
      const res = await api.get('/admin/freelancers');
      if (res.data.success) {
        setFreelancers(res.data.freelancers);
      } else {
        setFreelancersError(res.data.message || 'Failed to fetch freelancers');
      }
    } catch (err) {
      setFreelancersError(err.response?.data?.message || 'Failed to fetch freelancers');
    } finally {
      setFreelancersLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      } else {
        setStatsError(res.data.message || 'Failed to fetch stats');
      }
    } catch (err) {
      setStatsError(err.response?.data?.message || 'Failed to fetch stats');
    } finally {
      setStatsLoading(false);
    }
  };

  // Associate Request Management Functions
  const fetchAssociateRequests = async () => {
    setAssociateRequestsLoading(true);
    setAssociateRequestsError('');
    try {
      const res = await api.get('/associate-request/requests');
      if (res.data.success) {
        setAssociateRequests(res.data.data.requests);
      } else {
        setAssociateRequestsError(res.data.message || 'Failed to fetch associate requests');
      }
    } catch (err) {
      setAssociateRequestsError(err.response?.data?.message || 'Failed to fetch associate requests');
    } finally {
      setAssociateRequestsLoading(false);
    }
  };

  const handleReviewRequest = async (requestId) => {
    setReviewLoading(true);
    try {
      const res = await api.put(`/associate-request/requests/${requestId}/review`, reviewFormData);
      if (res.data.success) {
        // Refresh the requests list
        fetchAssociateRequests();
        setSelectedRequest(null);
        setReviewFormData({ status: 'approved', review_notes: '', password: '' });
        alert(`Request ${reviewFormData.status} successfully`);
      } else {
        alert(res.data.message || 'Failed to review request');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to review request');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewFormChange = (e) => {
    setReviewFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Enhanced Freelancer Management Functions
  const fetchFreelancersWithFilters = async () => {
    setFreelancersLoading(true);
    setFreelancersError('');
    try {
      const params = new URLSearchParams();
      if (freelancerFilters.availability_status !== 'all') {
        params.append('availability_status', freelancerFilters.availability_status);
      }
      params.append('page', freelancerFilters.page);
      params.append('limit', freelancerFilters.limit);

      const res = await api.get(`/admin/freelancers?${params.toString()}`);
      if (res.data.success) {
        setFreelancers(res.data.freelancers);
      } else {
        setFreelancersError(res.data.message || 'Failed to fetch freelancers');
      }
    } catch (err) {
      setFreelancersError(err.response?.data?.message || 'Failed to fetch freelancers');
    } finally {
      setFreelancersLoading(false);
    }
  };

  const updateFreelancerAvailability = async (freelancerId, availabilityStatus) => {
    setAvailabilityUpdateLoading(prev => ({ ...prev, [freelancerId]: true }));
    try {
      const res = await api.put(`/admin/freelancers/${freelancerId}/availability`, {
        availability_status: availabilityStatus
      });
      if (res.data.success) {
        // Update freelancer in state
        setFreelancers(prev => prev.map(f => 
          f.freelancer_id === freelancerId 
            ? { ...f, availability_status: availabilityStatus }
            : f
        ));
        alert(`Freelancer availability updated to ${availabilityStatus}`);
      } else {
        alert(res.data.message || 'Failed to update availability');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setAvailabilityUpdateLoading(prev => ({ ...prev, [freelancerId]: false }));
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
            <div style={{ fontSize: 13, color: '#bdbdbd', marginTop: 4 }}>ESC Admin Panel</div>
          </div>
          <nav style={{ marginTop: 32 }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="admin-sidebar-btn">
                  <i className="bi bi-house-door me-2"></i> Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('associate-requests')} className="admin-sidebar-btn">
                  <i className="bi bi-envelope me-2"></i> Associate Requests
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('associates')} className="admin-sidebar-btn">
                  <i className="bi bi-building me-2"></i> Associates
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('freelancers')} className="admin-sidebar-btn">
                  <i className="bi bi-person-workspace me-2"></i> Freelancers
                </button>
              </li>
             {/* <li>
                <Link to="/admin/analytics" className="admin-sidebar-btn" style={{ textDecoration: 'none' }}>
                  <i className="bi bi-graph-up me-2"></i> Analytics
                </Link>
              </li>*/}
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
        <div style={{ width: '100%', background: '#fff', boxShadow: '0 2px 12px rgba(253,104,14,0.08)', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minHeight: 70, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: '#444', fontSize: 17 }}>{user?.first_name || 'Admin'} {user?.last_name || ''}</div>
              <div style={{ color: '#888', fontSize: 13 }}>Administrator</div>
            </div>
            <div style={{ position: 'relative', width: 44, height: 44 }}>
              {getAdminImageUrl() ? (
                <img
                  src={getAdminImageUrl()}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: 44, height: 44, objectFit: 'cover', border: '2.5px solid #fd680e', background: '#eee' }}
                />
              ) : (
                <i className="bi bi-person-circle" style={{ fontSize: 32, color: accent, background: '#eee', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}></i>
              )}
              {/* Upload button */}
              <button
                type="button"
                className="btn btn-sm btn-light"
                style={{ position: 'absolute', bottom: -6, right: -6, borderRadius: '50%', border: '2px solid #fff', background: accent, color: '#fff', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, boxShadow: '0 2px 8px rgba(253,104,14,0.12)', zIndex: 2, padding: 0 }}
                onClick={() => adminImageInputRef.current && adminImageInputRef.current.click()}
                title="Upload/Change Profile Picture"
                disabled={adminImageUploading}
              >
                <i className="bi bi-plus"></i>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={adminImageInputRef}
                style={{ display: 'none' }}
                onChange={handleAdminImageChange}
                disabled={adminImageUploading}
              />
              {/* Delete button */}
              {getAdminImageUrl() && (
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  style={{ position: 'absolute', top: -6, right: -6, borderRadius: '50%', border: '2px solid #fff', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, zIndex: 2, padding: 0 }}
                  onClick={handleDeleteAdminImage}
                  title="Delete Profile Picture"
                  disabled={adminImageUploading}
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          </div>
          {/* Feedback messages */}
          {(adminImageSuccess || adminImageError || adminImageUploading) && (
            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, minWidth: 180 }}>
              <div className={`toast show align-items-center text-white bg-${adminImageSuccess ? 'success' : adminImageError ? 'danger' : 'primary'} border-0`} role="alert" aria-live="assertive" aria-atomic="true" style={{ borderRadius: 16, boxShadow: '0 2px 16px rgba(253,104,14,0.18)', fontWeight: 600, fontSize: 15, padding: '12px 24px' }}>
                <div className="d-flex align-items-center">
                  <i className={`bi me-2 ${adminImageSuccess ? 'bi-check-circle' : adminImageError ? 'bi-exclamation-triangle' : 'bi-info-circle'}`}></i>
                  <div>{adminImageUploading ? 'Uploading...' : adminImageSuccess || adminImageError}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Main Dashboard Content */}
        <div style={{ flex: 1, padding: '40px 32px', background: 'transparent', minHeight: 0, overflowY: 'auto' }}>
          {/* Add Associate Form (Dashboard Tab) */}
          {activeTab === 'dashboard' && (
            <>
              {/* System Stats Row */}
              <div className="row gy-4 mb-4">
                <div className="col-lg-3 col-md-6">
                  <div className="dashboard-stat-card bg-white rounded-4 shadow-sm p-4 text-center animate-fade-in orange-border">
                    <div style={{ fontSize: 32, color: accent, marginBottom: 8 }}><i className="bi bi-people"></i></div>
                    <div style={{ fontWeight: 700, fontSize: 22, color: '#444' }}>Users</div>
                    <div style={{ color: '#888', fontSize: 15 }}>
                      {statsLoading ? '...' : statsError ? <span style={{ color: '#df1529' }}>{statsError}</span> : stats?.users ? Object.values(stats.users).reduce((a, b) => a + b, 0) : '--'}
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="dashboard-stat-card bg-white rounded-4 shadow-sm p-4 text-center animate-fade-in orange-border">
                    <div style={{ fontSize: 32, color: accent, marginBottom: 8 }}><i className="bi bi-file-earmark-text"></i></div>
                    <div style={{ fontWeight: 700, fontSize: 22, color: '#444' }}>CVs</div>
                    <div style={{ color: '#888', fontSize: 15 }}>
                      {statsLoading ? '...' : statsError ? <span style={{ color: '#df1529' }}>{statsError}</span> : stats?.total_cvs ?? '--'}
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="dashboard-stat-card bg-white rounded-4 shadow-sm p-4 text-center animate-fade-in orange-border">
                    <div style={{ fontSize: 32, color: accent, marginBottom: 8 }}><i className="bi bi-chat-dots"></i></div>
                    <div style={{ fontWeight: 700, fontSize: 22, color: '#444' }}>Messages</div>
                    <div style={{ color: '#888', fontSize: 15 }}>
                      {statsLoading ? '...' : statsError ? <span style={{ color: '#df1529' }}>{statsError}</span> : stats?.total_messages ?? '--'}
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="dashboard-stat-card bg-white rounded-4 shadow-sm p-4 text-center animate-fade-in orange-border">
                    <div style={{ fontSize: 32, color: accent, marginBottom: 8 }}><i className="bi bi-envelope"></i></div>
                    <div style={{ fontWeight: 700, fontSize: 22, color: '#444' }}>Pending Requests</div>
                    <div style={{ color: '#888', fontSize: 15 }}>
                      {statsLoading ? '...' : statsError ? <span style={{ color: '#df1529' }}>{statsError}</span> : stats?.associate_requests?.pending ?? '--'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional Stats Row */}
              <div className="row gy-4 mb-4">
                <div className="col-lg-4 col-md-6">
                  <div className="dashboard-stat-card bg-white rounded-4 shadow-sm p-4 text-center animate-fade-in orange-border">
                    <div style={{ fontSize: 32, color: accent, marginBottom: 8 }}><i className="bi bi-person-check"></i></div>
                    <div style={{ fontWeight: 700, fontSize: 22, color: '#444' }}>Available Freelancers</div>
                    <div style={{ color: '#888', fontSize: 15 }}>
                      {statsLoading ? '...' : statsError ? <span style={{ color: '#df1529' }}>{statsError}</span> : stats?.freelancer_availability?.available ?? '--'}
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div className="dashboard-stat-card bg-white rounded-4 shadow-sm p-4 text-center animate-fade-in orange-border">
                    <div style={{ fontSize: 32, color: accent, marginBottom: 8 }}><i className="bi bi-person-x"></i></div>
                    <div style={{ fontWeight: 700, fontSize: 22, color: '#444' }}>Unavailable Freelancers</div>
                    <div style={{ color: '#888', fontSize: 15 }}>
                      {statsLoading ? '...' : statsError ? <span style={{ color: '#df1529' }}>{statsError}</span> : stats?.freelancer_availability?.unavailable ?? '--'}
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-6">
                  <div className="dashboard-stat-card bg-white rounded-4 shadow-sm p-4 text-center animate-fade-in orange-border">
                    <div style={{ fontSize: 32, color: accent, marginBottom: 8 }}><i className="bi bi-person-busy"></i></div>
                    <div style={{ fontWeight: 700, fontSize: 22, color: '#444' }}>Busy Freelancers</div>
                    <div style={{ color: '#888', fontSize: 15 }}>
                      {statsLoading ? '...' : statsError ? <span style={{ color: '#df1529' }}>{statsError}</span> : stats?.freelancer_availability?.busy ?? '--'}
                    </div>
                  </div>
                </div>
              </div>
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
            </>
          )}
          {/* Associate Requests Table (Associate Requests Tab) */}
          {activeTab === 'associate-requests' && (
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)', maxWidth: 1200, margin: '0 auto' }}>
              <h5 style={{ color: accent, fontWeight: 700, marginBottom: 18 }}>Associate Requests</h5>
              {associateRequestsLoading ? (
                <div>Loading associate requests...</div>
              ) : associateRequestsError ? (
                <div style={{ color: '#df1529', fontWeight: 500 }}>{associateRequestsError}</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-bordered" style={{ minWidth: 700 }}>
                    <thead style={{ background: '#f8f9fa' }}>
                      <tr>
                        <th>Email</th>
                        <th>Company Name</th>
                        <th>Contact Person</th>
                        <th>Industry</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Requested</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {associateRequests.map(request => (
                        <tr key={request.request_id}>
                          <td>{request.email}</td>
                          <td>{request.company_name || 'N/A'}</td>
                          <td>{request.contact_person}</td>
                          <td>{request.industry}</td>
                          <td>{request.phone}</td>
                          <td>
                            <span className={`badge ${request.status === 'pending' ? 'bg-warning' : request.status === 'approved' ? 'bg-success' : 'bg-danger'}`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          <td>{request.created_at ? new Date(request.created_at).toLocaleDateString() : ''}</td>
                          <td>
                            {request.status === 'pending' && (
                              <button
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => setSelectedRequest(request)}
                                style={{ borderRadius: 20, fontWeight: 600, fontSize: 14, padding: '6px 18px' }}
                              >
                                Review
                              </button>
                            )}
                            {request.status !== 'pending' && (
                              <div>
                                <small className="text-muted">
                                  {request.reviewed_at ? `Reviewed: ${new Date(request.reviewed_at).toLocaleDateString()}` : ''}
                                </small>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Review Modal */}
              {selectedRequest && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                  <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Review Associate Request</h5>
                        <button type="button" className="btn-close" onClick={() => setSelectedRequest(null)}></button>
                      </div>
                      <div className="modal-body">
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <strong>Email:</strong> {selectedRequest.email}
                          </div>
                          <div className="col-md-6">
                            <strong>Company:</strong> {selectedRequest.company_name || 'N/A'}
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <strong>Contact Person:</strong> {selectedRequest.contact_person}
                          </div>
                          <div className="col-md-6">
                            <strong>Industry:</strong> {selectedRequest.industry}
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <strong>Phone:</strong> {selectedRequest.phone}
                          </div>
                          <div className="col-md-6">
                            <strong>Website:</strong> {selectedRequest.website || 'N/A'}
                          </div>
                        </div>
                        {selectedRequest.request_reason && (
                          <div className="mb-3">
                            <strong>Reason:</strong> {selectedRequest.request_reason}
                          </div>
                        )}
                        <hr />
                        <form>
                          <div className="mb-3">
                            <label className="form-label">Decision:</label>
                            <select 
                              name="status" 
                              className="form-select" 
                              value={reviewFormData.status}
                              onChange={handleReviewFormChange}
                            >
                              <option value="approved">Approve</option>
                              <option value="rejected">Reject</option>
                            </select>
                          </div>
                          {reviewFormData.status === 'approved' && (
                            <div className="mb-3">
                              <label className="form-label">Set Password:</label>
                              <input 
                                type="password" 
                                name="password" 
                                className="form-control" 
                                placeholder="Enter password for the new account"
                                value={reviewFormData.password}
                                onChange={handleReviewFormChange}
                                required
                              />
                            </div>
                          )}
                          <div className="mb-3">
                            <label className="form-label">Review Notes (Optional):</label>
                            <textarea 
                              name="review_notes" 
                              className="form-control" 
                              rows="3"
                              placeholder="Add any notes about this decision"
                              value={reviewFormData.review_notes}
                              onChange={handleReviewFormChange}
                            ></textarea>
                          </div>
                        </form>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setSelectedRequest(null)}>
                          Cancel
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-primary" 
                          onClick={() => handleReviewRequest(selectedRequest.request_id)}
                          disabled={reviewLoading || (reviewFormData.status === 'approved' && !reviewFormData.password)}
                        >
                          {reviewLoading ? 'Processing...' : `Submit ${reviewFormData.status}`}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
          {/* Freelancers Table (Freelancers Tab) */}
          {activeTab === 'freelancers' && (
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)', maxWidth: 1200, margin: '0 auto' }}>
              <h5 style={{ color: accent, fontWeight: 700, marginBottom: 18 }}>All Freelancers</h5>
              
              {/* Filters */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <label className="form-label">Availability Status:</label>
                  <select 
                    className="form-select" 
                    value={freelancerFilters.availability_status}
                    onChange={(e) => {
                      setFreelancerFilters(prev => ({ ...prev, availability_status: e.target.value, page: 1 }));
                      setTimeout(() => fetchFreelancersWithFilters(), 100);
                    }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="busy">Busy</option>
                  </select>
                </div>
              </div>
              
              {freelancersLoading ? (
                <div>Loading freelancers...</div>
              ) : freelancersError ? (
                <div style={{ color: '#df1529', fontWeight: 500 }}>{freelancersError}</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-bordered" style={{ minWidth: 700 }}>
                    <thead style={{ background: '#f8f9fa' }}>
                      <tr>
                        <th>Email</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Phone</th>
                        <th>Availability</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Last Login</th>
                        <th>Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {freelancers.map(f => (
                        <tr key={f.freelancer_id}>
                          <td>{f.email}</td>
                          <td>{f.first_name}</td>
                          <td>{f.last_name}</td>
                          <td>{f.phone}</td>
                          <td>
                            <select 
                              className="form-select form-select-sm" 
                              value={f.availability_status || 'available'}
                              onChange={(e) => updateFreelancerAvailability(f.freelancer_id, e.target.value)}
                              disabled={availabilityUpdateLoading[f.freelancer_id]}
                              style={{ minWidth: 100 }}
                            >
                              <option value="available">Available</option>
                              <option value="unavailable">Unavailable</option>
                              <option value="busy">Busy</option>
                            </select>
                          </td>
                          <td>{f.is_verified ? 'Verified' : 'Unverified'}</td>
                          <td>{f.created_at ? new Date(f.created_at).toLocaleDateString() : ''}</td>
                          <td>{f.last_login ? new Date(f.last_login).toLocaleDateString() : ''}</td>
                          <td>
                            <span className="badge" style={{ background: f.is_active ? '#059652' : '#df1529', color: '#fff', borderRadius: 20, fontWeight: 600, fontSize: 14, padding: '6px 18px', minWidth: 90 }}>
                              {f.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            {availabilityUpdateLoading[f.freelancer_id] && (
                              <small className="text-muted">Updating...</small>
                            )}
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
        .dashboard-stat-card {
          transition: transform 0.22s cubic-bezier(.4,2,.6,1), box-shadow 0.22s cubic-bezier(.4,2,.6,1);
          will-change: transform, box-shadow;
        }
        .dashboard-stat-card:hover, .dashboard-stat-card:focus {
          transform: translateY(-8px) scale(1.045);
          box-shadow: 0 8px 32px rgba(253,104,14,0.18);
          z-index: 2;
        }
        .animate-fade-in {
          animation: fadeInUp 0.7s cubic-bezier(.4,2,.6,1);
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(32px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .admin-sidebar-btn {
          background: none;
          border: none;
          color: #fff;
          text-align: left;
          width: 100%;
          display: flex;
          align-items: center;
          padding: 14px 32px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          position: relative;
          transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.18s;
          outline: none;
        }
        .admin-sidebar-btn:hover, .admin-sidebar-btn:focus {
          background: rgba(253,104,14,0.12);
          color: #fd680e;
          box-shadow: 0 2px 16px rgba(253,104,14,0.18);
          transform: translateX(6px) scale(1.04);
          z-index: 2;
        }
        .orange-border {
          border: 2.5px solid rgba(253,104,14,0.18);
          box-shadow: 0 2px 16px rgba(253,104,14,0.08);
          transition: border-color 0.22s cubic-bezier(.4,2,.6,1), box-shadow 0.22s cubic-bezier(.4,2,.6,1);
        }
        .dashboard-stat-card.orange-border:hover, .dashboard-stat-card.orange-border:focus {
          border-color: #fd680e;
          box-shadow: 0 8px 32px rgba(253,104,14,0.18), 0 0 0 4px rgba(253,104,14,0.10);
        }
      `}</style>
    </div>
  );
};

export default ESCAdminDashboard; 