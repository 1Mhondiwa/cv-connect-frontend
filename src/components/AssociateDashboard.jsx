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
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'messages'
  
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
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Associate Dashboard</h2>
        <p>
          Search for top freelancers, review profiles, and connect with talent that matches your needs.
        </p>
      </div>

      {/* User Type Display */}
      <div className="container mb-4" data-aos="fade-up" data-aos-delay="50">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card text-center">
              <div className="card-body">
                <i className="bi bi-building fs-1 text-primary mb-3"></i>
                <h4 className="card-title">Account Type</h4>
                <p className="card-text">
                  <span className="badge bg-success fs-6">Associate</span>
                </p>
                <p className="text-muted small">Industry: {user?.industry || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Unread Badge */}
      <div className="container" style={{marginTop: '-20px'}}>
        {globalUnread > 0 && (
          <div className="text-end">
            <span className="badge bg-danger fs-6">
              <i className="bi bi-envelope-fill me-1"></i> {globalUnread} new message{globalUnread > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Profile Image Upload/Delete Section */}
      <div className="container mb-4" data-aos="fade-up" data-aos-delay="50">
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={getAssociateAvatarUrl()}
                alt="Profile"
                className="rounded-circle shadow"
                style={{
                  width: 120,
                  height: 120,
                  objectFit: 'cover',
                  border: '4px solid #fff',
                  background: '#eee',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
                onError={e => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://ui-avatars.com/api/?name=User&background=eee&color=555&size=120&bold=true";
                }}
              />
              <button
                type="button"
                className="btn btn-primary rounded-circle"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  border: '3px solid #fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  padding: 0
                }}
                onClick={() => assocFileInputRef.current && assocFileInputRef.current.click()}
                title="Upload/Change Profile Picture"
                disabled={assocUploading}
              >
                <i className="bi bi-plus"></i>
              </button>
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
              <input
                type="file"
                accept="image/*"
                ref={assocFileInputRef}
                style={{ display: 'none' }}
                onChange={handleAssociateProfileImageChange}
                disabled={assocUploading}
              />
            </div>
            {assocUploadSuccess && <div className="sent-message mt-2">{assocUploadSuccess}</div>}
            {assocUploadError && <div className="error-message mt-2">{assocUploadError}</div>}
            {assocDeleteMsg && <div className="mt-2 alert alert-info text-center">{assocDeleteMsg}</div>}
            {assocUploading && (
              <div className="mt-2">
                <span className="spinner-border spinner-border-sm text-primary" role="status" />
                <span className="ms-2">Uploading...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-tabs" id="dashboardTabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'search' ? 'active' : ''}`}
                  onClick={() => setActiveTab('search')}
                >
                  <i className="bi bi-search me-2"></i>Search Freelancers
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'messages' ? 'active' : ''}`}
                  onClick={() => setActiveTab('messages')}
                >
                  <i className="bi bi-chat-dots me-2"></i>Messages
                  {conversations.filter(c => c.unread_count > 0).length > 0 && (
                    <span className="badge bg-danger ms-2">
                      {conversations.filter(c => c.unread_count > 0).length}
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="tab-content">
            {/* Skill Search */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card p-4 shadow-sm">
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
                      <button type="submit" className="btn btn-primary" disabled={searchLoading}>
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
              </div>
            </div>

            {/* Search Results */}
            <div className="row">
              <div className="col-12">
                {searchLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="mt-3">Searching freelancers...</div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="row gy-4">
                    {searchResults.map((freelancer, idx) => (
                      <div className="col-lg-4 col-md-6" key={freelancer.freelancer_id || idx}>
                        <div className="card h-100 shadow-sm">
                          <div className="card-body">
                            <h5 className="card-title mb-2">
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
                              className="btn-get-started mt-2"
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
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row">
              {/* Conversations List */}
              <div className="col-lg-4">
                <div className="card">
                  <div className="card-header">
                    <h5>Conversations</h5>
                  </div>
                  <div className="card-body p-0">
                    {conversations.length === 0 ? (
                      <div className="p-3 text-center text-muted">
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
                          >
                            <div className="ms-2 me-auto">
                              <div className="fw-bold">
                                {conversation.freelancer_name}
                                {conversation.unread_count > 0 && (
                                  <span className="badge bg-danger ms-2">{conversation.unread_count}</span>
                                )}
                              </div>
                              <small className="text-muted">
                                {conversation.last_message ? 
                                  conversation.last_message.substring(0, 50) + '...' : 
                                  'No messages yet'
                                }
                              </small>
                            </div>
                            <small className="text-muted">
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
                <div className="card">
                  <div className="card-header">
                    <h5>
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
                              <div className={`d-inline-block p-3 rounded ${message.sender_id === user.user_id ? 'bg-primary text-white' : 'bg-light'}`}>
                                <div className="d-flex align-items-center">
                                  <div className="flex-grow-1">{message.content}</div>
                                  {message.sender_id === user.user_id && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-link text-danger ms-2 p-0"
                                      title="Delete message"
                                      onClick={() => handleDeleteMessage(message.message_id)}
                                      style={{fontSize: '1.1rem'}}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  )}
                                </div>
                                <small className={message.sender_id === user.user_id ? 'text-white-50' : 'text-muted'}>
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
                            />
                            <button type="submit" className="btn-get-started" disabled={messagingLoading || !newMessage.trim()}>
                              {messagingLoading ? 'Sending...' : 'Send'}
                            </button>
                          </div>
                        </form>
                      </>
                    ) : (
                      <div className="text-center text-muted">
                        <i className="bi bi-chat-dots fs-1"></i>
                        <p>Select a conversation to start messaging</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="container mt-5" data-aos="fade-up" data-aos-delay="100">
        <h2>Recent Activity</h2>
        {activityLoading ? (
          <div>Loading...</div>
        ) : (
          <ActivityTable activities={activities} />
        )}
      </div>
    </div>
  );
};

export default AssociateDashboard; 