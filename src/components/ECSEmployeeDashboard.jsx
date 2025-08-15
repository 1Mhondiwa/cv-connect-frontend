import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const accent = '#fd680e';

const ECSEmployeeDashboard = () => {
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
    approval_status: 'all',
    page: 1,
    limit: 10
  });
  const [availabilityUpdateLoading, setAvailabilityUpdateLoading] = useState({});
  const [approvalLoading, setApprovalLoading] = useState({});
  const [selectedFreelancerForNotes, setSelectedFreelancerForNotes] = useState(null);
  const [freelancerNotesModal, setFreelancerNotesModal] = useState(false);
  const [freelancerNotes, setFreelancerNotes] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);
  
  // Enhanced statistics
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  
  // ECS Employee profile management
  const [employeeImage, setEmployeeImage] = useState(null);
  const [employeeImageUploading, setEmployeeImageUploading] = useState(false);
  const [employeeImageError, setEmployeeImageError] = useState('');
  const [employeeImageSuccess, setEmployeeImageSuccess] = useState('');
  const employeeImageInputRef = useRef(null);

  // Freelancer request management
  const [freelancerRequests, setFreelancerRequests] = useState([]);
  const [freelancerRequestsLoading, setFreelancerRequestsLoading] = useState(false);
  const [freelancerRequestsError, setFreelancerRequestsError] = useState('');
  const [selectedFreelancerRequest, setSelectedFreelancerRequest] = useState(null);
  const [showFreelancerRequestDetailsModal, setShowFreelancerRequestDetailsModal] = useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [availableFreelancers, setAvailableFreelancers] = useState([]);
  const [allFreelancers, setAllFreelancers] = useState([]); // Store original list for filtering
  const [selectedFreelancers, setSelectedFreelancers] = useState([]);
  const [highlightedFreelancers, setHighlightedFreelancers] = useState([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  
  // Simple search state
  const [searchSkills, setSearchSkills] = useState('');
  const [searchExperience, setSearchExperience] = useState('');
  const [searchStatus, setSearchStatus] = useState('');

  // Analytics tab state
  const [timeRange, setTimeRange] = useState('90d');
  const [filteredChartData, setFilteredChartData] = useState([]);

  // Analytics data states
  const [analyticsData, setAnalyticsData] = useState({
    registrationTrends: [],
    userTypeDistribution: [],
    userActivityStatus: [],
    cvUploadTrends: [],
    topSkills: [],
    cvFileTypes: [],
    messageTrends: [],
    userCommunicationActivity: []
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [lastAnalyticsUpdate, setLastAnalyticsUpdate] = useState(null);
  const [visitorData, setVisitorData] = useState([]);
  const [visitorDataLoading, setVisitorDataLoading] = useState(false);

  // Chart data (static for now, will be real-time later)
  const chartData = [
    { date: "2024-04-01", desktop: 222, mobile: 150 },
    { date: "2024-04-02", desktop: 199, mobile: 221 },
    { date: "2024-04-03", desktop: 250, mobile: 194 },
    { date: "2024-04-04", desktop: 222, mobile: 150 },
    { date: "2024-04-05", desktop: 199, mobile: 221 },
    { date: "2024-04-06", desktop: 250, mobile: 194 },
    { date: "2024-04-07", desktop: 222, mobile: 150 },
    { date: "2024-04-08", desktop: 199, mobile: 221 },
    { date: "2024-04-09", desktop: 250, mobile: 194 },
    { date: "2024-04-10", desktop: 222, mobile: 150 },
    { date: "2024-04-11", desktop: 199, mobile: 221 },
    { date: "2024-04-12", desktop: 250, mobile: 194 },
    { date: "2024-04-13", desktop: 222, mobile: 150 },
    { date: "2024-04-14", desktop: 199, mobile: 221 },
    { date: "2024-04-15", desktop: 250, mobile: 194 },
    { date: "2024-04-16", desktop: 222, mobile: 150 },
    { date: "2024-04-17", desktop: 199, mobile: 221 },
    { date: "2024-04-18", desktop: 250, mobile: 194 },
    { date: "2024-04-19", desktop: 222, mobile: 150 },
    { date: "2024-04-20", desktop: 199, mobile: 221 },
    { date: "2024-04-21", desktop: 250, mobile: 194 },
    { date: "2024-04-22", desktop: 222, mobile: 150 },
    { date: "2024-04-23", desktop: 199, mobile: 221 },
    { date: "2024-04-24", desktop: 250, mobile: 194 },
    { date: "2024-04-25", desktop: 222, mobile: 150 },
    { date: "2024-04-26", desktop: 199, mobile: 221 },
    { date: "2024-04-27", desktop: 250, mobile: 194 },
    { date: "2024-04-28", desktop: 222, mobile: 150 },
    { date: "2024-04-29", desktop: 199, mobile: 221 },
    { date: "2024-04-30", desktop: 250, mobile: 194 }
  ];

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData || userData.user_type !== 'ecs_employee') {
          navigate('/login');
          return;
        }
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        navigate('/login');
      }
    };

    loadUserData();
  }, [navigate]);

  // Load statistics
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadStats();
    }
  }, [activeTab]);

  // Load associate requests
  useEffect(() => {
    if (activeTab === 'associate-requests') {
      loadAssociateRequests();
    }
  }, [activeTab]);

  // Load associates
  useEffect(() => {
    if (activeTab === 'associates') {
      loadAssociates();
    }
  }, [activeTab]);

  // Load freelancers
  useEffect(() => {
    if (activeTab === 'freelancers') {
      loadFreelancers();
    }
  }, [activeTab]);

  // Load freelancer requests
  useEffect(() => {
    if (activeTab === 'freelancer-requests') {
      loadFreelancerRequests();
    }
  }, [activeTab]);

  // Load analytics data
  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalyticsData();
    }
  }, [activeTab, timeRange]);

  // Fetch visitor data when time range changes
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchVisitorData();
    }
  }, [timeRange]);

  // Fetch analytics data when analytics tab is activated
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalyticsData();
    }
  }, [activeTab]);

  const loadStats = async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setStatsError('Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  const loadAssociateRequests = async () => {
    setAssociateRequestsLoading(true);
    setAssociateRequestsError('');
    try {
      const response = await api.get('/associate-request/requests');
      if (response.data.success) {
        setAssociateRequests(response.data.data.requests);
      } else {
        setAssociateRequestsError(response.data.message || 'Failed to load associate requests');
      }
    } catch (error) {
      console.error('Error loading associate requests:', error);
      setAssociateRequestsError('Failed to load associate requests');
    } finally {
      setAssociateRequestsLoading(false);
    }
  };

  const loadAssociates = async () => {
    setAssociatesLoading(true);
    setAssociatesError('');
    try {
      const response = await api.get('/admin/associates');
      if (response.data.success) {
        setAssociates(response.data.associates);
      }
    } catch (error) {
      console.error('Error loading associates:', error);
      setAssociatesError('Failed to load associates');
    } finally {
      setAssociatesLoading(false);
    }
  };

  const loadFreelancers = async () => {
    setFreelancersLoading(true);
    setFreelancersError('');
    try {
      const queryParams = new URLSearchParams({
        availability_status: freelancerFilters.availability_status,
        approval_status: freelancerFilters.approval_status,
        page: freelancerFilters.page,
        limit: freelancerFilters.limit
      });

      const response = await api.get(`/admin/freelancers?${queryParams}`);
      if (response.data.success) {
        setFreelancers(response.data.freelancers);
      }
    } catch (error) {
      console.error('Error loading freelancers:', error);
      setFreelancersError('Failed to load freelancers');
    } finally {
      setFreelancersLoading(false);
    }
  };

  const loadFreelancerRequests = async () => {
    setFreelancerRequestsLoading(true);
    setFreelancerRequestsError('');
    try {
      const response = await api.get('/admin/freelancer-requests');
      if (response.data.success) {
        setFreelancerRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Error loading freelancer requests:', error);
      setFreelancerRequestsError('Failed to load freelancer requests');
    } finally {
      setFreelancerRequestsLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      // Load analytics data based on timeRange
      // This would be implemented based on your analytics endpoints
      console.log('Loading analytics data for:', timeRange);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const fetchVisitorData = async () => {
    setVisitorDataLoading(true);
    try {
      // Simulate API call for visitor data
      setTimeout(() => {
        setVisitorData(chartData);
        setVisitorDataLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching visitor data:', error);
      setVisitorDataLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      // Simulate API call for analytics data
      setTimeout(() => {
        setAnalyticsData({
          registrationTrends: [],
          userTypeDistribution: [],
          userActivityStatus: [],
          cvUploadTrends: [],
          topSkills: [],
          cvFileTypes: [],
          messageTrends: [],
          userCommunicationActivity: []
        });
        setAnalyticsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setAnalyticsError('Failed to load analytics data');
      setAnalyticsLoading(false);
    }
  };

  // Associate Request Management Functions
  const handleReviewRequest = async (requestId) => {
    setReviewLoading(true);
    try {
      console.log('🔍 Sending review request:', {
        url: `/associate-request/requests/${requestId}/review`,
        data: reviewFormData,
        requestId
      });
      
      const res = await api.put(`/associate-request/requests/${requestId}/review`, reviewFormData);
      console.log('✅ Review response:', res.data);
      
      if (res.data.success) {
        // Refresh the requests list
        loadAssociateRequests();
        setSelectedRequest(null);
        setReviewFormData({ status: 'approved', review_notes: '', password: '' });
        setSuccessMessage(`Request ${reviewFormData.status} successfully`);
        setTimeout(() => setSuccessMessage(''), 5000); // Clear after 5 seconds
      } else {
        setErrorMessage(res.data.message || 'Failed to review request');
        setTimeout(() => setErrorMessage(''), 5000); // Clear after 5 seconds
      }
    } catch (err) {
      console.error('❌ Review request error:', err);
      console.error('Error response:', err.response?.data);
      setErrorMessage(err.response?.data?.message || 'Failed to review request');
      setTimeout(() => setErrorMessage(''), 5000); // Clear after 5 seconds
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Professional Sidebar */}
      <div className="sidebar" style={{ 
        width: '280px', 
        height: '100vh', 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        background: '#fff', 
        borderRight: '1px solid #e5e7eb',
        overflowY: 'auto',
        zIndex: 1000
      }}>
        {/* Sidebar Header */}
        <div className="sidebar-header" style={{ 
          padding: '24px', 
          borderBottom: '1px solid #e5e7eb',
          background: '#fafafa'
        }}>
          <div className="d-flex align-items-center">
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: accent, 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <i className="bi bi-building" style={{ color: '#fff', fontSize: '18px' }}></i>
            </div>
        <div>
              <h5 className="mb-0" style={{ color: '#111827', fontWeight: 600, fontSize: '16px' }}>
                ECS Employee
              </h5>
              <small className="text-muted">Control Center</small>
          </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="sidebar-content" style={{ padding: '16px' }}>
          {/* Main Navigation */}
          <div className="nav-section mb-4">
            <h6 className="nav-section-title" style={{ 
              color: '#6b7280', 
              fontSize: '12px', 
              fontWeight: 600, 
              textTransform: 'uppercase',
              marginBottom: '8px',
              paddingLeft: '8px'
            }}>
              Main Navigation
            </h6>
            <div className="nav-items">
              <button
                className={`nav-item w-100 text-start ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: activeTab === 'dashboard' ? accent : 'transparent',
                  color: activeTab === 'dashboard' ? '#fff' : '#374151',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                <i className="bi bi-speedometer2 me-3"></i>
                Dashboard
                </button>
              


              <button
                className={`nav-item w-100 text-start ${activeTab === 'associate-requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('associate-requests')}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: activeTab === 'associate-requests' ? accent : 'transparent',
                  color: activeTab === 'associate-requests' ? '#fff' : '#374151',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  height: '48px',
                  lineHeight: '24px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <i className="bi bi-person-plus me-3"></i>
                Associate Requests
                </button>

              <button
                className={`nav-item w-100 text-start ${activeTab === 'freelancer-requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('freelancer-requests')}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: activeTab === 'freelancer-requests' ? accent : 'transparent',
                  color: activeTab === 'freelancer-requests' ? '#fff' : '#374151',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  height: '48px',
                  lineHeight: '24px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <i className="bi bi-people-fill me-3"></i>
                Associate Freelancer Requests
                </button>



              <button
                className={`nav-item w-100 text-start ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: activeTab === 'documents' ? accent : 'transparent',
                  color: activeTab === 'documents' ? '#fff' : '#374151',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  height: '48px',
                  lineHeight: '24px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <i className="bi bi-folder me-3"></i>
                Documents
                </button>
        </div>
          </div>

          {/* Management Tools */}
          <div className="nav-section mb-4">
            <h6 className="nav-section-title" style={{ 
              color: '#6b7280', 
              fontSize: '12px', 
              fontWeight: 600, 
              textTransform: 'uppercase',
              marginBottom: '8px',
              paddingLeft: '8px'
            }}>
              Management Tools
            </h6>
            <div className="nav-items">
              <button
                className="nav-item w-100 text-start"
                onClick={() => setActiveTab('analytics')}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: '#374151',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  height: '48px',
                  lineHeight: '24px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <i className="bi bi-graph-up me-3"></i>
                Analytics
              </button>
              
              <button
                className="nav-item w-100 text-start"
                onClick={() => setActiveTab('reports')}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: '#374151',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  height: '48px',
                  lineHeight: '24px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <i className="bi bi-file-earmark-text me-3"></i>
                Reports
          </button>
              
              <button
                className="nav-item w-100 text-start"
                onClick={() => setActiveTab('performance')}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: '#374151',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  height: '48px',
                  lineHeight: '24px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <i className="bi bi-speedometer2 me-3"></i>
                Performance Monitor
          </button>
        </div>
            </div>

          {/* System */}
          <div className="nav-section">
            <h6 className="nav-section-title" style={{ 
              color: '#6b7280', 
              fontSize: '12px', 
              fontWeight: 600, 
              textTransform: 'uppercase',
              marginBottom: '8px',
              paddingLeft: '8px'
            }}>
              System
            </h6>
            <div className="nav-items">
              <button
                className="nav-item w-100 text-start"
                onClick={() => setActiveTab('settings')}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: '#374151',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  height: '48px',
                  lineHeight: '24px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <i className="bi bi-gear me-3"></i>
                Settings
              </button>
              
                <button
                className="nav-item w-100 text-start"
                onClick={logout}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: '#dc3545',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  height: '48px',
                  lineHeight: '24px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <i className="bi bi-box-arrow-right me-3"></i>
                Logout
                </button>
            </div>
          </div>
                </div>
              </div>

      {/* Main Content Area */}
      <div className="main-content flex-grow-1" style={{ 
        marginLeft: '300px',
        padding: '20px',
        minHeight: '100vh',
        background: '#f9fafb',
        width: 'calc(100% - 300px)',
        maxWidth: '100%',
        overflowX: 'hidden'
      }}>
        {/* Page Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-0" style={{ color: '#111827', fontWeight: 600 }}>
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'associate-requests' && 'Associate Requests'}
              {activeTab === 'freelancer-requests' && 'Associate Freelancer Requests'}
              {activeTab === 'analytics' && 'Analytics'}
              {activeTab === 'reports' && 'Reports'}
              {activeTab === 'settings' && 'Settings'}
              
              {activeTab === 'documents' && 'Documents'}
            </h1>
            <p className="text-muted mb-0">
              {activeTab === 'dashboard' && 'System overview and key metrics'}
              {activeTab === 'associate-requests' && 'Review associate join requests'}
              {activeTab === 'freelancer-requests' && 'Handle associate freelancer requests'}
              {activeTab === 'analytics' && 'Performance insights and trends'}
              {activeTab === 'reports' && 'Generate and view system reports'}
              {activeTab === 'settings' && 'System configuration and preferences'}
              
              {activeTab === 'documents' && 'Document management and organization'}
            </p>
            </div>
        </div>
        {/* Main Dashboard Content */}
        <div className="px-3 py-4" style={{ width: '100%', maxWidth: '100%' }}>
          {/* Add Associate Form (Dashboard Tab) */}
          {activeTab === 'dashboard' && (
            <>
              {/* System Stats Row */}
              <div className="row g-4 mb-4">
                <div className="col-lg-3 col-md-6">
                  {/* Total Users Card */}
                  <div className="bg-white rounded-4 shadow-sm p-4 text-center" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
                    <div className="mb-3">
                      <div style={{ fontSize: 32, color: accent, marginBottom: 8 }}>
                        <i className="bi bi-people"></i>
                    </div>
                      <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase' }}>
                        Total Users
                  </div>
                </div>
                    <div style={{ fontWeight: 700, fontSize: '28px', color: '#111827', marginBottom: '8px' }}>
                      {statsLoading ? '...' : statsError ? '--' : stats?.users ? Object.values(stats.users).reduce((a, b) => a + b, 0) : '--'}
                    </div>
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <span className="badge" style={{ background: '#10b981', color: '#fff', fontSize: '12px', padding: '4px 8px' }}>
                        <i className="bi bi-arrow-up me-1"></i>
                        +12.5%
                      </span>
                  </div>
                    <div className="mt-3 text-sm text-muted">
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                        <i className="bi bi-arrow-up" style={{ color: '#10b981' }}></i>
                        <span style={{ fontWeight: 500 }}>Growing steadily</span>
                </div>
                      <div className="text-muted">Active users</div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  {/* Total CVs Card */}
                  <div className="bg-white rounded-4 shadow-sm p-4 text-center" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
                    <div className="mb-3">
                      <div style={{ fontSize: 32, color: accent, marginBottom: 8 }}>
                        <i className="bi bi-file-earmark-text"></i>
                    </div>
                      <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase' }}>
                        Total CVs
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '28px', color: '#111827', marginBottom: '8px' }}>
                      {statsLoading ? '...' : statsError ? '--' : stats?.total_cvs ?? '--'}
                    </div>
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <span className="badge" style={{ background: '#10b981', color: '#fff', fontSize: '12px', padding: '4px 8px' }}>
                        <i className="bi bi-arrow-up me-1"></i>
                        +8.2%
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-muted">
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                        <i className="bi bi-arrow-up" style={{ color: '#10b981' }}></i>
                        <span style={{ fontWeight: 500 }}>CV uploads increasing</span>
                      </div>
                      <div className="text-muted">Professional profiles added</div>
                  </div>
                </div>
              </div>
              
                <div className="col-lg-3 col-md-6">
                  {/* Total Messages Card */}
                  <div className="bg-white rounded-4 shadow-sm p-4 text-center" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
                    <div className="mb-3">
                      <div style={{ fontSize: 32, color: accent, marginBottom: 8 }}>
                        <i className="bi bi-chat-dots"></i>
                    </div>
                      <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase' }}>
                        Total Messages
                  </div>
                </div>
                    <div style={{ fontWeight: 700, fontSize: '28px', color: '#111827', marginBottom: '8px' }}>
                      {statsLoading ? '...' : statsError ? '--' : stats?.total_messages ?? '--'}
                    </div>
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <span className="badge" style={{ background: '#10b981', color: '#fff', fontSize: '12px', padding: '4px 8px' }}>
                        <i className="bi bi-arrow-up me-1"></i>
                        +15.3%
                      </span>
                  </div>
                    <div className="mt-3 text-sm text-muted">
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                        <i className="bi bi-arrow-up" style={{ color: '#10b981' }}></i>
                        <span style={{ fontWeight: 500 }}>Communication active</span>
                </div>
                      <div className="text-muted">High engagement levels</div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-md-6">
                  {/* Pending Requests Card */}
                  <div className="bg-white rounded-4 shadow-sm p-4 text-center" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
                    <div className="mb-3">
                      <div style={{ fontSize: 32, color: accent, marginBottom: 8 }}>
                        <i className="bi bi-envelope"></i>
              </div>
                      <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase' }}>
                        Pending Requests
                        </div>
                        </div>
                    <div style={{ fontWeight: 700, fontSize: '28px', color: '#111827', marginBottom: '8px' }}>
                      {statsLoading ? '...' : statsError ? '--' : stats?.associate_requests?.pending ?? '--'}
                        </div>
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <span className="badge" style={{ background: '#f59e0b', color: '#fff', fontSize: '12px', padding: '4px 8px' }}>
                        <i className="bi bi-clock me-1"></i>
                        Awaiting
                      </span>
                        </div>
                    <div className="mt-3 text-sm text-muted">
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                        <i className="bi bi-clock" style={{ color: '#f59e0b' }}></i>
                        <span style={{ fontWeight: 500 }}>Review required</span>
                        </div>
                      <div className="text-muted">ECS Admin attention needed</div>
                        </div>
                        </div>
                        </div>
              </div>

              {/* Total Visitors Graph */}
              <div className="bg-white rounded-4 shadow-sm p-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)', maxWidth: 1200, margin: '0 auto' }}>
                {/* Interactive Chart Component */}
                <div className="chart-container">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0 pb-0">
                      <div className="d-flex justify-content-between align-items-start flex-wrap">
                        <div>
                          <h6 className="card-title mb-1" style={{ color: accent, fontWeight: 600, fontSize: '18px' }}>
                            Total Visitors
                          </h6>
                          <p className="card-text text-muted small mb-0">
                            Total for the last 3 months
                          </p>
                        </div>
                        <div className="d-flex gap-2 mt-2">
                          {/* Refresh Button */}
                          <button 
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={fetchVisitorData}
                            disabled={visitorDataLoading}
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            {visitorDataLoading ? 'Loading...' : 'Refresh'}
                          </button>
                          {/* Time Range Toggle Group */}
                          <div className="btn-group" role="group">
                            <button
                              type="button"
                              className={`btn btn-sm ${timeRange === '90d' ? '' : 'btn-outline-primary'}`}
                              onClick={() => setTimeRange('90d')}
                              style={{ 
                                fontSize: '12px', 
                                padding: '6px 12px',
                                background: timeRange === '90d' ? accent : 'transparent',
                                color: timeRange === '90d' ? '#fff' : accent,
                                border: `1px solid ${accent}`,
                                borderRadius: timeRange === '90d' ? '6px 0 0 6px' : '6px 0 0 6px'
                              }}
                            >
                              Last 3 months
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${timeRange === '30d' ? '' : 'btn-outline-primary'}`}
                              onClick={() => setTimeRange('30d')}
                              style={{ 
                                fontSize: '12px', 
                                padding: '6px 12px',
                                background: timeRange === '30d' ? accent : 'transparent',
                                color: timeRange === '30d' ? accent : '#374151',
                                border: `1px solid ${accent}`,
                                borderRadius: '0'
                              }}
                            >
                              Last 30 days
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${timeRange === '7d' ? '' : 'btn-outline-primary'}`}
                              onClick={() => setTimeRange('7d')}
                              style={{ 
                                fontSize: '12px', 
                                padding: '6px 12px',
                                background: timeRange === '7d' ? accent : 'transparent',
                                color: timeRange === '7d' ? accent : '#374151',
                                border: `1px solid ${accent}`,
                                borderRadius: '0 6px 6px 0'
                              }}
                            >
                              Last 7 days
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={visitorData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="desktop" stroke={accent} fill={accent} fillOpacity={0.3} />
                            <Area type="monotone" dataKey="mobile" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Associate Requests Tab */}
          {activeTab === 'associate-requests' && (
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)', maxWidth: 1200, margin: '0 auto' }}>
              <h5 style={{ color: accent, fontWeight: 700, marginBottom: 18 }}>Associate Requests</h5>
              
              {/* Success and Error Messages */}
              {successMessage && (
                <div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  {successMessage}
                  <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
                </div>
              )}
              
              {errorMessage && (
                <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {errorMessage}
                  <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
                </div>
              )}
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
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1050 }}>
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

          {/* Associates Tab */}
          {activeTab === 'associates' && (
            <div className="associates-tab">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0">
                  <h5 className="card-title mb-0">Associates</h5>
                </div>
                <div className="card-body">
                  {associatesLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : associatesError ? (
                    <div className="alert alert-danger" role="alert">
                      {associatesError}
                    </div>
                  ) : associates.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <i className="bi bi-building fs-1"></i>
                      <p className="mt-2">No associates found</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Company</th>
                            <th>Contact Person</th>
                            <th>Industry</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {associates.map((associate) => (
                            <tr key={associate.associate_id}>
                              <td>{associate.company_name || 'N/A'}</td>
                              <td>{associate.contact_person}</td>
                              <td>{associate.industry}</td>
                              <td>
                                <span className={`badge bg-${associate.verified ? 'success' : 'warning'}`}>
                                  {associate.verified ? 'Verified' : 'Pending'}
                                </span>
                              </td>
                              <td>{new Date(associate.created_at).toLocaleDateString()}</td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary">
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Freelancers Tab */}
          {activeTab === 'freelancers' && (
            <div className="freelancers-tab">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0">
                  <h5 className="card-title mb-0">Freelancers</h5>
                </div>
                <div className="card-body">
                  {freelancersLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : freelancersError ? (
                    <div className="alert alert-danger" role="alert">
                      {freelancersError}
                    </div>
                  ) : freelancers.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <i className="bi bi-people fs-1"></i>
                      <p className="mt-2">No freelancers found</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Availability</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {freelancers.map((freelancer) => (
                            <tr key={freelancer.freelancer_id}>
                              <td>{`${freelancer.first_name} ${freelancer.last_name}`}</td>
                              <td>{freelancer.email}</td>
                              <td>
                                <span className={`badge bg-${freelancer.is_approved ? 'success' : 'warning'}`}>
                                  {freelancer.is_approved ? 'Approved' : 'Pending'}
                                </span>
                              </td>
                              <td>
                                <span className={`badge bg-${freelancer.is_available ? 'success' : 'secondary'}`}>
                                  {freelancer.is_available ? 'Available' : 'Unavailable'}
                                </span>
                              </td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary">
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Freelancer Requests Tab */}
          {activeTab === 'freelancer-requests' && (
            <div className="freelancer-requests-tab">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0">
                  <h5 className="card-title mb-0">Freelancer Requests</h5>
                </div>
                <div className="card-body">
                  {freelancerRequestsLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : freelancerRequestsError ? (
                    <div className="alert alert-danger" role="alert">
                      {freelancerRequestsError}
                    </div>
                  ) : freelancerRequests.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <i className="bi bi-clipboard-data fs-1"></i>
                      <p className="mt-2">No freelancer requests found</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Associate</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {freelancerRequests.map((request) => (
                            <tr key={request.request_id}>
                              <td>{request.title}</td>
                              <td>{request.associate_name || 'N/A'}</td>
                              <td>
                                <span className={`badge bg-${request.status === 'pending' ? 'warning' : request.status === 'completed' ? 'success' : 'info'}`}>
                                  {request.status}
                                </span>
                              </td>
                              <td>{new Date(request.created_at).toLocaleDateString()}</td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary">
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="analytics-tab">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">Analytics</h5>
                    <select
                      className="form-select form-select-sm w-auto"
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="1y">Last year</option>
                    </select>
                  </div>
                </div>
                <div className="card-body">
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-graph-up fs-1"></i>
                    <p className="mt-2">Analytics data will be displayed here</p>
                    <small>Select a time range to view detailed analytics</small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ECSEmployeeDashboard;
