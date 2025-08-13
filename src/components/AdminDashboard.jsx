import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line } from 'recharts';

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

  // Reports & Documentation states
  const [reportsData, setReportsData] = useState({
    security: null,
    performance: null,
    business: null
  });
  const [reportsLoading, setReportsLoading] = useState({
    security: false,
    performance: false,
    business: false
  });
  const [reportsError, setReportsError] = useState({
    security: '',
    performance: '',
    business: ''
  });
  const [activeReportTab, setActiveReportTab] = useState('security');
  const [reportTimeRange, setReportTimeRange] = useState('30d');
  const [lastReportsUpdate, setLastReportsUpdate] = useState(null);

  // Enhanced Security states
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageDetails, setMessageDetails] = useState(null);
  const [messageDetailsLoading, setMessageDetailsLoading] = useState(false);
  const [flagMessageModal, setFlagMessageModal] = useState(false);
  const [blockUserModal, setBlockUserModal] = useState(false);
  const [selectedUserForBlock, setSelectedUserForBlock] = useState(null);
  const [securityAuditLog, setSecurityAuditLog] = useState([]);
  const [auditLogLoading, setAuditLogLoading] = useState(false);
  const [flagFormData, setFlagFormData] = useState({
    flag_reason: '',
    admin_notes: '',
    risk_level: 'medium'
  });
  const [blockFormData, setBlockFormData] = useState({
    block_reason: '',
    admin_notes: '',
    block_duration: 'temporary'
  });

  // Chart data (static for now, will be real-time later)
  const chartData = [
    { date: "2024-04-01", desktop: 222, mobile: 150 },
    { date: "2024-04-02", desktop: 97, mobile: 180 },
    { date: "2024-04-03", desktop: 167, mobile: 120 },
    { date: "2024-04-04", desktop: 242, mobile: 260 },
    { date: "2024-04-05", desktop: 373, mobile: 290 },
    { date: "2024-04-06", desktop: 301, mobile: 340 },
    { date: "2024-04-07", desktop: 245, mobile: 180 },
    { date: "2024-04-08", desktop: 409, mobile: 320 },
    { date: "2024-04-09", desktop: 59, mobile: 110 },
    { date: "2024-04-10", desktop: 261, mobile: 190 },
    { date: "2024-04-11", desktop: 327, mobile: 350 },
    { date: "2024-04-12", desktop: 292, mobile: 210 },
    { date: "2024-04-13", desktop: 342, mobile: 380 },
    { date: "2024-04-14", desktop: 137, mobile: 220 },
    { date: "2024-04-15", desktop: 120, mobile: 170 },
    { date: "2024-04-16", desktop: 138, mobile: 190 },
    { date: "2024-04-17", desktop: 446, mobile: 360 },
    { date: "2024-04-18", desktop: 364, mobile: 410 },
    { date: "2024-04-19", desktop: 243, mobile: 180 },
    { date: "2024-04-20", desktop: 89, mobile: 150 },
    { date: "2024-04-21", desktop: 137, mobile: 200 },
    { date: "2024-04-22", desktop: 224, mobile: 170 },
    { date: "2024-04-23", desktop: 138, mobile: 230 },
    { date: "2024-04-24", desktop: 387, mobile: 290 },
    { date: "2024-04-25", desktop: 215, mobile: 250 },
    { date: "2024-04-26", desktop: 75, mobile: 130 },
    { date: "2024-04-27", desktop: 383, mobile: 420 },
    { date: "2024-04-28", desktop: 122, mobile: 180 },
    { date: "2024-04-29", desktop: 315, mobile: 240 },
    { date: "2024-04-30", desktop: 454, mobile: 380 },
    { date: "2024-05-01", desktop: 165, mobile: 220 },
    { date: "2024-05-02", desktop: 293, mobile: 310 },
    { date: "2024-05-03", desktop: 247, mobile: 190 },
    { date: "2024-05-04", desktop: 385, mobile: 420 },
    { date: "2024-05-05", desktop: 481, mobile: 390 },
    { date: "2024-05-06", desktop: 498, mobile: 520 },
    { date: "2024-05-07", desktop: 388, mobile: 300 },
    { date: "2024-05-08", desktop: 149, mobile: 210 },
    { date: "2024-05-09", desktop: 227, mobile: 180 },
    { date: "2024-05-10", desktop: 293, mobile: 330 },
    { date: "2024-05-11", desktop: 335, mobile: 270 },
    { date: "2024-05-12", desktop: 197, mobile: 240 },
    { date: "2024-05-13", desktop: 197, mobile: 160 },
    { date: "2024-05-14", desktop: 448, mobile: 490 },
    { date: "2024-05-15", desktop: 473, mobile: 380 },
    { date: "2024-05-16", desktop: 338, mobile: 400 },
    { date: "2024-05-17", desktop: 499, mobile: 420 },
    { date: "2024-05-18", desktop: 315, mobile: 350 },
    { date: "2024-05-19", desktop: 235, mobile: 180 },
    { date: "2024-05-20", desktop: 177, mobile: 230 },
    { date: "2024-05-21", desktop: 82, mobile: 140 },
    { date: "2024-05-22", desktop: 81, mobile: 120 },
    { date: "2024-05-23", desktop: 252, mobile: 290 },
    { date: "2024-05-24", desktop: 294, mobile: 220 },
    { date: "2024-05-25", desktop: 201, mobile: 250 },
    { date: "2024-05-26", desktop: 213, mobile: 170 },
    { date: "2024-05-27", desktop: 420, mobile: 460 },
    { date: "2024-05-28", desktop: 233, mobile: 190 },
    { date: "2024-05-29", desktop: 78, mobile: 130 },
    { date: "2024-05-30", desktop: 340, mobile: 280 },
    { date: "2024-05-31", desktop: 178, mobile: 230 },
    { date: "2024-06-01", desktop: 178, mobile: 200 },
    { date: "2024-06-02", desktop: 470, mobile: 410 },
    { date: "2024-06-03", desktop: 103, mobile: 160 },
    { date: "2024-06-04", desktop: 439, mobile: 380 },
    { date: "2024-06-05", desktop: 88, mobile: 140 },
    { date: "2024-06-06", desktop: 294, mobile: 250 },
    { date: "2024-06-07", desktop: 323, mobile: 370 },
    { date: "2024-06-08", desktop: 385, mobile: 320 },
    { date: "2024-06-09", desktop: 438, mobile: 480 },
    { date: "2024-06-10", desktop: 155, mobile: 200 },
    { date: "2024-06-11", desktop: 92, mobile: 150 },
    { date: "2024-06-12", desktop: 492, mobile: 420 },
    { date: "2024-06-13", desktop: 81, mobile: 130 },
    { date: "2024-06-14", desktop: 426, mobile: 380 },
    { date: "2024-06-15", desktop: 307, mobile: 350 },
    { date: "2024-06-16", desktop: 371, mobile: 310 },
    { date: "2024-06-17", desktop: 475, mobile: 520 },
    { date: "2024-06-18", desktop: 107, mobile: 170 },
    { date: "2024-06-19", desktop: 341, mobile: 290 },
    { date: "2024-06-20", desktop: 408, mobile: 450 },
    { date: "2024-06-21", desktop: 169, mobile: 210 },
    { date: "2024-06-22", desktop: 317, mobile: 270 },
    { date: "2024-06-23", desktop: 480, mobile: 530 },
    { date: "2024-06-24", desktop: 132, mobile: 180 },
    { date: "2024-06-25", desktop: 141, mobile: 190 },
    { date: "2024-06-26", desktop: 434, mobile: 380 },
    { date: "2024-06-27", desktop: 448, mobile: 490 },
    { date: "2024-06-28", desktop: 149, mobile: 200 },
    { date: "2024-06-29", desktop: 103, mobile: 160 },
    { date: "2024-06-30", desktop: 446, mobile: 400 },
  ];

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

  // Fetch associate requests when associate-requests tab is activated
  useEffect(() => {
    if (activeTab === 'associate-requests') {
      fetchAssociateRequests();
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

  // Fetch reports when reports tab is activated
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchCurrentReport();
      // Also fetch security audit log for security tab
      if (activeReportTab === 'security') {
        fetchSecurityAuditLog();
      }
    }
  }, [activeTab]);

  // Refetch reports when time range changes
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchCurrentReport();
    }
  }, [reportTimeRange]);

  // Fetch security audit log when security tab is activated
  useEffect(() => {
    if (activeTab === 'reports' && activeReportTab === 'security') {
      fetchSecurityAuditLog();
    }
  }, [activeReportTab]);

  // Auto-refresh reports every 10 minutes when reports tab is active
  useEffect(() => {
    let intervalId;
    
    if (activeTab === 'reports') {
      intervalId = setInterval(() => {
        console.log('🔄 Auto-refreshing reports data...');
        fetchCurrentReport();
      }, 10 * 60 * 1000);
    }
    
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
      console.log('🔍 Sending review request:', {
        url: `/associate-request/requests/${requestId}/review`,
        data: reviewFormData,
        requestId
      });
      
      const res = await api.put(`/associate-request/requests/${requestId}/review`, reviewFormData);
      console.log('✅ Review response:', res.data);
      
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
      console.error('❌ Review request error:', err);
      console.error('Error response:', err.response?.data);
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

  // Fetch security and communication reports
  const fetchSecurityReports = async () => {
    setReportsLoading(prev => ({ ...prev, security: true }));
    setReportsError(prev => ({ ...prev, security: '' }));
    
    try {
      const getDaysFromTimeRange = (range) => {
        switch (range) {
          case '7d': return 7;
          case '30d': return 30;
          case '90d': return 90;
          default: return 30;
        }
      };
      
      const days = getDaysFromTimeRange(reportTimeRange);
      const response = await api.get(`/admin/reports/security-communication?days=${days}&includeContent=true`);
      
      if (response.data.success) {
        setReportsData(prev => ({ ...prev, security: response.data.data }));
        setLastReportsUpdate(new Date());
      } else {
        setReportsError(prev => ({ ...prev, security: response.data.message }));
      }
    } catch (error) {
      console.error('Error fetching security reports:', error);
      setReportsError(prev => ({ ...prev, security: 'Failed to fetch security reports' }));
    } finally {
      setReportsLoading(prev => ({ ...prev, security: false }));
    }
  };

  // Fetch system performance reports
  const fetchPerformanceReports = async () => {
    setReportsLoading(prev => ({ ...prev, performance: true }));
    setReportsError(prev => ({ ...prev, performance: '' }));
    
    try {
      const getDaysFromTimeRange = (range) => {
        switch (range) {
          case '7d': return 7;
          case '30d': return 30;
          case '90d': return 90;
          default: return 30;
        }
      };
      
      const days = getDaysFromTimeRange(reportTimeRange);
      const response = await api.get(`/admin/reports/system-performance?days=${days}`);
      
      if (response.data.success) {
        setReportsData(prev => ({ ...prev, performance: response.data.data }));
        setLastReportsUpdate(new Date());
      } else {
        setReportsError(prev => ({ ...prev, performance: response.data.message }));
      }
    } catch (error) {
      console.error('Error fetching performance reports:', error);
      setReportsError(prev => ({ ...prev, performance: 'Failed to fetch performance reports' }));
    } finally {
      setReportsLoading(prev => ({ ...prev, performance: false }));
    }
  };

  // Fetch business intelligence reports
  const fetchBusinessReports = async () => {
    setReportsLoading(prev => ({ ...prev, business: true }));
    setReportsError(prev => ({ ...prev, business: '' }));
    
    try {
      const getDaysFromTimeRange = (range) => {
        switch (range) {
          case '7d': return 7;
          case '30d': return 30;
          case '90d': return 90;
          default: return 90;
        }
      };
      
      const days = getDaysFromTimeRange(reportTimeRange);
      const response = await api.get(`/admin/reports/business-intelligence?days=${days}`);
      
      if (response.data.success) {
        setReportsData(prev => ({ ...prev, business: response.data.data }));
        setLastReportsUpdate(new Date());
      } else {
        setReportsError(prev => ({ ...prev, business: response.data.message }));
      }
    } catch (error) {
      console.error('Error fetching business reports:', error);
      setReportsError(prev => ({ ...prev, business: 'Failed to fetch business reports' }));
    } finally {
      setReportsLoading(prev => ({ ...prev, business: false }));
    }
  };

  // Fetch all reports for current tab
  const fetchCurrentReport = () => {
    switch (activeReportTab) {
      case 'security':
        fetchSecurityReports();
        break;
      case 'performance':
        fetchPerformanceReports();
        break;
      case 'business':
        fetchBusinessReports();
        break;
      default:
        break;
    }
  };

  // Export report data
  const exportReport = async (type, format = 'json') => {
    try {
      const getDaysFromTimeRange = (range) => {
        switch (range) {
          case '7d': return 7;
          case '30d': return 30;
          case '90d': return 90;
          default: return 30;
        }
      };
      
      const days = getDaysFromTimeRange(reportTimeRange);
      const response = await api.get(`/admin/reports/export/${type}?format=${format}&days=${days}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        // Download CSV file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // Download JSON file
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report');
    }
  };

  // Enhanced Security Functions
  const fetchMessageDetails = async (messageId) => {
    setMessageDetailsLoading(true);
    try {
      const response = await api.get(`/admin/security/message/${messageId}`);
      if (response.data.success) {
        setMessageDetails(response.data.data);
        setSelectedMessage(messageId);
      }
    } catch (error) {
      console.error('Error fetching message details:', error);
      alert('Failed to fetch message details');
    } finally {
      setMessageDetailsLoading(false);
    }
  };

  const flagMessage = async () => {
    try {
      const response = await api.post(`/admin/security/flag-message/${selectedMessage}`, flagFormData);
      if (response.data.success) {
        alert('Message flagged successfully');
        setFlagMessageModal(false);
        setFlagFormData({ flag_reason: '', admin_notes: '', risk_level: 'medium' });
        // Refresh security reports
        fetchSecurityReports();
      }
    } catch (error) {
      console.error('Error flagging message:', error);
      alert('Failed to flag message');
    }
  };

  const blockUser = async () => {
    try {
      const response = await api.post(`/admin/security/block-user/${selectedUserForBlock}`, blockFormData);
      if (response.data.success) {
        alert('User blocked successfully');
        setBlockUserModal(false);
        setBlockFormData({ block_reason: '', admin_notes: '', block_duration: 'temporary' });
        setSelectedUserForBlock(null);
        // Refresh security reports
        fetchSecurityReports();
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user');
    }
  };

  const fetchSecurityAuditLog = async () => {
    setAuditLogLoading(true);
    try {
      const response = await api.get('/admin/security/audit-log?days=30');
      if (response.data.success) {
        setSecurityAuditLog(response.data.data.activities);
      }
    } catch (error) {
      console.error('Error fetching audit log:', error);
    } finally {
      setAuditLogLoading(false);
    }
  };

  const openFlagMessageModal = (message) => {
    setSelectedMessage(message.message_id);
    setFlagMessageModal(true);
  };

  const openBlockUserModal = (user) => {
    setSelectedUserForBlock(user.user_id);
    setBlockUserModal(true);
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
      <div className="main-content" style={{ 
        marginLeft: '280px', 
        padding: '24px',
        minHeight: '100vh',
        background: '#f9fafb'
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
        <div style={{ flex: 1, padding: '40px 32px', background: 'transparent', minHeight: 0, overflowY: 'auto' }}>
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
            <div className="bg-white rounded-4 shadow-sm p-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)', maxWidth: 1400, margin: '0 auto' }}>
              {/* Reports Header */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 style={{ color: accent, fontWeight: 700, marginBottom: 8 }}>Reports & Documentation</h5>
                  <p style={{ color: '#666', fontSize: 14, margin: 0 }}>Comprehensive system insights and security monitoring</p>
                </div>
                <div className="d-flex gap-2">
                  <select 
                    className="form-select form-select-sm" 
                    style={{ width: '120px' }}
                    value={reportTimeRange}
                    onChange={(e) => setReportTimeRange(e.target.value)}
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                  </select>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={fetchCurrentReport}
                    disabled={reportsLoading[activeReportTab]}
                  >
                    {reportsLoading[activeReportTab] ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>

              {/* Last Update Indicator */}
              {lastReportsUpdate && (
                <div className="text-muted mb-3" style={{ fontSize: '12px' }}>
                  <i className="bi bi-clock me-1"></i>
                  Last updated: {lastReportsUpdate.toLocaleString()}
                </div>
              )}

              {/* Reports Navigation Tabs */}
              <div className="nav nav-tabs mb-4" style={{ borderBottom: '2px solid #e5e7eb' }}>
                <button
                  className={`nav-link ${activeReportTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveReportTab('security')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: activeReportTab === 'security' ? accent : '#6b7280',
                    borderBottom: activeReportTab === 'security' ? `3px solid ${accent}` : 'none',
                    padding: '12px 20px',
                    fontWeight: 600,
                    borderRadius: '0'
                  }}
                >
                  <i className="bi bi-shield-check me-2"></i>
                  Security & Communication
                </button>
                <button
                  className={`nav-link ${activeReportTab === 'performance' ? 'active' : ''}`}
                  onClick={() => setActiveReportTab('performance')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: activeReportTab === 'performance' ? accent : '#6b7280',
                    borderBottom: activeReportTab === 'performance' ? `3px solid ${accent}` : 'none',
                    padding: '12px 20px',
                    fontWeight: 600,
                    borderRadius: '0'
                  }}
                >
                  <i className="bi bi-speedometer2 me-2"></i>
                  System Performance
                </button>
                <button
                  className={`nav-link ${activeReportTab === 'business' ? 'active' : ''}`}
                  onClick={() => setActiveReportTab('business')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: activeReportTab === 'business' ? accent : '#6b7280',
                    borderBottom: activeReportTab === 'business' ? `3px solid ${accent}` : 'none',
                    padding: '12px 20px',
                    fontWeight: 600,
                    borderRadius: '0'
                  }}
                >
                  <i className="bi bi-graph-up me-2"></i>
                  Business Intelligence
                </button>
              </div>

              {/* Reports Content */}
              <div className="reports-content">
                {/* Security & Communication Reports */}
                {activeReportTab === 'security' && (
                  <div className="security-reports">
                    {reportsLoading.security ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading security reports...</p>
                      </div>
                    ) : reportsError.security ? (
                      <div className="alert alert-danger" role="alert">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {reportsError.security}
                      </div>
                    ) : reportsData.security ? (
                      <div className="row g-4">
                        {/* Security Summary Cards */}
                        <div className="col-12">
                          <div className="row g-3">
                            <div className="col-md-2">
                              <div className="bg-danger bg-opacity-10 rounded-3 p-3 text-center">
                                <div className="h4 text-danger mb-1">{reportsData.security.security_summary.high_risk_messages}</div>
                                <small className="text-muted">High Risk Messages</small>
                              </div>
                            </div>
                            <div className="col-md-2">
                              <div className="bg-warning bg-opacity-10 rounded-3 p-3 text-center">
                                <div className="h4 text-warning mb-1">{reportsData.security.security_summary.medium_risk_messages}</div>
                                <small className="text-muted">Medium Risk</small>
                              </div>
                            </div>
                            <div className="col-md-2">
                              <div className="bg-info bg-opacity-10 rounded-3 p-3 text-center">
                                <div className="h4 text-info mb-1">{reportsData.security.security_summary.suspicious_users}</div>
                                <small className="text-muted">Suspicious Users</small>
                              </div>
                            </div>
                            <div className="col-md-2">
                              <div className="bg-secondary bg-opacity-10 rounded-3 p-3 text-center">
                                <div className="h4 text-secondary mb-1">{reportsData.security.security_summary.inactive_users}</div>
                                <small className="text-muted">Inactive Users</small>
                              </div>
                            </div>
                            <div className="col-md-2">
                              <div className="bg-primary bg-opacity-10 rounded-3 p-3 text-center">
                                <div className="h4 text-primary mb-1">{reportsData.security.security_summary.total_messages_analyzed}</div>
                                <small className="text-muted">Total Analyzed</small>
                              </div>
                            </div>
                            <div className="col-md-2">
                              <div className="bg-success bg-opacity-10 rounded-3 p-3 text-center">
                                <div className="h4 text-success mb-1">{reportsData.security.security_summary.high_volume_users}</div>
                                <small className="text-muted">High Volume</small>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Export Button */}
                        <div className="col-12">
                          <div className="d-flex justify-content-end gap-2">
                            <button 
                              className="btn btn-outline-success btn-sm"
                              onClick={() => exportReport('security', 'json')}
                            >
                              <i className="bi bi-download me-1"></i>
                              Export JSON
                            </button>
                            <button 
                              className="btn btn-outline-success btn-sm"
                              onClick={() => exportReport('security', 'csv')}
                            >
                              <i className="bi bi-file-earmark-spreadsheet me-1"></i>
                              Export CSV
                            </button>
                          </div>
                        </div>

                        {/* Suspicious Messages Table */}
                        <div className="col-12">
                          <div className="card">
                            <div className="card-header">
                              <h6 className="mb-0">
                                <i className="bi bi-exclamation-triangle me-2 text-warning"></i>
                                Suspicious Messages Analysis
                              </h6>
                            </div>
                            <div className="card-body p-0">
                              <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                  <thead className="table-light">
                                    <tr>
                                      <th>Risk Level</th>
                                      <th>Sender</th>
                                      <th>User Type</th>
                                      <th>Content Flags</th>
                                      <th>Date</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {reportsData.security.suspicious_messages.slice(0, 10).map((message, index) => (
                                      <tr key={index}>
                                        <td>
                                          <span className={`badge ${
                                            message.risk_level === 'high_risk' ? 'bg-danger' :
                                            message.risk_level === 'medium_risk' ? 'bg-warning' : 'bg-success'
                                          }`}>
                                            {message.risk_level.replace('_', ' ').toUpperCase()}
                                          </span>
                                        </td>
                                        <td>{message.sender_name || 'Unknown'}</td>
                                        <td>
                                          <span className={`badge ${
                                            message.user_type === 'associate' ? 'bg-primary' :
                                            message.user_type === 'freelancer' ? 'bg-success' : 'bg-secondary'
                                          }`}>
                                            {message.user_type}
                                          </span>
                                        </td>
                                        <td>
                                          {message.content_flags !== 'normal' && (
                                            <span className="badge bg-info">{message.content_flags}</span>
                                          )}
                                        </td>
                                        <td>{new Date(message.sent_at).toLocaleDateString()}</td>
                                        <td>
                                          <div className="btn-group btn-group-sm">
                                            <button 
                                              className="btn btn-outline-primary"
                                              onClick={() => fetchMessageDetails(message.message_id)}
                                              title="View Details"
                                            >
                                              <i className="bi bi-eye"></i>
                                            </button>
                                            <button 
                                              className="btn btn-outline-warning"
                                              onClick={() => openFlagMessageModal(message)}
                                              title="Flag Message"
                                            >
                                              <i className="bi bi-flag"></i>
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* User Behavior Analysis */}
                        <div className="col-12">
                          <div className="card">
                            <div className="card-header">
                              <h6 className="mb-0">
                                <i className="bi bi-person-check me-2 text-info"></i>
                                User Behavior Analysis
                              </h6>
                            </div>
                            <div className="card-body p-0">
                              <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                  <thead className="table-light">
                                    <tr>
                                      <th>User</th>
                                      <th>Type</th>
                                      <th>Status</th>
                                      <th>Messages</th>
                                      <th>CV Uploads</th>
                                      <th>Activity Flags</th>
                                      <th>Last Login</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {reportsData.security.user_behavior.slice(0, 10).map((user, index) => (
                                      <tr key={index}>
                                        <td>
                                          <div>
                                            <div className="fw-medium">{user.display_name || user.email}</div>
                                            <small className="text-muted">{user.email}</small>
                                          </div>
                                        </td>
                                        <td>
                                          <span className={`badge ${
                                            user.user_type === 'associate' ? 'bg-primary' :
                                            user.user_type === 'freelancer' ? 'bg-success' : 'bg-secondary'
                                          }`}>
                                            {user.user_type}
                                          </span>
                                        </td>
                                        <td>
                                          <span className={`badge ${user.is_active ? 'bg-success' : 'bg-danger'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                          </span>
                                        </td>
                                        <td>{user.total_messages}</td>
                                        <td>{user.cv_uploads}</td>
                                        <td>
                                          {user.activity_flags !== 'normal_activity' && (
                                            <span className={`badge ${
                                              user.activity_flags === 'high_message_volume' ? 'bg-warning' :
                                              user.activity_flags === 'inactive_user' ? 'bg-secondary' : 'bg-info'
                                            }`}>
                                              {user.activity_flags.replace('_', ' ')}
                                            </span>
                                          )}
                                        </td>
                                        <td>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                                        <td>
                                          <div className="btn-group btn-group-sm">
                                            <button 
                                              className="btn btn-outline-warning"
                                              onClick={() => openBlockUserModal(user)}
                                              title="Block User"
                                              disabled={!user.is_active}
                                            >
                                              <i className="bi bi-person-x"></i>
                                            </button>
                                            <button 
                                              className="btn btn-outline-info"
                                              title="View Profile"
                                            >
                                              <i className="bi bi-person"></i>
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Security Audit Log */}
                        <div className="col-12">
                          <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                              <h6 className="mb-0">
                                <i className="bi bi-journal-text me-2 text-secondary"></i>
                                Security Audit Log
                              </h6>
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={fetchSecurityAuditLog}
                                disabled={auditLogLoading}
                              >
                                {auditLogLoading ? 'Loading...' : 'Refresh'}
                              </button>
                            </div>
                            <div className="card-body p-0">
                              <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                  <thead className="table-light">
                                    <tr>
                                      <th>Date</th>
                                      <th>Event Type</th>
                                      <th>Description</th>
                                      <th>User</th>
                                      <th>Details</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {securityAuditLog.slice(0, 20).map((activity, index) => (
                                      <tr key={index}>
                                        <td>{new Date(activity.activity_date).toLocaleString()}</td>
                                        <td>
                                          <span className={`badge ${
                                            activity.activity_type === 'Message Flagged' ? 'bg-warning' :
                                            activity.activity_type === 'User Blocked' ? 'bg-danger' :
                                            activity.activity_type === 'Login Attempt' ? 'bg-info' :
                                            'bg-secondary'
                                          }`}>
                                            {activity.activity_type}
                                          </span>
                                        </td>
                                        <td>{activity.description}</td>
                                        <td>
                                          {activity.user_display_name || activity.user_email || 'System'}
                                        </td>
                                        <td>
                                          <small className="text-muted">
                                            {activity.details ? JSON.stringify(activity.details).substring(0, 50) + '...' : 'No details'}
                                          </small>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-shield-check display-1 text-muted"></i>
                        <h6 className="text-muted mt-3">No Security Data Available</h6>
                        <p className="text-muted">Click refresh to load security reports</p>
                      </div>
                    )}
                  </div>
                )}

                {/* System Performance Reports */}
                {activeReportTab === 'performance' && (
                  <div className="performance-reports">
                    {reportsLoading.performance ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading performance reports...</p>
                      </div>
                    ) : reportsError.performance ? (
                      <div className="alert alert-danger" role="alert">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {reportsError.performance}
                      </div>
                    ) : reportsData.performance ? (
                      <div className="row g-4">
                        {/* System Health Cards */}
                        <div className="col-12">
                          <div className="row g-3">
                            <div className="col-md-2">
                              <div className="bg-primary bg-opacity-10 rounded-3 p-3 text-center">
                                <div className="h4 text-primary mb-1">{reportsData.performance.system_health.total_users}</div>
                                <small className="text-muted">Total Users</small>
                              </div>
                            </div>
                            <div className="col-md-2">
                              <div className="bg-success bg-opacity-10 rounded-3 p-3 text-center">
                                <div className="h4 text-success mb-1">{reportsData.performance.system_health.active_users}</div>
                                <small className="text-muted">Active Users</small>
                              </div>
                            </div>
                            <div className="col-md-2">
                              <div className="bg-info bg-opacity-10 rounded-3 p-3 text-center">
                                <div className="h4 text-info mb-1">{reportsData.performance.system_health.total_cvs}</div>
                                <small className="text-muted">Total CVs</small>
                              </div>
                            </div>
                            <div className="col-md-2">
                              <div className="bg-warning bg-opacity-10 rounded-3 p-3 text-center">
                                <div className="h4 text-warning mb-1">{reportsData.performance.system_health.total_messages}</div>
                                <small className="text-muted">Messages</small>
                              </div>
                            </div>
                            <div className="col-md-2">
                              <div className="bg-secondary bg-opacity-10 rounded-3 p-3 text-center">
                                <div className="h4 text-secondary mb-1">{reportsData.performance.system_health.total_conversations}</div>
                                <small className="text-muted">Conversations</small>
                              </div>
                            </div>
                            <div className="col-md-2">
                              <div className="bg-success bg-opacity-10 rounded-3 p-3 text-center">
                                <div className="h4 text-success mb-1">{reportsData.performance.system_health.system_uptime}</div>
                                <small className="text-muted">Uptime</small>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Export Button */}
                        <div className="col-12">
                          <div className="d-flex justify-content-end gap-2">
                            <button 
                              className="btn btn-outline-success btn-sm"
                              onClick={() => exportReport('performance', 'json')}
                            >
                              <i className="bi bi-download me-1"></i>
                              Export JSON
                            </button>
                            <button 
                              className="btn btn-outline-success btn-sm"
                              onClick={() => exportReport('performance', 'csv')}
                            >
                              <i className="bi bi-file-earmark-spreadsheet me-1"></i>
                              Export CSV
                            </button>
                          </div>
                        </div>

                        {/* CV Performance Chart */}
                        <div className="col-12">
                          <div className="card">
                            <div className="card-header">
                              <h6 className="mb-0">
                                <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                                CV Processing Performance
                              </h6>
                            </div>
                            <div className="card-body">
                              <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={reportsData.performance.cv_performance}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="total_uploads" stackId="1" stroke="#8884d8" fill="#8884d8" />
                                    <Area type="monotone" dataKey="approved_cvs" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                                    <Area type="monotone" dataKey="rejected_cvs" stackId="1" stroke="#ffc658" fill="#ffc658" />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-speedometer2 display-1 text-muted"></i>
                        <h6 className="text-muted mt-3">No Performance Data Available</h6>
                        <p className="text-muted">Click refresh to load performance reports</p>
                      </div>
                      )}
                  </div>
                )}

                {/* Business Intelligence Reports */}
                {activeReportTab === 'business' && (
                  <div className="business-reports">
                    {reportsLoading.business ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading business intelligence...</p>
                      </div>
                      ) : reportsError.business ? (
                      <div className="alert alert-danger" role="alert">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {reportsError.business}
                      </div>
                    ) : reportsData.business ? (
                      <div className="row g-4">
                        {/* Platform Usage Cards */}
                        <div className="col-12">
                          <div className="row g-3">
                            <div className="col-md-3">
                              <div className="bg-primary bg-opacity-10 rounded-3 p-3 text-center">
                                <div className="h4 text-primary mb-1">{reportsData.business.platform_usage.total_registered_users}</div>
                                <small className="text-muted">Total Users</small>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="bg-success bg-opacity-10 rounded-3 p-3 text-center">
                                <div className="h4 text-success mb-1">{reportsData.business.platform_usage.monthly_active_users}</div>
                                <small className="text-muted">Monthly Active</small>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="bg-info bg-opacity-10 rounded-3 p-3 text-center">
                                <div className="h4 text-info mb-1">{reportsData.business.platform_usage.cv_upload_success_rate}%</div>
                                <small className="text-muted">CV Success Rate</small>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="bg-warning bg-opacity-10 rounded-3 p-3 text-center">
                                <div className="h4 text-warning mb-1">{reportsData.business.platform_usage.user_satisfaction_score}</div>
                                <small className="text-muted">Satisfaction Score</small>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Export Button */}
                        <div className="col-12">
                          <div className="d-flex justify-content-end gap-2">
                            <button 
                              className="btn btn-outline-success btn-sm"
                              onClick={() => exportReport('business', 'json')}
                            >
                              <i className="bi bi-download me-1"></i>
                              Export JSON
                            </button>
                            <button 
                              className="btn btn-outline-success btn-sm"
                              onClick={() => exportReport('business', 'csv')}
                            >
                              <i className="bi bi-file-earmark-spreadsheet me-1"></i>
                              Export CSV
                            </button>
                          </div>
                        </div>

                        {/* Skill Demand Chart */}
                        <div className="col-12">
                          <div className="card">
                            <div className="card-header">
                              <h6 className="mb-0">
                                <i className="bi bi-lightning me-2 text-warning"></i>
                                Top Skills Demand Analysis
                              </h6>
                            </div>
                            <div className="card-body">
                              <div style={{ height: '400px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={reportsData.business.skill_demand.slice(0, 15)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="skill_name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="requests_requiring_skill" fill="#8884d8" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* User Growth Chart */}
                        <div className="col-12">
                          <div className="card">
                            <div className="card-header">
                              <h6 className="mb-0">
                                <i className="bi bi-people me-2 text-success"></i>
                                User Growth Trends
                              </h6>
                            </div>
                            <div className="card-body">
                              <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={reportsData.business.user_growth}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="new_users" stroke="#8884d8" strokeWidth={2} />
                                    <Line type="monotone" dataKey="new_associates" stroke="#82ca9d" strokeWidth={2} />
                                    <Line type="monotone" dataKey="new_freelancers" stroke="#ffc658" strokeWidth={2} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-graph-up display-1 text-muted"></i>
                        <h6 className="text-muted mt-3">No Business Data Available</h6>
                        <p className="text-muted">Click refresh to load business intelligence</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
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

      {/* Enhanced Security Modals */}
      
      {/* Message Details Modal */}
      {messageDetails && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-shield-check me-2 text-warning"></i>
                  Message Security Analysis
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setMessageDetails(null)}
                ></button>
              </div>
              <div className="modal-body">
                {messageDetailsLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-md-8">
                      <h6>Message Content</h6>
                      <div className="border rounded p-3 bg-light mb-3">
                        <p className="mb-0">{messageDetails.message.content}</p>
                      </div>
                      
                      <h6>Sender Information</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <strong>Name:</strong> {messageDetails.message.sender_name}
                        </div>
                        <div className="col-md-6">
                          <strong>Type:</strong> 
                          <span className={`badge ms-2 ${
                            messageDetails.message.sender_type === 'associate' ? 'bg-primary' :
                            messageDetails.message.sender_type === 'freelancer' ? 'bg-success' : 'bg-secondary'
                          }`}>
                            {messageDetails.message.sender_type}
                          </span>
                        </div>
                      </div>
                      <div className="row mt-2">
                        <div className="col-md-6">
                          <strong>Email:</strong> {messageDetails.message.sender_email}
                        </div>
                        <div className="col-md-6">
                          <strong>Status:</strong> 
                          <span className={`badge ms-2 ${messageDetails.message.sender_active ? 'bg-success' : 'bg-danger'}`}>
                            {messageDetails.message.sender_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <h6>Security Analysis</h6>
                      <div className="mb-3">
                        <strong>Risk Score:</strong>
                        <div className="progress mt-1" style={{ height: '20px' }}>
                          <div 
                            className={`progress-bar ${
                              messageDetails.security_analysis.risk_score >= 70 ? 'bg-danger' :
                              messageDetails.security_analysis.risk_score >= 40 ? 'bg-warning' : 'bg-success'
                          }`}
                            style={{ width: `${messageDetails.security_analysis.risk_score}%` }}
                          >
                            {messageDetails.security_analysis.risk_score}/100
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <strong>Content Flags:</strong>
                        <div className="mt-1">
                          {messageDetails.security_analysis.content_flags.map((flag, index) => (
                            <span key={index} className="badge bg-info me-1 mb-1">{flag}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <strong>User Risk:</strong>
                        <span className={`badge ms-2 ${
                          messageDetails.security_analysis.user_risk_profile.level === 'high' ? 'bg-danger' :
                          messageDetails.security_analysis.user_risk_profile.level === 'medium' ? 'bg-warning' : 'bg-success'
                        }`}>
                          {messageDetails.security_analysis.user_risk_profile.level.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <strong>Recommendations:</strong>
                        <ul className="mt-1 small">
                          {messageDetails.security_analysis.recommended_actions.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-warning"
                  onClick={() => openFlagMessageModal(messageDetails.message)}
                >
                  <i className="bi bi-flag me-1"></i>
                  Flag Message
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setMessageDetails(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flag Message Modal */}
      {flagMessageModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-flag me-2 text-warning"></i>
                  Flag Suspicious Message
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setFlagMessageModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Flag Reason *</label>
                  <select 
                    className="form-select"
                    value={flagFormData.flag_reason}
                    onChange={(e) => setFlagFormData(prev => ({ ...prev, flag_reason: e.target.value }))}
                  >
                    <option value="">Select a reason</option>
                    <option value="spam">Spam Content</option>
                    <option value="suspicious_keywords">Suspicious Keywords</option>
                    <option value="excessive_volume">Excessive Message Volume</option>
                    <option value="inappropriate_content">Inappropriate Content</option>
                    <option value="phishing_attempt">Phishing Attempt</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Risk Level *</label>
                  <select 
                    className="form-select"
                    value={flagFormData.risk_level}
                    onChange={(e) => setFlagFormData(prev => ({ ...prev, risk_level: e.target.value }))}
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                    <option value="critical">Critical Risk</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Admin Notes</label>
                  <textarea 
                    className="form-control"
                    rows="3"
                    placeholder="Additional notes about this flag..."
                    value={flagFormData.admin_notes}
                    onChange={(e) => setFlagFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-warning"
                  onClick={flagMessage}
                  disabled={!flagFormData.flag_reason}
                >
                  <i className="bi bi-flag me-1"></i>
                  Flag Message
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setFlagMessageModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {blockUserModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person-x me-2 text-danger"></i>
                  Block User
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setBlockUserModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Block Reason *</label>
                  <select 
                    className="form-select"
                    value={blockFormData.block_reason}
                    onChange={(e) => setBlockFormData(prev => ({ ...prev, block_reason: e.target.value }))}
                  >
                    <option value="">Select a reason</option>
                    <option value="spam_activity">Spam Activity</option>
                    <option value="suspicious_behavior">Suspicious Behavior</option>
                    <option value="inappropriate_content">Inappropriate Content</option>
                    <option value="security_violation">Security Violation</option>
                    <option value="terms_violation">Terms of Service Violation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Block Duration *</label>
                  <select 
                    className="form-select"
                    value={blockFormData.block_duration}
                    onChange={(e) => setBlockFormData(prev => ({ ...prev, block_duration: e.target.value }))}
                  >
                    <option value="temporary">Temporary (24 hours)</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="permanent">Permanent</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Admin Notes</label>
                  <textarea 
                    className="form-control"
                    rows="3"
                    placeholder="Additional notes about this block..."
                    value={blockFormData.admin_notes}
                    onChange={(e) => setBlockFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={blockUser}
                  disabled={!blockFormData.block_reason}
                >
                  <i className="bi bi-person-x me-1"></i>
                  Block User
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setBlockUserModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ESCAdminDashboard; 