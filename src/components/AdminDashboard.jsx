import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  
  // Skills chart filtering state
  const [skillsFilter, setSkillsFilter] = useState('all');
  const [skillsLimit, setSkillsLimit] = useState(10);
  
  // Analytics data states
  const [analyticsData, setAnalyticsData] = useState({
    registrationTrends: [],
    userTypeDistribution: [],
    userActivityStatus: [],
    cvUploadTrends: [],
    topSkills: [],
    skillsDemand: [],
    messageTrends: [],
    userCommunicationActivity: [],
    hiredFreelancersTrends: []
  });

  // CV Upload date filtering states
  const [cvUploadDateFilter, setCvUploadDateFilter] = useState({
    type: 'days', // 'days' or 'custom'
    days: 90,
    startDate: '',
    endDate: ''
  });
  const [cvUploadFilterLoading, setCvUploadFilterLoading] = useState(false);
  const [analyticsDataReady, setAnalyticsDataReady] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [lastAnalyticsUpdate, setLastAnalyticsUpdate] = useState(null);
  const [visitorData, setVisitorData] = useState([]);
  const [visitorDataLoading, setVisitorDataLoading] = useState(false);

  // Chart data will be populated from real-time API calls
  const chartData = [];

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

  // Hired freelancers tracking state
  const [hiredFreelancersCount, setHiredFreelancersCount] = useState(0);
  const [hiredFreelancersLoading, setHiredFreelancersLoading] = useState(false);
  const [lastHiredFreelancersUpdate, setLastHiredFreelancersUpdate] = useState(null);

  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Interview Feedback Analytics state
  const [interviewAnalytics, setInterviewAnalytics] = useState(null);
  const [interviewAnalyticsLoading, setInterviewAnalyticsLoading] = useState(false);
  const [interviewAnalyticsError, setInterviewAnalyticsError] = useState('');
  const [interviewTimeRange, setInterviewTimeRange] = useState('30');

  const [recommendationNotes, setRecommendationNotes] = useState('');
  const [submittingRecommendations, setSubmittingRecommendations] = useState(false);
  const [dataTableData, setDataTableData] = useState([]);
  const [showDataModal, setShowDataModal] = useState(false);
  const [selectedDataItem, setSelectedDataItem] = useState(null);










  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Initialize CV upload date filter with default values
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
    
    setCvUploadDateFilter(prev => ({
      ...prev,
      startDate: threeMonthsAgoStr,
      endDate: today
    }));
  }, []);

  useEffect(() => {
    checkAuth();
    // Fetch initial hired freelancers count
    fetchHiredFreelancersCount();
  }, []);

  // Fetch visitor data when time range changes
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchVisitorData();
    }
  }, [timeRange]);

  // Fetch CV upload data when analytics tab is opened or filter changes
  useEffect(() => {
    console.log('🔄 CV Upload useEffect triggered:', { 
      activeTab, 
      startDate: cvUploadDateFilter.startDate, 
      endDate: cvUploadDateFilter.endDate 
    });
    if (activeTab === 'analytics') {
      if (cvUploadDateFilter.startDate && cvUploadDateFilter.endDate) {
        console.log('🚀 Auto-fetching CV upload data...');
        fetchCVUploadData();
      } else {
        console.log('⚠️ CV upload filter not initialized yet');
      }
    }
  }, [cvUploadDateFilter, activeTab]);

  // Debug CV upload trends data changes
  useEffect(() => {
    console.log('📊 CV Upload Trends data changed:', {
      length: analyticsData.cvUploadTrends?.length,
      data: analyticsData.cvUploadTrends
    });
  }, [analyticsData.cvUploadTrends]);

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

  // Fetch interview analytics when analytics tab is activated
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchInterviewAnalytics();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // Refetch interview analytics when time range changes
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchInterviewAnalytics();
    }
    // eslint-disable-next-line
  }, [interviewTimeRange]);

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
      fetchHiredFreelancersCount(); // Add hired freelancers count
    }
    // eslint-disable-next-line
  }, [activeTab]);

  // Auto-refresh hired freelancers count every 2 minutes when dashboard tab is active
  useEffect(() => {
    let intervalId;
    
    if (activeTab === 'dashboard') {
      // Set up auto-refresh every 2 minutes (120,000 milliseconds)
      intervalId = setInterval(() => {
        console.log('🔄 Auto-refreshing hired freelancers count...');
        fetchHiredFreelancersCount();
      }, 2 * 60 * 1000);
    }
    
    // Cleanup interval when component unmounts or tab changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
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



  // Helper function to format trends data
  const formatTrendsData = (data) => {
    return (data || []).map(item => ({
      ...item,
      // Ensure numeric values for chart data
      total_users: parseInt(item.total_users) || 0,
      associates: parseInt(item.associates) || 0,
      freelancers: parseInt(item.freelancers) || 0,
      admins: parseInt(item.admins) || 0,
      ecs_employees: parseInt(item.ecs_employees) || 0,
      uploads: parseInt(item.uploads) || 0,
      messages: parseInt(item.messages) || 0,
      conversations: parseInt(item.conversations) || 0,
      hired_freelancers: parseInt(item.hired_freelancers) || 0,
      formattedDate: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      })
    }));
  };

  // CV Upload date filtering functions
  const fetchCVUploadData = async () => {
    setCvUploadFilterLoading(true);
    try {
      console.log('🔍 Fetching CV upload data with filter:', cvUploadDateFilter);
      
      let queryParams = '';
      if (cvUploadDateFilter.type === 'custom' && cvUploadDateFilter.startDate && cvUploadDateFilter.endDate) {
        queryParams = `?start_date=${cvUploadDateFilter.startDate}&end_date=${cvUploadDateFilter.endDate}`;
        console.log('📅 Using custom date range:', cvUploadDateFilter.startDate, 'to', cvUploadDateFilter.endDate);
      } else {
        queryParams = `?days=${cvUploadDateFilter.days}`;
        console.log('📅 Using days filter:', cvUploadDateFilter.days, 'days');
      }
      
      console.log('🌐 Making API call to:', `/admin/analytics/cv-upload-trends${queryParams}`);
      const response = await api.get(`/admin/analytics/cv-upload-trends${queryParams}`);
      
      console.log('📊 API Response:', response.data);
      
      if (response.data.success) {
        console.log('📊 Raw API data:', response.data.data);
        const formattedData = formatTrendsData(response.data.data);
        console.log('📈 Formatted data before setting state:', formattedData);
        
        setAnalyticsData(prev => {
          const newData = {
            ...prev,
            cvUploadTrends: formattedData
          };
          console.log('🔄 Updated analytics data:', newData.cvUploadTrends);
          return newData;
        });
        
        console.log('✅ CV upload data fetched successfully:', formattedData.length, 'records');
      } else {
        console.error('❌ CV upload data fetch failed:', response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching CV upload data:', error);
      console.error('❌ Error details:', error.response?.data);
    } finally {
      setCvUploadFilterLoading(false);
    }
  };

  const handleCVUploadDateFilterChange = (field, value) => {
    setCvUploadDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyCVUploadDateFilter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔍 Apply button clicked!');
    console.log('📅 Current filter state:', cvUploadDateFilter);
    alert('Apply button clicked! Check console for details.');
    console.log('🚀 Starting CV upload data fetch...');
    fetchCVUploadData();
  };

  // Analytics Functions
  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    
    try {
      console.log('🚀 Fetching analytics data...');
      
      // Debug authentication
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      console.log('🔐 Auth Debug:', { 
        hasToken: !!token, 
        tokenLength: token ? token.length : 0,
        user: user ? JSON.parse(user) : null 
      });
      
      // Calculate days based on time range
      const getDaysFromTimeRange = (range) => {
        switch (range) {
          case '30d': return 30;
          case '90d': return 90;
          case '6m': return 180;
          case '1y': return 365;
          default: return 90; // Default to 90 days to show more data
        }
      };
      
      const days = getDaysFromTimeRange(timeRange);
      console.log(`📅 Fetching data for last ${days} days`);
      
      // Fetch all analytics data in parallel
      const [
        registrationResponse,
        userTypeResponse,
        userActivityResponse,
        cvUploadResponse,
        topSkillsResponse,
        skillsDemandResponse,

        messageTrendsResponse,
        communicationActivityResponse,
        hiredFreelancersTrendsResponse
      ] = await Promise.all([
        api.get(`/admin/analytics/registration-trends?days=${days}`),
        api.get('/admin/analytics/user-type-distribution'),
        api.get('/admin/analytics/user-activity-status'),
        api.get(`/admin/analytics/cv-upload-trends?days=${days}`),
        api.get('/admin/analytics/top-skills'),
        api.get('/admin/analytics/skills-demand'),

        api.get(`/admin/analytics/message-trends?days=${days}`),
        api.get('/admin/analytics/user-communication-activity'),
        api.get(`/admin/analytics/hired-freelancers-trends?days=${days}`)
      ]);
      
      console.log('📊 API Responses received:', {
        registration: registrationResponse.data.success,
        userType: userTypeResponse.data.success,
        userActivity: userActivityResponse.data.success,
        cvUpload: cvUploadResponse.data.success,
        topSkills: topSkillsResponse.data.success,

        messageTrends: messageTrendsResponse.data.success,
        communicationActivity: communicationActivityResponse.data.success,
        hiredFreelancers: hiredFreelancersTrendsResponse.data.success
      });
      
      // Use the shared formatTrendsData function
      
      const analyticsData = {
        registrationTrends: formatTrendsData(registrationResponse.data.data),
        userTypeDistribution: userTypeResponse.data.data || [],
        userActivityStatus: userActivityResponse.data.data || [],
        cvUploadTrends: formatTrendsData(cvUploadResponse.data.data),
        topSkills: topSkillsResponse.data.data || [],
        skillsDemand: skillsDemandResponse.data.data || [],

        messageTrends: formatTrendsData(messageTrendsResponse.data.data),
        userCommunicationActivity: communicationActivityResponse.data.data || [],
        hiredFreelancersTrends: formatTrendsData(hiredFreelancersTrendsResponse.data.data)
      };
      
      console.log('📊 Formatted analytics data:', {
        registrationTrends: analyticsData.registrationTrends.length,
        cvUploadTrends: analyticsData.cvUploadTrends.length,
        messageTrends: analyticsData.messageTrends.length,
        hiredFreelancersTrends: analyticsData.hiredFreelancersTrends.length,
        userTypeDistribution: analyticsData.userTypeDistribution.length,
        topSkills: analyticsData.topSkills.length,

        userCommunicationActivity: analyticsData.userCommunicationActivity.length
      });
      
      setAnalyticsData(analyticsData);
      setLastAnalyticsUpdate(new Date());
      setAnalyticsDataReady(true);
      console.log('✅ Analytics data updated successfully');
      
      // Debug registration trends data
      console.log('🔍 Registration Trends Debug:', {
        rawData: registrationResponse.data,
        formattedData: analyticsData.registrationTrends,
        sampleItem: analyticsData.registrationTrends[0],
        dataLength: analyticsData.registrationTrends.length
      });
      

      
    } catch (error) {
      console.error('❌ Analytics fetch error:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('❌ Response Error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('❌ Request Error:', error.request);
      } else {
        console.error('❌ Error:', error.message);
      }
      
      setAnalyticsError('Failed to fetch analytics data. Please try again.');
      
      // Set empty data if API fails
      setAnalyticsData({
        registrationTrends: [],
        userTypeDistribution: [],
        userActivityStatus: [],
        cvUploadTrends: [],
        topSkills: [],
        skillsDemand: [],
        messageTrends: [],
        hiredFreelancersTrends: [],
        userCommunicationActivity: []
      });
      
      // Update the last update timestamp
      setLastAnalyticsUpdate(new Date());
    } finally {
      setAnalyticsLoading(false);
    }
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
        // Format the data for the chart with proper validation
        const formattedData = response.data.data.map(item => ({
          ...item,
          // Ensure required properties exist with fallback values
          mobile: Number(item.mobile) || 0,
          desktop: Number(item.desktop) || 0,
          date: item.date || new Date().toISOString(),
          // Format the date for display
          formattedDate: new Date(item.date || new Date()).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        }));
        
        console.log('📊 Visitor data structure:', response.data.data);
        console.log('📊 Formatted chart data:', formattedData);
        setVisitorData(formattedData);
        setFilteredChartData(formattedData); // Update the chart data
      } else {
        console.error('Failed to fetch visitor data:', response.data.message);
        // Set fallback data if API fails
        const fallbackData = [
          { date: new Date().toISOString(), mobile: 0, desktop: 0, formattedDate: 'Today' },
          { date: new Date(Date.now() - 86400000).toISOString(), mobile: 0, desktop: 0, formattedDate: 'Yesterday' }
        ];
        setVisitorData(fallbackData);
        setFilteredChartData(fallbackData);
      }
    } catch (error) {
      console.error('Error fetching visitor data:', error);
      // Set fallback data if API fails
      const fallbackData = [
        { date: new Date().toISOString(), mobile: 0, desktop: 0, formattedDate: 'Today' },
        { date: new Date(Date.now() - 86400000).toISOString(), mobile: 0, desktop: 0, formattedDate: 'Yesterday' }
      ];
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
        performance: null,
        business: null,
        security: null,
        operations: null
      };
      
      setReportsData(fallbackData);
      console.log('✅ Fallback data set:', fallbackData);
    } finally {
      setReportsLoading(false);
    }
  };



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

  // Interview Feedback Analytics Functions
  const fetchInterviewAnalytics = async () => {
    setInterviewAnalyticsLoading(true);
    setInterviewAnalyticsError('');

    try {
      console.log(`🎯 Fetching interview feedback analytics for last ${interviewTimeRange} days`);
      
      const response = await api.get(`/admin/analytics/interview-feedback?timeRange=${interviewTimeRange}`);
      
      if (response.data.success) {
        setInterviewAnalytics(response.data.data);
        console.log('✅ Interview analytics fetched successfully:', response.data.data);
      } else {
        setInterviewAnalyticsError('Failed to fetch interview analytics data');
      }
    } catch (error) {
      console.error('❌ Error fetching interview analytics:', error);
      setInterviewAnalyticsError('Failed to load interview analytics. Please try again.');
    } finally {
      setInterviewAnalyticsLoading(false);
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
        [section]: null
      }));
    } finally {
      setSecurityLoading(false);
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

  // Fetch hired freelancers count for real-time updates
  const fetchHiredFreelancersCount = async () => {
    try {
      setHiredFreelancersLoading(true);
      console.log('🔍 Fetching hired freelancers count...');
      
      const response = await api.get('/hiring/stats');
      
      console.log('🔍 API Response:', response.data);
      console.log('🔍 Response structure:', {
        success: response.data.success,
        stats: response.data.stats,
        total_hires: response.data.stats?.total_hires
      });
      
      if (response.data.success) {
        const count = response.data.stats.total_hires || 0;
        setHiredFreelancersCount(count);
        setLastHiredFreelancersUpdate(new Date());
        console.log('✅ Hired freelancers count updated:', count);
      } else {
        console.error('❌ Failed to fetch hired freelancers count:', response.data.message);
        setHiredFreelancersCount(0);
      }
    } catch (error) {
      console.error('❌ Error fetching hired freelancers count:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        console.error('❌ Authentication error - user may not have admin privileges');
      } else if (error.response?.status === 403) {
        console.error('❌ Forbidden - user does not have permission to access hiring stats');
      }
      
      setHiredFreelancersCount(0);
    } finally {
      setHiredFreelancersLoading(false);
    }
  };

  // Freelancer Request Management Functions


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
            <img 
              src="/assets/img/cv-connect_logo.png" 
              alt="CV-Connect Logo" 
              style={{
                width: '32px', 
                height: '32px', 
                borderRadius: '8px',
                marginRight: '12px'
              }}
            />
        <div>
              <h5 className="mb-0" style={{ color: '#111827', fontWeight: 600, fontSize: '16px' }}>
                CV-Connect
              </h5>
              <small className="text-muted">Admin Portal</small>
          </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="sidebar-content" style={{ 
          padding: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          height: 'calc(100vh - 120px)' 
        }}>
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
                onClick={() => {
                  setActiveTab('dashboard');
                  window.scrollTo(0, 0);
                }}
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
                className={`nav-item w-100 text-start ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('analytics');
                  window.scrollTo(0, 0);
                }}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: activeTab === 'analytics' ? accent : 'transparent',
                  color: activeTab === 'analytics' ? '#fff' : '#374151',
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
                className={`nav-item w-100 text-start ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('reports');
                  window.scrollTo(0, 0);
                }}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: activeTab === 'reports' ? accent : 'transparent',
                  color: activeTab === 'reports' ? '#fff' : '#374151',
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
                System Monitor
          </button>
              

        </div>
            </div>

          {/* Spacer to push bottom section down */}
          <div style={{ flex: 1 }}></div>

          {/* Bottom Section - Settings and Logout */}
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
                className={`nav-item w-100 text-start ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('settings');
                  window.scrollTo(0, 0);
                }}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: activeTab === 'settings' ? accent : 'transparent',
                  color: activeTab === 'settings' ? '#fff' : '#374151',
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


              {activeTab === 'analytics' && 'Analytics'}
              {activeTab === 'reports' && 'System Monitor'}
              {activeTab === 'settings' && 'Settings'}
              

            </h1>
            <p className="text-muted mb-0">
              {activeTab === 'dashboard' && 'System overview and key metrics'}


              {activeTab === 'analytics' && 'Performance insights and trends'}
              {activeTab === 'reports' && 'Monitor system performance and health'}
              {activeTab === 'settings' && 'System configuration and preferences'}
              

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
                  {/* Total Freelancers Hired Card */}
                  <div className="bg-white rounded-4 shadow-sm p-4 text-center" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
                    <div className="mb-3">
                      <div style={{ fontSize: 32, color: accent, marginBottom: 8 }}>
                        <i className="bi bi-briefcase"></i>
              </div>
                      <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase' }}>
                        Total Freelancers Hired
                        </div>
                        </div>
                    <div style={{ fontWeight: 700, fontSize: '28px', color: '#111827', marginBottom: '8px' }}>
                      {hiredFreelancersLoading ? (
                        <div className="spinner-border spinner-border-sm" style={{ color: '#ffd7c2' }} role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        hiredFreelancersCount
                      )}
                        </div>
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <span className="badge" style={{ background: '#10b981', color: '#fff', fontSize: '12px', padding: '4px 8px' }}>
                        <i className="bi bi-check-circle me-1"></i>
                        Successfully Hired
                      </span>
                        </div>
                    <div className="mt-3 text-sm text-muted">
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                        <i className="bi bi-arrow-up" style={{ color: '#10b981' }}></i>
                        <span style={{ fontWeight: 500 }}>Growing steadily</span>
                        </div>
                      <div className="text-muted">Real-time system data</div>


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
                            className="btn btn-sm me-2"
                            onClick={fetchVisitorData}
                            disabled={visitorDataLoading}
                            style={{ 
                              fontSize: '12px', 
                              padding: '6px 12px',
                              backgroundColor: '#ffd7c2',
                              borderColor: '#ffd7c2',
                              color: '#8b4513',
                              transition: 'all 0.3s ease-in-out',
                              transform: 'scale(1)'
                            }}
                            onMouseEnter={(e) => {
                              if (!visitorDataLoading) {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.backgroundColor = '#ffc299';
                                e.target.style.boxShadow = '0 4px 12px rgba(255, 215, 194, 0.4)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!visitorDataLoading) {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.backgroundColor = '#ffd7c2';
                                e.target.style.boxShadow = 'none';
                              }
                            }}
                            onMouseDown={(e) => {
                              if (!visitorDataLoading) {
                                e.target.style.transform = 'scale(0.95)';
                              }
                            }}
                            onMouseUp={(e) => {
                              if (!visitorDataLoading) {
                                e.target.style.transform = 'scale(1.05)';
                              }
                            }}
                          >
                            {visitorDataLoading ? 'Loading...' : 'Refresh'}
                          </button>
                          {/* Time Range Toggle Group */}
                          <div className="btn-group" role="group">
                            <button
                              type="button"
                              className={`btn btn-sm ${timeRange === '90d' ? '' : ''}`}
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
                              className={`btn btn-sm ${timeRange === '30d' ? '' : ''}`}
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
                              className={`btn btn-sm ${timeRange === '7d' ? '' : ''}`}
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
                            <div className="spinner-border style={{ color: '#ffd7c2' }}" role="status">
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
                        ) : !filteredChartData[0] || typeof filteredChartData[0].mobile === 'undefined' || typeof filteredChartData[0].desktop === 'undefined' ? (
                          <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                            <div className="text-center text-muted">
                              <i className="bi bi-exclamation-triangle display-4"></i>
                              <p className="mt-2">Invalid chart data structure</p>
                              <small className="text-muted">Please refresh the page or try again later</small>
                            </div>
                          </div>
                        ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={filteredChartData.filter(item => 
                            item && 
                            typeof item.mobile === 'number' && 
                            typeof item.desktop === 'number' && 
                            item.date &&
                            !isNaN(item.mobile) &&
                            !isNaN(item.desktop)
                          )}>
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
                              isAnimationActive={false}
                            />
                            <Area
                              dataKey="desktop"
                              type="monotone"
                              fill="url(#fillDesktop)"
                              stroke={accent}
                              strokeWidth={2}
                              stackId="a"
                              name="Desktop"
                              isAnimationActive={false}
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
                    className="btn btn-sm"
                    onClick={fetchAnalyticsData}
                    disabled={analyticsLoading}
                    style={{ 
                      backgroundColor: '#ffd7c2',
                      borderColor: '#ffd7c2',
                      color: '#8b4513',
                      transition: 'all 0.3s ease-in-out',
                      transform: 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                      if (!analyticsLoading) {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.backgroundColor = '#ffc299';
                        e.target.style.boxShadow = '0 4px 12px rgba(255, 215, 194, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!analyticsLoading) {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.backgroundColor = '#ffd7c2';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!analyticsLoading) {
                        e.target.style.transform = 'scale(0.95)';
                      }
                    }}
                    onMouseUp={(e) => {
                      if (!analyticsLoading) {
                        e.target.style.transform = 'scale(1.05)';
                      }
                    }}
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
              
              {/* Initial Loading State */}
              {!analyticsDataReady && !analyticsLoading && (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: accent }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Initializing analytics data...</p>
                  <button 
                    className="btn btn-sm "
                    onClick={fetchAnalyticsData}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>Load Data
                  </button>
                </div>
              )}
              
              {analyticsError && (
                <div className="alert alert-warning mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {analyticsError}
                </div>
              )}

                            {/* Analytics Content - Only show when data is ready */}
              {analyticsDataReady && (
                <>
                  {console.log('🔍 RENDERING ANALYTICS SECTION - REACHED THIS POINT')}
                  
                  {/* ================================== */}
                  {/* TIER 1: IMMEDIATE BUSINESS IMPACT */}
                  {/* Top Priority for Industry Recruiters */}
                  {/* ================================== */}
                  
                  {/* 1. Skills Supply vs Demand - MOST IMPORTANT FOR RECRUITERS */}
              <div className="row g-4 mb-4">
                <div className="col-md-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                      <h6 className="mb-0" style={{ color: accent, fontWeight: 600 }}>
                            <i className="bi bi-bar-chart me-2"></i>Skills Supply vs Demand
                      </h6>
                          <small className="text-muted">Compare freelancer skills (supply) with job requirements (demand)</small>
                        </div>
                        <div className="d-flex gap-2">
                          <select 
                            className="form-select form-select-sm" 
                            style={{ width: '140px', fontSize: '13px' }}
                            onChange={(e) => {
                              const filter = e.target.value;
                              setSkillsFilter(filter);
                            }}
                            value={skillsFilter}
                          >
                            <option value="all">All Skills</option>
                            <option value="supply">Freelancer Skills</option>
                            <option value="demand">Job Requirements</option>
                            <option value="both">Balanced Skills</option>
                          </select>
                          <select 
                            className="form-select form-select-sm" 
                            style={{ width: '100px', fontSize: '13px' }}
                            onChange={(e) => {
                              const limit = parseInt(e.target.value);
                              setSkillsLimit(limit);
                            }}
                            value={skillsLimit}
                          >
                            <option value="5">Top 5</option>
                            <option value="10">Top 10</option>
                            <option value="15">Top 15</option>
                            <option value="20">Top 20</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      {(() => {
                            // Get supply data (freelancer skills)
                            const supplyData = analyticsData.topSkills || [];
                            const demandData = analyticsData.skillsDemand || [];

                            console.log('🔍 Skills Data:', {
                              supply: supplyData.length,
                              demand: demandData.length,
                              supplySample: supplyData[0],
                              demandSample: demandData[0],
                              supplyData: supplyData,
                              demandData: demandData
                            });

                            // Check if we have any data
                            if (supplyData.length === 0 && demandData.length === 0) {
                              return (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                                  <div className="text-center text-muted">
                                    <i className="bi bi-bar-chart display-4"></i>
                                    <p className="mt-2">No skills data available</p>
                                  </div>
                                </div>
                              );
                            }

                            // Create a combined dataset with both supply and demand
                            const skillMap = new Map();
                            
                            // Add supply data
                            console.log('🔍 Processing Supply Data:', supplyData);
                            supplyData.forEach(item => {
                              if (item && item.skill && (typeof item.count === 'number' || !isNaN(parseInt(item.count)))) {
                                const skill = item.skill.toLowerCase();
                                const count = parseInt(item.count);
                                console.log(`🔍 Adding supply skill: "${skill}" with count: ${count}`);
                                skillMap.set(skill, {
                                  skill: item.skill,
                                  supply: count,
                                  demand: 0,
                                  fill: item.fill || '#fd680e'
                                });
                              }
                            });

                            // Add demand data
                            console.log('🔍 Processing Demand Data:', demandData);
                            demandData.forEach(item => {
                              if (item && item.skill && (typeof item.count === 'number' || !isNaN(parseInt(item.count)))) {
                                const skill = item.skill.toLowerCase();
                                const count = parseInt(item.count);
                                console.log(`🔍 Processing demand skill: "${skill}" with count: ${count}`);
                                
                                // Try to find matching skill in supply data
                                let matchedSkill = null;
                                
                                // First try exact match
                                if (skillMap.has(skill)) {
                                  matchedSkill = skill;
                                } else {
                                  // Try fuzzy matching
                                  const normalizedSkill = skill.replace(/[^a-z0-9]/g, '');
                                  
                                  for (const [existingSkill] of skillMap) {
                                    const normalizedExisting = existingSkill.replace(/[^a-z0-9]/g, '');
                                    
                                    // Check if skills match (case-insensitive, ignore special chars)
                                    if (normalizedSkill === normalizedExisting ||
                                        normalizedSkill.includes(normalizedExisting) ||
                                        normalizedExisting.includes(normalizedSkill)) {
                                      matchedSkill = existingSkill;
                                      break;
                                    }
                                  }
                                }
                                
                                if (matchedSkill) {
                                  // Update existing skill with demand
                                  const existing = skillMap.get(matchedSkill);
                                  existing.demand = count;
                                  console.log(`🔍 Updated existing skill "${matchedSkill}" with demand: ${count}`);
                                } else {
                                  // Add new skill with only demand
                                  skillMap.set(skill, {
                                    skill: item.skill,
                                    supply: 0,
                                    demand: count,
                                    fill: '#10b981'
                                  });
                                  console.log(`🔍 Added new demand-only skill: "${skill}" with count: ${count}`);
                                }
                              }
                            });

                            // Prepare chart data based on filter
                            let filteredData = Array.from(skillMap.values());

                            // Apply filter
                            if (skillsFilter === 'supply') {
                              filteredData = filteredData.filter(item => item.supply > 0);
                            } else if (skillsFilter === 'demand') {
                              filteredData = filteredData.filter(item => item.demand > 0);
                            } else if (skillsFilter === 'both') {
                              filteredData = filteredData.filter(item => item.supply > 0 && item.demand > 0);
                            }

                            // Sort and limit data
                            const sortedData = filteredData
                              .sort((a, b) => (b.supply + b.demand) - (a.supply + a.demand))
                              .slice(0, skillsLimit);

                            console.log('🔍 Final Filtered Data:', {
                              filter: skillsFilter,
                              limit: skillsLimit,
                              totalItems: filteredData.length,
                              displayedItems: sortedData.length,
                              data: sortedData
                            });

                            // Prepare chart-specific data
                            const supplyChartData = Array.from(skillMap.values())
                              .filter(item => item.supply > 0)
                              .sort((a, b) => b.supply - a.supply)
                              .slice(0, skillsLimit)
                              .map(item => ({
                                skill: item.skill,
                                count: item.supply,
                                type: 'Supply',
                                color: '#fd680e'
                              }));

                            // Get all demand skills, not just from combinedData
                            const allDemandSkills = Array.from(skillMap.values())
                              .filter(item => item.demand > 0)
                              .sort((a, b) => b.demand - a.demand)
                              .slice(0, skillsLimit)
                              .map(item => ({
                                skill: item.skill,
                                count: item.demand,
                                type: 'Demand',
                                color: '#10b981'
                              }));

                            // Get balanced skills (skills that have both supply and demand)
                            const balancedSkillsData = Array.from(skillMap.values())
                              .filter(item => item.supply > 0 && item.demand > 0)
                              .sort((a, b) => (b.supply + b.demand) - (a.supply + a.demand))
                              .slice(0, skillsLimit)
                              .map(item => ({
                                skill: item.skill,
                                supply: item.supply,
                                demand: item.demand,
                                total: item.supply + item.demand,
                                type: 'Balanced',
                                supplyColor: '#fd680e',
                                demandColor: '#10b981'
                              }));

                            console.log('🔍 Supply Chart Data:', supplyChartData);
                            console.log('🔍 Demand Chart Data:', allDemandSkills);
                            console.log('🔍 Balanced Skills Data:', balancedSkillsData);
                            
                            // Calculate summary statistics
                            const totalSupply = Array.from(skillMap.values()).reduce((sum, item) => sum + item.supply, 0);
                            const totalDemand = Array.from(skillMap.values()).reduce((sum, item) => sum + item.demand, 0);
                            const totalSkills = Array.from(skillMap.values()).length;
                            const balancedSkills = Array.from(skillMap.values()).filter(item => item.supply > 0 && item.demand > 0).length;

                            return (
                              <div>
                                {/* Summary Statistics */}
                                {(skillsFilter === 'all' || skillsFilter === 'both') && (
                                  <div className="row mb-4">
                                    <div className="col-md-3">
                                      <div className="text-center p-3" style={{ backgroundColor: '#fff8f0', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fd680e' }}>{totalSupply}</div>
                                        <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Total Supply</div>
                                      </div>
                                    </div>
                                    <div className="col-md-3">
                                      <div className="text-center p-3" style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{totalDemand}</div>
                                        <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Total Demand</div>
                                      </div>
                                    </div>
                                    <div className="col-md-3">
                                      <div className="text-center p-3" style={{ backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#64748b' }}>{totalSkills}</div>
                                        <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Skills Shown</div>
                                      </div>
                                    </div>
                                    <div className="col-md-3">
                                      <div className="text-center p-3" style={{ backgroundColor: '#faf5ff', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>{balancedSkills}</div>
                                        <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Balanced Skills</div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Charts based on filter selection */}
                                <div className="row">
                                  {/* Balanced Skills Chart - Show only for 'both' filter */}
                                  {skillsFilter === 'both' && (
                                    <div className="col-md-12">
                                      <div className="text-center mb-3">
                                        <h6 style={{ color: '#8b5cf6', fontWeight: '600' }}>
                                          <i className="bi bi-balance me-2"></i>Balanced Skills (Supply & Demand)
                                        </h6>
                                        <small className="text-muted">Skills that have both freelancer supply and job demand</small>
                                      </div>
                                      <ResponsiveContainer width="100%" height={400}>
                                        <BarChart 
                                          data={balancedSkillsData}
                                          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                                        >
                                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                          <XAxis 
                                            dataKey="skill" 
                                            stroke="#666"
                                            tick={{ fontSize: 12, fill: '#666', fontWeight: '500' }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={100}
                                            interval={0}
                                          />
                                          <YAxis 
                                            stroke="#666"
                                            tick={{ fontSize: 12, fill: '#666' }}
                                            label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#666', fontSize: '14px', fontWeight: '500' } }}
                                          />
                                          <Tooltip 
                                            contentStyle={{ 
                                              backgroundColor: '#fff', 
                                              border: '1px solid #ddd',
                                              borderRadius: '8px',
                                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                              fontSize: '14px'
                                            }}
                                            formatter={(value, name) => {
                                              if (name === 'supply') return [value, 'Supply (Freelancers)'];
                                              if (name === 'demand') return [value, 'Demand (Jobs)'];
                                              return [value, name];
                                            }}
                                            labelFormatter={(label) => `Skill: ${label}`}
                                          />
                                          <Bar 
                                            dataKey="supply" 
                                            fill="#fd680e"
                                            radius={[0, 0, 0, 0]}
                                            stroke="#fd680e"
                                            strokeWidth={1}
                                            name="Supply"
                                          />
                                          <Bar 
                                            dataKey="demand" 
                                            fill="#10b981"
                                            radius={[0, 0, 0, 0]}
                                            stroke="#10b981"
                                            strokeWidth={1}
                                            name="Demand"
                                          />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    </div>
                                  )}

                                  {/* Supply Chart - Show for 'all' and 'supply' filters */}
                                  {(skillsFilter === 'all' || skillsFilter === 'supply') && (
                                    <div className={skillsFilter === 'supply' ? 'col-md-12' : 'col-md-6'}>
                                      <div className="text-center mb-3">
                                        <h6 style={{ color: '#fd680e', fontWeight: '600' }}>
                                          <i className="bi bi-people me-2"></i>Skills Supply (Freelancers)
                                        </h6>
                                      </div>
                                      <ResponsiveContainer width="100%" height={300}>
                                        <BarChart 
                                          data={supplyChartData}
                                          margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                                        >
                                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                          <XAxis 
                                            dataKey="skill" 
                                            stroke="#666"
                                            tick={{ fontSize: 11, fill: '#666', fontWeight: '500' }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={70}
                                            interval={0}
                                          />
                                          <YAxis 
                                            stroke="#666"
                                            tick={{ fontSize: 11, fill: '#666' }}
                                          />
                                          <Tooltip 
                                            contentStyle={{ 
                                              backgroundColor: '#fff', 
                                              border: '1px solid #ddd',
                                              borderRadius: '8px',
                                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                              fontSize: '13px'
                                            }}
                                            formatter={(value) => [value, 'Freelancers']}
                                            labelFormatter={(label) => `Skill: ${label}`}
                                          />
                                          <Bar 
                                            dataKey="count" 
                                            fill="#fd680e"
                                            radius={[4, 4, 0, 0]}
                                            stroke="#fd680e"
                                            strokeWidth={1}
                                          />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    </div>
                                  )}

                                  {/* Demand Chart - Show for 'all' and 'demand' filters */}
                                  {(skillsFilter === 'all' || skillsFilter === 'demand') && (
                                    <div className={skillsFilter === 'demand' ? 'col-md-12' : 'col-md-6'}>
                                      <div className="text-center mb-3">
                                        <h6 style={{ color: '#10b981', fontWeight: '600' }}>
                                          <i className="bi bi-briefcase me-2"></i>Skills Demand (Jobs)
                                        </h6>
                                      </div>
                                      <ResponsiveContainer width="100%" height={300}>
                                        <BarChart 
                                          data={allDemandSkills}
                                          margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                                        >
                                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                          <XAxis 
                                            dataKey="skill" 
                                            stroke="#666"
                                            tick={{ fontSize: 11, fill: '#666', fontWeight: '500' }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={70}
                                            interval={0}
                                          />
                                          <YAxis 
                                            stroke="#666"
                                            tick={{ fontSize: 11, fill: '#666' }}
                                          />
                                          <Tooltip 
                                            contentStyle={{ 
                                              backgroundColor: '#fff', 
                                              border: '1px solid #ddd',
                                              borderRadius: '8px',
                                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                              fontSize: '13px'
                                            }}
                                            formatter={(value) => [value, 'Job Requirements']}
                                            labelFormatter={(label) => `Skill: ${label}`}
                                          />
                                          <Bar 
                                            dataKey="count" 
                                            fill="#10b981"
                                            radius={[4, 4, 0, 0]}
                                            stroke="#10b981"
                                            strokeWidth={1}
                                          />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    </div>
                                  )}
                                </div>

                                {/* Legend - Only show when both charts are visible */}
                                {skillsFilter === 'all' && (
                                  <div className="row mt-3">
                                    <div className="col-12">
                                      <div className="d-flex justify-content-center gap-4">
                                        <div className="d-flex align-items-center">
                                          <div style={{ 
                                            width: '12px', 
                                            height: '12px', 
                                            backgroundColor: '#fd680e', 
                                            marginRight: '8px',
                                            borderRadius: '2px'
                                          }}></div>
                                          <small style={{ color: '#666', fontWeight: '500' }}>Supply (Freelancers)</small>
                                        </div>
                                        <div className="d-flex align-items-center">
                                          <div style={{ 
                                            width: '12px', 
                                            height: '12px', 
                                            backgroundColor: '#10b981', 
                                            marginRight: '8px',
                                            borderRadius: '2px'
                                          }}></div>
                                          <small style={{ color: '#666', fontWeight: '500' }}>Demand (Jobs)</small>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
                  
                  {/* 2. Hired Freelancers Trends - SECOND MOST IMPORTANT */}
                  <div className="row g-4 mb-4">
                    <div className="col-12">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-transparent border-0">
                          <h6 className="mb-0" style={{ color: accent, fontWeight: 600 }}>
                        <i className="bi bi-briefcase me-2"></i>Hired Freelancers Trends
                          </h6>
                        </div>
                        <div className="card-body">
                          {(() => {
                            // Debug: Log the actual data structure
                            console.log('🔍 Hired Freelancers Trends Data:', {
                              exists: !!analyticsData.hiredFreelancersTrends,
                              length: analyticsData.hiredFreelancersTrends?.length,
                              sample: analyticsData.hiredFreelancersTrends?.[0],
                              allData: analyticsData.hiredFreelancersTrends
                            });

                            // Validate data structure
                            if (!analyticsData.hiredFreelancersTrends || analyticsData.hiredFreelancersTrends.length === 0) {
                              return (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                          <div className="text-center text-muted">
                            <i className="bi bi-briefcase display-4"></i>
                            <p className="mt-2">No hiring data available for the selected time period</p>
                              </div>
                            </div>
                              );
                            }

                                                        // Validate that each item has required properties
                            const validData = analyticsData.hiredFreelancersTrends.filter(item => 
                                  item &&
                                  item.date &&
                              typeof item.hires === 'number' && 
                              typeof item.active_hires === 'number' && 
                              typeof item.completed_hires === 'number' && 
                              !isNaN(item.hires) &&
                              !isNaN(item.active_hires) &&
                              !isNaN(item.completed_hires) &&
                              item.hires >= 0 &&
                              item.active_hires >= 0 &&
                              item.completed_hires >= 0 &&
                              item.date !== undefined &&
                              item.hires !== undefined &&
                              item.active_hires !== undefined &&
                              item.completed_hires !== undefined &&
                              item.date !== null &&
                              item.hires !== null &&
                              item.active_hires !== null &&
                              item.completed_hires !== null
                            );

                            console.log('🔍 Valid Hired Freelancers Data:', {
                              originalLength: analyticsData.hiredFreelancersTrends.length,
                              validLength: validData.length,
                              validData: validData
                            });

                                if (validData.length === 0) {
                                  return (
                                    <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                                      <div className="text-center text-muted">
                                        <i className="bi bi-exclamation-triangle display-4"></i>
                                    <p className="mt-2">Invalid hiring data structure</p>
                                <small>Check console for details</small>
                                      </div>
                                    </div>
                                  );
                                }

                            console.log('🔍 Hired Freelancers Chart - About to render with data:', validData);
                                return (
                                  <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={validData}>
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
                                    dataKey="hires" 
                                    stackId="1" 
                                        stroke="#3b82f6" 
                                    fill="#3b82f6" 
                                    fillOpacity={0.6}
                                  />
                                  <Area 
                                        type="monotone" 
                                    dataKey="active_hires" 
                                    stackId="1" 
                                        stroke="#10b981" 
                                    fill="#10b981" 
                                    fillOpacity={0.6}
                                  />
                                  <Area 
                                        type="monotone" 
                                    dataKey="completed_hires" 
                                    stackId="1" 
                                        stroke="#f59e0b" 
                                    fill="#f59e0b" 
                                    fillOpacity={0.6}
                                  />
                                </AreaChart>
                                  </ResponsiveContainer>
                                );
                          })()}
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
                          {(() => {
                            // Debug: Log the actual data structure
                            console.log('🔍 User Type Distribution Data:', {
                              exists: !!analyticsData.userTypeDistribution,
                              length: analyticsData.userTypeDistribution?.length,
                              sample: analyticsData.userTypeDistribution?.[0],
                              allData: analyticsData.userTypeDistribution
                            });

                            // Validate data structure
                            if (!analyticsData.userTypeDistribution || analyticsData.userTypeDistribution.length === 0) {
                              return (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: 250 }}>
                          <div className="text-center text-muted">
                            <i className="bi bi-pie-chart display-4"></i>
                            <p className="mt-2">No user type data available</p>
                          </div>
                        </div>
                              );
                            }

                            // Validate that each item has required properties
                            const validData = analyticsData.userTypeDistribution.filter(item => 
                              item && 
                              typeof item.type === 'string' && 
                              typeof item.count === 'number' && 
                              !isNaN(item.count) &&
                              item.count >= 0 &&
                              item.type !== undefined &&
                              item.count !== undefined &&
                              item.type !== null &&
                              item.count !== null
                            );

                            console.log('🔍 Valid User Type Data:', {
                              originalLength: analyticsData.userTypeDistribution.length,
                              validLength: validData.length,
                              validData: validData
                            });

                            if (validData.length === 0) {
                              return (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: 250 }}>
                                  <div className="text-center text-muted">
                                    <i className="bi bi-exclamation-triangle display-4"></i>
                                    <p className="mt-2">Invalid user type data structure</p>
                                    <small>Check console for details</small>
                                  </div>
                                </div>
                              );
                            }

                            console.log('🔍 FINAL User Type Distribution Data for Chart:', validData);
                            return (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                                    data={validData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                              label={({ type, count }) => `${type}: ${count}`}
                            >
                                    {validData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill || `#${Math.floor(Math.random()*16777215).toString(16)}`} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                            );
                          })()}
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
                          {(() => {
                            // Debug: Log the actual data structure
                            console.log('🔍 User Activity Status Data:', {
                              exists: !!analyticsData.userActivityStatus,
                              length: analyticsData.userActivityStatus?.length,
                              sample: analyticsData.userActivityStatus?.[0],
                              allData: analyticsData.userActivityStatus
                            });

                            // Validate data structure
                            if (!analyticsData.userActivityStatus || analyticsData.userActivityStatus.length === 0) {
                              return (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: 250 }}>
                          <div className="text-center text-muted">
                            <i className="bi bi-activity display-4"></i>
                            <p className="mt-2">No user activity data available</p>
                          </div>
                        </div>
                              );
                            }

                            // Validate that each item has required properties
                            const validData = analyticsData.userActivityStatus.filter(item => 
                              item && 
                              typeof item.status === 'string' && 
                              typeof item.count === 'number' && 
                              !isNaN(item.count) &&
                              item.count >= 0
                            );

                            console.log('🔍 Valid User Activity Data:', {
                              originalLength: analyticsData.userActivityStatus.length,
                              validLength: validData.length,
                              validData: validData
                            });

                            if (validData.length === 0) {
                              return (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: 250 }}>
                                  <div className="text-center text-muted">
                                    <i className="bi bi-exclamation-triangle display-4"></i>
                                    <p className="mt-2">Invalid user activity data structure</p>
                                    <small>Check console for details</small>
                                  </div>
                                </div>
                              );
                            }

                            return (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                                    data={validData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                              label={({ status, count }) => `${status}: ${count}`}
                            >
                                    {validData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill || `#${Math.floor(Math.random()*16777215).toString(16)}`} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                            );
                          })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* CV Upload Trends - Line Chart */}
              <div className="row g-4 mb-4">
                <div className="col-12">
                  <div className="card border-0 shadow-sm" style={{ border: '2px solid red' }}>
                    <div className="card-header bg-transparent border-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0" style={{ color: accent, fontWeight: 600 }}>
                          <i className="bi bi-file-earmark-arrow-up me-2"></i>CV Upload Trends
                        </h6>
                        
                        {/* Date Filter Controls */}
                        <div className="d-flex align-items-center gap-3">
                          <div className="d-flex align-items-center gap-2">
                            <label className="form-label mb-0" style={{ fontSize: '14px', fontWeight: 500 }}>
                              Filter by:
                            </label>
                            <select
                              className="form-select form-select-sm"
                              style={{ width: '120px', fontSize: '13px' }}
                              value={cvUploadDateFilter.type}
                              onChange={(e) => handleCVUploadDateFilterChange('type', e.target.value)}
                            >
                              <option value="days">Days</option>
                              <option value="custom">Custom Range</option>
                            </select>
                          </div>
                          
                          {cvUploadDateFilter.type === 'days' ? (
                            <div className="d-flex align-items-center gap-2">
                              <select
                                className="form-select form-select-sm"
                                style={{ width: '100px', fontSize: '13px' }}
                                value={cvUploadDateFilter.days}
                                onChange={(e) => handleCVUploadDateFilterChange('days', parseInt(e.target.value))}
                              >
                                <option value={7}>7 days</option>
                                <option value={30}>30 days</option>
                                <option value={90}>90 days</option>
                                <option value={180}>6 months</option>
                                <option value={365}>1 year</option>
                              </select>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="date"
                                className="form-control form-control-sm"
                                style={{ width: '140px', fontSize: '13px' }}
                                value={cvUploadDateFilter.startDate}
                                onChange={(e) => handleCVUploadDateFilterChange('startDate', e.target.value)}
                                placeholder="Start Date"
                              />
                              <span style={{ fontSize: '13px', color: '#666' }}>to</span>
                              <input
                                type="date"
                                className="form-control form-control-sm"
                                style={{ width: '140px', fontSize: '13px' }}
                                value={cvUploadDateFilter.endDate}
                                onChange={(e) => handleCVUploadDateFilterChange('endDate', e.target.value)}
                                placeholder="End Date"
                              />
                            </div>
                          )}
                          
                          <button
                            className="btn btn-sm"
                            style={{ 
                              background: cvUploadFilterLoading ? '#ccc' : accent, 
                              color: '#fff', 
                              border: 'none',
                              fontSize: '13px',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: cvUploadFilterLoading ? 'not-allowed' : 'pointer'
                            }}
                            onClick={applyCVUploadDateFilter}
                            disabled={cvUploadFilterLoading}
                            type="button"
                          >
                            {cvUploadFilterLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                Loading...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-funnel me-1"></i>Apply
                              </>
                            )}
                          </button>
                          
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      {(() => {

                            // Validate data structure
                            if (!analyticsData.cvUploadTrends || analyticsData.cvUploadTrends.length === 0) {
                              return (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                                  <div className="text-center text-muted">
                                    <i className="bi bi-file-earmark-arrow-up display-4"></i>
                                    <p className="mt-2">No CV upload data available</p>
                                  </div>
                                </div>
                              );
                            }

                                                        // Validate that each item has required properties
                            const validData = analyticsData.cvUploadTrends.filter(item => 
                            item && 
                            item.date &&
                              typeof item.uploads === 'number' && 
                            !isNaN(item.uploads) &&
                              item.uploads >= 0 &&
                              item.date !== undefined &&
                              item.uploads !== undefined &&
                              item.date !== null &&
                              item.uploads !== null
                            );
                          
                            console.log('🔍 Valid CV Upload Data:', {
                              originalLength: analyticsData.cvUploadTrends.length,
                              validLength: validData.length,
                              validData: validData
                            });

                            if (validData.length === 0) {
                              return (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                                  <div className="text-center text-muted">
                                    <i className="bi bi-exclamation-triangle display-4"></i>
                                    <p className="mt-2">Invalid CV upload data structure</p>
                                    <small>Check console for details</small>
                                  </div>
                                </div>
                              );
                          }
                          
                                                      console.log('🔍 CV Upload Chart - About to render with data:', validData);
                            console.log('🔍 Chart data keys:', validData.length > 0 ? Object.keys(validData[0]) : 'No data');
                            console.log('🔍 First data item:', validData[0]);
                          return (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={validData} key={validData.length}>
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
                                  stroke="#fd680e" 
                                  fill="#fd680e" 
                                  fillOpacity={0.6}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              
                  {/* ================================== */}
                  {/* TIER 2: TALENT ACQUISITION INSIGHTS */}
                  {/* ================================== */}
                  
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
                      {(() => {
                            // Debug: Log the actual data structure
                            console.log('🔍 Communication Trends Data:', {
                              exists: !!analyticsData.messageTrends,
                              length: analyticsData.messageTrends?.length,
                              sample: analyticsData.messageTrends?.[0],
                              allData: analyticsData.messageTrends
                            });

                            // Validate data structure
                            if (!analyticsData.messageTrends || analyticsData.messageTrends.length === 0) {
                              return (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                                  <div className="text-center text-muted">
                                    <i className="bi bi-chat-dots display-4"></i>
                                    <p className="mt-2">No message trends data available</p>
                                  </div>
                                </div>
                              );
                            }

                            // Validate that each item has required properties
                            const validData = analyticsData.messageTrends.filter(item => 
                              item && 
                              item.date && 
                              typeof item.messages === 'number' && 
                              typeof item.conversations === 'number' && 
                              !isNaN(item.messages) &&
                              !isNaN(item.conversations) &&
                              item.messages >= 0 &&
                              item.conversations >= 0 &&
                              item.date !== undefined &&
                              item.messages !== undefined &&
                              item.conversations !== undefined &&
                              item.date !== null &&
                              item.messages !== null &&
                              item.conversations !== null
                            );

                            console.log('🔍 Valid Communication Trends Data:', {
                              originalLength: analyticsData.messageTrends.length,
                              validLength: validData.length,
                              validData: validData
                            });

                            if (validData.length === 0) {
                              return (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                                  <div className="text-center text-muted">
                                    <i className="bi bi-exclamation-triangle display-4"></i>
                                    <p className="mt-2">Invalid message trends data structure</p>
                                    <small>Check console for details</small>
                                  </div>
                                </div>
                              );
                            }
                            
                            console.log('🔍 Communication Trends Chart - About to render with data:', validData);
                            return (
                              <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={validData}>
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
                                  <Line 
                                    type="monotone" 
                                    dataKey="messages" 
                                    stroke="#fd680e" 
                                    strokeWidth={3}
                                    dot={{ fill: '#fd680e', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#fd680e', strokeWidth: 2, fill: '#fff' }}
                                    name="Messages"
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="conversations" 
                                    stroke="#10b981" 
                                    strokeWidth={2}
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                                    activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                                    name="Conversations"
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            );
                          })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* ================================== */}
              {/* TIER 3: GROWTH & TREND ANALYSIS */}
              {/* ================================== */}
              
              {/* User Registration Trends - Line Chart */}
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
                          <div className="spinner-border style={{ color: '#ffd7c2' }}" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : analyticsData.registrationTrends && analyticsData.registrationTrends.length > 0 ? (
                          (() => {
                            // Validate registration trends data
                            const validData = analyticsData.registrationTrends.filter(item =>
                              item &&
                              item.date &&
                              typeof item.total_users === 'number' &&
                              !isNaN(item.total_users) &&
                              item.total_users >= 0
                            );

                            if (validData.length === 0) {
                              return (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                                  <div className="text-center text-muted">
                                    <i className="bi bi-exclamation-triangle display-4"></i>
                                    <p className="mt-2">No valid registration data available</p>
                                  </div>
                                </div>
                              );
                            }

                            console.log('🔍 Registration Trends Chart - Rendering with data:', validData);
                            return (
                              <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={validData}>
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
                                  <Line 
                                    type="monotone" 
                                    dataKey="total_users" 
                                    stroke="#fd680e" 
                                    strokeWidth={3}
                                    dot={{ fill: '#fd680e', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#fd680e', strokeWidth: 2, fill: '#fff' }}
                                    name="Total Users"
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="associates" 
                                    stroke="#3b82f6" 
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                                    activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                                    name="Associates"
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="freelancers" 
                                    stroke="#10b981" 
                                    strokeWidth={2}
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                                    activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                                    name="Freelancers"
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="admins" 
                                    stroke="#8b5cf6" 
                                    strokeWidth={2}
                                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                                    activeDot={{ r: 5, stroke: '#8b5cf6', strokeWidth: 2, fill: '#fff' }}
                                    name="Admins"
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="ecs_employees" 
                                    stroke="#f59e0b" 
                                    strokeWidth={2}
                                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                                    activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }}
                                    name="ECS Employees"
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            );
                          })()
                      ) : (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                          <div className="text-center text-muted">
                            <i className="bi bi-graph-up display-4"></i>
                            <p className="mt-2">No registration data available for the selected time period</p>
                          </div>
                        </div>
                      )}
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
                      {(() => {
                            // Debug: Log the actual data structure
                            console.log('🔍 User Communication Activity Data:', {
                              exists: !!analyticsData.userCommunicationActivity,
                              length: analyticsData.userCommunicationActivity?.length,
                              sample: analyticsData.userCommunicationActivity?.[0],
                              demandData: demandData
                            });

                            // Check if we have any data
                            if (supplyData.length === 0 && demandData.length === 0) {
                              return (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                                  <div className="text-center text-muted">
                                    <i className="bi bi-bar-chart display-4"></i>
                                    <p className="mt-2">No skills data available</p>
                                  </div>
                                </div>
                              );
                            }

                            // Create a combined dataset with both supply and demand
                            const skillMap = new Map();
                            
                            // Add supply data
                            console.log('🔍 Processing Supply Data:', supplyData);
                            supplyData.forEach(item => {
                              if (item && item.skill && (typeof item.count === 'number' || !isNaN(parseInt(item.count)))) {
                                const skill = item.skill.toLowerCase();
                                const count = parseInt(item.count);
                                console.log(`🔍 Adding supply skill: "${skill}" with count: ${count}`);
                                skillMap.set(skill, {
                                  skill: item.skill,
                                  supply: count,
                                  demand: 0,
                                  fill: item.fill || '#fd680e'
                                });
                              }
                            });

                            // Add demand data
                            console.log('🔍 Processing Demand Data:', demandData);
                            demandData.forEach(item => {
                              if (item && item.skill && (typeof item.count === 'number' || !isNaN(parseInt(item.count)))) {
                                const skill = item.skill.toLowerCase();
                                const count = parseInt(item.count);
                                console.log(`🔍 Processing demand skill: "${skill}" with count: ${count}`);
                                
                                // Try to find matching skill in supply data
                                let matchedSkill = null;
                                for (const [existingSkill, data] of skillMap.entries()) {
                                  if (skill === existingSkill || 
                                      skill.includes(existingSkill) || 
                                      existingSkill.includes(skill) ||
                                      skill.replace(/[^a-z]/g, '') === existingSkill.replace(/[^a-z]/g, '')) {
                                    matchedSkill = existingSkill;
                                    console.log(`🔍 Matched skill: "${skill}" -> "${existingSkill}"`);
                                    break;
                                  }
                                }
                                
                                if (matchedSkill) {
                                  skillMap.get(matchedSkill).demand = count;
                                } else {
                                  console.log(`🔍 No match found for skill: "${skill}", adding as new skill`);
                                  skillMap.set(skill, {
                                    skill: item.skill,
                                    supply: 0,
                                    demand: count,
                                    fill: item.fill || '#10b981'
                                  });
                                }
                              }
                            });

                            // Convert to array and apply filters
                            let filteredData = Array.from(skillMap.values())
                              .map(item => ({
                                ...item,
                                total: item.supply + item.demand,
                                imbalance: Math.abs(item.supply - item.demand)
                              }));

                            // Apply filters
                            if (skillsFilter === 'supply') {
                              filteredData = filteredData.filter(item => item.supply > 0);
                            } else if (skillsFilter === 'demand') {
                              filteredData = filteredData.filter(item => item.demand > 0);
                            } else if (skillsFilter === 'both') {
                              // Show skills that have both supply and demand (balanced market)
                              filteredData = filteredData.filter(item => item.supply > 0 && item.demand > 0);
                            }

                            // Sort and limit
                            const combinedData = filteredData
                              .sort((a, b) => b.total - a.total)
                              .slice(0, skillsLimit);

                            console.log('🔍 Combined Skills Data:', combinedData);
                            console.log('🔍 Skill Map Entries:', Array.from(skillMap.entries()));
                            console.log('🔍 Filtered Data Before Limit:', filteredData);
                            console.log('🔍 Skills Filter:', skillsFilter);
                            console.log('🔍 Skills Limit:', skillsLimit);

                            if (combinedData.length === 0) {
                          return (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                                  <div className="text-center text-muted">
                                    <i className="bi bi-exclamation-triangle display-4"></i>
                                    <p className="mt-2">No skills match the selected filter</p>
                                  </div>
                            </div>
                          );
                        }
                          
                            // Create separate datasets for supply and demand
                            const supplyChartData = combinedData
                              .filter(item => item.supply > 0)
                              .map(item => ({
                                skill: item.skill,
                                count: item.supply,
                                type: 'Supply',
                                color: '#fd680e'
                              }));

                            // Get all demand skills, not just from combinedData
                            const allDemandSkills = Array.from(skillMap.values())
                              .filter(item => item.demand > 0)
                              .sort((a, b) => b.demand - a.demand)
                              .slice(0, skillsLimit)
                              .map(item => ({
                                skill: item.skill,
                                count: item.demand,
                                type: 'Demand',
                                color: '#10b981'
                              }));

                            // Get balanced skills (skills that have both supply and demand)
                            const balancedSkillsData = Array.from(skillMap.values())
                              .filter(item => item.supply > 0 && item.demand > 0)
                              .sort((a, b) => (b.supply + b.demand) - (a.supply + a.demand))
                              .slice(0, skillsLimit)
                              .map(item => ({
                                skill: item.skill,
                                supply: item.supply,
                                demand: item.demand,
                                total: item.supply + item.demand,
                                type: 'Balanced',
                                supplyColor: '#fd680e',
                                demandColor: '#10b981'
                              }));

                            console.log('🔍 Supply Chart Data:', supplyChartData);
                            console.log('🔍 Demand Chart Data:', allDemandSkills);
                            console.log('🔍 Balanced Skills Data:', balancedSkillsData);
                            
                            // Calculate summary statistics
                            const totalSupply = Array.from(skillMap.values()).reduce((sum, item) => sum + item.supply, 0);
                            const totalDemand = Array.from(skillMap.values()).reduce((sum, item) => sum + item.demand, 0);
                            const totalSkills = Array.from(skillMap.values()).length;
                            const balancedSkills = Array.from(skillMap.values()).filter(item => item.supply > 0 && item.demand > 0).length;
                            
                            console.log('📊 Summary Statistics:', {
                              totalSupply,
                              totalDemand,
                              totalSkills,
                              balancedSkills,
                              skillsShown: Math.min(totalSkills, skillsLimit)
                            });

                          return (
                              <div>
                                {/* Legend - Only show when both charts are visible */}
                                {(skillsFilter === 'all' || skillsFilter === 'both') && (
                                  <div className="d-flex justify-content-center mb-4">
                                    <div className="d-flex gap-4">
                                      <div className="d-flex align-items-center">
                                        <div 
                                          style={{ 
                                            width: '20px', 
                                            height: '20px', 
                                            backgroundColor: '#fd680e', 
                                            borderRadius: '4px',
                                            marginRight: '8px'
                                          }}
                                        ></div>
                                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>Supply (Freelancers)</span>
                                      </div>
                                      <div className="d-flex align-items-center">
                                        <div 
                                          style={{ 
                                            width: '20px', 
                                            height: '20px', 
                                            backgroundColor: '#10b981', 
                                            borderRadius: '4px',
                                            marginRight: '8px'
                                          }}
                                        ></div>
                                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>Demand (Jobs)</span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Charts based on filter selection */}
                                <div className="row">
                                  {/* Balanced Skills Chart - Show only for 'both' filter */}
                                  {skillsFilter === 'both' && (
                                    <div className="col-md-12">
                                      <div className="text-center mb-3">
                                        <h6 style={{ color: '#8b5cf6', fontWeight: '600' }}>
                                          <i className="bi bi-balance me-2"></i>Balanced Skills (Supply & Demand)
                                        </h6>
                                        <small className="text-muted">Skills that have both freelancer supply and job demand</small>
                                      </div>
                                      <ResponsiveContainer width="100%" height={400}>
                              <BarChart 
                                          data={balancedSkillsData}
                                          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                  dataKey="skill" 
                                  stroke="#666"
                                            tick={{ fontSize: 12, fill: '#666', fontWeight: '500' }}
                                  angle={-45}
                                  textAnchor="end"
                                            height={100}
                                  interval={0}
                                />
                                <YAxis 
                                  stroke="#666"
                                  tick={{ fontSize: 12, fill: '#666' }}
                                            label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#666', fontSize: '14px', fontWeight: '500' } }}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: '#fff', 
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                              fontSize: '14px'
                                            }}
                                            formatter={(value, name) => {
                                              if (name === 'supply') return [value, 'Supply (Freelancers)'];
                                              if (name === 'demand') return [value, 'Demand (Jobs)'];
                                              return [value, name];
                                            }}
                                            labelFormatter={(label) => `Skill: ${label}`}
                                          />
                                          <Bar 
                                            dataKey="supply" 
                                            fill="#fd680e"
                                            radius={[0, 0, 0, 0]}
                                            stroke="#fd680e"
                                            strokeWidth={1}
                                            name="Supply"
                                          />
                                          <Bar 
                                            dataKey="demand" 
                                            fill="#10b981"
                                            radius={[0, 0, 0, 0]}
                                            stroke="#10b981"
                                            strokeWidth={1}
                                            name="Demand"
                                          />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    </div>
                                  )}

                                  {/* Supply Chart - Show for 'all' and 'supply' filters */}
                                  {(skillsFilter === 'all' || skillsFilter === 'supply') && (
                                    <div className={skillsFilter === 'supply' ? 'col-md-12' : 'col-md-6'}>
                                      <div className="text-center mb-3">
                                        <h6 style={{ color: '#fd680e', fontWeight: '600' }}>
                                          <i className="bi bi-people me-2"></i>Skills Supply (Freelancers)
                                        </h6>
                                      </div>
                                      <ResponsiveContainer width="100%" height={300}>
                                        <BarChart 
                                          data={supplyChartData}
                                          margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                                        >
                                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                          <XAxis 
                                            dataKey="skill" 
                                            stroke="#666"
                                            tick={{ fontSize: 11, fill: '#666', fontWeight: '500' }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={70}
                                            interval={0}
                                          />
                                          <YAxis 
                                            stroke="#666"
                                            tick={{ fontSize: 11, fill: '#666' }}
                                          />
                                          <Tooltip 
                                            contentStyle={{ 
                                              backgroundColor: '#fff', 
                                              border: '1px solid #ddd',
                                              borderRadius: '8px',
                                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                              fontSize: '13px'
                                            }}
                                            formatter={(value) => [value, 'Freelancers']}
                                  labelFormatter={(label) => `Skill: ${label}`}
                                />
                                <Bar 
                                  dataKey="count" 
                                  fill="#fd680e"
                                  radius={[4, 4, 0, 0]}
                                  stroke="#fd680e"
                                  strokeWidth={1}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                                    </div>
                                  )}

                                  {/* Demand Chart - Show for 'all' and 'demand' filters */}
                                  {(skillsFilter === 'all' || skillsFilter === 'demand') && (
                                    <div className={skillsFilter === 'demand' ? 'col-md-12' : 'col-md-6'}>
                                      <div className="text-center mb-3">
                                        <h6 style={{ color: '#10b981', fontWeight: '600' }}>
                                          <i className="bi bi-briefcase me-2"></i>Skills Demand (Jobs)
                                        </h6>
                                      </div>
                                      <ResponsiveContainer width="100%" height={300}>
                                        <BarChart 
                                          data={allDemandSkills}
                                          margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                                        >
                                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                          <XAxis 
                                            dataKey="skill" 
                                            stroke="#666"
                                            tick={{ fontSize: 11, fill: '#666', fontWeight: '500' }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={70}
                                            interval={0}
                                          />
                                          <YAxis 
                                            stroke="#666"
                                            tick={{ fontSize: 11, fill: '#666' }}
                                          />
                                          <Tooltip 
                                            contentStyle={{ 
                                              backgroundColor: '#fff', 
                                              border: '1px solid #ddd',
                                              borderRadius: '8px',
                                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                              fontSize: '13px'
                                            }}
                                            formatter={(value) => [value, 'Job Requirements']}
                                            labelFormatter={(label) => `Skill: ${label}`}
                                          />
                                          <Bar 
                                            dataKey="count" 
                                            fill="#10b981"
                                            radius={[4, 4, 0, 0]}
                                            stroke="#10b981"
                                            strokeWidth={1}
                                          />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    </div>
                                  )}
                                </div>

                                {/* Summary Stats */}
                                <div className="row mt-4">
                                  <div className="col-md-3">
                                    <div className="text-center p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                      <h6 className="mb-1" style={{ color: '#fd680e' }}>{totalSupply}</h6>
                                      <small className="text-muted">Total Supply</small>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="text-center p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                      <h6 className="mb-1" style={{ color: '#10b981' }}>{totalDemand}</h6>
                                      <small className="text-muted">Total Demand</small>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="text-center p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                      <h6 className="mb-1" style={{ color: '#6b7280' }}>{Math.min(totalSkills, skillsLimit)}</h6>
                                      <small className="text-muted">Skills Shown</small>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="text-center p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                      <h6 className="mb-1" style={{ color: '#8b5cf6' }}>{balancedSkills}</h6>
                                      <small className="text-muted">Balanced Skills</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                          );
                      })()}
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
                      {(() => {
                            // Debug: Log the actual data structure
                            console.log('🔍 Communication Trends Data:', {
                              exists: !!analyticsData.messageTrends,
                              length: analyticsData.messageTrends?.length,
                              sample: analyticsData.messageTrends?.[0],
                              allData: analyticsData.messageTrends
                            });

                            // Validate data structure
                            if (!analyticsData.messageTrends || analyticsData.messageTrends.length === 0) {
                              return (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                                  <div className="text-center text-muted">
                                    <i className="bi bi-chat-dots display-4"></i>
                                    <p className="mt-2">No message trends data available</p>
                                  </div>
                                </div>
                              );
                            }

                                                        // Validate that each item has required properties
                            const validData = analyticsData.messageTrends.filter(item => 
                            item && 
                              item.date && 
                            typeof item.messages === 'number' && 
                            typeof item.conversations === 'number' && 
                              !isNaN(item.messages) &&
                              !isNaN(item.conversations) &&
                              item.messages >= 0 &&
                              item.conversations >= 0 &&
                              item.date !== undefined &&
                              item.messages !== undefined &&
                              item.conversations !== undefined &&
                              item.date !== null &&
                              item.messages !== null &&
                              item.conversations !== null
                            );

                            console.log('🔍 Valid Communication Trends Data:', {
                              originalLength: analyticsData.messageTrends.length,
                              validLength: validData.length,
                              validData: validData
                            });

                            if (validData.length === 0) {
                          return (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                                  <div className="text-center text-muted">
                                    <i className="bi bi-exclamation-triangle display-4"></i>
                                    <p className="mt-2">Invalid communication trends data structure</p>
                              <small>Check console for details</small>
                                  </div>
                            </div>
                          );
                        }
                          
                                                      console.log('🔍 Communication Trends Chart - About to render with data:', validData);
                          return (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={validData}>
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
                          );
                      })()}
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
                      {(() => {
                            // Debug: Log the actual data structure
                            console.log('🔍 User Communication Activity Data:', {
                              exists: !!analyticsData.userCommunicationActivity,
                              length: analyticsData.userCommunicationActivity?.length,
                              sample: analyticsData.userCommunicationActivity?.[0],
                              allData: analyticsData.userCommunicationActivity
                            });

                            // Validate data structure
                            if (!analyticsData.userCommunicationActivity || analyticsData.userCommunicationActivity.length === 0) {
                              return (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                                  <div className="text-center text-muted">
                                    <i className="bi bi-people display-4"></i>
                                    <p className="mt-2">No communication activity data available</p>
                                  </div>
                                </div>
                              );
                            }

                                                        // Validate that each item has required properties
                            const validData = analyticsData.userCommunicationActivity.filter(item => 
                            item && 
                              typeof item.user === 'string' && 
                            typeof item.messages === 'number' && 
                            typeof item.conversations === 'number' && 
                              !isNaN(item.messages) &&
                              !isNaN(item.conversations) &&
                              item.messages >= 0 &&
                              item.conversations >= 0 &&
                              item.user !== undefined &&
                              item.messages !== undefined &&
                              item.conversations !== undefined &&
                              item.user !== null &&
                              item.messages !== null &&
                              item.conversations !== null
                            );

                            console.log('🔍 Valid User Communication Activity Data:', {
                              originalLength: analyticsData.userCommunicationActivity.length,
                              validLength: validData.length,
                              validData: validData
                            });

                            if (validData.length === 0) {
                          return (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                                  <div className="text-center text-muted">
                                    <i className="bi bi-exclamation-triangle display-4"></i>
                                    <p className="mt-2">Invalid communication activity data structure</p>
                              <small>Check console for details</small>
                                  </div>
                            </div>
                          );
                        }
                          
                                                      console.log('🔍 User Communication Activity Chart - About to render with data:', validData);
                            console.log('🔍 Chart data structure check:', validData.map(item => ({
                              user: item.user,
                              messages: item.messages,
                              conversations: item.conversations,
                              messagesType: typeof item.messages,
                              conversationsType: typeof item.conversations
                            })));
                            
                            return (
                              <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={validData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                      dataKey="user" 
                                      stroke="#666" 
                                      angle={-45} 
                                      textAnchor="end" 
                                      height={80}
                                      interval={0}
                                    />
                                    <YAxis stroke="#666" />
                                    <Tooltip 
                                      contentStyle={{ 
                                        backgroundColor: '#fff', 
                                        border: '1px solid #ddd',
                                        borderRadius: '8px'
                                      }}
                                      formatter={(value, name) => {
                                        console.log('🔍 Tooltip formatter - name:', name, 'value:', value);
                                        if (name === 'messages') {
                                          return [`${value} messages`, 'Messages'];
                                        } else if (name === 'conversations') {
                                          return [`${value} conversations`, 'Conversations'];
                                        } else {
                                          return [value, name];
                                        }
                                      }}
                                    />
                                    <Bar dataKey="messages" fill="#fd680e" name="messages" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="conversations" fill="#10b981" name="conversations" radius={[4, 4, 0, 0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            );
                      })()}
                </div>
              </div>
            </div>
              </div>

              {/* Interview Feedback Analytics Section */}
              <div className="row g-4 mb-4 mt-5">
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1" style={{ color: accent, fontWeight: 600 }}>
                            <i className="bi bi-chat-square-text me-2"></i>Interview Feedback Analytics
                          </h6>
                          <small className="text-muted">Performance insights from interview feedback</small>
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                          <select 
                            className="form-select form-select-sm" 
                            style={{ width: '120px' }}
                            value={interviewTimeRange}
                            onChange={(e) => setInterviewTimeRange(e.target.value)}
                          >
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                            <option value="180">Last 6 Months</option>
                          </select>
                          <button 
                            className="btn btn-sm"
                            onClick={fetchInterviewAnalytics}
                            disabled={interviewAnalyticsLoading}
                            style={{ 
                              backgroundColor: '#ffd7c2',
                              borderColor: '#ffd7c2',
                              color: '#8b4513',
                              transition: 'all 0.3s ease-in-out',
                              transform: 'scale(1)'
                            }}
                            onMouseEnter={(e) => {
                              if (!interviewAnalyticsLoading) {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.backgroundColor = '#ffc299';
                                e.target.style.boxShadow = '0 4px 12px rgba(255, 215, 194, 0.4)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!interviewAnalyticsLoading) {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.backgroundColor = '#ffd7c2';
                                e.target.style.boxShadow = 'none';
                              }
                            }}
                            onMouseDown={(e) => {
                              if (!interviewAnalyticsLoading) {
                                e.target.style.transform = 'scale(0.95)';
                              }
                            }}
                            onMouseUp={(e) => {
                              if (!interviewAnalyticsLoading) {
                                e.target.style.transform = 'scale(1.05)';
                              }
                            }}
                          >
                            {interviewAnalyticsLoading ? 'Loading...' : 'Refresh'}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="card-body">
                      {interviewAnalyticsError && (
                        <div className="alert alert-warning mb-3">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          {interviewAnalyticsError}
                        </div>
                      )}

                      {interviewAnalyticsLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
                          <div className="spinner-border style={{ color: '#ffd7c2' }}" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : interviewAnalytics ? (
                        <>
                          {/* Overview Stats */}
                          <div className="row g-3 mb-4">
                            <div className="col-md-3 col-6">
                              <div className="card border-0 bg-light h-100">
                                <div className="card-body text-center p-3">
                                  <div className="h4 mb-1" style={{ color: accent }}>
                                    {interviewAnalytics.overview?.total_interviews || 0}
                                  </div>
                                  <div className="small text-muted">Total Interviews</div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3 col-6">
                              <div className="card border-0 bg-light h-100">
                                <div className="card-body text-center p-3">
                                  <div className="h4 mb-1 text-success">
                                    {interviewAnalytics.overview?.completion_rate || 0}%
                                  </div>
                                  <div className="small text-muted">Completion Rate</div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3 col-6">
                              <div className="card border-0 bg-light h-100">
                                <div className="card-body text-center p-3">
                                  <div className="h4 mb-1" style={{ color: '#28a745' }}>
                                    {interviewAnalytics.overview?.hire_rate || 0}%
                                  </div>
                                  <div className="small text-muted">Hire Rate</div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3 col-6">
                              <div className="card border-0 bg-light h-100">
                                <div className="card-body text-center p-3">
                                  <div className="h4 mb-1" style={{ color: '#ffc107' }}>
                                    {interviewAnalytics.overview?.avg_overall_rating || 0}/5
                                  </div>
                                  <div className="small text-muted">Avg Rating</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Charts Row */}
                          <div className="row g-4">
                            {/* Hiring Recommendations Chart */}
                            <div className="col-md-6">
                              <h6 className="mb-3">Hiring Recommendations</h6>
                              {interviewAnalytics.recommendationDistribution && interviewAnalytics.recommendationDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                  <PieChart>
                                    <Pie
                                      data={interviewAnalytics.recommendationDistribution.map(item => ({
                                        name: item.recommendation === 'hire' ? 'Hire' : 
                                              item.recommendation === 'no_hire' ? 'No Hire' : 'Maybe',
                                        value: parseInt(item.count),
                                        percentage: parseFloat(item.percentage)
                                      }))}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="value"
                                    >
                                      {interviewAnalytics.recommendationDistribution.map((entry, index) => (
                                        <Cell 
                                          key={`cell-${index}`} 
                                          fill={entry.recommendation === 'hire' ? '#28a745' : 
                                                entry.recommendation === 'no_hire' ? '#dc3545' : '#ffc107'} 
                                        />
                                      ))}
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="text-center py-4 text-muted">
                                  <i className="bi bi-pie-chart display-4"></i>
                                  <p className="mt-2">No recommendation data available</p>
                                </div>
                              )}
                            </div>

                            {/* Rating Breakdown Chart */}
                            <div className="col-md-6">
                              <h6 className="mb-3">Average Ratings by Category</h6>
                              {interviewAnalytics.ratingBreakdown && Object.keys(interviewAnalytics.ratingBreakdown).length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                  <BarChart 
                                    data={[
                                      { category: 'Technical', rating: parseFloat(interviewAnalytics.ratingBreakdown.avg_technical_skills) || 0 },
                                      { category: 'Communication', rating: parseFloat(interviewAnalytics.ratingBreakdown.avg_communication) || 0 },
                                      { category: 'Cultural Fit', rating: parseFloat(interviewAnalytics.ratingBreakdown.avg_cultural_fit) || 0 },
                                      { category: 'Overall', rating: parseFloat(interviewAnalytics.ratingBreakdown.avg_overall) || 0 }
                                    ]}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                      dataKey="category" 
                                      stroke="#666" 
                                      interval={0}
                                      angle={0}
                                      textAnchor="middle"
                                      height={60}
                                    />
                                    <YAxis domain={[0, 5]} stroke="#666" />
                                    <Tooltip formatter={(value) => [`${value}/5`, 'Rating']} />
                                    <Bar dataKey="rating" fill={accent} radius={[4, 4, 0, 0]} />
                                  </BarChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="text-center py-4 text-muted">
                                  <i className="bi bi-bar-chart display-4"></i>
                                  <p className="mt-2">No rating data available</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-5">
                          <i className="bi bi-chat-square-text display-4 text-muted"></i>
                          <h6 className="text-muted mt-3">No Interview Data Available</h6>
                          <p className="text-muted">Interview feedback analytics will appear here once interviews are conducted and feedback is submitted.</p>
                          <button 
                            className="btn "
                            onClick={fetchInterviewAnalytics}
                          >
                            <i className="bi bi-arrow-clockwise me-1"></i>Check for Data
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

                </>
              )}
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
                    className="btn btn-sm"
                    onClick={() => generateComprehensiveReport()}
                    disabled={reportsLoading}
                    style={{ 
                      backgroundColor: '#ffd7c2',
                      borderColor: '#ffd7c2',
                      color: '#8b4513',
                      transition: 'all 0.3s ease-in-out',
                      transform: 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                      if (!reportsLoading) {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.backgroundColor = '#ffc299';
                        e.target.style.boxShadow = '0 4px 12px rgba(255, 215, 194, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!reportsLoading) {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.backgroundColor = '#ffd7c2';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                    onMouseDown={(e) => {
                      if (!reportsLoading) {
                        e.target.style.transform = 'scale(0.95)';
                      }
                    }}
                    onMouseUp={(e) => {
                      if (!reportsLoading) {
                        e.target.style.transform = 'scale(1.05)';
                      }
                    }}
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
                                          <span className={`badge ${alert.severity === 'high' ? 'bg-danger' :
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
                                                <span className={`badge ${user.user_type === 'associate' ? 'bg-primary' : 'bg-success'
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
                                                <span className={`badge ${riskLevel === 'High' ? 'bg-danger' :
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


      {/* Freelancer Notes Modal */}
        {
          freelancerNotesModal && (
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
                  className="btn" 
                  onClick={saveFreelancerNotes}
                  disabled={notesLoading}
                  style={{ 
                    backgroundColor: '#ffd7c2',
                    borderColor: '#ffd7c2',
                    color: '#8b4513',
                    transition: 'all 0.3s ease-in-out',
                    transform: 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!notesLoading) {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.backgroundColor = '#ffc299';
                      e.target.style.boxShadow = '0 4px 12px rgba(255, 215, 194, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!notesLoading) {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.backgroundColor = '#ffd7c2';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                  onMouseDown={(e) => {
                    if (!notesLoading) {
                      e.target.style.transform = 'scale(0.95)';
                    }
                  }}
                  onMouseUp={(e) => {
                    if (!notesLoading) {
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                >
                  {notesLoading ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
          )
        }

      {/* Freelancer Request Details Modal */}
        {
          showFreelancerRequestDetailsModal && selectedFreelancerRequest && (
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
                          <span className={`badge ms-2 ${selectedFreelancerRequest.status === 'pending' ? 'bg-warning' :
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
                    <p><strong>Company:</strong> {selectedFreelancerRequest.company_name || 'N/A'}</p>
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
          )
        }

      {/* Recommendations Modal */}
        {
          showRecommendationsModal && selectedFreelancerRequest && (
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
                                <strong>Required Skills:</strong><br />
                            {selectedFreelancerRequest.required_skills.join(', ')}
                          </small>
                        </div>
                        <div className="col-md-3">
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                                <strong>Min Experience:</strong><br />
                            {selectedFreelancerRequest.min_experience}+ years
                          </small>
                        </div>
                        <div className="col-md-3">
                          <small className="text-muted">
                            <i className="bi bi-geo-alt me-1"></i>
                                <strong>Location:</strong><br />
                            {selectedFreelancerRequest.preferred_location || 'Any'}
                          </small>
                        </div>
                        <div className="col-md-3">
                          <small className="text-muted">
                            <i className="bi bi-currency-dollar me-1"></i>
                                <strong>Budget:</strong><br />
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
                        className="btn btn-sm"
                        onClick={resetSearch}
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
                        Reset Search
                      </button>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {availableFreelancers.map((freelancer) => (
                        <div key={freelancer.freelancer_id} className="col-md-6">
                              <div className={`card border-2 h-100 ${selectedFreelancers.includes(freelancer.freelancer_id)
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
                                <div className="d-flex gap-1 mb-2 flex-wrap">
                                  <span className={`badge ${freelancer.is_available ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '10px' }}>
                                    {freelancer.is_available ? 'Available' : 'Unavailable'}
                            </span>
                                  <span className={`badge ${freelancer.is_approved ? 'bg-primary' : 'bg-warning'}`} style={{ fontSize: '10px' }}>
                                    {freelancer.is_approved ? 'Approved' : 'Pending'}
                                  </span>
                                  {freelancer.hourly_rate && (
                                    <span className="badge" style={{ 
                                      backgroundColor: '#fff3cd', 
                                      color: '#856404', 
                                      fontSize: '10px' 
                                    }}>
                                      <i className="bi bi-currency-exchange me-1"></i>
                                      R{freelancer.hourly_rate}/hr
                                    </span>
                                  )}
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
          )
        }

      {/* Animation Styles */}
        <style>
          {`
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
        

      `}
        </style>



      {/* Security Component Functions */}
      {/* Security Dashboard Component */}
        {
          activeSecuritySection === 'dashboard' && (
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
                                  <span className={`badge ${login.status === 'success' ? 'bg-success' : 'bg-danger'
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
          )
        }

      {/* Communication Analysis Component */}
        {
          activeSecuritySection === 'communications' && (
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
                    <div className="spinner-border style={{ color: '#ffd7c2' }}" role="status">
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
                                  <span className={`badge ${message.flag_reason === 'spam' ? 'bg-warning' :
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
          )
        }

      {/* Audit Log Component */}
        {
          activeSecuritySection === 'audit' && (
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
                              <span className={`badge ${entry.severity === 'HIGH' ? 'bg-danger' :
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
          )
        }

      {/* Threat Intelligence Component */}
        {
          activeSecuritySection === 'threats' && (
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
                              <span className={`badge ${threat.severity === 'HIGH' ? 'bg-danger' :
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
          )
        }

      {/* Auto-fetch security data when section changes */}
        {
          activeSecuritySection && !securityData[activeSecuritySection] && (
        <div className="text-center py-4">
          <button 
            className="btn"
            onClick={() => fetchSecurityData(activeSecuritySection)}
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
            <i className="bi bi-download me-2"></i>
            Load {activeSecuritySection.charAt(0).toUpperCase() + activeSecuritySection.slice(1)} Data
          </button>
        </div>
          )
        }

      {/* Auto-generate reports when report section changes */}
        {
          activeReportSection && !reportsData[activeReportSection] && (
        <div className="text-center py-4">
          <button 
            className="btn"
            onClick={() => generateComprehensiveReport()}
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
            <i className="bi bi-download me-2"></i>
            Load Report Data
          </button>
        </div>
          )
        }
      </div>
    </div>
  );
}
export default ESCAdminDashboard; 