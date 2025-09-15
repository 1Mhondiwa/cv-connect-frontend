import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { useRef } from 'react';
import ActivityTable from "./ActivityTable";
import { useAuth } from '../contexts/AuthContext';
import HiringModal from './HiringModal';
import InterviewSchedulingModal from './InterviewSchedulingModal';
import InterviewDashboard from './InterviewDashboard';
import InterviewFeedbackModal from './InterviewFeedbackModal';
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
    title: '',
    description: '',
    skills: '',
    min_experience: '',
    location: '',
    budget_range: '',
    urgency_level: 'normal'
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchSuccess, setSearchSuccess] = useState('');
  const [pagination, setPagination] = useState({});
  
  // Messaging state
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagingLoading, setMessagingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('request'); // 'request', 'messages', 'change-password', 'my-requests'
  
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

  // Request management state
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);

  // Hiring state
  const [showHiringModal, setShowHiringModal] = useState(false);
  const [selectedFreelancerForHiring, setSelectedFreelancerForHiring] = useState(null);
  const [hiringLoading, setHiringLoading] = useState(false);

  // Interview state
  const [showInterviewSchedulingModal, setShowInterviewSchedulingModal] = useState(false);
  const [selectedFreelancerForInterview, setSelectedFreelancerForInterview] = useState(null);
  const [showInterviewFeedbackModal, setShowInterviewFeedbackModal] = useState(false);
  const [selectedInterviewForFeedback, setSelectedInterviewForFeedback] = useState(null);

  // REMOVE: const socket = io('http://localhost:5000'); // Adjust if backend URL is different

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSkills();
      fetchConversations();
      fetchGlobalUnread();
      fetchRequests();
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
    setSearchError(''); // Clear error when form changes
    setSearchSuccess(''); // Clear success message when form changes
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearchError('');
    setSearchResults([]);

    try {
      // Process skills field - convert comma-separated string to array
      const requestData = {
        ...searchForm,
        required_skills: searchForm.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };

      // Submit freelancer request to ECS Admin
      const response = await api.post('/associate/freelancer-request', requestData);

      if (response.data.success) {
        setSearchError(''); // Clear any previous errors
        setSearchSuccess('Your freelancer request has been submitted successfully! ECS Admin will review your requirements and contact you within 24-48 hours.');
        // Show success message - results will come from ECS Admin later
        setSearchResults([]); // Clear any previous results
        // Refresh requests list
        fetchRequests();
        // Clear form
        setSearchForm({
          title: '',
          description: '',
          skills: '',
          min_experience: '',
          location: '',
          budget_range: '',
          urgency_level: 'normal'
        });
      } else {
        setSearchError(response.data.message || 'Request submission failed');
      }
    } catch (error) {
      console.error('Request submission error:', error);
      if (error.response?.data?.message) {
        setSearchError(error.response.data.message);
      } else {
        setSearchError('Request submission failed. Please try again.');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  // Fetch all requests for this associate
  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const response = await api.get('/associate/freelancer-requests');
      if (response.data.success) {
        setRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  // Fetch recommendations for a specific request
  const fetchRecommendations = async (requestId) => {
    setRecommendationsLoading(true);
    try {
      const response = await api.get(`/associate/freelancer-requests/${requestId}/recommendations`);
      if (response.data.success) {
        setRecommendations(response.data.recommendations);
        
        // Find the full request object from the requests array
        const fullRequest = requests.find(req => req.request_id === requestId);
        setSelectedRequest(fullRequest || { request_id: requestId });
        
        setShowRecommendationsModal(true);
        
        // Refresh the requests list to update recommendation counts
        await fetchRequests();
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // Submit response to a recommendation
  const handleRecommendationResponse = async (freelancerId, response, notes = '') => {
    try {
      const responseData = await api.post(`/associate/freelancer-requests/${selectedRequest.request_id}/respond`, {
        freelancer_id: freelancerId,
        response,
        notes
      });

      if (responseData.data.success) {
        // Refresh recommendations
        await fetchRecommendations(selectedRequest.request_id);
        // Show success message
        setToast({ message: 'Response submitted successfully!', type: 'success' });
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      setToast({ message: 'Failed to submit response. Please try again.', type: 'error' });
    }
  };

  const handleStartConversation = async (freelancerId, firstName, lastName) => {
    try {
      // Create a new conversation or get existing one
      const response = await api.post('/message/conversations', {
        freelancer_id: freelancerId
      });

      if (response.data.success) {
        // Close the recommendations modal first
        setShowRecommendationsModal(false);
        
        // Navigate to messages tab and select the conversation
        setActiveTab('messages');
        
        // Set the conversation ID correctly
        const conversationId = response.data.conversation.conversation_id;
        setSelectedConversation(conversationId);
        
        // Load the conversation messages
        await loadConversation(conversationId);
        
        // Show success message
        setToast({ message: `Conversation started with ${firstName} ${lastName}!`, type: 'success' });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      setToast({ message: 'Failed to start conversation. Please try again.', type: 'error' });
    }
  };

  // Hiring functions
  const openHiringModal = (freelancer) => {
    console.log('Opening hiring modal for freelancer:', freelancer);
    console.log('Current selectedRequest:', selectedRequest);
    console.log('selectedRequest type:', typeof selectedRequest);
    console.log('selectedRequest properties:', selectedRequest ? Object.keys(selectedRequest) : 'null');
    
    if (!selectedRequest || !selectedRequest.request_id) {
      console.error('No valid request selected for hiring!');
      setToast({ 
        message: 'Error: No valid request selected. Please try again.', 
        type: 'error' 
      });
      return;
    }
    
    setSelectedFreelancerForHiring(freelancer);
    setShowHiringModal(true);
    console.log('Modal state set to true');
  };

  const closeHiringModal = () => {
    setShowHiringModal(false);
    setSelectedFreelancerForHiring(null);
  };

  const handleHireSuccess = () => {
    // Refresh recommendations and requests
    if (selectedRequest && selectedRequest.request_id) {
      fetchRecommendations(selectedRequest.request_id);
    }
    fetchRequests();
    
    // Show success toast
    setToast({ 
      message: 'Freelancer hired successfully! ECS Employee has been notified.', 
      type: 'success' 
    });
  };

  // Interview functions
  const openInterviewSchedulingModal = (freelancer) => {
    console.log('Opening interview scheduling modal for freelancer:', freelancer);
    console.log('Current selectedRequest:', selectedRequest);
    
    if (!selectedRequest || !selectedRequest.request_id) {
      console.error('No valid request selected for interview scheduling!');
      setToast({ 
        message: 'Error: No valid request selected. Please try again.', 
        type: 'error' 
      });
      return;
    }
    
    setSelectedFreelancerForInterview(freelancer);
    setShowInterviewSchedulingModal(true);
  };

  const closeInterviewSchedulingModal = () => {
    setShowInterviewSchedulingModal(false);
    setSelectedFreelancerForInterview(null);
  };

  const handleInterviewScheduleSuccess = () => {
    // Refresh recommendations and requests
    if (selectedRequest && selectedRequest.request_id) {
      fetchRecommendations(selectedRequest.request_id);
    }
    fetchRequests();
    
    // Show success toast
    setToast({ 
      message: 'Interview scheduled successfully! The freelancer has been notified.', 
      type: 'success' 
    });
  };

  const openInterviewFeedbackModal = (interview) => {
    setSelectedInterviewForFeedback(interview);
    setShowInterviewFeedbackModal(true);
  };

  const closeInterviewFeedbackModal = () => {
    setShowInterviewFeedbackModal(false);
    setSelectedInterviewForFeedback(null);
  };

  const handleInterviewFeedbackSuccess = () => {
    // Show success toast
    setToast({ 
      message: 'Interview feedback submitted successfully!', 
      type: 'success' 
    });
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
      <nav className="dashboard-navbar">
        <div className="container d-flex justify-content-between align-items-center">
          <Link to="/associate/dashboard" style={{ textDecoration: 'none', color: accent, fontWeight: 700, fontSize: 22, letterSpacing: 1 }} className="d-flex align-items-center">
            <img 
              src="/assets/img/cv-connect_logo.png" 
              alt="CV-Connect Logo" 
              style={{
                height: 32,
                width: 32,
                marginRight: 8,
                borderRadius: '50%'
              }}
            />
            CV<span style={{ color: '#333' }}>‑Connect</span>
          </Link>
          <button
            className="btn logout-btn"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <i className="bi bi-box-arrow-right"></i>Logout
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
                  className={`btn dashboard-btn w-100 ${activeTab === 'request' ? '' : ''}`}
                  style={{ background: activeTab === 'request' ? accent : 'transparent', color: activeTab === 'request' ? '#fff' : accent, border: `2px solid ${accent}`, borderRadius: 30, padding: '12px 24px', fontWeight: 600, fontSize: 16, transition: 'transform 0.18s, box-shadow 0.18s' }}
                  onClick={() => setActiveTab('request')}
                >
                  <i className="bi bi-person-plus me-2"></i>Request Freelancer
                </button>
                <button 
                  className={`btn dashboard-btn w-100 ${activeTab === 'messages' ? '' : ''} position-relative`}
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
                  className={`btn dashboard-btn w-100 ${activeTab === 'change-password' ? '' : ''}`}
                  style={{ background: activeTab === 'change-password' ? accent : 'transparent', color: activeTab === 'change-password' ? '#fff' : accent, border: `2px solid ${accent}`, borderRadius: 30, padding: '12px 24px', fontWeight: 600, fontSize: 16, transition: 'transform 0.18s, box-shadow 0.18s' }}
                  onClick={() => setActiveTab('change-password')}
                >
                  <i className="bi bi-key me-2"></i>Change Password
                </button>
                <button 
                  className={`btn dashboard-btn w-100 ${activeTab === 'my-requests' ? '' : ''}`}
                  style={{ background: activeTab === 'my-requests' ? accent : 'transparent', color: activeTab === 'my-requests' ? '#fff' : accent, border: `2px solid ${accent}`, borderRadius: 30, padding: '12px 24px', fontWeight: 600, fontSize: 16, transition: 'transform 0.18s, box-shadow 0.18s' }}
                  onClick={() => setActiveTab('my-requests')}
                >
                  <i className="bi bi-list-check me-2"></i>My Requests
                </button>
                <button 
                  className={`btn dashboard-btn w-100 ${activeTab === 'interviews' ? '' : ''}`}
                  style={{ background: activeTab === 'interviews' ? accent : 'transparent', color: activeTab === 'interviews' ? '#fff' : accent, border: `2px solid ${accent}`, borderRadius: 30, padding: '12px 24px', fontWeight: 600, fontSize: 16, transition: 'transform 0.18s, box-shadow 0.18s' }}
                  onClick={() => setActiveTab('interviews')}
                >
                  <i className="bi bi-calendar-event me-2"></i>Interviews
                </button>
              </div>
              {assocUploading && (
                <div className="mt-2">
                  <span className="spinner-border spinner-border-sm" style={{ color: '#ffd7c2' }} role="status" />
                  <span className="ms-2">Uploading...</span>
                </div>
              )}
            </div>
          </div>
          {/* Main Content Area */}
          <div className="col-lg-9">
            <div className="section-title mb-4">
              <h2 style={{ color: accent, fontWeight: 700 }}>Associate Dashboard</h2>
              <p style={{ color: '#888' }}>Request freelancers through ECS Admin, review curated profiles, and connect with pre-approved talent that matches your needs.</p>
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
        {activeTab === 'request' && (
          <div className="tab-content">
            {/* Skill Search */}
                <div className="card p-4 shadow-lg mb-4 rounded-4">
                  <div className="text-center mb-4">
                    <h4 style={{ color: accent, fontWeight: 600 }}>Request Freelancer Services</h4>
                    <p style={{ color: '#666', fontSize: 14 }}>Submit your requirements and ECS Admin will provide you with curated freelancer options</p>
                  </div>
                  <form className="row g-3" onSubmit={handleSearch}>
                    <div className="col-12">
                      <label className="form-label">Request Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={searchForm.title || ''}
                        onChange={handleSearchChange}
                        placeholder="Brief title for your request"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Detailed Description *</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={searchForm.description || ''}
                        onChange={handleSearchChange}
                        placeholder="Describe your project requirements, timeline, and expectations"
                        rows="3"
                        required
                      ></textarea>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Required Skills *</label>
                      <input
                        list="skills-list"
                        className="form-control"
                        name="skills"
                        value={searchForm.skills}
                        onChange={handleSearchChange}
                        placeholder="e.g., React, Node.js, PostgreSQL"
                        autoComplete="off"
                        required
                      />
                      <datalist id="skills-list">
                        {availableSkills.map(skill => (
                          <option key={skill.skill_id} value={skill.skill_name} />
                        ))}
                      </datalist>
                      <small className="text-muted">Separate multiple skills with commas</small>
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
                    <div className="col-md-4">
                      <label className="form-label">Budget Range</label>
                      <select
                        className="form-control"
                        name="budget_range"
                        value={searchForm.budget_range || ''}
                        onChange={handleSearchChange}
                      >
                        <option value="">Select budget range</option>
                        <option value="Under $1,000">Under $1,000</option>
                        <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                        <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                        <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                        <option value="$25,000+">$25,000+</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Urgency Level</label>
                      <select
                        className="form-control"
                        name="urgency_level"
                        value={searchForm.urgency_level || 'normal'}
                        onChange={handleSearchChange}
                      >
                        <option value="low">Low - Flexible timeline</option>
                        <option value="normal">Normal - Standard timeline</option>
                        <option value="high">High - Urgent</option>
                        <option value="urgent">Urgent - ASAP</option>
                      </select>
                    </div>
                    <div className="col-md-4 d-grid">
                      <button type="submit" className="btn dashboard-btn" style={{ background: accent, color: '#fff', border: 'none', borderRadius: 30, fontWeight: 600, fontSize: 16, padding: '12px 24px', transition: 'transform 0.18s, box-shadow 0.18s' }} disabled={searchLoading}>
                        {searchLoading ? (
                          <span>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Submitting...
                          </span>
                        ) : (
                          "Submit Request"
                        )}
                      </button>
                    </div>
                  </form>
                  {searchError && <div className="alert alert-danger mt-3 text-center">{searchError}</div>}
                  {searchSuccess && <div className="alert alert-success mt-3 text-center">{searchSuccess}</div>}
                  {!searchError && !searchSuccess && (
                    <div className="alert alert-info mt-3 text-center">
                      <i className="bi bi-info-circle me-2"></i>
                      Your request will be reviewed by ECS Admin. We'll contact you with curated freelancer options within 24-48 hours.
                </div>
                  )}
                    </div>
            {/* Request Status */}
            <div className="card p-4 shadow-lg rounded-4">
              <div className="text-center">
                <i className="bi bi-clock-history fs-1 mb-3" style={{ color: accent }}></i>
                <h5 style={{ color: '#444', fontWeight: 600 }}>Request Status</h5>
                <p style={{ color: '#666', fontSize: 14 }}>
                  Once you submit your request, ECS Admin will review your requirements and provide you with curated freelancer options.
                </p>
                <div className="row mt-4">
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-1-circle-fill fs-4" style={{ color: accent }}></i>
                  </div>
                      <small style={{ color: '#666' }}>Submit Request</small>
                            </div>
                          </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-2-circle-fill fs-4" style={{ color: accent }}></i>
                        </div>
                      <small style={{ color: '#666' }}>ECS Admin Review</small>
                      </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-3-circle-fill fs-4" style={{ color: accent }}></i>
                  </div>
                      <small style={{ color: '#666' }}>Get Curated List</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-4-circle-fill fs-4" style={{ color: accent }}></i>
                      </div>
                      <small style={{ color: '#666' }}>Connect & Hire</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity - Only show on Request Freelancer tab */}
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
        {activeTab === 'my-requests' && (
          <div className="tab-content">
            <div className="card p-4 shadow-lg mb-4 rounded-4">
              <div className="text-center mb-4">
                <h4 style={{ color: accent, fontWeight: 600 }}>My Freelancer Requests</h4>
                <p style={{ color: '#666', fontSize: 14 }}>Track your submitted requests and view ECS Admin recommendations</p>
              </div>
              
              {requestsLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" style={{ color: accent }} role="status"></div>
                  <p className="mt-2 text-muted">Loading your requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-4 text-muted"></i>
                  <p className="mt-3 text-muted">No requests submitted yet</p>
                  <p className="text-muted small">Submit a freelancer request to get started</p>
                </div>
              ) : (
                <div className="row g-3">
                  {requests.map((request) => (
                    <div key={request.request_id} className="col-12">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h6 className="card-title mb-1" style={{ color: accent, fontWeight: 600 }}>
                                {request.title}
                              </h6>
                              <p className="card-text text-muted small mb-2">
                                {request.description.length > 100 
                                  ? `${request.description.substring(0, 100)}...` 
                                  : request.description}
                              </p>
                            </div>
                            <div className="text-end">
                              <span className={`badge ${
                                request.status === 'pending' ? 'bg-warning' :
                                request.status === 'reviewed' ? 'bg-info' :
                                request.status === 'provided' ? 'bg-success' :
                                request.status === 'completed' ? 'bg-warning' :
                                'bg-secondary'
                              }`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="row g-2 mb-3">
                            <div className="col-md-6">
                              <small className="text-muted">
                                <i className="bi bi-gear me-1"></i>
                                <strong>Skills:</strong> {request.required_skills.join(', ')}
                              </small>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted">
                                <i className="bi bi-calendar me-1"></i>
                                <strong>Submitted:</strong> {new Date(request.created_at).toLocaleDateString()}
                              </small>
                            </div>
                          </div>

                          {request.status === 'provided' && (
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <small className="text-success">
                                  <i className="bi bi-check-circle me-1"></i>
                                  {request.recommendation_count} freelancer(s) recommended
                                </small>
                              </div>
                              <button
                                className="btn btn-sm"
                                style={{ background: accent, color: '#fff', borderRadius: 20 }}
                                onClick={() => fetchRecommendations(request.request_id)}
                              >
                                <i className="bi bi-eye me-1"></i>View Recommendations
                              </button>
                            </div>
                          )}

                          {request.status === 'pending' && (
                            <div className="text-center py-2">
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                ECS Admin is reviewing your request
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      {/* Recommendations Modal */}
      {showRecommendationsModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ color: accent, fontWeight: 600 }}>
                  <i className="bi bi-star me-2"></i>Freelancer Recommendations
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={async () => {
                    setShowRecommendationsModal(false);
                    // Refresh requests to ensure accurate counts
                    await fetchRequests();
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {recommendationsLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" style={{ color: accent }} role="status"></div>
                    <p className="mt-2 text-muted">Loading recommendations...</p>
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-inbox display-4 text-muted"></i>
                    <p className="mt-3 text-muted">No recommendations available</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {recommendations.map((rec) => (
                      <div key={rec.recommendation_id} className="col-12">
                        <div className={`card border-0 shadow-sm h-100 ${rec.is_highlighted ? 'border-warning border-2' : ''}`}>
                          <div className="card-body">
                            {rec.is_highlighted && (
                              <div className="text-center mb-2">
                                <span className="badge bg-warning text-dark">
                                  <i className="bi bi-star-fill me-1"></i>Top Recommendation
                                </span>
                              </div>
                            )}
                            
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h6 className="card-title mb-1" style={{ color: accent, fontWeight: 600 }}>
                                  {rec.first_name} {rec.last_name}
                                </h6>
                                <p className="card-text text-muted small mb-2">
                                  {rec.headline}
                                </p>
                              </div>
                              <div className="text-end">
                                <span style={{ 
                                  background: rec.availability_status === 'available' ? '#d4edda' : 
                                             rec.availability_status === 'busy' ? '#fff3cd' : '#f8d7da',
                                  color: rec.availability_status === 'available' ? '#155724' : 
                                         rec.availability_status === 'busy' ? '#856404' : '#721c24',
                                  padding: '6px 12px', 
                                  borderRadius: 15,
                                  fontSize: 12,
                                  fontWeight: 600
                                }}>
                                  <i className={`bi ${
                                    rec.availability_status === 'available' ? 'bi-check-circle' :
                                    rec.availability_status === 'busy' ? 'bi-clock' : 'bi-x-circle'
                                  } me-1`}></i>
                                  {rec.availability_status === 'available' ? 'Available for Work' : 
                                   rec.availability_status === 'busy' ? 'Busy' : 'Not Available'}
                                </span>
                              </div>
                            </div>

                            <div className="row g-2 mb-3">
                              <div className="col-md-6">
                                <small className="text-muted">
                                  <i className="bi bi-envelope me-1"></i>
                                  <strong>Email:</strong> {rec.email}
                                </small>
                              </div>
                              <div className="col-md-6">
                                <small className="text-muted">
                                  <i className="bi bi-telephone me-1"></i>
                                  <strong>Phone:</strong> {rec.phone || 'Not provided'}
                                </small>
                              </div>
                            </div>

                            {rec.admin_notes && (
                              <div className="mb-3">
                                <small className="text-muted">
                                  <i className="bi bi-chat-quote me-1"></i>
                                  <strong>Admin Notes:</strong> {rec.admin_notes}
                                </small>
                              </div>
                            )}

                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm"
                                style={{ background: accent, color: '#fff' }}
                                onClick={() => handleStartConversation(rec.freelancer_id, rec.first_name, rec.last_name)}
                                title="Start a conversation with this freelancer"
                              >
                                <i className="bi bi-chat-dots me-1"></i>Start Conversation
                              </button>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleRecommendationResponse(rec.freelancer_id, 'interested')}
                              >
                                <i className="bi bi-hand-thumbs-up me-1"></i>Interested
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleRecommendationResponse(rec.freelancer_id, 'not_interested')}
                              >
                                <i className="bi bi-hand-thumbs-down me-1"></i>Not Interested
                              </button>
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => openInterviewSchedulingModal(rec)}
                                title="Schedule an interview with this freelancer"
                              >
                                <i className="bi bi-calendar-event me-1"></i>Schedule Interview
                              </button>
                              <button
                                className="btn btn-sm"
                                onClick={() => openHiringModal(rec)}
                                title="Formally hire this freelancer with project details"
                                style={{ 
                                  backgroundColor: '#ffd7c2',
                                  borderColor: '#ffd7c2',
                                  color: '#8b4513',
                                  transition: 'all 0.3s ease-in-out',
                                  transform: 'scale(1)'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = 'scale(1.05)';
                                  e.target.style.backgroundColor = '#ffc299';
                                  e.target.style.boxShadow = '0 4px 12px rgba(255, 215, 194, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = 'scale(1)';
                                  e.target.style.backgroundColor = '#ffd7c2';
                                  e.target.style.boxShadow = 'none';
                                }}
                                onMouseDown={(e) => {
                                  e.target.style.transform = 'scale(0.95)';
                                }}
                                onMouseUp={(e) => {
                                  e.target.style.transform = 'scale(1.05)';
                                }}
                              >
                                <i className="bi bi-briefcase me-1"></i>Hire Freelancer
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRecommendationsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Tab */}
      {activeTab === 'interviews' && (
        <div className="tab-content">
          <div className="card p-4 shadow-lg rounded-4" style={{ minHeight: '80vh' }}>
            <div className="text-center mb-4">
              <h4 style={{ color: accent, fontWeight: 600 }}>Interview Management</h4>
              <p style={{ color: '#666', fontSize: 14 }}>Schedule, manage, and track your interviews with freelancers</p>
            </div>
            
            <InterviewDashboard userType="associate" />
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.message && (
        <div className={`toast-container position-fixed top-0 end-0 p-3`} style={{ zIndex: 9999 }}>
          <div className={`toast show ${toast.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
            <div className="toast-body">
              {toast.message}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setToast({ message: '', type: '' })}
            ></button>
          </div>
        </div>
      )}

      {/* Hiring Modal */}
      <HiringModal
        isOpen={showHiringModal}
        onClose={closeHiringModal}
        freelancer={selectedFreelancerForHiring}
        request={selectedRequest}
        onHireSuccess={handleHireSuccess}
      />

      {/* Interview Scheduling Modal */}
      <InterviewSchedulingModal
        isOpen={showInterviewSchedulingModal}
        onClose={closeInterviewSchedulingModal}
        freelancer={selectedFreelancerForInterview}
        request={selectedRequest}
        onScheduleSuccess={handleInterviewScheduleSuccess}
      />

      {/* Interview Feedback Modal */}
      <InterviewFeedbackModal
        isOpen={showInterviewFeedbackModal}
        onClose={closeInterviewFeedbackModal}
        interview={selectedInterviewForFeedback}
        userType="associate"
        onSubmitSuccess={handleInterviewFeedbackSuccess}
      />

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
        </div>
      </div>
    </div>
  );
};

export default AssociateDashboard;