import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { useRef } from 'react';
import ActivityTable from "./ActivityTable";
import { useAuth } from '../contexts/AuthContext';
// REMOVE: import io from 'socket.io-client';

const accent = '#fd680e';

const AssociateDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search state
  const [searchForm, setSearchForm] = useState({
    keyword: '',
    skills: '',
    min_experience: '',
    max_experience: '',
    location: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [pagination, setPagination] = useState({});
  
  // Messaging state
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagingLoading, setMessagingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'messages', 'change-password'
  
  // Skills for dropdown
  const [availableSkills, setAvailableSkills] = useState([]);
  const [globalUnread, setGlobalUnread] = useState(0);
  const messagesEndRef = useRef(null);

  const [associateProfile, setAssociateProfile] = useState(null);
  const [assocUploading, setAssocUploading] = useState(false);
  const [assocUploadError, setAssocUploadError] = useState('');
  const [assocUploadSuccess, setAssocUploadSuccess] = useState('');
  const [assocDeleteMsg, setAssocDeleteMsg] = useState('');
  const assocFileInputRef = useRef(null);

  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePwForm, setChangePwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [changePwError, setChangePwError] = useState('');
  const [changePwSuccess, setChangePwSuccess] = useState('');
  const [changePwLoading, setChangePwLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, strength: 'weak', color: '#dc3545' });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // REMOVE: const socket = io('http://localhost:5000'); // Adjust if backend URL is different

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSkills();
      fetchConversations();
      fetchGlobalUnread();
    }
  }, [user]);

  useEffect(() => {
    // Fetch associate profile on mount
    const fetchAssociateProfile = async () => {
      try {
        const response = await api.get('/associate/profile');
        if (response.data.success) {
          setAssociateProfile(response.data.profile);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchAssociateProfile();
  }, []);

  useEffect(() => {
    fetchActivity();
  }, []);

  // REMOVE: useEffect for socket.io real-time status updates

  useEffect(() => {
    // Show toast for upload success
    if (assocUploadSuccess) {
      setToast({ message: assocUploadSuccess, type: 'success' });
      setTimeout(() => setToast({ message: '', type: '' }), 3000);
    }
  }, [assocUploadSuccess]);
  // Show toast for delete
  useEffect(() => {
    if (assocDeleteMsg) {
      setToast({ message: assocDeleteMsg, type: 'info' });
      setTimeout(() => setToast({ message: '', type: '' }), 3000);
    }
  }, [assocDeleteMsg]);
  // Show toast for upload error
  useEffect(() => {
    if (assocUploadError) {
      setToast({ message: assocUploadError, type: 'danger' });
      setTimeout(() => setToast({ message: '', type: '' }), 3000);
    }
  }, [assocUploadError]);

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
      if (parsedUser.user_type !== 'associate') {
        setError('Access denied. Associate privileges required.');
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

  const fetchSkills = async () => {
    try {
      const response = await api.get('/search/skills');
      
      if (response.data.success) {
        setAvailableSkills(response.data.skills);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/message/conversations');
      
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchGlobalUnread = async () => {
    try {
      const response = await api.get('/message/unread-count');
      if (response.data.success) {
        setGlobalUnread(response.data.total_unread);
      }
    } catch (error) {
      setGlobalUnread(0);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await api.get("/associate/activity");
      setActivities(res.data.activities || []);
    } catch (err) {
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const params = new URLSearchParams();
      
      // Add search parameters
      Object.keys(searchForm).forEach(key => {
        if (searchForm[key]) {
          params.append(key, searchForm[key]);
        }
      });

      const response = await api.get(`/search/freelancers?${params}`);

      if (response.data.success) {
        setSearchResults(response.data.freelancers);
        setPagination(response.data.pagination);
      } else {
        setSearchError(response.data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      if (error.response?.data?.message) {
        setSearchError(error.response.data.message);
      } else {
        setSearchError('Search failed. Please try again.');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendMessage = async (freelancerId) => {
    try {
      // Create or get conversation
      const conversationResponse = await api.post('/message/conversations', {
        recipient_id: freelancerId
      });

      if (conversationResponse.data.success) {
        const conversationId = conversationResponse.data.conversation_id;
        
        // Open messaging tab and load conversation
        setActiveTab('messages');
        await loadConversation(conversationId);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await api.get(`/message/conversations/${conversationId}/messages`);
      if (response.data.success) {
        setMessages(response.data.messages);
        setSelectedConversation(conversationId);
        // Mark as read
        await api.put(`/message/conversations/${conversationId}/read`, {});
        // Refresh conversations to update unread counts
        await fetchConversations();
        await fetchGlobalUnread();
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/message/messages/${messageId}`);
      if (selectedConversation) await loadConversation(selectedConversation);
    } catch (error) {
      alert('Failed to delete message.');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setMessagingLoading(true);
    try {
      const response = await api.post(`/message/conversations/${selectedConversation}/messages`, {
        content: newMessage.trim()
      });

      if (response.data.success) {
        setNewMessage('');
        // Reload messages
        await loadConversation(selectedConversation);
        // Refresh conversations list
        await fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setMessagingLoading(false);
    }
  };

  const handleAssociateProfileImageChange = async (e) => {
    setAssocUploadError('');
    setAssocUploadSuccess('');
    setAssocDeleteMsg('');
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAssocUploadError('Please select a valid image file.');
      return;
    }
    setAssocUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/associate/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        setAssocUploadSuccess('Profile picture updated!');
        setAssociateProfile((prev) => ({
          ...prev,
          profile_picture_url: response.data.image_url
        }));
      } else {
        setAssocUploadError(response.data.message || 'Failed to upload image.');
      }
    } catch (err) {
      setAssocUploadError('Failed to upload image. Please try again.');
    } finally {
      setAssocUploading(false);
      if (assocFileInputRef.current) assocFileInputRef.current.value = '';
    }
  };

  const handleDeleteAssociateProfileImage = async () => {
    if (!window.confirm("Delete your profile picture?")) return;
    try {
      await api.delete("/associate/profile-image");
      setAssocDeleteMsg("Profile picture deleted.");
      setAssociateProfile(prev => ({
        ...prev,
        profile_picture_url: null
      }));
    } catch (err) {
      setAssocDeleteMsg(
        err.response?.data?.message ||
        "Failed to delete profile picture."
      );
    }
  };

  const getAssociateAvatarUrl = () => {
    const BACKEND_URL = "http://localhost:5000";
    if (associateProfile?.profile_picture_url) {
      if (associateProfile.profile_picture_url.startsWith('http')) {
        return associateProfile.profile_picture_url;
      }
      return `${BACKEND_URL}${associateProfile.profile_picture_url}?t=${Date.now()}`;
    }
    const name = `${associateProfile?.contact_person || associateProfile?.email || "User"}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eee&color=555&size=120&bold=true`;
  };

  // Password strength validation
  const validatePasswordStrength = (password) => {
    let score = 0;
    const errors = [];

    // Length check
    if (password.length >= 8) score += 1;
    else errors.push('At least 8 characters');

    // Uppercase check
    if (/[A-Z]/.test(password)) score += 1;
    else errors.push('One uppercase letter');

    // Lowercase check
    if (/[a-z]/.test(password)) score += 1;
    else errors.push('One lowercase letter');

    // Number check
    if (/\d/.test(password)) score += 1;
    else errors.push('One number');

    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else errors.push('One special character');

    // Common password check
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123'];
    if (!commonPasswords.includes(password.toLowerCase())) score += 1;
    else errors.push('Not a common password');

    // Sequential check
    const sequentialPatterns = ['123', 'abc', 'qwe'];
    const hasSequential = sequentialPatterns.some(pattern => 
      password.toLowerCase().includes(pattern)
    );
    if (!hasSequential) score += 1;
    else errors.push('No sequential characters');

    // Repeated characters check
    if (!/(.)\1{2,}/.test(password)) score += 1;
    else errors.push('No repeated characters');

    let strength = 'weak';
    let color = '#dc3545';
    
    if (score >= 7) {
      strength = 'strong';
      color = '#28a745';
    } else if (score >= 5) {
      strength = 'medium';
      color = '#ffc107';
    }

    return { score, strength, color, errors };
  };

  // Handler for change password form
  const handleChangePwInput = (e) => {
    const { name, value } = e.target;
    setChangePwForm(prev => ({ ...prev, [name]: value }));
    setChangePwError('');
    setChangePwSuccess('');
    
    // Update password strength for new password field
    if (name === 'newPassword') {
      const strength = validatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePwError('');
    setChangePwSuccess('');
    if (!changePwForm.oldPassword || !changePwForm.newPassword || !changePwForm.confirmPassword) {
      setChangePwError('All fields are required.');
      return;
    }
    if (changePwForm.newPassword !== changePwForm.confirmPassword) {
      setChangePwError('New passwords do not match.');
      return;
    }
    setChangePwLoading(true);
    try {
      const res = await api.post('/associate/change-password', {
        oldPassword: changePwForm.oldPassword,
        newPassword: changePwForm.newPassword
      });
      if (res.data.success) {
        setChangePwSuccess('Password changed successfully!');
        setChangePwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setChangePwError(res.data.message || 'Failed to change password.');
      }
    } catch (err) {
      setChangePwError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setChangePwLoading(false);
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
          <div className="error-message">
            <h4>Authentication Error</h4>
            <p>{error}</p>
            <p className="text-muted">This might be due to an expired session. Please try logging in again.</p>
          </div>
          <button onClick={() => navigate('/login')} className="btn-get-started">Back to Login</button>
        </div>
      </section>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(120deg, #fff 60%, #f8f4f2 100%)' }}>
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
          <Link to="/associate/dashboard" style={{ textDecoration: 'none', color: accent, fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>
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
      {/* Main Layout */}
      <div className="container-fluid py-4">
        <div className="row">
          {/* Left Panel */}
          <div className="col-lg-3 mb-4 mb-lg-0">
            <div className="bg-white rounded-4 shadow-lg p-4 h-100 d-flex flex-column align-items-center" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.07)', position: 'relative' }}>
              {/* Toast popup notification */}
              {toast.message && (
                <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, minWidth: 180 }}>
                  <div className={`toast show align-items-center text-white bg-${toast.type === 'success' ? 'success' : toast.type === 'info' ? 'primary' : 'danger'} border-0`} role="alert" aria-live="assertive" aria-atomic="true" style={{ borderRadius: 16, boxShadow: '0 2px 16px rgba(253,104,14,0.18)', fontWeight: 600, fontSize: 15, padding: '12px 24px' }}>
                    <div className="d-flex align-items-center">
                      <i className={`bi me-2 ${toast.type === 'success' ? 'bi-check-circle' : toast.type === 'info' ? 'bi-info-circle' : 'bi-exclamation-triangle'}`}></i>
                      <div>{toast.message}</div>
          </div>
        </div>
          </div>
        )}
              {/* Profile image and overlay buttons */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={getAssociateAvatarUrl()}
                alt="Profile"
                  className="rounded-circle mb-3"
                  style={{ width: 90, height: 90, objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 4px 16px rgba(253,104,14,0.15)' }}
                onError={e => {
                  e.target.onerror = null;
                    e.target.src = "https://ui-avatars.com/api/?name=User&background=eee&color=555&size=90&bold=true";
                  }}
                />
                {/* Delete button overlays top-right of image */}
              {associateProfile?.profile_picture_url && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    borderRadius: "50%",
                    padding: "6px 8px",
                    fontSize: 18,
                    zIndex: 2
                  }}
                  title="Delete Profile Picture"
                  onClick={handleDeleteAssociateProfileImage}
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
                {/* Upload button overlays bottom-right of image */}
                <button
                  type="button"
                  className="btn rounded-circle profile-upload-btn position-absolute"
                  style={{ bottom: 0, right: 0, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: 0, background: accent, color: '#fff', transition: 'transform 0.18s, box-shadow 0.18s' }}
                  onClick={() => assocFileInputRef.current && assocFileInputRef.current.click()}
                  title="Upload/Change Profile Picture"
                  disabled={assocUploading}
                >
                  <i className="bi bi-plus"></i>
                </button>
              <input
                type="file"
                accept="image/*"
                ref={assocFileInputRef}
                style={{ display: 'none' }}
                onChange={handleAssociateProfileImageChange}
                disabled={assocUploading}
              />
            </div>
              <h5 className="mt-3 mb-1" style={{ color: '#444', fontWeight: 700 }}>{associateProfile?.contact_person || user?.email}</h5>
              <span className="badge bg-success mb-2">Associate</span>
              <div className="d-grid gap-3 w-100 mt-4">
                <button 
                  className={`btn dashboard-btn w-100 ${activeTab === 'search' ? '' : 'btn-outline-primary'}`}
                  style={{ background: activeTab === 'search' ? accent : 'transparent', color: activeTab === 'search' ? '#fff' : accent, border: `2px solid ${accent}`, borderRadius: 30, padding: '12px 24px', fontWeight: 600, fontSize: 16, transition: 'transform 0.18s, box-shadow 0.18s' }}
                  onClick={() => setActiveTab('search')}
                >
                  <i className="bi bi-search me-2"></i>Search Freelancers
                </button>
                <button 
                  className={`btn dashboard-btn w-100 ${activeTab === 'messages' ? '' : 'btn-outline-primary'} position-relative`}
                  style={{ background: activeTab === 'messages' ? accent : 'transparent', color: activeTab === 'messages' ? '#fff' : accent, border: `2px solid ${accent}`, borderRadius: 30, padding: '12px 24px', fontWeight: 600, fontSize: 16, transition: 'transform 0.18s, box-shadow 0.18s' }}
                  onClick={() => setActiveTab('messages')}
                >
                  <i className="bi bi-chat-dots me-2"></i>Messages
                  {globalUnread > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{ background: '#df1529' }}>
                      {globalUnread}
                    </span>
                  )}
                </button>
                <button 
                  className={`btn dashboard-btn w-100 ${activeTab === 'change-password' ? '' : 'btn-outline-primary'}`}
                  style={{ background: activeTab === 'change-password' ? accent : 'transparent', color: activeTab === 'change-password' ? '#fff' : accent, border: `2px solid ${accent}`, borderRadius: 30, padding: '12px 24px', fontWeight: 600, fontSize: 16, transition: 'transform 0.18s, box-shadow 0.18s' }}
                  onClick={() => setActiveTab('change-password')}
                >
                  <i className="bi bi-key me-2"></i>Change Password
                </button>
              </div>
              {assocUploading && (
                <div className="mt-2">
                  <span className="spinner-border spinner-border-sm text-primary" role="status" />
                  <span className="ms-2">Uploading...</span>
                </div>
              )}
            </div>
          </div>
          {/* Main Content Area */}
          <div className="col-lg-9">
            <div className="section-title mb-4">
              <h2 style={{ color: accent, fontWeight: 700 }}>Associate Dashboard</h2>
              <p style={{ color: '#888' }}>Search for top freelancers, review profiles, and connect with talent that matches your needs.</p>
            </div>
            {/* Global Unread Badge */}
            {globalUnread > 0 && (
              <div className="text-end mb-3">
                <span className="badge fs-6" style={{ background: '#df1529' }}>
                  <i className="bi bi-envelope-fill me-1"></i> {globalUnread} new message{globalUnread > 1 ? 's' : ''}
                </span>
        </div>
            )}
            {/* Tab Content */}
        {activeTab === 'search' && (
          <div className="tab-content">
            {/* Skill Search */}
                <div className="card p-4 shadow-lg mb-4 rounded-4">
                  <form className="row g-3 align-items-end" onSubmit={handleSearch}>
                    <div className="col-md-4">
                      <label className="form-label">Skill</label>
                      <input
                        list="skills-list"
                        className="form-control"
                        name="skills"
                        value={searchForm.skills}
                        onChange={handleSearchChange}
                        placeholder="Type or select a skill"
                        autoComplete="off"
                      />
                      <datalist id="skills-list">
                        {availableSkills.map(skill => (
                          <option key={skill.skill_id} value={skill.skill_name} />
                        ))}
                      </datalist>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Min Experience</label>
                      <input
                        type="number"
                        className="form-control"
                        name="min_experience"
                        value={searchForm.min_experience}
                        onChange={handleSearchChange}
                        min="0"
                        placeholder="Years"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        name="location"
                        value={searchForm.location}
                        onChange={handleSearchChange}
                        placeholder="Location"
                      />
                    </div>
                    <div className="col-md-2 d-grid">
                      <button type="submit" className="btn dashboard-btn" style={{ background: accent, color: '#fff', border: 'none', borderRadius: 30, fontWeight: 600, fontSize: 16, padding: '12px 24px', transition: 'transform 0.18s, box-shadow 0.18s' }} disabled={searchLoading}>
                        {searchLoading ? (
                          <span>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Searching...
                          </span>
                        ) : (
                          "Search"
                        )}
                      </button>
                    </div>
                  </form>
                  {searchError && <div className="alert alert-danger mt-3 text-center">{searchError}</div>}
                </div>
            {/* Search Results */}
                {searchLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: accent }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="mt-3">Searching freelancers...</div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="row gy-4">
                    {searchResults.map((freelancer, idx) => (
                      <div className="col-lg-4 col-md-6" key={freelancer.freelancer_id || idx}>
                        <div className="card h-100 shadow-lg rounded-4">
                          <div className="card-body">
                            <h5 className="card-title mb-2" style={{ color: accent, fontWeight: 700 }}>
                              {freelancer.first_name} {freelancer.last_name}
                            </h5>
                            <p className="mb-1"><strong>Job Title:</strong> {freelancer.headline || <span className="text-muted">N/A</span>}</p>
                            <p className="mb-1"><strong>Experience:</strong> {freelancer.years_experience || 0} years</p>
                            <p className="mb-1"><strong>Email:</strong> {freelancer.email}</p>
                            <div className="mb-2">
                              <strong>Skills:</strong>
                              {freelancer.skills && freelancer.skills.length > 0 ? (
                                <ul className="list-inline mb-0">
                                  {freelancer.skills.map(skill => (
                                    <li key={skill.skill_id} className="list-inline-item badge bg-primary me-1">
                                      {skill.skill_name}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-muted ms-1">None</span>
                              )}
                            </div>
                            <button 
                              onClick={() => handleSendMessage(freelancer.freelancer_id)}
                              className="btn dashboard-btn mt-2"
                              style={{ background: accent, color: '#fff', border: 'none', borderRadius: 30, fontWeight: 600, fontSize: 16, padding: '10px 24px', transition: 'transform 0.18s, box-shadow 0.18s' }}
                            >
                              <i className="bi bi-chat me-2"></i>Message
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-search fs-1 mb-3"></i>
                    <div>No results found. Try a different skill or criteria.</div>
                  </div>
                )}
          </div>
        )}
        {activeTab === 'messages' && (
              <div className="container-fluid px-0">
            <div className="row">
              {/* Conversations List */}
              <div className="col-lg-4">
                    <div className="card border-0 shadow-lg rounded-4">
                      <div className="card-header" style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                        <h5 className="mb-0" style={{ color: '#444', fontWeight: 700 }}>Conversations</h5>
                  </div>
                  <div className="card-body p-0">
                    {conversations.length === 0 ? (
                          <div className="p-3 text-center" style={{ color: '#888' }}>
                        No conversations yet
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {conversations.map(conversation => (
                          <button
                            key={conversation.conversation_id}
                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-start ${
                              selectedConversation === conversation.conversation_id ? 'active' : ''
                            }`}
                            onClick={() => loadConversation(conversation.conversation_id)}
                                style={{
                                  border: 'none',
                                  background: selectedConversation === conversation.conversation_id ? accent : 'transparent',
                                  color: selectedConversation === conversation.conversation_id ? '#fff' : '#444',
                                  transition: 'all 0.18s ease'
                                }}
                          >
                            <div className="ms-2 me-auto">
                              <div className="fw-bold">
                                {conversation.freelancer_name}
                                {conversation.unread_count > 0 && (
                                      <span className="badge ms-2" style={{ background: '#df1529' }}>{conversation.unread_count}</span>
                                )}
                              </div>
                                  <small style={{ color: selectedConversation === conversation.conversation_id ? 'rgba(255,255,255,0.8)' : '#888' }}>
                                {conversation.last_message ? 
                                  conversation.last_message.substring(0, 50) + '...' : 
                                  'No messages yet'
                                }
                              </small>
                            </div>
                                <small style={{ color: selectedConversation === conversation.conversation_id ? 'rgba(255,255,255,0.8)' : '#888' }}>
                              {conversation.last_message_time ? 
                                new Date(conversation.last_message_time).toLocaleDateString() : 
                                ''
                              }
                            </small>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Messages */}
              <div className="col-lg-8">
                    <div className="card border-0 shadow-lg rounded-4">
                      <div className="card-header" style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                        <h5 className="mb-0" style={{ color: '#444', fontWeight: 700 }}>
                      {selectedConversation ? 
                        conversations.find(c => c.conversation_id === selectedConversation)?.freelancer_name || 'Messages' : 
                        'Select a conversation'
                      }
                    </h5>
                  </div>
                  <div className="card-body">
                    {selectedConversation ? (
                      <>
                        {/* Messages List */}
                        <div className="messages-container" style={{ height: '400px', overflowY: 'auto' }}>
                          {messages.map(message => (
                            <div key={message.message_id} className={`mb-3 ${message.sender_id === user.user_id ? 'text-end' : 'text-start'}`}>
                                  <div className={`d-inline-block p-3 rounded ${message.sender_id === user.user_id ? 'text-white' : 'bg-light'}`}
                                       style={{ 
                                         background: message.sender_id === user.user_id ? accent : '#f8f9fa',
                                         maxWidth: '70%'
                                       }}>
                                <div className="d-flex align-items-center">
                                  <div className="flex-grow-1">{message.content}</div>
                                  {message.sender_id === user.user_id && (
                                    <button
                                      type="button"
                                          className="btn btn-sm btn-link ms-2 p-0 message-delete-btn"
                                      title="Delete message"
                                      onClick={() => handleDeleteMessage(message.message_id)}
                                          style={{fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', transition: 'all 0.18s ease'}}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  )}
                                </div>
                                    <small style={{ color: message.sender_id === user.user_id ? 'rgba(255,255,255,0.8)' : '#888' }}>
                                  {new Date(message.sent_at).toLocaleString()}
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Send Message Form */}
                        <form onSubmit={sendMessage} className="mt-3">
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Type your message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              disabled={messagingLoading}
                                  style={{ borderRadius: '20px 0 0 20px', border: '1.5px solid #eee' }}
                            />
                                <button type="submit" className="btn dashboard-btn" disabled={messagingLoading || !newMessage.trim()} style={{ background: accent, color: '#fff', border: 'none', borderRadius: '0 20px 20px 0', fontWeight: 600, transition: 'transform 0.18s, box-shadow 0.18s' }}>
                              {messagingLoading ? 'Sending...' : 'Send'}
                            </button>
                          </div>
                        </form>
                      </>
                    ) : (
                          <div className="text-center py-5" style={{ color: '#888' }}>
                            <i className="bi bi-chat-dots fs-1" style={{ color: accent }}></i>
                        <p>Select a conversation to start messaging</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'change-password' && (
          <div className="bg-white rounded-4 shadow-sm p-4 mt-3" style={{ maxWidth: 500, margin: '0 auto' }}>
            <h5 style={{ color: accent, fontWeight: 700, marginBottom: 18 }}>Change Password</h5>
            <form onSubmit={handleChangePassword} autoComplete="off" data-form-type="other">
              <div className="mb-3">
                <label className="form-label">Old Password</label>
                <div className="position-relative">
                  <input 
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword" 
                    className="form-control" 
                    value={changePwForm.oldPassword} 
                    onChange={handleChangePwInput} 
                    required 
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
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
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    <i className={`bi ${showOldPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <div className="position-relative">
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword" 
                    className="form-control" 
                    value={changePwForm.newPassword} 
                    onChange={handleChangePwInput} 
                    required 
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
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
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    <i className={`bi ${showNewPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
                {/* Password strength indicator */}
                {changePwForm.newPassword && (
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
                <label className="form-label">Confirm New Password</label>
                <div className="position-relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword" 
                    className="form-control" 
                    value={changePwForm.confirmPassword} 
                    onChange={handleChangePwInput} 
                    required 
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
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
              </div>
              {changePwError && <div className="alert alert-danger">{changePwError}</div>}
              {changePwSuccess && <div className="alert alert-success">{changePwSuccess}</div>}
              <div className="d-flex gap-2">
                <button 
                  type="submit" 
                  className="btn dashboard-btn" 
                  style={{ background: accent, color: '#fff', borderRadius: 30, fontWeight: 600, fontSize: 16, padding: '10px 28px' }} 
                  disabled={changePwLoading || passwordStrength.score < 5}
                >
                  {changePwLoading ? 'Changing...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        )}
      {/* Recent Activity */}
            <div className="mt-5">
              <h5 className="mb-3" style={{ color: '#444', fontWeight: 700 }}>Recent Activity</h5>
        {activityLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" style={{ color: accent }} role="status"></div>
                </div>
        ) : (
                <div className="bg-light rounded-3 p-3" style={{ maxHeight: '300px', overflowY: 'auto', background: '#f8f9fa' }}>
          <ActivityTable activities={activities} />
                </div>
        )}
            </div>
          </div>
        </div>
      </div>
      {/* Animation Styles */}
      <style>{`
        .dashboard-btn:hover, .dashboard-btn:focus {
          transform: scale(1.07);
          box-shadow: 0 4px 24px rgba(253,104,14,0.18);
          z-index: 2;
        }
        .profile-upload-btn:hover, .profile-upload-btn:focus {
          transform: scale(1.15);
          box-shadow: 0 4px 16px rgba(253,104,14,0.25);
          z-index: 2;
        }
        .message-delete-btn:hover, .message-delete-btn:focus {
          transform: scale(1.2);
          color: #fff !important;
        }
        .list-group-item:hover {
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(253,104,14,0.1);
        }
      `}</style>
    </div>
  );
};

export default AssociateDashboard; 