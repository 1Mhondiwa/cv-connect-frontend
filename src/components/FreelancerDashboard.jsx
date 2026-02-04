import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import ActivityTable from "./ActivityTable";
import { useAuth } from '../contexts/AuthContext';
import InterviewDashboard from './InterviewDashboard';
import InterviewFeedbackModal from './InterviewFeedbackModal';
import FreelancerInterviewFeedback from './FreelancerInterviewFeedback';

// Contracts List Component
const ContractsList = ({ contracts, loading, error, onRetry, onUploadSuccess }) => {
  const [uploadingContracts, setUploadingContracts] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  const handleDownloadContract = (contractPath) => {
    if (contractPath) {
      const fullUrl = contractPath.startsWith('http') ? contractPath : `${BACKEND_URL}${contractPath}`;
      window.open(fullUrl, '_blank');
    }
  };

  const handleUploadSignedContract = async (hireId, file) => {
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadErrors(prev => ({
        ...prev,
        [hireId]: 'Please select a PDF file'
      }));
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadErrors(prev => ({
        ...prev,
        [hireId]: 'File size must be less than 10MB'
      }));
      return;
    }

    setUploadingContracts(prev => ({ ...prev, [hireId]: true }));
    setUploadErrors(prev => ({ ...prev, [hireId]: '' }));

    try {
      const formData = new FormData();
      formData.append('signed_contract', file);

      const token = localStorage.getItem('token');
      const response = await api.post(
        `/freelancer/contract/${hireId}/upload-signed`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Refresh contracts list
        onUploadSuccess && onUploadSuccess();
        console.log('✅ Signed contract uploaded successfully');
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Error uploading signed contract:', error);
      setUploadErrors(prev => ({
        ...prev,
        [hireId]: error.response?.data?.message || 'Failed to upload signed contract'
      }));
    } finally {
      setUploadingContracts(prev => ({ ...prev, [hireId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: accent }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3" style={{ color: '#666' }}>Loading your contracts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
        <button 
          className="btn" 
          style={{ background: accent, color: '#fff' }}
          onClick={onRetry}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-5">
        <div style={{ fontSize: '4rem', color: '#ddd', marginBottom: '1rem' }}>
          <i className="bi bi-file-earmark-text"></i>
        </div>
        <h5 style={{ color: '#666', marginBottom: '0.5rem' }}>No Contracts Yet</h5>
        <p style={{ color: '#888' }}>You haven't been hired for any projects yet. Keep building your profile and applying for opportunities!</p>
      </div>
    );
  }

  return (
    <div className="row">
      {contracts.map((contract) => (
        <div key={contract.hire_id} className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100" style={{ 
            border: '1px solid #e9ecef', 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease'
          }}>
            <div className="card-body d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="card-title mb-0" style={{ color: '#333', fontWeight: 600 }}>
                  {contract.project_title}
                </h6>
                <span className={`badge ${
                  contract.status === 'active' ? 'bg-success' : 
                  contract.status === 'completed' ? 'bg-primary' : 
                  contract.status === 'cancelled' ? 'bg-danger' : 'bg-warning'
                }`} style={{ fontSize: '10px' }}>
                  {contract.status?.charAt(0).toUpperCase() + contract.status?.slice(1)}
                </span>
              </div>
              
              <div className="mb-3">
                <p className="text-muted mb-1" style={{ fontSize: '12px' }}>
                  <i className="bi bi-building me-1"></i>
                  {contract.company_contact}
                </p>
                <p className="text-muted mb-1" style={{ fontSize: '12px' }}>
                  <i className="bi bi-calendar me-1"></i>
                  Hired: {new Date(contract.hire_date).toLocaleDateString()}
                </p>
                {contract.agreed_rate && (
                  <p className="text-muted mb-1" style={{ fontSize: '12px' }}>
                    <i className="bi bi-currency-exchange me-1"></i>
                    R{contract.agreed_rate}/{contract.rate_type}
                  </p>
                )}
              </div>

              {contract.project_description && (
                <p className="card-text text-muted mb-3" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                  {contract.project_description.length > 100 
                    ? `${contract.project_description.substring(0, 100)}...` 
                    : contract.project_description
                  }
                </p>
              )}

              <div className="mt-auto">
                {contract.contract_pdf_path ? (
                  <div>
                    <button
                      className="btn w-100 mb-2"
                      style={{ 
                        background: accent, 
                        color: '#fff', 
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                      onClick={() => handleDownloadContract(contract.contract_pdf_path)}
                    >
                      <i className="bi bi-download me-2"></i>
                      Download Contract
                    </button>
                    
                    {/* Signed Contract Upload Section */}
                    <div className="border-top pt-2">
                      {contract.signed_contract_pdf_path && (
                        <div className="text-center mb-2">
                          <div className="text-success" style={{ fontSize: '12px' }}>
                            <i className="bi bi-check-circle me-1"></i>
                            Signed contract uploaded
                          </div>
                          {contract.signed_contract_uploaded_at && (
                            <div className="text-muted" style={{ fontSize: '11px' }}>
                              Uploaded: {new Date(contract.signed_contract_uploaded_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleUploadSignedContract(contract.hire_id, file);
                            }
                          }}
                          style={{ display: 'none' }}
                          id={`signed-contract-${contract.hire_id}`}
                        />
                        <label
                          htmlFor={`signed-contract-${contract.hire_id}`}
                          className="btn w-100"
                          style={{ 
                            background: contract.signed_contract_pdf_path ? '#6c757d' : '#28a745', 
                            color: '#fff', 
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: uploadingContracts[contract.hire_id] ? 'not-allowed' : 'pointer',
                            opacity: uploadingContracts[contract.hire_id] ? 0.6 : 1
                          }}
                        >
                          {uploadingContracts[contract.hire_id] ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-2" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-upload me-2"></i>
                              {contract.signed_contract_pdf_path ? 'Re-upload Signed Contract' : 'Upload Signed Contract'}
                            </>
                          )}
                        </label>
                        
                        {uploadErrors[contract.hire_id] && (
                          <div className="text-danger mt-1" style={{ fontSize: '11px' }}>
                            {uploadErrors[contract.hire_id]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted" style={{ fontSize: '12px' }}>
                    <i className="bi bi-file-earmark-x me-1"></i>
                    No contract available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://cv-connect-backend-1r7p.onrender.com';
const accent = '#fd680e';

const FreelancerDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Profile image upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Messaging state
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagingLoading, setMessagingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'messages', 'contracts', or 'feedback'
  const [globalUnread, setGlobalUnread] = useState(0);
  const messagesEndRef = useRef(null);

  // Recent Activity state
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // Contracts state
  const [contracts, setContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [contractsError, setContractsError] = useState('');

  // Interview state
  const [showInterviewFeedbackModal, setShowInterviewFeedbackModal] = useState(false);
  const [selectedInterviewForFeedback, setSelectedInterviewForFeedback] = useState(null);

  // Scroll to top when component mounts or URL changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchProfileData = async () => {
      try {
        console.log('Fetching freelancer profile...');
        const response = await api.get('/freelancer/profile');

        if (response.data.success) {
          console.log('Profile fetched successfully:', response.data.profile);
          if (isMounted) {
            setProfile(response.data.profile);
          }
        } else {
          console.error('Profile fetch failed:', response.data.message);
          if (isMounted) {
            setError(response.data.message);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (isMounted) {
          if (error.response?.status === 401) {
            setError('Authentication failed. Please log in again.');
          } else {
            setError('Failed to load profile. Please try again.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchActivityData = async () => {
      try {
        const res = await api.get("/freelancer/activity");
        if (isMounted) {
          setActivities(res.data.activities || []);
        }
      } catch (err) {
        if (isMounted) {
          setActivities([]);
        }
      } finally {
        if (isMounted) {
          setActivityLoading(false);
        }
      }
    };
    
    const loadData = async () => {
      if (isMounted) {
        await Promise.all([fetchProfileData(), fetchActivityData()]);
      }
    };
    
    loadData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchConversations();
      fetchGlobalUnread();
    } else if (activeTab === 'contracts') {
      console.log('🔄 Contracts tab activated, fetching contracts...');
      fetchContracts();
    }
    // eslint-disable-next-line
  }, [activeTab]);


  const fetchContracts = async () => {
    try {
      setContractsLoading(true);
      setContractsError('');
      console.log('🔍 Fetching contracts for freelancer...');
      const response = await api.get('/freelancer/hiring/history');
      console.log('📄 Contracts response:', response.data);
      
      if (response.data.success) {
        setContracts(response.data.hiring_history || []);
        console.log('✅ Contracts loaded:', response.data.hiring_history?.length || 0);
      } else {
        console.error('❌ Contracts fetch failed:', response.data.message);
        setContractsError(response.data.message || 'Failed to fetch contracts');
      }
    } catch (err) {
      console.error('❌ Error fetching contracts:', err);
      console.error('❌ Error response:', err.response?.data);
      setContractsError('Failed to fetch contracts. Please try again.');
    } finally {
      setContractsLoading(false);
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
        await loadConversation(selectedConversation);
        await fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setMessagingLoading(false);
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

  const handleLogout = () => {
    // This will be handled by the auth context
    navigate('/');
  };

  // Profile image upload handler
  const handleProfileImageChange = async (e) => {
    setUploadError('');
    setUploadSuccess('');
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/freelancer/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        setUploadSuccess('Profile picture updated!');
        setProfile((prev) => ({
          ...prev,
          profile_picture_url: response.data.image_url
        }));
      } else {
        setUploadError(response.data.message || 'Failed to upload image.');
      }
    } catch (err) {
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Helper for avatar URL
  const getAvatarUrl = () => {
    if (profile?.profile_picture_url) {
      if (profile.profile_picture_url.startsWith('http')) {
        return profile.profile_picture_url;
      }
      return `${BACKEND_URL}${profile.profile_picture_url}`;
    }
    const name = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eee&color=555&size=120&bold=true`;
  };


  // Interview functions
  const openInterviewFeedbackModal = (interview) => {
    setSelectedInterviewForFeedback(interview);
    setShowInterviewFeedbackModal(true);
  };

  const closeInterviewFeedbackModal = () => {
    setShowInterviewFeedbackModal(false);
    setSelectedInterviewForFeedback(null);
  };

  const handleInterviewFeedbackSuccess = () => {
    // Show success message or refresh data if needed
    console.log('Interview feedback submitted successfully');
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(120deg, #fff 60%, #f8f4f2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ color: accent, width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 style={{ color: '#444' }}>Loading Dashboard...</h4>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(120deg, #fff 60%, #f8f4f2 100%)' }}>
        <div className="text-center">
          <div className="error-message">
            <h4 style={{ color: '#444' }}>Authentication Error</h4>
            <p style={{ color: '#666' }}>{error}</p>
            <p style={{ color: '#888' }}>This might be due to an expired session. Please try logging in again.</p>
          </div>
          <Link to="/login" className="btn dashboard-btn" style={{ background: accent, color: '#fff', border: 'none', borderRadius: 30, padding: '12px 32px', fontWeight: 600 }}>Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(120deg, #fff 60%, #f8f4f2 100%)' }}>
      {/* Navbar */}
      <nav className="dashboard-navbar">
        <div className="container d-flex justify-content-between align-items-center">
          <Link to="/freelancer-dashboard" style={{ textDecoration: 'none', color: accent, fontWeight: 700, fontSize: 22, letterSpacing: 1 }} className="d-flex align-items-center">
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
      {/* Tab Navigation */}
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-center mb-4">
              <div className="btn-group" role="group" style={{ 
                boxShadow: '0 4px 20px rgba(253,104,14,0.12)', 
                borderRadius: 30,
                border: '2px solid #ffb366',
                background: 'linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%)',
                overflow: 'hidden',
                padding: '3px'
              }}>
                <button 
                  className={`btn dashboard-tab-btn ${activeTab === 'dashboard' ? '' : 'btn-outline-primary'}`}
                  style={{
                    background: activeTab === 'dashboard' ? accent : '#fff',
                    color: activeTab === 'dashboard' ? '#fff' : accent,
                    border: 'none',
                    borderRadius: '27px 0 0 27px',
                    padding: '12px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    transition: 'all 0.3s ease',
                    minWidth: '140px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: activeTab === 'dashboard' ? '0 2px 8px rgba(253,104,14,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  onClick={() => {
                    setActiveTab('dashboard');
                    window.scrollTo(0, 0);
                  }}
                >
                  <i className="bi bi-house me-2"></i>Dashboard
                </button>
                <div style={{ width: '2px', background: '#ffb366', margin: '0 2px' }}></div>
                <button 
                  className={`btn dashboard-tab-btn ${activeTab === 'messages' ? '' : 'btn-outline-primary'} position-relative`}
                  style={{
                    background: activeTab === 'messages' ? accent : '#fff',
                    color: activeTab === 'messages' ? '#fff' : accent,
                    border: 'none',
                    borderRadius: '0',
                    padding: '12px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    transition: 'all 0.3s ease',
                    minWidth: '140px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: activeTab === 'messages' ? '0 2px 8px rgba(253,104,14,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  onClick={() => {
                    setActiveTab('messages');
                    window.scrollTo(0, 0);
                  }}
                >
                  <i className="bi bi-chat-dots me-2"></i>Messages
                  {globalUnread > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{ background: '#df1529' }}>
                      {globalUnread}
                    </span>
                  )}
                </button>
                <div style={{ width: '2px', background: '#ffb366', margin: '0 2px' }}></div>
                <button 
                  className={`btn dashboard-tab-btn ${activeTab === 'interviews' ? '' : 'btn-outline-primary'}`}
                  style={{
                    background: activeTab === 'interviews' ? accent : '#fff',
                    color: activeTab === 'interviews' ? '#fff' : accent,
                    border: 'none',
                    borderRadius: '0',
                    padding: '12px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    transition: 'all 0.3s ease',
                    minWidth: '140px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: activeTab === 'interviews' ? '0 2px 8px rgba(253,104,14,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  onClick={() => {
                    setActiveTab('interviews');
                    window.scrollTo(0, 0);
                  }}
                >
                  <i className="bi bi-calendar-event me-2"></i>Interviews
                </button>
                <div style={{ width: '2px', background: '#ffb366', margin: '0 2px' }}></div>
                <button 
                  className={`btn dashboard-tab-btn ${activeTab === 'feedback' ? '' : 'btn-outline-primary'}`}
                  style={{
                    background: activeTab === 'feedback' ? accent : '#fff',
                    color: activeTab === 'feedback' ? '#fff' : accent,
                    border: 'none',
                    borderRadius: '0',
                    padding: '12px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    transition: 'all 0.3s ease',
                    minWidth: '180px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: activeTab === 'feedback' ? '0 2px 8px rgba(253,104,14,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  onClick={() => {
                    setActiveTab('feedback');
                    window.scrollTo(0, 0);
                  }}
                >
                  <i className="bi bi-star-half me-2"></i>Interview Feedback
                </button>
                <div style={{ width: '2px', background: '#ffb366', margin: '0 2px' }}></div>
                <button 
                  className={`btn dashboard-tab-btn ${activeTab === 'contracts' ? '' : 'btn-outline-primary'}`}
                  style={{
                    background: activeTab === 'contracts' ? accent : '#fff',
                    color: activeTab === 'contracts' ? '#fff' : accent,
                    border: 'none',
                    borderRadius: '0 27px 27px 0',
                    padding: '12px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    transition: 'all 0.3s ease',
                    minWidth: '140px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: activeTab === 'contracts' ? '0 2px 8px rgba(253,104,14,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                  onClick={() => {
                    setActiveTab('contracts');
                    window.scrollTo(0, 0);
                  }}
                >
                  <i className="bi bi-file-earmark-text me-2"></i>Contracts
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Tab */}
        {activeTab === 'interviews' && (
          <div className="container">
            <div className="bg-white rounded-4 shadow-lg p-4" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.07)' }}>
              <div className="text-center mb-4">
                <h4 style={{ color: accent, fontWeight: 600 }}>Interview Management</h4>
                <p style={{ color: '#666', fontSize: 14 }}>View and manage your scheduled interviews with associates</p>
              </div>
              
              <InterviewDashboard userType="freelancer" />
            </div>
          </div>
        )}

        {/* Interview Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="container">
            <div className="bg-white rounded-4 shadow-lg p-4" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.07)' }}>
              <div className="text-center mb-4">
                <h4 style={{ color: accent, fontWeight: 600 }}>Interview Feedback</h4>
                <p style={{ color: '#666', fontSize: 14 }}>Review feedback from your interviews to improve your performance</p>
              </div>
              
              <FreelancerInterviewFeedback />
            </div>
          </div>
        )}

        {/* Contracts Tab */}
        {activeTab === 'contracts' && (
          <div className="container">
            <div className="bg-white rounded-4 shadow-lg p-4" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.07)' }}>
              <div className="text-center mb-4">
                <h4 style={{ color: accent, fontWeight: 600 }}>My Contracts</h4>
                <p style={{ color: '#666', fontSize: 14 }}>View and download your contract agreements with associates</p>
                <button 
                  className="btn btn-sm" 
                  style={{ background: accent, color: '#fff', marginTop: '10px' }}
                  onClick={fetchContracts}
                  disabled={contractsLoading}
                >
                  {contractsLoading ? 'Loading...' : 'Refresh Contracts'}
                </button>
              </div>
              
              <ContractsList 
                contracts={contracts}
                loading={contractsLoading}
                error={contractsError}
                onRetry={fetchContracts}
                onUploadSuccess={fetchContracts}
              />
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="container">
            <div className="row">
              {/* Left Section - Main Dashboard Content */}
              <div className="col-lg-7">
                <div className="bg-white rounded-4 shadow-lg p-5 h-100" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.07)' }}>
                  {/* Header */}
                  <div className="d-flex align-items-center mb-4">
                    <div style={{ position: 'relative', marginRight: '20px' }}>
                      <img
                        src={getAvatarUrl()}
                        alt="Profile"
                        className="rounded-circle"
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          border: '3px solid #fff',
                          boxShadow: '0 4px 16px rgba(253,104,14,0.15)'
                        }}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = 'https://ui-avatars.com/api/?name=User&background=eee&color=555&size=80&bold=true';
                        }}
                      />
                      <button
                        type="button"
                        className="btn rounded-circle position-absolute profile-upload-btn"
                        style={{
                          bottom: 0,
                          right: 0,
                          width: 30,
                          height: 30,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          border: '2px solid #fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          padding: 0,
                          background: accent,
                          color: '#fff',
                          transition: 'transform 0.18s, box-shadow 0.18s'
                        }}
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        title="Upload/Change Profile Picture"
                        disabled={uploading}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleProfileImageChange}
                        disabled={uploading}
                      />
                    </div>
                    <div>
                      <h3 className="mb-1" style={{ color: '#444', fontWeight: 700 }}>Welcome back, {profile?.first_name}!</h3>
                      <p style={{ color: '#888', marginBottom: 0 }}>Freelancer Dashboard</p>
                      {uploadSuccess && <div style={{ color: '#059652', fontSize: 14, marginTop: 4 }}>{uploadSuccess}</div>}
                      {uploadError && <div style={{ color: '#df1529', fontSize: 14, marginTop: 4 }}>{uploadError}</div>}
                      {uploading && <div style={{ color: accent, fontSize: 14, marginTop: 4 }}>Uploading...</div>}
                    </div>
                  </div>

                  {/* Profile Overview */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: 500, color: '#444', marginBottom: 4, fontSize: 14 }}>Full Name</label>
                        <p className="mb-0 fw-bold" style={{ color: '#444' }}>{profile?.first_name} {profile?.last_name}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: 500, color: '#444', marginBottom: 4, fontSize: 14 }}>Email</label>
                        <p className="mb-0 fw-bold" style={{ color: '#444' }}>{profile?.email}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: 500, color: '#444', marginBottom: 4, fontSize: 14 }}>Phone</label>
                        <p className="mb-0 fw-bold" style={{ color: '#444' }}>{profile?.phone}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: 500, color: '#444', marginBottom: 4, fontSize: 14 }}>Experience</label>
                        <p className="mb-0 fw-bold" style={{ color: '#444' }}>{profile?.years_experience || 0} years</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: 500, color: '#444', marginBottom: 4, fontSize: 14 }}>Status</label>
                        <span className={`badge ${profile?.current_status === 'Available' ? 'bg-success' : 'bg-warning'}`}>
                          {profile?.current_status || 'Available'}
                        </span>
                      </div>
                      <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: 500, color: '#444', marginBottom: 4, fontSize: 14 }}>Member Since</label>
                        <p className="mb-0 fw-bold" style={{ color: '#444' }}>{new Date(profile?.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {profile?.headline && (
                    <div className="mb-4">
                      <label className="form-label" style={{ fontWeight: 500, color: '#444', marginBottom: 4, fontSize: 14 }}>Professional Headline</label>
                      <p className="mb-0 fw-bold" style={{ color: '#444' }}>{profile.headline}</p>
                    </div>
                  )}

                  {profile?.summary && (
                    <div className="mb-4">
                      <label className="form-label" style={{ fontWeight: 500, color: '#444', marginBottom: 4, fontSize: 14 }}>Summary</label>
                      <p className="mb-0" style={{ color: '#666' }}>{profile.summary}</p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <Link to="/freelancer/edit" className="btn w-100 dashboard-btn" style={{ background: accent, color: '#fff', border: 'none', borderRadius: 30, padding: '12px 24px', fontWeight: 600, transition: 'transform 0.18s, box-shadow 0.18s' }}>
                        <i className="bi bi-pencil me-2"></i>Edit Profile
                      </Link>
                    </div>
                  </div>

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

              {/* Right Section - Visual Design Elements */}
              <div className="col-lg-5">
                <div className="position-relative h-100">
                  {/* Background Design Elements */}
                  <div className="position-absolute w-100 h-100" style={{ zIndex: 1 }}>
                    <div className="position-absolute" style={{ top: '10%', right: '15%', width: '120px', height: '120px', background: 'rgba(253,104,14,0.1)', borderRadius: '50%' }}></div>
                    <div className="position-absolute" style={{ top: '30%', right: '5%', width: '80px', height: '80px', background: 'rgba(253,104,14,0.15)', borderRadius: '50%' }}></div>
                    <div className="position-absolute" style={{ top: '60%', right: '25%', width: '100px', height: '100px', background: 'rgba(253,104,14,0.08)', borderRadius: '50%' }}></div>
                  </div>

                  {/* Floating Cards */}
                  <div className="position-relative" style={{ zIndex: 2 }}>
                    {/* Top Card - Profile Stats */}
                    <div className="bg-white rounded-4 shadow-lg p-4 mb-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle p-2 me-3" style={{ background: accent }}>
                          <i className="bi bi-person-circle text-white"></i>
                        </div>
                        <div>
                          <h6 className="mb-0" style={{ color: accent, fontWeight: 700 }}>Profile</h6>
                          <p className="mb-0" style={{ color: '#888', fontSize: 14 }}>View your profile</p>
                        </div>
                      </div>
                      <Link to="/freelancer/profile" className="btn btn-sm w-100 dashboard-btn" style={{ background: 'transparent', color: accent, border: `1px solid ${accent}`, borderRadius: 20, fontWeight: 600, transition: 'transform 0.18s, box-shadow 0.18s' }}>
                        View Profile
                      </Link>
                    </div>

                    {/* Middle Card - CV Status */}
                    <div className="bg-white rounded-4 shadow-lg p-4 mb-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle p-2 me-3" style={{ background: '#059652' }}>
                          <i className="bi bi-file-earmark-text text-white"></i>
                        </div>
                        <div>
                          <h6 className="mb-0" style={{ color: '#059652', fontWeight: 700 }}>CV Status</h6>
                          <p className="mb-0" style={{ color: '#888', fontSize: 14 }}>{profile?.cv ? 'CV Uploaded' : 'No CV Uploaded'}</p>
                        </div>
                      </div>
                      <Link to="/freelancer/upload" className="btn btn-sm w-100 dashboard-btn" style={{ background: 'transparent', color: '#059652', border: '1px solid #059652', borderRadius: 20, fontWeight: 600, transition: 'transform 0.18s, box-shadow 0.18s' }}>
                        {profile?.cv ? 'Update CV' : 'Upload CV'}
                      </Link>
                    </div>

                    {/* Bottom Card - Account Security */}
                    <div className="bg-white rounded-4 shadow-lg p-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="rounded-circle p-2 me-3" style={{ background: '#ffc107' }}>
                          <i className="bi bi-shield-check text-white"></i>
                        </div>
                        <div>
                          <h6 className="mb-0" style={{ color: '#ffc107', fontWeight: 700 }}>Account Security</h6>
                          <p className="mb-0" style={{ color: '#888', fontSize: 14 }}>Your data, your rules</p>
                        </div>
                      </div>
                      <div style={{ fontSize: 14 }}>
                        <div className="d-flex justify-content-between mb-2">
                          <span style={{ color: '#666' }}>Email Verified:</span>
                          <span className={`badge ${profile?.is_verified ? 'bg-success' : 'bg-warning'}`}>
                            {profile?.is_verified ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span style={{ color: '#666' }}>Account Status:</span>
                          <span className="badge bg-success">
                            Active
                          </span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span style={{ color: '#666' }}>Skills Listed:</span>
                          <span className="badge" style={{ background: accent }}>{profile?.skills?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Floating Social Icons */}
                    <div className="position-absolute" style={{ top: '20%', right: '10%' }}>
                      <div className="bg-white rounded-circle shadow p-2 mb-2 dashboard-btn" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)', transition: 'transform 0.18s, box-shadow 0.18s' }}>
                        <i className="bi bi-linkedin" style={{ color: accent }}></i>
                      </div>
                    </div>
                    <div className="position-absolute" style={{ top: '25%', right: '5%' }}>
                      <div className="bg-white rounded-circle shadow p-2 dashboard-btn" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)', transition: 'transform 0.18s, box-shadow 0.18s' }}>
                        <i className="bi bi-github" style={{ color: '#333' }}></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="container">
            <div className="bg-white rounded-4 shadow-lg p-4" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.07)' }}>
              {/* Global Unread Badge */}
              {globalUnread > 0 && (
                <div className="text-end mb-3">
                  <span className="badge fs-6" style={{ background: '#df1529' }}>
                    <i className="bi bi-envelope-fill me-1"></i> {globalUnread} new message{globalUnread > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              <div className="row">
                {/* Conversations List */}
                <div className="col-lg-4">
                  <div className="card border-0 shadow-sm">
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
                                  {conversation.associate_name || conversation.associate_email}
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
                  <div className="card border-0 shadow-sm">
                    <div className="card-header" style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                      <h5 className="mb-0" style={{ color: '#444', fontWeight: 700 }}>
                        {selectedConversation ? 
                          conversations.find(c => c.conversation_id === selectedConversation)?.associate_name || 'Messages' : 
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
                              <div key={message.message_id} className={`mb-3 ${message.sender_id === profile.user_id ? 'text-end' : 'text-start'}`}>
                                <div className={`d-inline-block p-3 rounded ${message.sender_id === profile.user_id ? 'text-white' : 'bg-light'}`}
                                     style={{ 
                                       background: message.sender_id === profile.user_id ? accent : '#f8f9fa',
                                       maxWidth: '70%'
                                     }}>
                                  <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">{message.content}</div>
                                    {message.sender_id === profile.user_id && (
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
                                  <small style={{ color: message.sender_id === profile.user_id ? 'rgba(255,255,255,0.8)' : '#888' }}>
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
                              <button type="submit" className="btn dashboard-btn" disabled={messagingLoading || !newMessage.trim()}
                                      style={{ 
                                        background: accent, 
                                        color: '#fff', 
                                        border: 'none', 
                                        borderRadius: '0 20px 20px 0',
                                        fontWeight: 600,
                                        transition: 'transform 0.18s, box-shadow 0.18s'
                                      }}>
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
          </div>
        )}
      </div>

      {/* Animation Styles */}
      <style>{`
        .dashboard-tab-btn:hover, .dashboard-tab-btn:focus {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(253,104,14,0.2);
          z-index: 2;
        }
        
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

      {/* Interview Feedback Modal */}
      <InterviewFeedbackModal
        isOpen={showInterviewFeedbackModal}
        onClose={closeInterviewFeedbackModal}
        interview={selectedInterviewForFeedback}
        userType="freelancer"
        onSubmitSuccess={handleInterviewFeedbackSuccess}
      />
    </div>
  );
};

export default FreelancerDashboard; 