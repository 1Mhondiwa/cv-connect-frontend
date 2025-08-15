import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const accent = '#fd680e';

const ESCAdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  
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
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'associates', 'freelancers'
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
  
  // Admin profile management
  const [adminImage, setAdminImage] = useState(null);
  const [adminImageUploading, setAdminImageUploading] = useState(false);
  const [adminImageError, setAdminImageError] = useState('');
  const [adminImageSuccess, setAdminImageSuccess] = useState('');
  const adminImageInputRef = useRef(null);

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

  // Reports system state
  const [activeReportSection, setActiveReportSection] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsData, setReportsData] = useState({
    performance: null,
    business: null,
    security: null,
    operations: null
  });
  const [reportsError, setReportsError] = useState('');
  const [lastReportUpdate, setLastReportUpdate] = useState(null);

  // Enhanced Security Monitoring state
  const [activeSecuritySection, setActiveSecuritySection] = useState(null);
  const [securityData, setSecurityData] = useState({
    dashboard: null,
    communications: null,
    audit: null,
    threats: null
  });
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [lastSecurityUpdate, setLastSecurityUpdate] = useState(null);

  // Advanced Performance Monitoring state
  const [performanceMetrics, setPerformanceMetrics] = useState({
    systemHealth: null,
    databasePerformance: null,
    apiPerformance: null,
    userExperience: null
  });
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState('');
  const [lastPerformanceUpdate, setLastPerformanceUpdate] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  const [recommendationNotes, setRecommendationNotes] = useState('');
  const [submittingRecommendations, setSubmittingRecommendations] = useState(false);
  const [dataTableData, setDataTableData] = useState([
    {
      id: 1,
      header: "Executive Summary",
      type: "Executive Summary",
      status: "Done",
      target: "2-3",
      limit: "3",
      reviewer: "Eddie Lake"
    },
    {
      id: 2,
      header: "Technical Approach",
      type: "Technical Approach",
      status: "In Progress",
      target: "5-8",
      limit: "8",
      reviewer: "Jamik Tashpulatov"
    },
    {
      id: 3,
      header: "Project Management",
      type: "Management",
      status: "Not Started",
      target: "3-5",
      limit: "5",
      reviewer: "Assign reviewer"
    },
    {
      id: 4,
      header: "Quality Assurance",
      type: "Quality",
      status: "Done",
      target: "2-4",
      limit: "4",
      reviewer: "Emily Whalen"
    },
    {
      id: 5,
      header: "Risk Management",
      type: "Risk",
      status: "In Progress",
      target: "3-6",
      limit: "6",
      reviewer: "Eddie Lake"
    }
  ]);
  const [showDataModal, setShowDataModal] = useState(false);
  const [selectedDataItem, setSelectedDataItem] = useState(null);
  const [documentItems, setDocumentItems] = useState([
    {
      name: "Executive Summary",
      type: "PDF Document",
      icon: "bi bi-file-earmark-pdf",
      size: "2.4 MB",
      created: "2024-01-15",
      modified: "2024-01-20",
      description: "Comprehensive executive summary of the project proposal including key objectives, timeline, and expected outcomes."
    },
    {
      name: "Technical Specifications",
      type: "Word Document",
      icon: "bi bi-file-earmark-word",
      size: "1.8 MB",
      created: "2024-01-10",
      modified: "2024-01-18",
      description: "Detailed technical specifications and requirements for the project implementation phase."
    },
    {
      name: "Project Timeline",
      type: "Excel Spreadsheet",
      icon: "bi bi-file-earmark-excel",
      size: "856 KB",
      created: "2024-01-12",
      modified: "2024-01-19",
      description: "Project timeline with milestones, deadlines, and resource allocation details."
    },
    {
      name: "Budget Analysis",
      type: "PDF Document",
      icon: "bi bi-file-earmark-pdf",
      size: "3.1 MB",
      created: "2024-01-08",
      modified: "2024-01-17",
      description: "Comprehensive budget analysis including cost breakdown, resource allocation, and financial projections."
    },
    {
      name: "Risk Assessment",
      type: "Word Document",
      icon: "bi bi-file-earmark-word",
      size: "1.2 MB",
      created: "2024-01-14",
      modified: "2024-01-16",
      description: "Risk assessment document identifying potential project risks and mitigation strategies."
    }
  ]);
  const [selectedDocument, setSelectedDocument] = useState(null);









  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch visitor data when time range changes
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchVisitorData();
    }
  }, [timeRange]);

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



  // Fetch freelancer requests when freelancer-requests tab is activated
  useEffect(() => {
    if (activeTab === 'freelancer-requests') {
      fetchFreelancerRequests();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // Fetch analytics data when analytics tab is activated
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalyticsData();
      // Set initial last update time
      setLastAnalyticsUpdate(new Date());
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // Refetch analytics data when time range changes
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalyticsData();
    }
    // eslint-disable-next-line
  }, [timeRange]);

  // Auto-refresh analytics data every 5 minutes when analytics tab is active
  useEffect(() => {
    let intervalId;
    
    if (activeTab === 'analytics') {
      // Set up auto-refresh every 5 minutes (300,000 milliseconds)
      intervalId = setInterval(() => {
        console.log('🔄 Auto-refreshing analytics data...');
        fetchAnalyticsData();
      }, 5 * 60 * 1000);
    }
    
    // Cleanup interval when component unmounts or tab changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeTab]);

  // Auto-refresh visitor data every 5 minutes when dashboard tab is active
  useEffect(() => {
    let intervalId;
    
    if (activeTab === 'dashboard') {
      // Set up auto-refresh every 5 minutes (300,000 milliseconds)
      intervalId = setInterval(() => {
        console.log('🔄 Auto-refreshing visitor data...');
        fetchVisitorData();
      }, 5 * 60 * 1000);
    }
    
    // Cleanup interval when component unmounts or tab changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeTab]);

  // Fetch system stats and visitor data on dashboard tab
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
      fetchVisitorData();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // Fetch admin image on user load
  useEffect(() => {
    if (user && user.profile_picture_url) {
      setAdminImage(user.profile_picture_url);
    }
  }, [user]);

  // Auto-generate reports when report section changes
  useEffect(() => {
    console.log('🔄 useEffect triggered - activeReportSection:', activeReportSection);
    console.log('🔄 Current reportsData:', reportsData);
    if (activeReportSection && !reportsData[activeReportSection]) {
      console.log('🔄 Generating report for section:', activeReportSection);
      generateComprehensiveReport();
    } else {
      console.log('🔄 Report data already exists for section:', activeReportSection);
    }
  }, [activeReportSection]);

  // Auto-load performance metrics when performance tab is activated
  useEffect(() => {
    if (activeTab === 'performance') {
      fetchAdvancedPerformanceMetrics();
    }
  }, [activeTab]);

  // Auto-refresh performance metrics based on interval
  useEffect(() => {
    let intervalId;
    
    if (activeTab === 'performance' && autoRefreshEnabled) {
      intervalId = setInterval(() => {
        console.log('🔄 Auto-refreshing performance metrics...');
        fetchAdvancedPerformanceMetrics();
      }, refreshInterval);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeTab, autoRefreshEnabled, refreshInterval]);

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



  // Analytics Functions
  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    
    try {
      // Calculate days based on time range
      const getDaysFromTimeRange = (range) => {
        switch (range) {
          case '30d': return 30;
          case '90d': return 90;
          case '6m': return 180;
          case '1y': return 365;
          default: return 30;
        }
      };
      
      const days = getDaysFromTimeRange(timeRange);
      
      // Fetch registration trends with time range parameter
      const registrationResponse = await api.get(`/admin/analytics/registration-trends?days=${days}`);
      const userTypeResponse = await api.get('/admin/analytics/user-type-distribution');
      const userActivityResponse = await api.get('/admin/analytics/user-activity-status');
      const cvUploadResponse = await api.get(`/admin/analytics/cv-upload-trends?days=${days}`);
      const topSkillsResponse = await api.get('/admin/analytics/top-skills');
      const cvFileTypesResponse = await api.get('/admin/analytics/cv-file-types');
      const messageTrendsResponse = await api.get(`/admin/analytics/message-trends?days=${days}`);
      const communicationActivityResponse = await api.get('/admin/analytics/user-communication-activity');
      
      // Format the registration trends data to use proper dates
      const formattedRegistrationTrends = (registrationResponse.data.data || []).map(item => ({
        ...item,
        // Format the date for display (e.g., "2024-01-15" -> "Jan 15")
        formattedDate: new Date(item.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }));
      
      setAnalyticsData({
        registrationTrends: formattedRegistrationTrends,
        userTypeDistribution: userTypeResponse.data.data || [],
        userActivityStatus: userActivityResponse.data.data || [],
        cvUploadTrends: cvUploadResponse.data.data || [],
        topSkills: topSkillsResponse.data.data || [],
        cvFileTypes: cvFileTypesResponse.data.data || [],
        messageTrends: messageTrendsResponse.data.data || [],
        userCommunicationActivity: communicationActivityResponse.data.data || []
      });
      
    } catch (error) {
      console.error('Analytics fetch error:', error);
      setAnalyticsError('');
      
      // Fallback to sample data if API fails
      setAnalyticsData({
        registrationTrends: [
          { date: '2025-06-19', formattedDate: 'Jun 19', users: 9, associates: 2, freelancers: 6, admins: 1 },
          { date: '2025-06-20', formattedDate: 'Jun 20', users: 12, associates: 3, freelancers: 8, admins: 1 },
          { date: '2025-06-21', formattedDate: 'Jun 21', users: 15, associates: 4, freelancers: 10, admins: 1 },
          { date: '2025-07-01', formattedDate: 'Jul 1', users: 18, associates: 5, freelancers: 12, admins: 1 },
          { date: '2025-07-15', formattedDate: 'Jul 15', users: 25, associates: 6, freelancers: 16, admins: 3 },
          { date: '2025-07-31', formattedDate: 'Jul 31', users: 30, associates: 7, freelancers: 20, admins: 3 },
          { date: '2025-08-01', formattedDate: 'Aug 1', users: 35, associates: 9, freelancers: 22, admins: 4 },
          { date: '2025-08-11', formattedDate: 'Aug 11', users: 52, associates: 20, freelancers: 28, admins: 4 }
        ],
        userTypeDistribution: [
          { type: 'Freelancers', count: 28, fill: '#fd680e' },
          { type: 'Associates', count: 20, fill: '#10b981' },
          { type: 'Admins', count: 4, fill: '#3b82f6' }
        ],
        userActivityStatus: [
          { status: 'Active', count: 52, fill: '#10b981' },
          { status: 'Inactive', count: 0, fill: '#6b7280' },
          { status: 'Pending', count: 0, fill: '#f59e0b' }
        ],
        cvUploadTrends: [
          { date: '2025-06-19', uploads: 5, approved: 4, rejected: 1 },
          { date: '2025-06-25', uploads: 8, approved: 7, rejected: 1 },
          { date: '2025-07-01', uploads: 12, approved: 11, rejected: 1 },
          { date: '2025-07-15', uploads: 15, approved: 14, rejected: 1 },
          { date: '2025-07-31', uploads: 18, approved: 17, rejected: 1 },
          { date: '2025-08-11', uploads: 22, approved: 21, rejected: 1 }
        ],
        topSkills: [
          { skill: 'JavaScript', count: 18, fill: '#fd680e' },
          { skill: 'React', count: 15, fill: '#10b981' },
          { skill: 'Python', count: 12, fill: '#3b82f6' },
          { skill: 'Node.js', count: 10, fill: '#8b5cf6' },
          { skill: 'SQL', count: 8, fill: '#f59e0b' },
          { skill: 'AWS', count: 6, fill: '#ef4444' }
        ],
        cvFileTypes: [
          { type: 'PDF', count: 15, fill: '#ef4444' },
          { type: 'DOCX', count: 8, fill: '#3b82f6' },
          { type: 'DOC', count: 3, fill: '#10b981' },
          { type: 'TXT', count: 1, fill: '#f59e0b' }
        ],
        messageTrends: [
          { date: '2025-06-19', messages: 12, conversations: 3 },
          { date: '2025-06-25', messages: 18, conversations: 5 },
          { date: '2025-07-01', messages: 25, conversations: 7 },
          { date: '2025-07-15', messages: 32, conversations: 9 },
          { date: '2025-07-31', messages: 38, conversations: 11 },
          { date: '2025-08-11', messages: 45, conversations: 13 }
        ],
        userCommunicationActivity: [
          { user: 'josh', messages: 6, conversations: 2, fill: '#10b981' },
          { user: 'Gunna Wunna', messages: 5, conversations: 2, fill: '#10b981' },
          { user: 'Jane Smith', messages: 3, conversations: 1, fill: '#10b981' },
          { user: 'Natasha Joy', messages: 2, conversations: 1, fill: '#10b981' },
          { user: 'Evidencia Chengeta', messages: 2, conversations: 1, fill: '#fd680e' }
        ]
      });
      
      // Update the last update timestamp
      setLastAnalyticsUpdate(new Date());
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Generate fallback visitor data based on your actual user data
  const generateFallbackVisitorData = () => {
    const today = new Date();
    const data = [];
    
    // Generate data for the last 90 days with realistic patterns
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate realistic visitor patterns based on your actual data
      let desktop = 0;
      let mobile = 0;
      
      // Add some realistic variation
      if (i === 89) { // June 19, 2025 (your first registration)
        desktop = 2; // 2 associates
        mobile = 6;  // 6 freelancers
      } else if (i === 70) { // July 8, 2025
        desktop = 1; // 1 associate
        mobile = 3;  // 3 freelancers
      } else if (i === 50) { // July 28, 2025
        desktop = 2; // 2 associates
        mobile = 4;  // 4 freelancers
      } else if (i === 30) { // August 17, 2025
        desktop = 3; // 3 associates
        mobile = 2;  // 2 freelancers
      } else if (i === 10) { // August 27, 2025
        desktop = 1; // 1 associate
        mobile = 1;  // 1 freelancer
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        desktop,
        mobile
      });
    }
    
    return data;
  };

  // Fetch visitor data for dashboard chart
  const fetchVisitorData = async () => {
    setVisitorDataLoading(true);
    try {
      // Calculate days based on time range
      const getDaysFromTimeRange = (range) => {
        switch (range) {
          case '7d': return 7;
          case '30d': return 30;
          case '90d': return 90;
          default: return 90;
        }
      };
      
      const days = getDaysFromTimeRange(timeRange);
      const response = await api.get(`/admin/analytics/visitor-data?days=${days}`);
      
      if (response.data.success) {
        // Format the data for the chart
        const formattedData = response.data.data.map(item => ({
          ...item,
          // Format the date for display
          formattedDate: new Date(item.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        }));
        
        setVisitorData(formattedData);
        setFilteredChartData(formattedData); // Update the chart data
      } else {
        console.error('Failed to fetch visitor data:', response.data.message);
        // Fallback to sample data if API fails
        const fallbackData = generateFallbackVisitorData();
        setVisitorData(fallbackData);
        setFilteredChartData(fallbackData);
      }
    } catch (error) {
      console.error('Error fetching visitor data:', error);
      // Fallback to sample data if API fails
      const fallbackData = generateFallbackVisitorData();
      setVisitorData(fallbackData);
      setFilteredChartData(fallbackData);
    } finally {
      setVisitorDataLoading(false);
    }
  };

  // Comprehensive Reports Functions
  const generateComprehensiveReport = async () => {
    setReportsLoading(true);
    setReportsError('');
    try {
      console.log('📊 Generating comprehensive report...');
      console.log('📊 Current activeReportSection:', activeReportSection);
      
      // Fetch all report data in parallel
      const [performanceRes, businessRes, securityRes, operationsRes] = await Promise.all([
        api.get('/admin/reports/performance'),
        api.get('/admin/reports/business'),
        api.get('/admin/reports/security'),
        api.get('/admin/reports/operations')
      ]);

      console.log('📊 API Responses:', {
        performance: performanceRes.data,
        business: businessRes.data,
        security: securityRes.data,
        operations: operationsRes.data
      });

      // Update reports data
      setReportsData({
        performance: performanceRes.data.success ? performanceRes.data.data : null,
        business: businessRes.data.success ? businessRes.data.data : null,
        security: securityRes.data.success ? securityRes.data.data : null,
        operations: operationsRes.data.success ? operationsRes.data.data : null
      });

      setLastReportUpdate(new Date());
      console.log('✅ Comprehensive report generated successfully');
      console.log('✅ Updated reportsData:', {
        performance: performanceRes.data.success ? performanceRes.data.data : null,
        business: businessRes.data.success ? businessRes.data.data : null,
        security: securityRes.data.success ? securityRes.data.data : null,
        operations: operationsRes.data.success ? operationsRes.data.data : null
      });
    } catch (error) {
      console.error('❌ Error generating comprehensive report:', error);
      setReportsError('Failed to generate comprehensive report. Please try again.');
      
      // Set fallback data for demonstration
      const fallbackData = {
        performance: generateFallbackPerformanceData(),
        business: generateFallbackBusinessData(),
        security: generateFallbackBasicSecurityData(),
        operations: generateFallbackOperationsData()
      };
      
      setReportsData(fallbackData);
      console.log('✅ Fallback data set:', fallbackData);
    } finally {
      setReportsLoading(false);
    }
  };

  const generateFallbackPerformanceData = () => ({
    systemHealth: {
      uptime: '99.8%',
      responseTime: '245ms',
      errorRate: '0.2%',
      activeConnections: 48,
      totalConnections: 50,
      connectionUtilization: '96%'
    },
    systemResources: {
      cpuUsage: '23%',
      memoryUsage: '68%',
      diskUsage: '45%',
      networkLatency: '12ms'
    },
    performanceMetrics: [
      { metric: 'Database Query Time', value: '89ms', status: 'excellent' },
      { metric: 'Connection Pool Usage', value: '48/50', status: 'good' },
      { metric: 'Slow Query Rate', value: '0.2%', status: 'excellent' },
      { metric: 'Memory Usage', value: '68%', status: 'good' },
      { metric: 'CPU Usage', value: '23%', status: 'excellent' },
      { metric: 'Disk Usage', value: '45%', status: 'excellent' }
    ],
    userInsights: {
      totalUsers: 52,
      active24h: 12,
      active7d: 41,
      newUsers30d: 8,
      userActivityRate: '78.8%'
    },
    recentIssues: [
      { issue: 'System operating normally', severity: 'low', timestamp: 'Current', details: 'All metrics within normal ranges' }
    ]
  });

  const generateFallbackBusinessData = () => ({
    userGrowth: {
      totalUsers: 52,
      monthlyGrowth: '+15.2%',
      userRetention: '87.3%',
      activeUsers: 41
    },
    matchingEfficiency: {
      totalRequests: 18,
      successfulMatches: 15,
      matchRate: '83.3%',
      averageResponseTime: '2.4 hours'
    },
    businessMetrics: [
      { metric: 'User Satisfaction', value: '4.6/5.0', trend: 'up' },
      { metric: 'Project Completion Rate', value: '91.2%', trend: 'up' },
      { metric: 'Revenue Impact', value: '+23.4%', trend: 'up' }
    ]
  });



  const generateFallbackOperationsData = () => ({
    workflowEfficiency: {
      averageProcessingTime: '4.2 hours',
      completedTasks: 89,
      pendingTasks: 12,
      efficiencyScore: '92.1%'
    },
    qualityMetrics: {
      userSatisfaction: '4.6/5.0',
      errorRate: '1.2%',
      responseTime: '2.1 hours',
      qualityScore: '94.3%'
    },
    improvementAreas: [
      'Reduce associate request processing time',
      'Improve freelancer matching accuracy',
      'Enhance communication monitoring',
      'Optimize system performance'
    ]
  });

  const generateFallbackBasicSecurityData = () => ({
    securityOverview: {
      totalThreats: 3,
      blockedAttempts: 12,
      securityScore: 'A+',
      lastAudit: '2 days ago'
    },
    communicationMonitoring: {
      totalMessages: 156,
      flaggedMessages: 2,
      suspiciousUsers: 1,
      complianceScore: '98.5%'
    },
    recentAlerts: [
      { alert: 'Suspicious login attempt detected', severity: 'medium', timestamp: '3 hours ago' },
      { alert: 'Unusual message pattern detected', severity: 'low', timestamp: '1 day ago' }
    ]
  });

  const exportReportData = () => {
    try {
      const reportData = {
        generatedAt: new Date().toISOString(),
        performance: reportsData.performance,
        business: reportsData.business,
        security: reportsData.security,
        operations: reportsData.operations
      };

      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cv-connect-report-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      console.log('✅ Report data exported successfully');
    } catch (error) {
      console.error('❌ Error exporting report data:', error);
      alert('Failed to export report data. Please try again.');
    }
  };

  // Enhanced Security Monitoring Functions
  const fetchSecurityData = async (section) => {
    setSecurityLoading(true);
    setSecurityError('');
    try {
      console.log(`🔒 Fetching security data for section: ${section}`);
      
      let response;
      switch (section) {
        case 'dashboard':
          response = await api.get('/admin/security/dashboard');
          break;
        case 'communications':
          response = await api.get('/admin/security/communications');
          break;
        case 'audit':
          response = await api.get('/admin/security/audit-log');
          break;
        case 'threats':
          response = await api.get('/admin/security/threat-intelligence');
          break;
        default:
          throw new Error('Invalid security section');
      }

      if (response.data.success) {
        setSecurityData(prev => ({
          ...prev,
          [section]: response.data.data
        }));
        setLastSecurityUpdate(new Date());
        console.log(`✅ Security data fetched for ${section}`);
      } else {
        throw new Error(response.data.message || 'Failed to fetch security data');
      }
    } catch (error) {
      console.error(`❌ Error fetching security data for ${section}:`, error);
      setSecurityError(`Failed to fetch ${section} data: ${error.message}`);
      
      // Set fallback data for demonstration
      setSecurityData(prev => ({
        ...prev,
        [section]: generateFallbackSecurityData(section)
      }));
    } finally {
      setSecurityLoading(false);
    }
  };

  const generateFallbackSecurityData = (section) => {
    switch (section) {
      case 'dashboard':
        return {
          realTimeMetrics: {
            totalUsers: 52,
            activeUsers24h: 41,
            activeUsers7d: 48,
            suspiciousUsers: 1
          },
          recentLogins: [
            { user: 'admin@cvconnect.com', timestamp: '2 minutes ago', ip: '192.168.1.1', status: 'success' },
            { user: 'john.doe@company.com', timestamp: '5 minutes ago', ip: '192.168.1.100', status: 'success' }
          ],
          communicationThreats: {
            totalMessages: 156,
            spamMessages: 2,
            suspiciousMessages: 1,
            inappropriateMessages: 0
          },
          threatLevel: 'LOW',
          lastUpdated: new Date().toISOString()
        };
      case 'communications':
        return {
          patterns: [],
          topCommunicators: [],
          flaggedMessages: [],
          analysisPeriod: '7 days',
          userTypeFilter: 'All Users'
        };
      case 'audit':
        return {
          logEntries: [],
          totalEntries: 0,
          analysisPeriod: '30 days',
          actionFilter: 'All Actions'
        };
      case 'threats':
        return {
          messageThreats: { spam: 0, scam: 0, phishing: 0, suspicious: 0 },
          ipThreats: [],
          userAnomalies: [],
          overallThreatLevel: 'LOW',
          recommendations: []
        };
      default:
        return null;
    }
  };

  const flagMessage = async (messageId, flagReason, adminNotes) => {
    try {
      console.log(`🚩 Flagging message ${messageId} with reason: ${flagReason}`);
      
      const response = await api.post('/admin/security/flag-message', {
        messageId,
        flagReason,
        adminNotes
      });

      if (response.data.success) {
        console.log('✅ Message flagged successfully');
        // Refresh communications data
        if (activeSecuritySection === 'communications') {
          fetchSecurityData('communications');
        }
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to flag message');
      }
    } catch (error) {
      console.error('❌ Error flagging message:', error);
      alert(`Failed to flag message: ${error.message}`);
      return false;
    }
  };

  // Advanced Performance Monitoring Functions
  const fetchAdvancedPerformanceMetrics = async () => {
    setPerformanceLoading(true);
    setPerformanceError('');
    try {
      console.log('📊 Fetching advanced performance metrics...');
      
      // Fetch all performance data in parallel
      const [systemHealthRes, databaseRes, apiRes, userExpRes] = await Promise.all([
        api.get('/admin/performance/system-health'),
        api.get('/admin/performance/database'),
        api.get('/admin/performance/api-metrics'),
        api.get('/admin/performance/user-experience')
      ]);

      // Update performance metrics
      setPerformanceMetrics({
        systemHealth: systemHealthRes.data.success ? systemHealthRes.data.data : null,
        databasePerformance: databaseRes.data.success ? databaseRes.data.data : null,
        apiPerformance: apiRes.data.success ? apiRes.data.data : null,
        userExperience: userExpRes.data.success ? userExpRes.data.data : null
      });

      setLastPerformanceUpdate(new Date());
      console.log('✅ Advanced performance metrics fetched successfully');
    } catch (error) {
      console.error('❌ Error fetching performance metrics:', error);
      setPerformanceError('Failed to fetch performance metrics. Using fallback data.');
      
      // Set fallback data for demonstration
      setPerformanceMetrics({
        systemHealth: generateFallbackSystemHealthData(),
        databasePerformance: generateFallbackDatabaseData(),
        apiPerformance: generateFallbackAPIData(),
        userExperience: generateFallbackUserExperienceData()
      });
    } finally {
      setPerformanceLoading(false);
    }
  };

  const generateFallbackSystemHealthData = () => ({
    cpuUsage: '23%',
    memoryUsage: '68%',
    diskUsage: '45%',
    networkLatency: '12ms',
    uptime: '99.8%',
    lastRestart: '15 days ago',
    activeProcesses: 127,
    systemLoad: '0.8'
  });

  const generateFallbackDatabaseData = () => ({
    connectionPool: {
      active: 12,
      idle: 8,
      total: 20,
      maxConnections: 50
    },
    queryPerformance: {
      averageResponseTime: '89ms',
      slowQueries: 2,
      totalQueries: 1547,
      cacheHitRate: '94.2%'
    },
    storageMetrics: {
      totalSize: '2.4 GB',
      usedSpace: '1.8 GB',
      freeSpace: '600 MB',
      growthRate: '+15 MB/day'
    }
  });

  const generateFallbackAPIData = () => ({
    responseTimes: {
      average: '245ms',
      p95: '412ms',
      p99: '678ms',
      slowest: '1.2s'
    },
    throughput: {
      requestsPerSecond: 45,
      totalRequests: 15420,
      successfulRequests: 15380,
      failedRequests: 40
    },
    endpoints: [
      { path: '/admin/analytics', avgTime: '189ms', calls: 2340 },
      { path: '/admin/reports', avgTime: '312ms', calls: 890 },
      { path: '/admin/security', avgTime: '156ms', calls: 1230 }
    ]
  });

  const generateFallbackUserExperienceData = () => ({
    pageLoadTimes: {
      dashboard: '1.2s',
      analytics: '2.1s',
      reports: '1.8s',
      security: '1.5s'
    },
    userSatisfaction: {
      overall: '4.6/5.0',
      dashboard: '4.7/5.0',
      analytics: '4.5/5.0',
      reports: '4.6/5.0'
    },
    errorRates: {
      totalErrors: 23,
      criticalErrors: 1,
      userReportedIssues: 5,
      resolutionTime: '2.3 hours'
    }
  });

  // Freelancer Request Management Functions
  const fetchFreelancerRequests = async () => {
    setFreelancerRequestsLoading(true);
    setFreelancerRequestsError('');
    try {
      const res = await api.get('/admin/associate-requests');
      if (res.data.success) {
        setFreelancerRequests(res.data.requests);
      } else {
        setFreelancerRequestsError(res.data.message || 'Failed to fetch freelancer requests');
      }
    } catch (err) {
      setFreelancerRequestsError(err.response?.data?.message || 'Failed to fetch freelancer requests');
    } finally {
      setFreelancerRequestsLoading(false);
    }
  };

  const fetchAvailableFreelancers = async () => {
    try {
      console.log('🔍 Starting to fetch freelancers...');
      console.log('🔍 API URL: /admin/freelancers?availability_status=all&approval_status=all');
      
      // Get ALL freelancers for comprehensive recommendations
      const res = await api.get('/admin/freelancers?availability_status=all&approval_status=all');
      console.log('🔍 API Response:', res);
      console.log('🔍 Response Status:', res.status);
      console.log('🔍 Response Data:', res.data);
      
      if (res.data.success) {
        console.log('🔍 Fetched Freelancers:', res.data.freelancers.length);
        if (res.data.freelancers.length > 0) {
          console.log('🔍 Sample Freelancer:', res.data.freelancers[0]);
        } else {
          console.log('🔍 No freelancers returned from API');
        }
        setAllFreelancers(res.data.freelancers);
        setAvailableFreelancers(res.data.freelancers);
        console.log('🔍 State updated - allFreelancers:', res.data.freelancers.length);
        console.log('🔍 State updated - availableFreelancers:', res.data.freelancers.length);
      } else {
        console.error('🔍 API returned success: false:', res.data);
      }
    } catch (err) {
      console.error('Error fetching available freelancers:', err);
      console.error('Error details:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.message);
    }
  };

  const openFreelancerRequestDetails = async (request) => {
    setSelectedFreelancerRequest(request);
    setShowFreelancerRequestDetailsModal(true);
    await fetchAvailableFreelancers();
  };

  const openRecommendationsModal = async (request) => {
    console.log('🔍 Opening recommendations modal for request:', request);
    setSelectedFreelancerRequest(request);
    setShowRecommendationsModal(true);
    setSelectedFreelancers([]);
    setHighlightedFreelancers([]);
    setAdminNotes('');
    
    // Fetch all freelancers when opening recommendations modal
    console.log('🔍 Fetching freelancers...');
    await fetchAvailableFreelancers();
    console.log('🔍 Freelancers fetched, modal should show data now');
  };

  const handleFreelancerSelection = (freelancerId, isSelected) => {
    console.log('🔍 handleFreelancerSelection called:', { freelancerId, isSelected });
    if (isSelected) {
      setSelectedFreelancers(prev => {
        const newSelection = [...prev, freelancerId];
        console.log('🔍 Added freelancer to selection:', newSelection);
        return newSelection;
      });
    } else {
      setSelectedFreelancers(prev => {
        const newSelection = prev.filter(id => id !== freelancerId);
        console.log('🔍 Removed freelancer from selection:', newSelection);
        return newSelection;
      });
    }
  };

  const handleHighlightFreelancer = (freelancerId, isHighlighted) => {
    if (isHighlighted) {
      setHighlightedFreelancers(prev => [...prev, freelancerId]);
    } else {
      setHighlightedFreelancers(prev => prev.filter(id => id !== freelancerId));
    }
  };

  const submitRecommendations = async () => {
    if (selectedFreelancers.length === 0) {
      alert('Please select at least one freelancer');
      return;
    }

    setRecommendationsLoading(true);
    try {
      const res = await api.post(`/admin/associate-requests/${selectedFreelancerRequest.request_id}/recommendations`, {
        freelancer_ids: selectedFreelancers,
        admin_notes: adminNotes,
        highlighted_freelancers: highlightedFreelancers
      });

      if (res.data.success) {
        alert('Recommendations submitted successfully!');
        setShowRecommendationsModal(false);
        fetchFreelancerRequests();
      } else {
        alert(res.data.message || 'Failed to submit recommendations');
      }
    } catch (err) {
      console.error('Error submitting recommendations:', err);
      alert(err.response?.data?.message || 'Failed to submit recommendations');
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, status, notes = '') => {
    try {
      const res = await api.put(`/admin/associate-requests/${requestId}/status`, {
        status,
        admin_notes: notes
      });

      if (res.data.success) {
        alert('Request status updated successfully!');
        fetchFreelancerRequests();
      } else {
        alert(res.data.message || 'Failed to update request status');
      }
    } catch (err) {
      console.error('Error updating request status:', err);
      alert(err.response?.data?.message || 'Failed to update request status');
    }
  };

  // Simple search function
  const handleSearch = () => {
    console.log('🔍 Search function called with:', { searchSkills, searchExperience, searchStatus });
    console.log('🔍 allFreelancers count:', allFreelancers.length);
    console.log('🔍 Sample freelancer data:', allFreelancers[0]);
    
    let filtered = [...allFreelancers];
    console.log('🔍 Starting with all freelancers:', filtered.length);
    
    // Filter by skills
    if (searchSkills.trim()) {
      console.log('🔍 Filtering by skills:', searchSkills);
      filtered = filtered.filter(f => {
        const hasSkills = f.skills?.some(skill => skill.toLowerCase().includes(searchSkills.toLowerCase()));
        const hasHeadline = f.headline?.toLowerCase().includes(searchSkills.toLowerCase());
        const matches = hasSkills || hasHeadline;
        
        console.log(`🔍 Freelancer ${f.first_name} ${f.last_name}:`, {
          skills: f.skills,
          headline: f.headline,
          searchTerm: searchSkills,
          hasSkills,
          hasHeadline,
          matches
        });
        
        return matches;
      });
      console.log('🔍 After skills filter:', filtered.length);
    }
    
    // Filter by experience
    if (searchExperience.trim()) {
      console.log('🔍 Filtering by experience:', searchExperience);
      const minExp = parseInt(searchExperience);
      if (!isNaN(minExp)) {
        filtered = filtered.filter(f => {
          const experience = f.experience_years || 0;
          const matches = experience >= minExp;
          
          console.log(`🔍 Freelancer ${f.first_name} ${f.last_name}:`, {
            experience,
            minRequired: minExp,
            matches
          });
          
          return matches;
        });
        console.log('🔍 After experience filter:', filtered.length);
      }
    }
    
    // Filter by status
    if (searchStatus === 'available') {
      console.log('🔍 Filtering by status: available');
      filtered = filtered.filter(f => {
        const matches = f.is_available;
        console.log(`🔍 Freelancer ${f.first_name} ${f.last_name}:`, {
          is_available: f.is_available,
          matches
        });
        return matches;
      });
      console.log('🔍 After status filter (available):', filtered.length);
    } else if (searchStatus === 'approved') {
      console.log('🔍 Filtering by status: approved');
      filtered = filtered.filter(f => {
        const matches = f.is_approved;
        console.log(`🔍 Freelancer ${f.first_name} ${f.last_name}:`, {
          is_approved: f.is_approved,
          matches
        });
        return matches;
      });
      console.log('🔍 After status filter (approved):', filtered.length);
    }
    
    console.log('🔍 Final filtered results:', filtered.length);
    console.log('🔍 Sample filtered results:', filtered.slice(0, 3));
    
    setAvailableFreelancers(filtered);
    console.log('🔍 Search completed:', { 
      skills: searchSkills, 
      experience: searchExperience, 
      status: searchStatus, 
      results: filtered.length 
    });
  };

  // Reset search to show all freelancers
  const resetSearch = () => {
    setSearchSkills('');
    setSearchExperience('');
    setSearchStatus('');
    setAvailableFreelancers(allFreelancers);
    console.log('🔍 Search reset - showing all freelancers');
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
      if (freelancerFilters.approval_status !== 'all') {
        params.append('approval_status', freelancerFilters.approval_status);
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
        is_available: availabilityStatus === 'available'
      });
      if (res.data.success) {
        // Update freelancer in state
        setFreelancers(prev => prev.map(f => 
          f.freelancer_id === freelancerId 
            ? { ...f, is_available: availabilityStatus === 'available' }
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

  const approveFreelancer = async (freelancerId) => {
    setApprovalLoading(prev => ({ ...prev, [freelancerId]: true }));
    try {
      const res = await api.put(`/admin/freelancers/${freelancerId}/approve`);
      if (res.data.success) {
        // Update freelancer in state
        setFreelancers(prev => prev.map(f => 
          f.freelancer_id === freelancerId 
            ? { 
                ...f, 
                is_approved: true, 
                approval_date: new Date().toISOString(),
                approved_by: user.user_id,
                last_admin_review: new Date().toISOString()
              }
            : f
        ));
        alert('Freelancer approved successfully!');
      } else {
        alert(res.data.message || 'Failed to approve freelancer');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve freelancer');
    } finally {
      setApprovalLoading(prev => ({ ...prev, [freelancerId]: false }));
    }
  };

  const rejectFreelancer = async (freelancerId) => {
    setApprovalLoading(prev => ({ ...prev, [freelancerId]: true }));
    try {
      const res = await api.put(`/admin/freelancers/${freelancerId}/reject`);
      if (res.data.success) {
        // Update freelancer in state
        setFreelancers(prev => prev.map(f => 
          f.freelancer_id === freelancerId 
            ? { 
                ...f, 
                is_approved: false, 
                approval_date: null,
                approved_by: null,
                last_admin_review: new Date().toISOString()
              }
            : f
        ));
        alert('Freelancer rejected successfully!');
      } else {
        alert(res.data.message || 'Failed to reject freelancer');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject freelancer');
    } finally {
      setApprovalLoading(prev => ({ ...prev, [freelancerId]: false }));
    }
  };

  const updateFreelancerRating = async (freelancerId, rating) => {
    try {
      const res = await api.put(`/admin/freelancers/${freelancerId}/rating`, { rating });
      if (res.data.success) {
        // Update freelancer in state
        setFreelancers(prev => prev.map(f => 
          f.freelancer_id === freelancerId 
            ? { ...f, admin_rating: rating, last_admin_review: new Date().toISOString() }
            : f
        ));
      } else {
        alert(res.data.message || 'Failed to update rating');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update rating');
    }
  };

  const openFreelancerNotes = (freelancerId) => {
    const freelancer = freelancers.find(f => f.freelancer_id === freelancerId);
    setSelectedFreelancerForNotes(freelancer);
    setFreelancerNotes(freelancer?.admin_notes || '');
    setFreelancerNotesModal(true);
  };

  const saveFreelancerNotes = async () => {
    if (!selectedFreelancerForNotes) return;
    
    setNotesLoading(true);
    try {
      const res = await api.put(`/admin/freelancers/${selectedFreelancerForNotes.freelancer_id}/notes`, {
        notes: freelancerNotes
      });
      if (res.data.success) {
        // Update freelancer in state
        setFreelancers(prev => prev.map(f => 
          f.freelancer_id === selectedFreelancerForNotes.freelancer_id
            ? { 
                ...f, 
                admin_notes: freelancerNotes,
                last_admin_review: new Date().toISOString()
              }
            : f
        ));
        setFreelancerNotesModal(false);
        alert('Notes saved successfully!');
      } else {
        alert(res.data.message || 'Failed to save notes');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save notes');
    } finally {
      setNotesLoading(false);
    }
  };



  const handleDataUpdate = (updatedItem) => {
    setDataTableData(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    closeDataModal();
  };

  const openDocument = (document) => {
    setSelectedDocument(document);
  };

  const shareDocument = (document) => {
    // In a real application, this would open a sharing dialog
    alert(`Sharing ${document.name}...`);
  };

  const deleteDocument = (document) => {
    if (window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      setDocumentItems(prev => prev.filter(item => item.name !== document.name));
      if (selectedDocument && selectedDocument.name === document.name) {
        setSelectedDocument(null);
      }
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
                ECS Admin
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

              {activeTab === 'freelancer-requests' && 'Associate Freelancer Requests'}
              {activeTab === 'analytics' && 'Analytics'}
              {activeTab === 'reports' && 'Reports'}
              {activeTab === 'settings' && 'Settings'}
              
              {activeTab === 'documents' && 'Documents'}
            </h1>
            <p className="text-muted mb-0">
              {activeTab === 'dashboard' && 'System overview and key metrics'}

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
                      <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase' }}>
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
                      <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase' }}>
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
                      <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase' }}>
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
                      <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase' }}>
                        Pending Requests
                        </div>
                        </div>
                    <div style={{ fontWeight: 700, fontSize: '28px', color: '#111827', marginBottom: '8px' }}>
                      0
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
                                color: timeRange === '30d' ? '#fff' : accent,
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
                                color: timeRange === '7d' ? '#fff' : accent,
                                border: `1px solid ${accent}`,
                                borderRadius: timeRange === '7d' ? '0 6px 6px 0' : '0 6px 6px 0'
                              }}
                            >
                              Last 7 days
                          </button>
                        </div>
                      </div>
                      </div>
                    </div>
                    <div className="card-body pt-0">
                      <div className="chart-wrapper" style={{ height: '300px', width: '100%' }}>
                        {visitorDataLoading ? (
                          <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        ) : filteredChartData.length === 0 ? (
                          <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                            <div className="text-center text-muted">
                              <i className="bi bi-graph-up display-4"></i>
                              <p className="mt-2">No visitor data available for the selected time period</p>
                            </div>
                          </div>
                        ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={filteredChartData}>
                            <defs>
                              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={accent} stopOpacity={1.0} />
                                <stop offset="95%" stopColor={accent} stopOpacity={0.1} />
                              </linearGradient>
                              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6c757d" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#6c757d" stopOpacity={0.1} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                              dataKey="date"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              minTickGap={32}
                              tick={{ fontSize: 12, fill: '#666' }}
                              tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tick={{ fontSize: 12, fill: '#666' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                              }}
                              labelFormatter={(value) => {
                                return new Date(value).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric"
                                })
                              }}
                              formatter={(value, name) => [
                                value,
                                name === 'Desktop' ? 'Desktop' : 'Mobile'
                              ]}
                            />
                            <Area
                              dataKey="mobile"
                              type="monotone"
                              fill="url(#fillMobile)"
                              stroke="#6c757d"
                              strokeWidth={2}
                              stackId="a"
                              name="Mobile"
                            />
                            <Area
                              dataKey="desktop"
                              type="monotone"
                              fill="url(#fillDesktop)"
                              stroke={accent}
                              strokeWidth={2}
                              stackId="a"
                              name="Desktop"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {/* Associate Requests Table (Associate Requests Tab) */}

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

          {/* Freelancer Requests Tab */}
          {activeTab === 'freelancer-requests' && (
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)', maxWidth: 1200, margin: '0 auto' }}>
              <h5 style={{ color: accent, fontWeight: 700, marginBottom: 18 }}>ECS Admin Freelancer Request Management</h5>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>Review associate requests for freelancer services and provide curated recommendations</p>
              
              {freelancerRequestsLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" style={{ color: accent }} role="status"></div>
                  <p className="mt-2 text-muted">Loading freelancer requests...</p>
        </div>
              ) : freelancerRequestsError ? (
                <div className="alert alert-danger">{freelancerRequestsError}</div>
              ) : freelancerRequests.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-4 text-muted"></i>
                  <p className="mt-3 text-muted">No freelancer requests submitted yet</p>
      </div>
              ) : (
                <div className="row g-3">
                  {freelancerRequests.map((request) => (
                    <div key={request.request_id} className="col-12">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h6 className="card-title mb-1" style={{ color: accent, fontWeight: 600 }}>
                                {request.title}
                              </h6>
                              <p className="card-text text-muted small mb-2">
                                {request.description.length > 150 
                                  ? `${request.description.substring(0, 150)}...` 
                                  : request.description}
                              </p>
                            </div>
                            <div className="text-end">
                              <span className={`badge ${
                                request.status === 'pending' ? 'bg-warning' :
                                request.status === 'reviewed' ? 'bg-info' :
                                request.status === 'provided' ? 'bg-success' :
                                request.status === 'completed' ? 'bg-primary' :
                                'bg-secondary'
                              }`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="row g-2 mb-3">
                <div className="col-md-4">
                              <small className="text-muted">
                                <i className="bi bi-building me-1"></i>
                                <strong>Company:</strong> {request.associate_email}
                              </small>
                            </div>
                            <div className="col-md-4">
                              <small className="text-muted">
                                <i className="bi bi-gear me-1"></i>
                                <strong>Skills:</strong> {request.required_skills.join(', ')}
                              </small>
                            </div>
                            <div className="col-md-4">
                              <small className="text-muted">
                                <i className="bi bi-calendar me-1"></i>
                                <strong>Submitted:</strong> {new Date(request.created_at).toLocaleDateString()}
                              </small>
                            </div>
                          </div>

                          <div className="row g-2 mb-3">
                            <div className="col-md-3">
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                <strong>Urgency:</strong> {request.urgency_level}
                              </small>
                            </div>
                            <div className="col-md-3">
                              <small className="text-muted">
                                <i className="bi bi-currency-dollar me-1"></i>
                                <strong>Budget:</strong> {request.budget_range || 'Not specified'}
                              </small>
                            </div>
                            <div className="col-md-3">
                              <small className="text-muted">
                                <i className="bi bi-geo-alt me-1"></i>
                                <strong>Location:</strong> {request.preferred_location || 'Any'}
                              </small>
                            </div>
                            <div className="col-md-3">
                              <small className="text-muted">
                                <i className="bi bi-star me-1"></i>
                                <strong>Experience:</strong> {request.min_experience}+ years
                              </small>
                            </div>
                          </div>

                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <small className="text-muted">
                                <i className="bi bi-calendar me-1"></i>
                                <strong>Submitted:</strong> {new Date(request.created_at).toLocaleDateString()}
                              </small>
                            </div>
                            <button
                              className="btn btn-sm"
                              style={{ background: accent, color: '#fff', borderRadius: 20 }}
                              onClick={() => openRecommendationsModal(request)}
                            >
                              <i className="bi bi-star me-1"></i>Provide Recommendations
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)', maxWidth: 1400, margin: '0 auto' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 style={{ color: accent, fontWeight: 700, marginBottom: 8 }}>Analytics Dashboard</h5>
                  <p style={{ color: '#666', fontSize: 14, margin: 0 }}>Real-time performance insights and trends</p>
                </div>
                <div className="d-flex gap-2">
                  <select 
                    className="form-select form-select-sm" 
                    style={{ width: '120px' }}
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="6m">Last 6 Months</option>
                    <option value="1y">Last Year</option>
                  </select>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={fetchAnalyticsData}
                    disabled={analyticsLoading}
                  >
                    {analyticsLoading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>
              
              {/* Last Update Indicator */}
              {lastAnalyticsUpdate && (
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>
                    Last updated: {lastAnalyticsUpdate.toLocaleTimeString()}
                  </small>
                  <small className="text-muted">
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Auto-refreshes every 5 minutes
                  </small>
                </div>
              )}
              
              {analyticsError && (
                <div className="alert alert-warning mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {analyticsError}
                </div>
              )}

              {/* Registration Trends - Line Chart */}
              <div className="row g-4 mb-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0">
                      <h6 className="mb-0" style={{ color: accent, fontWeight: 600 }}>
                        <i className="bi bi-graph-up me-2"></i>User Registration Trends
                      </h6>
                    </div>
                    <div className="card-body">
                      {analyticsLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : analyticsData.registrationTrends.length === 0 ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                          <div className="text-center text-muted">
                            <i className="bi bi-graph-up display-4"></i>
                            <p className="mt-2">No registration data available for the selected time period</p>
                          </div>
                        </div>
                      ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analyticsData.registrationTrends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="formattedDate" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #ddd',
                              borderRadius: '8px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="users" 
                            stackId="1" 
                            stroke="#fd680e" 
                            fill="#fd680e" 
                            fillOpacity={0.6}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="associates" 
                            stackId="1" 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.6}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="freelancers" 
                            stackId="1" 
                            stroke="#3b82f6" 
                            fill="#3b82f6" 
                            fillOpacity={0.6}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Distribution and Activity - Pie Charts */}
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0">
                      <h6 className="mb-0" style={{ color: accent, fontWeight: 600 }}>
                        <i className="bi bi-pie-chart me-2"></i>User Type Distribution
                      </h6>
                    </div>
                    <div className="card-body">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={analyticsData.userTypeDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ type, count }) => `${type}: ${count}`}
                          >
                            {analyticsData.userTypeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0">
                      <h6 className="mb-0" style={{ color: accent, fontWeight: 600 }}>
                        <i className="bi bi-activity me-2"></i>User Activity Status
                      </h6>
                    </div>
                    <div className="card-body">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={analyticsData.userActivityStatus}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ status, count }) => `${status}: ${count}`}
                          >
                            {analyticsData.userActivityStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* CV Upload Trends - Line Chart */}
              <div className="row g-4 mb-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0">
                      <h6 className="mb-0" style={{ color: accent, fontWeight: 600 }}>
                        <i className="bi bi-file-earmark-arrow-up me-2"></i>CV Upload Trends
                      </h6>
                    </div>
                    <div className="card-body">
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analyticsData.cvUploadTrends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #ddd',
                              borderRadius: '8px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="uploads" 
                            stackId="1" 
                            stroke="#fd680e" 
                            fill="#fd680e" 
                            fillOpacity={0.6}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="approved" 
                            stackId="1" 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.6}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="rejected" 
                            stackId="1" 
                            stroke="#ef4444" 
                            fill="#ef4444" 
                            fillOpacity={0.6}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Skills and CV File Types - Bar and Pie Charts */}
              <div className="row g-4 mb-4">
                <div className="col-md-8">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0">
                      <h6 className="mb-0" style={{ color: accent, fontWeight: 600 }}>
                        <i className="bi bi-bar-chart me-2"></i>Top Skills Distribution
                      </h6>
                    </div>
                    <div className="card-body">
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analyticsData.topSkills}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="skill" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #ddd',
                              borderRadius: '8px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#fd680e" 
                            fill="#fd680e" 
                            fillOpacity={0.6}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0">
                      <h6 className="mb-0" style={{ color: accent, fontWeight: 600 }}>
                        <i className="bi bi-file-earmark me-2"></i>CV File Types
                      </h6>
                    </div>
                    <div className="card-body">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={analyticsData.cvFileTypes}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ type, count }) => `${type}: ${count}`}
                          >
                            {analyticsData.cvFileTypes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Communication Trends - Line Chart */}
              <div className="row g-4 mb-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0">
                      <h6 className="mb-0" style={{ color: accent, fontWeight: 600 }}>
                        <i className="bi bi-chat-dots me-2"></i>Communication Trends
                      </h6>
                    </div>
                    <div className="card-body">
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analyticsData.messageTrends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #ddd',
                              borderRadius: '8px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="messages" 
                            stackId="1" 
                            stroke="#fd680e" 
                            fill="#fd680e" 
                            fillOpacity={0.6}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="conversations" 
                            stackId="1" 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.6}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Communication Activity - Bar Chart */}
              <div className="row g-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0">
                      <h6 className="mb-0" style={{ color: accent, fontWeight: 600 }}>
                        <i className="bi bi-people me-2"></i>User Communication Activity
                      </h6>
                    </div>
                    <div className="card-body">
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analyticsData.userCommunicationActivity}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="user" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #ddd',
                              borderRadius: '8px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="messages" 
                            stackId="1" 
                            stroke="#fd680e" 
                            fill="#fd680e" 
                            fillOpacity={0.6}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="conversations" 
                            stackId="1" 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.6}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 style={{ color: accent, fontWeight: 700, marginBottom: 8 }}>Reports & Documentation</h5>
                  <p style={{ color: '#666', fontSize: 14, margin: 0 }}>Comprehensive system insights and security monitoring</p>
                </div>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => generateComprehensiveReport()}
                    disabled={reportsLoading}
                  >
                    {reportsLoading ? 'Generating...' : 'Generate Report'}
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-success"
                    onClick={() => exportReportData()}
                    disabled={reportsLoading}
                  >
                    <i className="bi bi-download me-1"></i>Export
                  </button>
                </div>
              </div>

              {/* Report Categories */}
              <div className="row g-3 mb-2">
                {/* System Performance */}
                <div className="col-md-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm" style={{ 
                    border: activeReportSection === 'performance' ? `2px solid ${accent}` : 'none',
                    backgroundColor: activeReportSection === 'performance' ? '#fff8f0' : 'white',
                    boxShadow: activeReportSection === 'performance' ? `0 0 15px ${accent}30` : '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div className="card-body text-center p-3">
                      <div className="mb-2">
                        <i className="bi bi-speedometer2" style={{ fontSize: '2rem', color: accent }}></i>
                      </div>
                      <h6 className="card-title mb-2">System Performance</h6>
                      <p className="card-text small text-muted">Response times, error rates, system health</p>
                      <button 
                        className="btn btn-sm"
                        style={{ 
                          backgroundColor: accent, 
                          color: 'white', 
                          border: `1px solid ${accent}`,
                          boxShadow: '0 2px 4px rgba(253,104,14,0.2)'
                        }}
                        onClick={() => {
                          console.log('🔍 Performance report clicked');
                          setActiveReportSection('performance');
                        }}
                      >
                        View Report
                      </button>
                    </div>
                  </div>
                </div>

                {/* Business Intelligence */}
                <div className="col-md-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm" style={{ 
                    border: activeReportSection === 'business' ? `2px solid ${accent}` : 'none',
                    backgroundColor: activeReportSection === 'business' ? '#fff8f0' : 'white',
                    boxShadow: activeReportSection === 'business' ? `0 0 15px ${accent}30` : '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div className="card-body text-center p-3">
                      <div className="mb-2">
                        <i className="bi bi-graph-up-arrow" style={{ fontSize: '2rem', color: accent }}></i>
                      </div>
                      <h6 className="card-title mb-2">Business Intelligence</h6>
                      <p className="card-text small text-muted">Growth trends, matching efficiency, ROI</p>
                      <button 
                        className="btn btn-sm"
                        style={{ 
                          backgroundColor: accent, 
                          color: 'white', 
                          border: `1px solid ${accent}`,
                          boxShadow: '0 2px 4px rgba(253,104,14,0.2)'
                        }}
                        onClick={() => {
                          console.log('🔍 Business report clicked');
                          setActiveReportSection('business');
                        }}
                      >
                        View Report
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security & Compliance */}
                <div className="col-md-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm" style={{ 
                    border: activeReportSection === 'security' ? `2px solid ${accent}` : 'none',
                    backgroundColor: activeReportSection === 'security' ? '#fff8f0' : 'white',
                    boxShadow: activeReportSection === 'security' ? `0 0 15px ${accent}30` : '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div className="card-body text-center p-3">
                      <div className="mb-2">
                        <i className="bi bi-shield-check" style={{ fontSize: '2rem', color: accent }}></i>
                      </div>
                      <h6 className="card-title mb-2">Security & Compliance</h6>
                      <p className="card-text small text-muted">Communication monitoring, threat detection</p>
                      <button 
                        className="btn btn-sm"
                        style={{ 
                          backgroundColor: accent, 
                          color: 'white', 
                          border: `1px solid ${accent}`,
                          boxShadow: '0 2px 4px rgba(253,104,14,0.2)'
                        }}
                        onClick={() => {
                          console.log('🔍 Security report clicked');
                          setActiveReportSection('security');
                        }}
                      >
                        View Report
                      </button>
                    </div>
                  </div>
                </div>

                {/* Operational Reports */}
                <div className="col-md-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm" style={{ 
                    border: activeReportSection === 'operations' ? `2px solid ${accent}` : 'none',
                    backgroundColor: activeReportSection === 'operations' ? '#fff8f0' : 'white',
                    boxShadow: activeReportSection === 'operations' ? `0 0 15px ${accent}30` : '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div className="card-body text-center p-3">
                      <div className="mb-2">
                        <i className="bi bi-clipboard-data" style={{ fontSize: '2rem', color: accent }}></i>
                      </div>
                      <h6 className="card-title mb-2">Operations</h6>
                      <p className="card-text small text-muted">Workflow efficiency, quality metrics</p>
                      <button 
                        className="btn btn-sm"
                        style={{ 
                          backgroundColor: accent, 
                          color: 'white', 
                          border: `1px solid ${accent}`,
                          boxShadow: '0 2px 4px rgba(253,104,14,0.2)'
                        }}
                        onClick={() => {
                          console.log('🔍 Operations report clicked');
                          setActiveReportSection('operations');
                        }}
                      >
                        View Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Content */}
              {activeReportSection && (
                <div className="mt-3">
                  {activeReportSection === 'performance' && (
                    <div className="bg-light rounded-3 p-4" style={{ border: `2px solid ${accent}`, backgroundColor: '#fff8f0' }}>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h6 style={{ color: accent, fontWeight: 600 }}>System Performance Report</h6>
                        <small className="text-muted">
                          <i className="bi bi-clock me-1"></i>
                          {lastReportUpdate ? `Last updated: ${lastReportUpdate.toLocaleTimeString()}` : 'Not generated yet'}
                        </small>
                      </div>
                      
                      {reportsData.performance ? (
                        <div className="row g-3">
                          {/* System Health Overview */}
                          <div className="col-xl-6 col-lg-6 col-md-12 mb-3">
                            <div className="card border-0 shadow-sm h-100">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-heart-pulse me-2"></i>System Health</h6>
                              </div>
                              <div className="card-body">
                                <div className="row text-center">
                                  <div className="col-6 col-sm-6 mb-3">
                                    <div className="mb-2">
                                      <div className="h4" style={{ color: accent }}>{reportsData.performance.systemHealth.uptime}</div>
                                      <small className="text-muted">Uptime</small>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 mb-3">
                                    <div className="mb-2">
                                      <div className="h4" style={{ color: accent }}>{reportsData.performance.systemHealth.responseTime}</div>
                                      <small className="text-muted">Response Time</small>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 mb-3">
                                    <div className="mb-2">
                                      <div className="h4" style={{ color: accent }}>{reportsData.performance.systemHealth.errorRate}</div>
                                      <small className="text-muted">Error Rate</small>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 mb-3">
                                    <div className="mb-2">
                                      <div className="h4" style={{ color: accent }}>{reportsData.performance.systemHealth.connectionUtilization || '--'}</div>
                                      <small className="text-muted">Connection Usage</small>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <small className="text-muted">
                                    <strong>Database Connections:</strong> {reportsData.performance.systemHealth.activeConnections || '--'} active / {reportsData.performance.systemHealth.totalConnections || '--'} total
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* System Resources */}
                          <div className="col-xl-6 col-lg-6 col-md-12 mb-3">
                            <div className="card border-0 shadow-sm h-100">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-cpu me-2"></i>System Resources</h6>
                              </div>
                              <div className="card-body">
                                <div className="row text-center">
                                  <div className="col-6 col-sm-6 mb-3">
                                    <div className="mb-2">
                                      <div className="h4" style={{ color: accent }}>{reportsData.performance.systemResources?.cpuUsage || '--'}</div>
                                      <small className="text-muted">CPU Usage</small>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 mb-3">
                                    <div className="mb-2">
                                      <div className="h4" style={{ color: accent }}>{reportsData.performance.systemResources?.memoryUsage || '--'}</div>
                                      <small className="text-muted">Memory Usage</small>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 mb-3">
                                    <div className="mb-2">
                                      <div className="h4" style={{ color: accent }}>{reportsData.performance.systemResources?.diskUsage || '--'}</div>
                                      <small className="text-muted">Disk Usage</small>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 mb-3">
                                    <div className="mb-2">
                                      <div className="h4" style={{ color: accent }}>{reportsData.performance.systemResources?.networkLatency || '--'}</div>
                                      <small className="text-muted">Network Latency</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Performance Metrics */}
                          <div className="col-xl-6 col-lg-6 col-md-12 mb-3">
                            <div className="card border-0 shadow-sm h-100">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-speedometer2 me-2"></i>Performance Metrics</h6>
                              </div>
                              <div className="card-body">
                                {reportsData.performance.performanceMetrics.map((metric, index) => (
                                  <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                                    <span className="small fw-medium">{metric.metric}</span>
                                    <span className="badge" style={{ backgroundColor: accent, color: 'white', fontSize: '0.8rem' }}>
                                      {metric.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* User Activity Insights */}
                          <div className="col-xl-6 col-lg-6 col-md-12 mb-3">
                            <div className="card border-0 shadow-sm h-100">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-people me-2"></i>User Activity</h6>
                              </div>
                              <div className="card-body">
                                <div className="row text-center">
                                  <div className="col-6 col-sm-6 mb-3">
                                    <div className="mb-2">
                                      <div className="h4" style={{ color: accent }}>{reportsData.performance.userInsights?.totalUsers || '--'}</div>
                                      <small className="text-muted">Total Users</small>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 mb-3">
                                    <div className="mb-2">
                                      <div className="h4" style={{ color: accent }}>{reportsData.performance.userInsights?.active7d || '--'}</div>
                                      <small className="text-muted">Active (7d)</small>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 mb-3">
                                    <div className="mb-2">
                                      <div className="h4" style={{ color: accent }}>{reportsData.performance.userInsights?.newUsers30d || '--'}</div>
                                      <small className="text-muted">New (30d)</small>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 mb-3">
                                    <div className="mb-2">
                                      <div className="h4" style={{ color: accent }}>{reportsData.performance.userInsights?.userActivityRate || '--'}</div>
                                      <small className="text-muted">Activity Rate</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* System Issues & Alerts */}
                          <div className="col-12 mb-3">
                            <div className="card border-0 shadow-sm">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-exclamation-triangle me-2"></i>System Issues & Alerts</h6>
                              </div>
                              <div className="card-body">
                                {reportsData.performance.recentIssues.map((issue, index) => (
                                  <div key={index} className="d-flex justify-content-between align-items-start p-3 border-bottom">
                                    <div className="flex-grow-1">
                                      <div className="d-flex align-items-center mb-2">
                                        <strong className="me-2">{issue.issue}</strong>
                                        <span className="badge" style={{ backgroundColor: accent, color: 'white' }}>
                                          {issue.severity}
                                        </span>
                                      </div>
                                      <small className="text-muted d-block mb-1">
                                        <i className="bi bi-clock me-1"></i>
                                        {issue.timestamp}
                                      </small>
                                      {issue.details && (
                                        <small className="text-muted d-block">
                                          {issue.details}
                                        </small>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="spinner-border" style={{ color: accent }} role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2">Loading performance data...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeReportSection === 'business' && (
                    <div className="bg-white rounded-4 shadow-sm p-4" style={{ 
                      border: `3px solid ${accent}`, 
                      backgroundColor: '#fff8f0',
                      boxShadow: `0 0 20px ${accent}40`
                    }}>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h6 style={{ color: accent, fontWeight: 600 }}>Business Intelligence Report</h6>
                        <small className="text-muted">
                          <i className="bi bi-clock me-1"></i>
                          {lastReportUpdate ? `Last updated: ${lastReportUpdate.toLocaleTimeString()}` : 'Not generated yet'}
                        </small>
                      </div>
                      
                      {reportsData.business ? (
                        <div className="row g-4">
                          {/* User Growth */}
                          <div className="col-md-6">
                            <div className="card border-0 shadow-sm">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-people me-2"></i>User Growth</h6>
                              </div>
                              <div className="card-body">
                                <div className="row text-center">
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.business.userGrowth.totalUsers}</div>
                                      <small className="text-muted">Total Users</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.business.userGrowth.monthlyGrowth}</div>
                                      <small className="text-muted">Monthly Growth</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.business.userGrowth.userRetention}</div>
                                      <small className="text-muted">User Retention</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.business.userGrowth.activeUsers}</div>
                                      <small className="text-muted">Active Users (7d)</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Matching Efficiency */}
                          <div className="col-md-6">
                            <div className="card border-0 shadow-sm">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-link me-2"></i>Matching Efficiency</h6>
                              </div>
                              <div className="card-body">
                                <div className="row text-center">
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.business.matchingEfficiency.totalRequests}</div>
                                      <small className="text-muted">Total Requests</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.business.matchingEfficiency.successfulMatches}</div>
                                      <small className="text-muted">Successful Matches</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.business.matchingEfficiency.matchRate}</div>
                                      <small className="text-muted">Match Rate</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.business.matchingEfficiency.averageResponseTime}</div>
                                      <small className="text-muted">Avg Response Time</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Business Metrics */}
                          <div className="col-12">
                            <div className="card border-0 shadow-sm">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-graph-up me-2"></i>Business Metrics</h6>
                              </div>
                              <div className="card-body">
                                <div className="row">
                                  {reportsData.business.businessMetrics.map((metric, index) => (
                                    <div key={index} className="col-md-4 mb-3">
                                      <div className="d-flex align-items-center">
                                        <i className={`bi bi-arrow-${metric.trend === 'up' ? 'up-circle' : 'down-circle'}`} style={{ color: accent }}></i>
                                        <div>
                                          <div className="fw-medium">{metric.metric}</div>
                                          <div className="h5 mb-0" style={{ color: accent }}>{metric.value}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="spinner-border" style={{ color: accent }} role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2">Loading business data...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeReportSection === 'security' && (
                    <div className="bg-white rounded-4 shadow-sm p-4" style={{ 
                      border: `3px solid ${accent}`, 
                      backgroundColor: '#fff8f0',
                      boxShadow: `0 0 20px ${accent}40`
                    }}>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h6 style={{ color: accent, fontWeight: 600 }}>Security & Compliance Report</h6>
                        <small className="text-muted">
                          <i className="bi bi-clock me-1"></i>
                          {reportsData.security?.reportGenerated ? 
                            `Last updated: ${new Date(reportsData.security.reportGenerated).toLocaleString()}` : 
                            'Not generated yet'}
                        </small>
                      </div>
                      
                      {reportsData.security ? (
                        <div className="row g-4">
                          {/* Security Overview */}
                          <div className="col-md-6">
                            <div className="card border-0 shadow-sm">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-shield-check me-2"></i>Security Overview</h6>
                              </div>
                              <div className="card-body">
                                <div className="row text-center">
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.security.securityOverview.totalThreats}</div>
                                      <small className="text-muted">Total Threats</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.security.securityOverview.blockedAttempts}</div>
                                      <small className="text-muted">Blocked Attempts</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.security.securityOverview.securityScore}</div>
                                      <small className="text-muted">Security Score</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.security.securityOverview.totalUsersCommunicating}</div>
                                      <small className="text-muted">Active Users</small>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <small className="text-muted">
                                    <strong>Last Audit:</strong> {reportsData.security.securityOverview.lastAudit}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Communication Monitoring */}
                          <div className="col-md-6">
                            <div className="card border-0 shadow-sm">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-chat-dots me-2"></i>Communication Monitoring</h6>
                              </div>
                              <div className="card-body">
                                <div className="row text-center">
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.security.communicationMonitoring.totalMessages}</div>
                                      <small className="text-muted">Total Messages</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.security.communicationMonitoring.flaggedMessages}</div>
                                      <small className="text-muted">Flagged Messages</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.security.communicationMonitoring.suspiciousMessages}</div>
                                      <small className="text-muted">Suspicious Messages</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.security.communicationMonitoring.complianceScore}</div>
                                      <small className="text-muted">Compliance Score</small>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <small className="text-muted">
                                    <strong>Status:</strong> {reportsData.security.auditTrail?.complianceStatus}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Real-Time Metrics */}
                          <div className="col-12">
                            <div className="card border-0 shadow-sm">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-activity me-2"></i>Real-Time Activity Metrics</h6>
                              </div>
                              <div className="card-body">
                                <div className="row text-center">
                                  <div className="col-3">
                                    <div className="mb-3">
                                      <div className="h5" style={{ color: accent }}>{reportsData.security.realTimeMetrics?.messageVolume?.today || 0}</div>
                                      <small className="text-muted">Messages Today</small>
                                    </div>
                                  </div>
                                  <div className="col-3">
                                    <div className="mb-3">
                                      <div className="h5" style={{ color: accent }}>{reportsData.security.realTimeMetrics?.messageVolume?.week || 0}</div>
                                      <small className="text-muted">Messages This Week</small>
                                    </div>
                                  </div>
                                  <div className="col-3">
                                    <div className="mb-3">
                                      <div className="h5" style={{ color: accent }}>{reportsData.security.realTimeMetrics?.activeConversations || 0}</div>
                                      <small className="text-muted">Active Conversations</small>
                                    </div>
                                  </div>
                                  <div className="col-3">
                                    <div className="mb-3">
                                      <div className="h5" style={{ color: accent }}>{reportsData.security.realTimeMetrics?.systemStatus || 'N/A'}</div>
                                      <small className="text-muted">System Status</small>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3 text-center">
                                  <small className="text-muted">
                                    <strong>Last Message:</strong> {reportsData.security.realTimeMetrics?.lastMessageTime || 'Never'}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Audit Trail Summary */}
                          <div className="col-12">
                            <div className="card border-0 shadow-sm">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-clipboard-data me-2"></i>Audit Trail Summary</h6>
                              </div>
                              <div className="card-body">
                                <div className="row text-center">
                                  <div className="col-3">
                                    <div className="mb-3">
                                      <div className="h5" style={{ color: accent }}>{reportsData.security.auditTrail?.totalMessagesAnalyzed || 0}</div>
                                      <small className="text-muted">Messages Analyzed</small>
                                    </div>
                                  </div>
                                  <div className="col-3">
                                    <div className="mb-3">
                                      <div className="h5" style={{ color: accent }}>{reportsData.security.auditTrail?.threatsDetected || 0}</div>
                                      <small className="text-muted">Threats Detected</small>
                                    </div>
                                  </div>
                                  <div className="col-3">
                                    <div className="mb-3">
                                      <div className="h5" style={{ color: accent }}>{reportsData.security.auditTrail?.suspiciousActivity || 0}</div>
                                      <small className="text-muted">Suspicious Activity</small>
                                    </div>
                                  </div>
                                  <div className="col-3">
                                    <div className="mb-3">
                                      <div className="h5" style={{ color: accent }}>{reportsData.security.auditTrail?.complianceStatus || 'N/A'}</div>
                                      <small className="text-muted">Compliance Status</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Recent Security Alerts */}
                          <div className="col-12">
                            <div className="card border-0 shadow-sm">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-bell me-2"></i>Recent Security Alerts</h6>
                              </div>
                              <div className="card-body">
                                {reportsData.security.recentAlerts && reportsData.security.recentAlerts.length > 0 ? (
                                  reportsData.security.recentAlerts.map((alert, index) => (
                                    <div key={index} className="d-flex justify-content-between align-items-center p-3 border-bottom">
                                      <div className="flex-grow-1">
                                        <div className="d-flex align-items-center mb-2">
                                          <strong className="me-2">{alert.alert}</strong>
                                          <span className={`badge ${
                                            alert.severity === 'high' ? 'bg-danger' :
                                            alert.severity === 'medium' ? 'bg-warning' :
                                            'bg-info'
                                          }`}>
                                            {alert.severity.toUpperCase()}
                                          </span>
                                        </div>
                                        <div className="mb-2">
                                          <small className="text-muted">
                                            <strong>Reason:</strong> {alert.flagReason} | 
                                            <strong>Time:</strong> {alert.timestamp}
                                          </small>
                                        </div>
                                        <div className="mb-2">
                                          <small className="text-muted">
                                            <strong>Sender:</strong> {alert.senderName} ({alert.senderEmail})
                                          </small>
                                        </div>
                                        <div className="bg-light p-2 rounded">
                                          <small className="text-muted">
                                            <strong>Message Preview:</strong> {alert.content}
                                          </small>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-3">
                                    <i className="bi bi-check-circle text-success" style={{ fontSize: '2rem' }}></i>
                                    <p className="mt-2 text-muted">No security alerts detected. System is secure!</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* All Communicating Users - Accountability Section */}
                          <div className="col-12">
                            <div className="card border-0 shadow-sm">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-people me-2"></i>All Communicating Users - Accountability</h6>
                                <small className="text-white-50">Complete audit trail for legal and compliance purposes</small>
                              </div>
                              <div className="card-body">
                                {reportsData.security.allCommunicatingUsers && reportsData.security.allCommunicatingUsers.length > 0 ? (
                                  <div className="table-responsive">
                                    <table className="table table-sm table-hover">
                                      <thead>
                                        <tr>
                                          <th>User</th>
                                          <th>Type</th>
                                          <th>Email</th>
                                          <th>Messages</th>
                                          <th>Last Activity</th>
                                          <th>Threats</th>
                                          <th>Suspicious</th>
                                          <th>Risk Level</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {reportsData.security.allCommunicatingUsers.map((user, index) => {
                                          const threatCount = parseInt(user.threat_count) || 0;
                                          const suspiciousCount = parseInt(user.suspicious_count) || 0;
                                          const riskLevel = threatCount > 0 || suspiciousCount > 0 ? 
                                            (threatCount > 2 || suspiciousCount > 3 ? 'High' : 'Medium') : 'Low';
                                          
                                          return (
                                            <tr key={index} className={
                                              riskLevel === 'High' ? 'table-danger' :
                                              riskLevel === 'Medium' ? 'table-warning' : ''
                                            }>
                                              <td>
                                                <strong>{user.display_name}</strong>
                                                <br />
                                                <small className="text-muted">ID: {user.user_id}</small>
                                              </td>
                                              <td>
                                                <span className={`badge ${
                                                  user.user_type === 'associate' ? 'bg-primary' : 'bg-success'
                                                }`}>
                                                  {user.user_type}
                                                </span>
                                              </td>
                                              <td>{user.email}</td>
                                              <td>{user.message_count}</td>
                                              <td>
                                                {user.last_message ? 
                                                  new Date(user.last_message).toLocaleDateString() : 'Never'}
                                              </td>
                                              <td>
                                                <span className={threatCount > 0 ? 'text-danger' : 'text-muted'}>
                                                  {threatCount}
                                                </span>
                                              </td>
                                              <td>
                                                <span className={suspiciousCount > 0 ? 'text-warning' : 'text-muted'}>
                                                  {suspiciousCount}
                                                </span>
                                              </td>
                                              <td>
                                                <span className={`badge ${
                                                  riskLevel === 'High' ? 'bg-danger' :
                                                  riskLevel === 'Medium' ? 'bg-warning' :
                                                  'bg-success'
                                                }`}>
                                                  {riskLevel}
                                                </span>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="text-center py-3">
                                    <i className="bi bi-info-circle text-info" style={{ fontSize: '2rem' }}></i>
                                    <p className="mt-2 text-muted">No communication data available for the selected period.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="spinner-border" style={{ color: accent }} role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2">Loading security data...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeReportSection === 'operations' && (
                    <div className="bg-white rounded-4 shadow-sm p-4" style={{ 
                      border: `3px solid ${accent}`, 
                      backgroundColor: '#fff8f0',
                      boxShadow: `0 0 20px ${accent}40`
                    }}>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h6 style={{ color: accent, fontWeight: 600 }}>Operations Report</h6>
                        <small className="text-muted">
                          <i className="bi bi-clock me-1"></i>
                          {lastReportUpdate ? `Last updated: ${lastReportUpdate.toLocaleTimeString()}` : 'Not generated yet'}
                        </small>
                      </div>
                      
                      {reportsData.operations ? (
                        <div className="row g-4">
                          {/* Workflow Efficiency */}
                          <div className="col-md-6">
                            <div className="card border-0 shadow-sm">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-gear me-2"></i>Workflow Efficiency</h6>
                              </div>
                              <div className="card-body">
                                <div className="row text-center">
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.operations.workflowEfficiency.averageProcessingTime}</div>
                                      <small className="text-muted">Avg Processing Time</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.operations.workflowEfficiency.completedTasks}</div>
                                      <small className="text-muted">Completed Tasks</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.operations.workflowEfficiency.pendingTasks}</div>
                                      <small className="text-muted">Pending Tasks</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.operations.workflowEfficiency.efficiencyScore}</div>
                                      <small className="text-muted">Efficiency Score</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quality Metrics */}
                          <div className="col-md-6">
                            <div className="card border-0 shadow-sm">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-award me-2"></i>Quality Metrics</h6>
                              </div>
                              <div className="card-body">
                                <div className="row text-center">
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h4" style={{ color: accent }}>{reportsData.operations.qualityMetrics.userSatisfaction}</div>
                                      <small className="text-muted">User Satisfaction</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h5" style={{ color: accent }}>{reportsData.operations.qualityMetrics.errorRate}</div>
                                      <small className="text-muted">Error Rate</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h5" style={{ color: accent }}>{reportsData.operations.qualityMetrics.responseTime}</div>
                                      <small className="text-muted">Response Time</small>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="mb-3">
                                      <div className="h5" style={{ color: accent }}>{reportsData.operations.qualityMetrics.qualityScore}</div>
                                      <small className="text-muted">Quality Score</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Real-Time Activity Metrics */}
                          <div className="col-12">
                            <div className="card border-0 shadow-sm">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-activity me-2"></i>Real-Time Activity Metrics</h6>
                              </div>
                              <div className="card-body">
                                <div className="row text-center">
                                  <div className="col-3">
                                    <div className="mb-3">
                                      <div className="h5" style={{ color: accent }}>{reportsData.operations.realTimeMetrics?.messageVolume?.today || 0}</div>
                                      <small className="text-muted">Messages Today</small>
                                    </div>
                                  </div>
                                  <div className="col-3">
                                    <div className="mb-3">
                                      <div className="h5" style={{ color: accent }}>{reportsData.operations.realTimeMetrics?.messageVolume?.week || 0}</div>
                                      <small className="text-muted">Messages This Week</small>
                                    </div>
                                  </div>
                                  <div className="col-3">
                                    <div className="mb-3">
                                      <div className="h5" style={{ color: accent }}>{reportsData.operations.realTimeMetrics?.activeConversations || 0}</div>
                                      <small className="text-muted">Active Conversations</small>
                                    </div>
                                  </div>
                                  <div className="col-3">
                                    <div className="mb-3">
                                      <div className="h5" style={{ color: accent }}>{reportsData.operations.realTimeMetrics?.activeUsers || 0}</div>
                                      <small className="text-muted">Active Users (7d)</small>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3 text-center">
                                  <small className="text-muted">
                                    <strong>Total Users:</strong> {reportsData.operations.realTimeMetrics?.totalUsers || 0} | 
                                    <strong>Engagement Rate:</strong> {reportsData.operations.realTimeMetrics?.totalUsers > 0 ? 
                                      Math.round((reportsData.operations.realTimeMetrics.activeUsers / reportsData.operations.realTimeMetrics.totalUsers) * 100) : 0}%
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Areas for Improvement */}
                          <div className="col-12">
                            <div className="card border-0 shadow-sm">
                              <div className="card-header text-white" style={{ backgroundColor: accent }}>
                                <h6 className="mb-0"><i className="bi bi-lightbulb me-2"></i>Areas for Improvement</h6>
                              </div>
                              <div className="card-body">
                                <div className="row">
                                  {reportsData.operations.improvementAreas.map((area, index) => (
                                    <div key={index} className="col-md-6 mb-3">
                                      <div className="d-flex align-items-start">
                                        <i className="bi bi-arrow-right-circle me-2 mt-1" style={{ color: accent }}></i>
                                        <span>{area}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="spinner-border text-purple" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2">Loading operations data...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Default View */}
              {!activeReportSection && (
              <div className="text-center py-5">
                <i className="bi bi-file-earmark-text display-1 text-muted"></i>
                  <h6 className="text-muted mt-3">Select a Report Category</h6>
                  <p className="text-muted">Choose from the categories above to view detailed reports and insights</p>
              </div>
              )}
            </div>
          )}

          {/* Performance Monitor Tab */}
          {activeTab === 'performance' && (
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)', maxWidth: 1400, margin: '0 auto' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 style={{ color: accent, fontWeight: 700, marginBottom: 8 }}>Advanced Performance Monitoring</h5>
                  <p style={{ color: '#666', fontSize: 14, margin: 0 }}>Real-time system health, database performance, and API metrics</p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="autoRefreshToggle"
                      checked={autoRefreshEnabled}
                      onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="autoRefreshToggle">
                      Auto-refresh
                    </label>
                  </div>
                  <select 
                    className="form-select form-select-sm" 
                    style={{ width: '120px' }}
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  >
                    <option value={15000}>15s</option>
                    <option value={30000}>30s</option>
                    <option value={60000}>1m</option>
                    <option value={300000}>5m</option>
                  </select>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={fetchAdvancedPerformanceMetrics}
                    disabled={performanceLoading}
                  >
                    {performanceLoading ? 'Refreshing...' : 'Refresh Now'}
                  </button>
                </div>
              </div>

              {performanceError && (
                <div className="alert alert-warning alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {performanceError}
                  <button type="button" className="btn-close" onClick={() => setPerformanceError('')}></button>
                </div>
              )}

              {/* System Health Overview */}
              <div className="row g-4 mb-4">
                <div className="col-md-6 col-lg-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center p-3">
                      <div className="mb-2">
                        <i className="bi bi-cpu" style={{ fontSize: '2rem', color: '#10b981' }}></i>
                      </div>
                      <div className="h4 text-success mb-1">
                        {performanceMetrics.systemHealth?.cpuUsage || '--'}
                      </div>
                      <small className="text-muted">CPU Usage</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center p-3">
                      <div className="mb-2">
                        <i className="bi bi-memory" style={{ fontSize: '2rem', color: '#3b82f6' }}></i>
                      </div>
                      <div className="h4 text-primary mb-1">
                        {performanceMetrics.systemHealth?.memoryUsage || '--'}
                      </div>
                      <small className="text-muted">Memory Usage</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center p-3">
                      <div className="mb-2">
                        <i className="bi bi-hdd" style={{ fontSize: '2rem', color: '#f59e0b' }}></i>
                      </div>
                      <div className="h4 text-warning mb-1">
                        {performanceMetrics.systemHealth?.diskUsage || '--'}
                      </div>
                      <small className="text-muted">Disk Usage</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center p-3">
                      <div className="mb-2">
                        <i className="bi bi-wifi" style={{ fontSize: '2rem', color: '#8b5cf6' }}></i>
                      </div>
                      <div className="h4 text-purple mb-1">
                        {performanceMetrics.systemHealth?.networkLatency || '--'}
                      </div>
                      <small className="text-muted">Network Latency</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Performance Metrics */}
              <div className="row g-4">
                {/* Database Performance */}
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-primary text-white">
                      <h6 className="mb-0"><i className="bi bi-database me-2"></i>Database Performance</h6>
                    </div>
                    <div className="card-body">
                      {performanceMetrics.databasePerformance ? (
                        <div>
                          <div className="row text-center mb-3">
                            <div className="col-6">
                              <div className="h5 text-primary mb-1">
                                {performanceMetrics.databasePerformance.connectionPool.active}
                              </div>
                              <small className="text-muted">Active Connections</small>
                            </div>
                            <div className="col-6">
                              <div className="h5 text-success mb-1">
                                {performanceMetrics.databasePerformance.queryPerformance.averageResponseTime}
                              </div>
                              <small className="text-muted">Avg Query Time</small>
                            </div>
                          </div>
                          <div className="progress mb-2" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar bg-info" 
                              style={{ 
                                width: `${(performanceMetrics.databasePerformance.connectionPool.total / performanceMetrics.databasePerformance.connectionPool.maxConnections) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <small className="text-muted">
                            Connection Pool: {performanceMetrics.databasePerformance.connectionPool.total}/{performanceMetrics.databasePerformance.connectionPool.maxConnections}
                          </small>
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* API Performance */}
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-success text-white">
                      <h6 className="mb-0"><i className="bi bi-activity me-2"></i>API Performance</h6>
                    </div>
                    <div className="card-body">
                      {performanceMetrics.apiPerformance ? (
                        <div>
                          <div className="row text-center mb-3">
                            <div className="col-6">
                              <div className="h5 text-success mb-1">
                                {performanceMetrics.apiPerformance.responseTimes.average}
                              </div>
                              <small className="text-muted">Avg Response</small>
                            </div>
                            <div className="col-6">
                              <div className="h5 text-info mb-1">
                                {performanceMetrics.apiPerformance.throughput.requestsPerSecond}
                              </div>
                              <small className="text-muted">Req/sec</small>
                            </div>
                          </div>
                          <div className="mb-2">
                            <small className="text-muted">Success Rate: </small>
                            <span className="text-success">
                              {performanceMetrics.apiPerformance.throughput.totalRequests > 0 ? 
                                `${Math.round((performanceMetrics.apiPerformance.throughput.successfulRequests / performanceMetrics.apiPerformance.throughput.totalRequests) * 100)}%` : 
                                '0%'
                              }
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Experience Metrics */}
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-info text-white">
                      <h6 className="mb-0"><i className="bi bi-person-check me-2"></i>User Experience Metrics</h6>
                    </div>
                    <div className="card-body">
                      {performanceMetrics.userExperience ? (
                        <div className="row">
                          <div className="col-md-3 text-center mb-3">
                            <div className="h5 text-info mb-1">
                              {performanceMetrics.userExperience.userSatisfaction.overall}
                            </div>
                            <small className="text-muted">Overall Satisfaction</small>
                          </div>
                          <div className="col-md-3 text-center mb-3">
                            <div className="h5 text-success mb-1">
                              {performanceMetrics.userExperience.pageLoadTimes.dashboard}
                            </div>
                            <small className="text-muted">Dashboard Load</small>
                          </div>
                          <div className="col-md-3 text-center mb-3">
                            <div className="h5 text-warning mb-1">
                              {performanceMetrics.userExperience.errorRates.totalErrors}
                            </div>
                            <small className="text-muted">Total Errors</small>
                          </div>
                          <div className="col-md-3 text-center mb-3">
                            <div className="h5 text-primary mb-1">
                              {performanceMetrics.userExperience.errorRates.resolutionTime}
                            </div>
                            <small className="text-muted">Resolution Time</small>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <div className="spinner-border text-info" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {lastPerformanceUpdate && (
                <div className="text-center mt-4">
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>
                    Last updated: {lastPerformanceUpdate.toLocaleTimeString()}
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)', maxWidth: 1200, margin: '0 auto' }}>
              <h5 style={{ color: accent, fontWeight: 700, marginBottom: 18 }}>System Settings</h5>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>Configure system preferences and settings</p>
              
              <div className="text-center py-5">
                <i className="bi bi-gear display-1 text-muted"></i>
                <h6 className="text-muted mt-3">Settings Coming Soon</h6>
                <p className="text-muted">System configuration and preferences will be available here</p>
              </div>
            </div>
          )}

          
        </div>
      </div>

      {/* Freelancer Notes Modal */}
      {freelancerNotesModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Admin Notes - {selectedFreelancerForNotes?.first_name} {selectedFreelancerForNotes?.last_name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setFreelancerNotesModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Internal Notes (ECS Admin Only):</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={freelancerNotes}
                    onChange={(e) => setFreelancerNotes(e.target.value)}
                    placeholder="Add internal notes about this freelancer..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setFreelancerNotesModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={saveFreelancerNotes}
                  disabled={notesLoading}
                >
                  {notesLoading ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Freelancer Request Details Modal */}
      {showFreelancerRequestDetailsModal && selectedFreelancerRequest && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ color: accent, fontWeight: 600 }}>
                  <i className="bi bi-file-text me-2"></i>Request Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowFreelancerRequestDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 style={{ color: accent, fontWeight: 600 }}>Project Information</h6>
                    <p><strong>Title:</strong> {selectedFreelancerRequest.title}</p>
                    <p><strong>Description:</strong> {selectedFreelancerRequest.description}</p>
                    <p><strong>Required Skills:</strong> {selectedFreelancerRequest.required_skills.join(', ')}</p>
                    <p><strong>Minimum Experience:</strong> {selectedFreelancerRequest.min_experience} years</p>
                  </div>
                  <div className="col-md-6">
                    <h6 style={{ color: accent, fontWeight: 600 }}>Additional Details</h6>
                    <p><strong>Budget Range:</strong> {selectedFreelancerRequest.budget_range || 'Not specified'}</p>
                    <p><strong>Urgency Level:</strong> {selectedFreelancerRequest.urgency_level}</p>
                    <p><strong>Preferred Location:</strong> {selectedFreelancerRequest.preferred_location || 'Any'}</p>
                    <p><strong>Status:</strong> 
                      <span className={`badge ms-2 ${
                        selectedFreelancerRequest.status === 'pending' ? 'bg-warning' :
                        selectedFreelancerRequest.status === 'reviewed' ? 'bg-info' :
                        selectedFreelancerRequest.status === 'provided' ? 'bg-success' :
                        selectedFreelancerRequest.status === 'completed' ? 'bg-primary' :
                        'bg-secondary'
                      }`}>
                        {selectedFreelancerRequest.status.charAt(0).toUpperCase() + selectedFreelancerRequest.status.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
                
                <hr />
                
                <div className="row">
                  <div className="col-md-6">
                    <h6 style={{ color: accent, fontWeight: 600 }}>Associate Information</h6>
                    <p><strong>Email:</strong> {selectedFreelancerRequest.associate_email}</p>
                    <p><strong>Contact Person:</strong> {selectedFreelancerRequest.contact_person}</p>
                    <p><strong>Industry:</strong> {selectedFreelancerRequest.industry}</p>
                    <p><strong>Submitted:</strong> {new Date(selectedFreelancerRequest.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 style={{ color: accent, fontWeight: 600 }}>Request Statistics</h6>
                    <p><strong>Recommendations:</strong> {selectedFreelancerRequest.recommendation_count || 0}</p>
                    <p><strong>Responses:</strong> {selectedFreelancerRequest.response_count || 0}</p>
                    {selectedFreelancerRequest.reviewed_at && (
                      <p><strong>Reviewed:</strong> {new Date(selectedFreelancerRequest.reviewed_at).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowFreelancerRequestDetailsModal(false)}
                >
                  Close
                </button>
                {selectedFreelancerRequest.status === 'pending' && (
                  <button 
                    type="button" 
                    className="btn"
                    style={{ background: accent, color: '#fff' }}
                    onClick={() => {
                      setShowFreelancerRequestDetailsModal(false);
                      openRecommendationsModal(selectedFreelancerRequest);
                    }}
                  >
                    <i className="bi bi-star me-1"></i>Provide Recommendations
                  </button>
                )}
                </div>
              </div>
          </div>
        </div>
      )}

      {/* Recommendations Modal */}
      {showRecommendationsModal && selectedFreelancerRequest && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ color: accent, fontWeight: 600 }}>
                  <i className="bi bi-star me-2"></i>Provide Freelancer Recommendations
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowRecommendationsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <h6 style={{ color: accent, fontWeight: 600 }}>Request: {selectedFreelancerRequest.title}</h6>
                  <p className="text-muted">Select freelancers that match the requirements and provide admin notes</p>
                  
                  {/* Request Requirements Summary */}
                  <div className="card border-0 bg-light mb-3">
                    <div className="card-body p-3">
                      <div className="row g-2">
                        <div className="col-md-3">
                          <small className="text-muted">
                            <i className="bi bi-gear me-1"></i>
                            <strong>Required Skills:</strong><br/>
                            {selectedFreelancerRequest.required_skills.join(', ')}
                          </small>
                        </div>
                        <div className="col-md-3">
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            <strong>Min Experience:</strong><br/>
                            {selectedFreelancerRequest.min_experience}+ years
                          </small>
                        </div>
                        <div className="col-md-3">
                          <small className="text-muted">
                            <i className="bi bi-geo-alt me-1"></i>
                            <strong>Location:</strong><br/>
                            {selectedFreelancerRequest.preferred_location || 'Any'}
                          </small>
                        </div>
                        <div className="col-md-3">
                          <small className="text-muted">
                            <i className="bi bi-currency-dollar me-1"></i>
                            <strong>Budget:</strong><br/>
                            {selectedFreelancerRequest.budget_range || 'Not specified'}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Admin Notes (Optional):</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about your recommendations or the request..."
                  />
                </div>

                <div className="mb-4">
                  <h6 style={{ color: accent, fontWeight: 600 }}>All Registered Freelancers</h6>
                  
                  {/* Debug Info - REMOVED since search is working perfectly */}
                  
                  {/* Simple Search Interface */}
                  <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-3">
                          <label className="form-label small">Search by Skills:</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g., React, Node.js"
                            value={searchSkills}
                            onChange={(e) => setSearchSkills(e.target.value)}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small">Minimum Experience (years):</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="e.g., 3"
                            value={searchExperience}
                            onChange={(e) => setSearchExperience(e.target.value)}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small">Status:</label>
                            <select 
                              className="form-select form-select-sm" 
                            value={searchStatus}
                            onChange={(e) => setSearchStatus(e.target.value)}
                          >
                            <option value="">All Statuses</option>
                            <option value="available">Available Only</option>
                            <option value="approved">Approved Only</option>
                            </select>
                        </div>
                        <div className="col-md-3 d-flex align-items-end">
                          <div className="d-flex gap-2 w-100">
                            <button 
                              className="btn btn-sm w-100"
                              style={{ background: accent, color: '#fff' }}
                              onClick={handleSearch}
                            >
                              <i className="bi bi-search me-1"></i>Search
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary w-100"
                              onClick={resetSearch}
                            >
                              <i className="bi bi-arrow-clockwise me-1"></i>Reset
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="row mt-2">
                        <div className="col-12">
                          <small className="text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            Showing {availableFreelancers.length} of {allFreelancers.length} freelancers. 
                            Use the search above to find specific freelancers.
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {availableFreelancers.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="bi bi-exclamation-triangle display-4 text-warning"></i>
                      <p className="mt-3 text-muted">No freelancers match the current filters</p>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={resetSearch}
                      >
                        Reset Search
                      </button>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {availableFreelancers.map((freelancer) => (
                        <div key={freelancer.freelancer_id} className="col-md-6">
                          <div className={`card border-2 h-100 ${
                            selectedFreelancers.includes(freelancer.freelancer_id) 
                              ? 'border-primary' 
                              : 'border-light'
                          }`}>
                            <div className="card-body">
                              <div className="form-check" style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`freelancer-${freelancer.freelancer_id}`}
                                  checked={selectedFreelancers.includes(freelancer.freelancer_id)}
                                  onChange={(e) => handleFreelancerSelection(freelancer.freelancer_id, e.target.checked)}
                                  style={{ 
                                    width: '20px', 
                                    height: '20px', 
                                    marginRight: '10px',
                                    cursor: 'pointer',
                                    display: 'inline-block'
                                  }}
                                />
                                <label className="form-check-label" htmlFor={`freelancer-${freelancer.freelancer_id}`} style={{ cursor: 'pointer' }}>
                                  <strong>{freelancer.first_name} {freelancer.last_name}</strong>
                                </label>
                                {/* Debug info */}
                                <small className="text-muted d-block">
                                  ID: {freelancer.freelancer_id} | 
                                  Selected: {selectedFreelancers.includes(freelancer.freelancer_id) ? 'Yes' : 'No'} |
                                  Checkbox visible: Yes
                                </small>
                              </div>
                              
                              <div className="mt-2">
                                <p className="text-muted small mb-2">{freelancer.headline}</p>
                                
                                {/* Skills Display */}
                                {freelancer.skills && freelancer.skills.length > 0 && (
                                  <div className="mb-2">
                                    <small className="text-muted">
                                      <i className="bi bi-gear me-1"></i>
                                      <strong>Skills:</strong> {freelancer.skills.slice(0, 3).join(', ')}
                                      {freelancer.skills.length > 3 && <span className="text-muted">...</span>}
                                    </small>
                                  </div>
                                )}
                                
                                {/* Experience and Rating */}
                                <div className="row g-2 mb-2">
                                  <div className="col-6">
                                    <small className="text-muted">
                                      <i className="bi bi-clock me-1"></i>
                                      <strong>Exp:</strong> {freelancer.experience_years || 0} years
                                    </small>
                                  </div>
                                  <div className="col-6">
                                    <div className="d-flex align-items-center">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <i
                                          key={star}
                                          className={`bi ${star <= (freelancer.admin_rating || 0) ? 'bi-star-fill' : 'bi-star'}`}
                                          style={{ color: star <= (freelancer.admin_rating || 0) ? '#ffc107' : '#dee2e6', fontSize: '10px' }}
                                        ></i>
                                      ))}
                                      <small className="ms-1 text-muted">({freelancer.admin_rating || 0}/5)</small>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Contact Information */}
                                <p className="text-muted small mb-1">
                                  <i className="bi bi-envelope me-1"></i>{freelancer.email}
                                </p>
                                <p className="text-muted small mb-2">
                                  <i className="bi bi-telephone me-1"></i>{freelancer.phone || 'No phone'}
                                </p>
                                
                                {/* Status Badges */}
                                <div className="d-flex gap-1 mb-2">
                                  <span className={`badge ${freelancer.is_available ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '10px' }}>
                                    {freelancer.is_available ? 'Available' : 'Unavailable'}
                            </span>
                                  <span className={`badge ${freelancer.is_approved ? 'bg-primary' : 'bg-warning'}`} style={{ fontSize: '10px' }}>
                                    {freelancer.is_approved ? 'Approved' : 'Pending'}
                                  </span>
                                </div>
                              </div>

                              {selectedFreelancers.includes(freelancer.freelancer_id) && (
                                <div className="mt-3">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`highlight-${freelancer.freelancer_id}`}
                                      checked={highlightedFreelancers.includes(freelancer.freelancer_id)}
                                      onChange={(e) => handleHighlightFreelancer(freelancer.freelancer_id, e.target.checked)}
                                    />
                                    <label className="form-check-label text-warning" htmlFor={`highlight-${freelancer.freelancer_id}`}>
                                      <i className="bi bi-star-fill me-1"></i>Top Recommendation
                                    </label>
                                  </div>
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
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowRecommendationsModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn"
                  style={{ background: accent, color: '#fff' }}
                  onClick={submitRecommendations}
                  disabled={recommendationsLoading || selectedFreelancers.length === 0}
                >
                  {recommendationsLoading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Submitting...
                    </span>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-1"></i>
                      Submit Recommendations ({selectedFreelancers.length})
                    </>
                  )}
                </button>
        </div>
      </div>
          </div>
        </div>
      )}

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
        
        /* Sidebar Navigation Hover Effects */
        .nav-item:hover {
          background: #f3f4f6 !important;
          color: #111827 !important;
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .nav-item.active:hover {
          background: ${accent} !important;
          color: #fff !important;
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(253,104,14,0.3);
        }
        
        /* Smooth transitions for all sidebar elements */
        .sidebar * {
          transition: all 0.2s ease;
        }
        
        /* Responsive design for mobile devices */
        @media (max-width: 768px) {
          .sidebar {
            width: 100% !important;
            position: relative !important;
            height: auto !important;
          }
          
          .main-content {
            marginLeft: 0 !important;
            width: 100% !important;
            padding: 16px !important;
          }
          
          .admin-dashboard {
            flex-direction: column;
          }
        }
        
        /* Force layout fixes */
        .main-content {
          margin-left: 300px !important;
          width: calc(100% - 300px) !important;
        }
        
        .row {
          margin-left: 0 !important;
          margin-right: 0 !important;
        }
        
        .col-xl-6, .col-lg-6, .col-md-12 {
          padding-left: 8px !important;
          padding-right: 8px !important;
        }
      `}</style>

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="documents-tab">
          <div className="row">
            {/* Documents Navigation Sidebar */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="bi bi-folder me-2"></i>
                    Documents
                  </h6>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {documentItems.map((item, index) => (
                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center p-3">
                        <div className="d-flex align-items-center">
                          <i className={`${item.icon} me-3`} style={{ color: accent, fontSize: '1.2rem' }}></i>
                          <div>
                            <div className="fw-medium">{item.name}</div>
                            <small className="text-muted">{item.type}</small>
                          </div>
                        </div>
                        <div className="dropdown">
                          <button 
                            className="btn btn-sm btn-outline-secondary" 
                            type="button" 
                            data-bs-toggle="dropdown"
                            style={{ padding: '4px 8px' }}
                          >
                            <i className="bi bi-three-dots"></i>
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <a className="dropdown-item" href="#" onClick={() => openDocument(item)}>
                                <i className="bi bi-folder me-2"></i>Open
                              </a>
                            </li>
                            <li>
                              <a className="dropdown-item" href="#" onClick={() => shareDocument(item)}>
                                <i className="bi bi-share me-2"></i>Share
                              </a>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <a className="dropdown-item text-danger" href="#" onClick={() => deleteDocument(item)}>
                                <i className="bi bi-trash me-2"></i>Delete
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    ))}
                    <div className="list-group-item p-3">
                      <button className="btn btn-link text-muted p-0 text-decoration-none">
                        <i className="bi bi-three-dots me-2"></i>
                        More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Content Area */}
            <div className="col-md-8">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    {selectedDocument ? selectedDocument.name : 'Document Viewer'}
                  </h6>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-download me-1"></i>Download
                    </button>
                    <button className="btn btn-outline-secondary btn-sm">
                      <i className="bi bi-pencil me-1"></i>Edit
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  {selectedDocument ? (
                    <div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <strong>Type:</strong> {selectedDocument.type}
                        </div>
                        <div className="col-md-6">
                          <strong>Size:</strong> {selectedDocument.size}
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <strong>Created:</strong> {selectedDocument.created}
                        </div>
                        <div className="col-md-6">
                          <strong>Modified:</strong> {selectedDocument.modified}
                        </div>
                      </div>
                      <div className="mb-3">
                        <strong>Description:</strong>
                        <p className="text-muted mt-1">{selectedDocument.description}</p>
                      </div>
                      <div className="border rounded p-3 bg-light">
                        <div className="text-center text-muted">
                          <i className="bi bi-file-earmark-text" style={{ fontSize: '3rem' }}></i>
                          <p className="mt-2">Document preview will be displayed here</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-file-earmark-text" style={{ fontSize: '3rem', color: accent }}></i>
                      <h5 className="mt-3">Select a Document</h5>
                      <p className="text-muted">Choose a document from the sidebar to view its details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      







      {/* Security Component Functions */}
      {/* Security Dashboard Component */}
      {activeSecuritySection === 'dashboard' && (
        <div className="row g-4">
          {/* Real-time Security Metrics */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-danger text-white">
                <h6 className="mb-0"><i className="bi bi-shield-check me-2"></i>Real-time Security Metrics</h6>
              </div>
              <div className="card-body">
                {securityData.dashboard ? (
                  <div className="row text-center">
                    <div className="col-6">
                      <div className="mb-3">
                        <div className="h4 text-success mb-1">{securityData.dashboard.realTimeMetrics.totalUsers}</div>
                        <small className="text-muted">Total Users</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-3">
                        <div className="h4 text-info mb-1">{securityData.dashboard.realTimeMetrics.activeUsers24h}</div>
                        <small className="text-muted">Active (24h)</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-3">
                        <div className="h4 text-warning mb-1">{securityData.dashboard.realTimeMetrics.activeUsers7d}</div>
                        <small className="text-muted">Active (7d)</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-3">
                        <div className="h4 text-danger mb-1">{securityData.dashboard.realTimeMetrics.suspiciousUsers}</div>
                        <small className="text-muted">Suspicious Users</small>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <div className="spinner-border text-danger" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Communication Threats */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0"><i className="bi bi-chat-dots me-2"></i>Communication Threats (24h)</h6>
              </div>
              <div className="card-body">
                {securityData.dashboard ? (
                  <div className="row text-center">
                    <div className="col-6">
                      <div className="mb-3">
                        <div className="h4 text-info mb-1">{securityData.dashboard.communicationThreats.totalMessages}</div>
                        <small className="text-muted">Total Messages</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-3">
                        <div className="h4 text-warning mb-1">{securityData.dashboard.communicationThreats.spamMessages}</div>
                        <small className="text-muted">Spam Messages</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-3">
                        <div className="h4 text-danger mb-1">{securityData.dashboard.communicationThreats.suspiciousMessages}</div>
                        <small className="text-muted">Suspicious</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-3">
                        <div className="h4 text-danger mb-1">{securityData.dashboard.communicationThreats.inappropriateMessages}</div>
                        <small className="text-muted">Inappropriate</small>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Login Attempts */}
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0"><i className="bi bi-person-check me-2"></i>Recent Login Attempts</h6>
              </div>
              <div className="card-body">
                {securityData.dashboard ? (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>IP Address</th>
                          <th>Status</th>
                          <th>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {securityData.dashboard.recentLogins.map((login, index) => (
                          <tr key={index}>
                            <td>{login.user}</td>
                            <td><code>{login.ip}</code></td>
                            <td>
                              <span className={`badge ${
                                login.status === 'success' ? 'bg-success' : 'bg-danger'
                              }`}>
                                {login.status}
                              </span>
                            </td>
                            <td>{login.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <div className="spinner-border text-info" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Communication Analysis Component */}
      {activeSecuritySection === 'communications' && (
        <div className="row g-4">
          {/* Communication Patterns */}
          <div className="col-md-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0"><i className="bi bi-graph-up me-2"></i>Communication Patterns</h6>
              </div>
              <div className="card-body">
                {securityData.communications ? (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Total Messages</th>
                          <th>Spam</th>
                          <th>Suspicious</th>
                          <th>Inappropriate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {securityData.communications.patterns.map((pattern, index) => (
                          <tr key={index}>
                            <td>{new Date(pattern.date).toLocaleDateString()}</td>
                            <td>{pattern.total_messages}</td>
                            <td>
                              {pattern.spam_count > 0 && (
                                <span className="badge bg-warning">{pattern.spam_count}</span>
                              )}
                            </td>
                            <td>
                              {pattern.suspicious_count > 0 && (
                                <span className="badge bg-danger">{pattern.suspicious_count}</span>
                              )}
                            </td>
                            <td>
                              {pattern.inappropriate_count > 0 && (
                                <span className="badge bg-danger">{pattern.inappropriate_count}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Communicators */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0"><i className="bi bi-people me-2"></i>Top Communicators</h6>
              </div>
              <div className="card-body">
                {securityData.communications ? (
                  <div className="list-group list-group-flush">
                    {securityData.communications.topCommunicators.slice(0, 5).map((user, index) => (
                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center p-2">
                        <div>
                          <div className="fw-medium">{user.user_name}</div>
                          <small className="text-muted">{user.user_type}</small>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold">{user.message_count}</div>
                          {user.spam_count > 0 && (
                            <small className="text-danger">+{user.spam_count} spam</small>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Flagged Messages */}
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0"><i className="bi bi-flag me-2"></i>Flagged Messages for Review</h6>
              </div>
              <div className="card-body">
                {securityData.communications ? (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Sender</th>
                          <th>Message Content</th>
                          <th>Flag Reason</th>
                          <th>Timestamp</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {securityData.communications.flaggedMessages.slice(0, 10).map((message, index) => (
                          <tr key={index}>
                            <td>
                              <div>{message.sender_name}</div>
                              <small className="text-muted">{message.sender_email}</small>
                            </td>
                            <td>
                              <div className="text-truncate" style={{ maxWidth: '200px' }} title={message.content}>
                                {message.content}
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${
                                message.flag_reason === 'spam' ? 'bg-warning' :
                                message.flag_reason === 'suspicious' ? 'bg-danger' :
                                'bg-secondary'
                              }`}>
                                {message.flag_reason}
                              </span>
                            </td>
                            <td>{new Date(message.sent_at).toLocaleString()}</td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => flagMessage(message.message_id, message.flag_reason, 'Admin review')}
                              >
                                <i className="bi bi-flag"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Component */}
      {activeSecuritySection === 'audit' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-dark text-white">
            <h6 className="mb-0"><i className="bi bi-journal-text me-2"></i>System Audit Log</h6>
          </div>
          <div className="card-body">
            {securityData.audit ? (
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Details</th>
                      <th>IP Address</th>
                      <th>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityData.audit.logEntries.map((entry, index) => (
                      <tr key={index}>
                        <td>{new Date(entry.timestamp).toLocaleString()}</td>
                        <td>{entry.user}</td>
                        <td>
                          <span className="badge bg-secondary">{entry.action}</span>
                        </td>
                        <td>{entry.details}</td>
                        <td><code>{entry.ip_address}</code></td>
                        <td>
                          <span className={`badge ${
                            entry.severity === 'HIGH' ? 'bg-danger' :
                            entry.severity === 'MEDIUM' ? 'bg-warning' :
                            entry.severity === 'LOW' ? 'bg-info' :
                            'bg-secondary'
                          }`}>
                            {entry.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-3">
                <div className="spinner-border text-dark" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Threat Intelligence Component */}
      {activeSecuritySection === 'threats' && (
        <div className="row g-4">
          {/* Message Threats */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-danger text-white">
                <h6 className="mb-0"><i className="bi bi-exclamation-triangle me-2"></i>Message Threats (7 days)</h6>
              </div>
              <div className="card-body">
                {securityData.threats ? (
                  <div className="row text-center">
                    <div className="col-6">
                      <div className="mb-3">
                        <div className="h4 text-warning mb-1">{securityData.threats.messageThreats.spam}</div>
                        <small className="text-muted">Spam</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-3">
                        <div className="h4 text-danger mb-1">{securityData.threats.messageThreats.scam}</div>
                        <small className="text-muted">Scam</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-3">
                        <div className="h4 text-danger mb-1">{securityData.threats.messageThreats.phishing}</div>
                        <small className="text-muted">Phishing</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-3">
                        <div className="h4 text-warning mb-1">{securityData.threats.messageThreats.suspicious}</div>
                        <small className="text-muted">Suspicious</small>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <div className="spinner-border text-danger" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* IP Threats */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0"><i className="bi bi-globe me-2"></i>IP-based Threats</h6>
              </div>
              <div className="card-body">
                {securityData.threats ? (
                  <div className="list-group list-group-flush">
                    {securityData.threats.ipThreats.map((threat, index) => (
                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center p-2">
                        <div>
                          <div className="fw-medium"><code>{threat.ip}</code></div>
                          <small className="text-muted">{threat.threat}</small>
                        </div>
                        <div className="text-end">
                          <span className={`badge ${
                            threat.severity === 'HIGH' ? 'bg-danger' :
                            threat.severity === 'MEDIUM' ? 'bg-warning' :
                            'bg-info'
                          }`}>
                            {threat.severity}
                          </span>
                          <br />
                          <small className="text-muted">{threat.lastSeen}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0"><i className="bi bi-lightbulb me-2"></i>Security Recommendations</h6>
              </div>
              <div className="card-body">
                {securityData.threats ? (
                  <div className="row">
                    {securityData.threats.recommendations.map((recommendation, index) => (
                      <div key={index} className="col-md-6 mb-3">
                        <div className="d-flex align-items-start">
                          <i className="bi bi-arrow-right-circle text-info me-2 mt-1"></i>
                          <span>{recommendation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <div className="spinner-border text-info" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-fetch security data when section changes */}
      {activeSecuritySection && !securityData[activeSecuritySection] && (
        <div className="text-center py-4">
          <button 
            className="btn btn-primary"
            onClick={() => fetchSecurityData(activeSecuritySection)}
          >
            <i className="bi bi-download me-2"></i>
            Load {activeSecuritySection.charAt(0).toUpperCase() + activeSecuritySection.slice(1)} Data
          </button>
        </div>
      )}

      {/* Auto-generate reports when report section changes */}
      {activeReportSection && !reportsData[activeReportSection] && (
        <div className="text-center py-4">
          <button 
            className="btn btn-primary"
            onClick={() => generateComprehensiveReport()}
          >
            <i className="bi bi-download me-2"></i>
            Load Report Data
          </button>
        </div>
      )}
    </div>
  );
};

export default ESCAdminDashboard; 