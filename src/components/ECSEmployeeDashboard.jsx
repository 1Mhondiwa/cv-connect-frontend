import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';


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
  
  // Real-time monitoring states
  const [recentHires, setRecentHires] = useState([]);
  const [recentHiresLoading, setRecentHiresLoading] = useState(false);
  
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
  const [selectedFreelancers, setSelectedFreelancers] = useState([]);
  const [highlightedFreelancers, setHighlightedFreelancers] = useState([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [allFreelancers, setAllFreelancers] = useState([]);
  const [availableFreelancers, setAvailableFreelancers] = useState([]);
  const [recommendationSuccessMessage, setRecommendationSuccessMessage] = useState('');
  
  // Simple search state
  const [searchSkills, setSearchSkills] = useState('');
  const [searchExperience, setSearchExperience] = useState('');
  const [searchStatus, setSearchStatus] = useState('all');

  // Freelancer profile modal states
  const [showFreelancerProfileModal, setShowFreelancerProfileModal] = useState(false);
  const [selectedFreelancerProfile, setSelectedFreelancerProfile] = useState(null);
  const [freelancerProfileLoading, setFreelancerProfileLoading] = useState(false);



  // Analytics data states




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

  // Load statistics and real-time data for home tab
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadStats();
      fetchRecentHires();
      fetchPendingFreelancerRequestsCount(); // Fetch pending freelancer requests count
    }
  }, [activeTab]);

  // Auto-refresh data every 2 minutes for real-time updates
  useEffect(() => {
    let intervalId;
    
    if (activeTab === 'dashboard') {
      intervalId = setInterval(() => {
        console.log('🔄 Auto-refreshing home tab data...');
        fetchRecentHires();
        fetchPendingFreelancerRequestsCount(); // Refresh pending freelancer requests count
      }, 2 * 60 * 1000); // 2 minutes
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
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
      fetchFreelancerRequests();
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

  // Fetch recent hires (associate responses to freelancer recommendations)
  const fetchRecentHires = async () => {
    setRecentHiresLoading(true);
    try {
      const response = await api.get('/hiring/recent-hires');
      if (response.data.success) {
        setRecentHires(response.data.hires);
      }
    } catch (error) {
      console.error('Error fetching recent hires:', error);
      // Fallback to local data if API fails
      setRecentHires([]);
    } finally {
      setRecentHiresLoading(false);
    }
  };

  // Fetch pending associate freelancer requests count
  const fetchPendingFreelancerRequestsCount = async () => {
    try {
      const response = await api.get('/admin/associate-requests?status=pending');
      if (response.data.success) {
        // Update the freelancerRequests state with pending requests only
        setFreelancerRequests(response.data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching pending freelancer requests count:', error);
      // Keep existing data if API fails
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
      console.log('🔍 API Response Status:', res.status);
      console.log('🔍 API Response Data:', res.data);
      
      if (res.data.success) {
        const freelancers = res.data.freelancers || [];
        console.log('🔍 Fetched Freelancers:', freelancers.length);
        
        if (freelancers.length > 0) {
          console.log('🔍 Sample Freelancer:', freelancers[0]);
          console.log('🔍 Sample Freelancer Skills:', freelancers[0].skills);
          if (freelancers[0].skills && freelancers[0].skills.length > 0) {
            console.log('🔍 Sample Skill Structure:', freelancers[0].skills[0]);
            console.log('🔍 Skills Array Type:', Array.isArray(freelancers[0].skills));
            console.log('🔍 Skills Array Length:', freelancers[0].skills.length);
          }
          console.log('🔍 Sample Freelancer Experience:', freelancers[0].experience_years);
          console.log('🔍 Sample Freelancer Rating:', freelancers[0].admin_rating);
        } else {
          console.log('🔍 No freelancers returned from API');
        }
        
        setAllFreelancers(freelancers);
        setAvailableFreelancers(freelancers);
        console.log('🔍 State updated - allFreelancers:', freelancers.length);
        console.log('🔍 State updated - availableFreelancers:', freelancers.length);
      } else {
        console.error('🔍 API returned success: false:', res.data);
        console.error('🔍 Error message:', res.data.message);
      }
    } catch (err) {
      console.error('❌ Error fetching available freelancers:', err);
      console.error('❌ Error details:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Error message:', err.message);
      
      // Set empty arrays to prevent UI errors
      setAllFreelancers([]);
      setAvailableFreelancers([]);
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

  // Freelancer profile modal functions
  const openFreelancerProfile = async (freelancer) => {
    setSelectedFreelancerProfile(freelancer);
    setShowFreelancerProfileModal(true);
    
    // Fetch detailed profile data
    setFreelancerProfileLoading(true);
    try {
      console.log('🔍 Fetching detailed profile for freelancer:', freelancer.freelancer_id);
      const res = await api.get(`/admin/freelancers/${freelancer.freelancer_id}/profile`);
      if (res.data.success) {
        setSelectedFreelancerProfile(res.data.freelancer);
      } else {
        console.error('❌ Failed to fetch freelancer profile:', res.data.message);
        // Still show modal with basic data if detailed fetch fails
      }
    } catch (err) {
      console.error('❌ Error fetching freelancer profile:', err);
      // Still show modal with basic data if detailed fetch fails
    } finally {
      setFreelancerProfileLoading(false);
    }
  };

  const submitRecommendations = async () => {
    if (selectedFreelancers.length === 0) {
      alert('Please select at least one freelancer');
      return;
    }

    if (!selectedFreelancerRequest || !selectedFreelancerRequest.request_id) {
      alert('No request selected for recommendations');
      return;
    }

    // Validate freelancer data
    const validFreelancers = selectedFreelancers.filter(id => {
      const freelancer = allFreelancers.find(f => f.freelancer_id === id);
      return freelancer && freelancer.freelancer_id;
    });

    if (validFreelancers.length !== selectedFreelancers.length) {
      alert('Some selected freelancers are invalid. Please refresh and try again.');
      return;
    }

    setRecommendationsLoading(true);
    try {
      console.log('🔍 Submitting recommendations:', {
        requestId: selectedFreelancerRequest.request_id,
        freelancerIds: selectedFreelancers,
        adminNotes: adminNotes,
        highlightedFreelancers: highlightedFreelancers
      });

      const res = await api.post(`/admin/associate-requests/${selectedFreelancerRequest.request_id}/recommendations`, {
        freelancer_ids: selectedFreelancers,
        admin_notes: adminNotes,
        highlighted_freelancers: highlightedFreelancers
      });

      if (res.data.success) {
        console.log('✅ Recommendations submitted successfully:', res.data);
        setRecommendationSuccessMessage(`Successfully submitted ${selectedFreelancers.length} recommendation${selectedFreelancers.length !== 1 ? 's' : ''}!`);
        setShowRecommendationsModal(false);
        setSelectedFreelancers([]);
        setHighlightedFreelancers([]);
        setAdminNotes('');
        await fetchFreelancerRequests();
        
        // Clear success message after 5 seconds
        setTimeout(() => setRecommendationSuccessMessage(''), 5000);
      } else {
        console.error('❌ API returned success: false:', res.data);
        alert(res.data.message || 'Failed to submit recommendations');
      }
    } catch (err) {
      console.error('❌ Error submitting recommendations:', err);
      console.error('Error response:', err.response?.data);
      alert(err.response?.data?.message || 'Failed to submit recommendations. Please try again.');
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
    if (allFreelancers.length > 0) {
      console.log('🔍 Sample freelancer data:', allFreelancers[0]);
      console.log('🔍 Sample freelancer skills:', allFreelancers[0].skills);
      if (allFreelancers[0].skills && allFreelancers[0].skills.length > 0) {
        console.log('🔍 Sample skill details:', allFreelancers[0].skills[0]);
      }
      console.log('🔍 Sample freelancer experience_years:', allFreelancers[0].experience_years);
      console.log('🔍 Sample freelancer is_available:', allFreelancers[0].is_available);
    }
    
    let filtered = [...allFreelancers];
    console.log('🔍 Starting with all freelancers:', filtered.length);
    
    // Filter by skills
    if (searchSkills && searchSkills.trim()) {
      console.log('🔍 Filtering by skills:', searchSkills);
      filtered = filtered.filter(f => {
        // Check if skills array contains the search term
        const hasSkills = f.skills?.some(skill => {
          const skillName = skill.skill_name || skill;
          return skillName && skillName.toLowerCase().includes(searchSkills.toLowerCase());
        });
        // Also check headline and current_status
        const hasHeadline = f.headline?.toLowerCase().includes(searchSkills.toLowerCase());
        const hasCurrentStatus = f.current_status?.toLowerCase().includes(searchSkills.toLowerCase());
        const matches = hasSkills || hasHeadline || hasCurrentStatus;
        
        console.log(`🔍 Freelancer ${f.first_name} ${f.last_name}:`, {
          skills: f.skills,
          headline: f.headline,
          current_status: f.current_status,
          searchTerm: searchSkills,
          hasSkills,
          hasHeadline,
          hasCurrentStatus,
          matches
        });
        
        return matches;
      });
      console.log('🔍 After skills filter:', filtered.length);
    }
    
    // Filter by experience
    if (searchExperience && searchExperience.trim()) {
      console.log('🔍 Filtering by experience:', searchExperience);
      const minExp = parseInt(searchExperience);
      if (!isNaN(minExp)) {
        filtered = filtered.filter(f => {
          const experience = f.experience_years || 0;
          const matches = experience === minExp;
          
          console.log(`🔍 Freelancer ${f.first_name} ${f.last_name}:`, {
            experience,
            exactRequired: minExp,
            matches
          });
          
          return matches;
        });
        console.log('🔍 After experience filter:', filtered.length);
      }
    }
    
    // Filter by status
    if (searchStatus && searchStatus !== 'all') {
      console.log('🔍 Filtering by status:', searchStatus);
      filtered = filtered.filter(f => {
        const status = f.availability_status || 'available';
        const matches = status === searchStatus;
        
        console.log(`🔍 Freelancer ${f.first_name} ${f.last_name}:`, {
          status,
          searchTerm: searchStatus,
          matches
        });
        
        return matches;
      });
      console.log('🔍 After status filter:', filtered.length);
    }
    
    setAvailableFreelancers(filtered);
    console.log('🔍 Final filtered results:', filtered.length);
    console.log('🔍 Filtered freelancers:', filtered.map(f => `${f.first_name} ${f.last_name}`));
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
              <small className="text-muted">ECS Employee Portal</small>
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
                <i className="bi bi-house-door me-3"></i>
                Home
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




        </div>
      </div>
      
          {/* Spacer to push bottom section down */}
          <div style={{ flex: 1 }}></div>

          {/* Bottom Section - Settings and Logout */}
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
                className={`nav-item w-100 text-start ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
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
              {activeTab === 'dashboard' && 'Home'}
              {activeTab === 'associate-requests' && 'Associate Requests'}
              {activeTab === 'freelancer-requests' && 'Associate Freelancer Requests'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <p className="text-muted mb-0">
              {activeTab === 'dashboard' && 'Operational tasks and associate response tracking'}
              {activeTab === 'associate-requests' && 'Review associate join requests'}
              {activeTab === 'freelancer-requests' && 'Handle associate freelancer requests'}
              {activeTab === 'settings' && 'System configuration and preferences'}
            </p>
            </div>
        </div>
        {/* Main Dashboard Content */}
        <div className="px-3 py-4" style={{ width: '100%', maxWidth: '100%' }}>
          {/* Home Tab - Operational Center */}
          {activeTab === 'dashboard' && (
            <>
              {/* Welcome Section */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="bg-white rounded-4 shadow-sm p-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <h4 className="mb-2" style={{ color: accent, fontWeight: 600 }}>
                          <i className="bi bi-house-door me-2"></i>
                          Welcome back, {user?.first_name || 'ECS Employee'}!
                        </h4>
                        <p className="text-muted mb-0">
                          Manage associate requests, handle freelancer recommendations, and track associate responses
                        </p>
                      </div>
                      <div className="text-end">
                        <div className="h5 mb-1" style={{ color: accent }}>
                          {new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                        <small className="text-muted">Ready to work</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="row g-4 mb-4">
                <div className="col-lg-4 col-md-6">
                  <div className="bg-white rounded-4 shadow-sm p-4 text-center" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
                    <div className="mb-3">
                      <div style={{ fontSize: 32, color: accent, marginBottom: 8 }}>
                        <i className="bi bi-envelope"></i>
                      </div>
                      <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase' }}>
                        Associate Pending Requests
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
                      <div className="text-muted">ECS Employee attention needed</div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6">
                  <div className="bg-white rounded-4 shadow-sm p-4 text-center" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
                    <div className="mb-3">
                      <div style={{ fontSize: 32, color: accent, marginBottom: 8 }}>
                        <i className="bi bi-people-fill"></i>
                      </div>
                      <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase' }}>
                        Pending Associate Freelancer Requests
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '28px', color: '#111827', marginBottom: '8px' }}>
                      {freelancerRequestsLoading ? '...' : freelancerRequests.length === 0 ? '0' : freelancerRequests.length || '--'}
                    </div>
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <span className="badge" style={{ background: '#f59e0b', color: '#fff', fontSize: '12px', padding: '4px 8px' }}>
                        <i className="bi bi-hand-thumbs-up me-1"></i>
                        Active
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-muted">
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                        <i className="bi bi-people" style={{ color: accent }}></i>
                        <span style={{ fontWeight: 500 }}>Pending requests</span>
                      </div>
                      <div className="text-muted">Awaiting freelancer recommendations</div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4 col-md-6">
                  <div className="bg-white rounded-4 shadow-sm p-4 text-center" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
                    <div className="mb-3">
                      <div style={{ fontSize: 32, color: accent, marginBottom: 8 }}>
                        <i className="bi bi-briefcase"></i>
                      </div>
                      <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase' }}>
                        Recent Responses
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '28px', color: '#111827', marginBottom: '8px' }}>
                      {recentHiresLoading ? '...' : recentHires.length || '0'}
                    </div>
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <span className="badge" style={{ background: '#f59e0b', color: '#fff', fontSize: '12px', padding: '4px 8px' }}>
                        <i className="bi bi-chat-dots me-1"></i>
                        New
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-muted">
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                        <i className="bi bi-briefcase" style={{ color: accent }}></i>
                        <span style={{ fontWeight: 500 }}>Associate feedback</span>
                      </div>
                      <div className="text-muted">Track recommendation responses</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Hires - Associate Responses */}
              <div className="row g-4">
                <div className="col-12">
                  <div className="bg-white rounded-4 shadow-sm p-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0" style={{ color: accent, fontWeight: 600 }}>
                        <i className="bi bi-briefcase me-2"></i>
                        Recent Freelancer Hires
                      </h5>
                      <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={fetchRecentHires}
                        disabled={recentHiresLoading}
                      >
                        {recentHiresLoading ? '...' : 'Refresh'}
                      </button>
                    </div>
                    {recentHiresLoading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
                    ) : recentHires.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <i className="bi bi-inbox fs-1"></i>
                        <p className="mt-2">No recent hires yet</p>
                        <small>When associates hire freelancers, the information will appear here</small>
        </div>
      ) : (
                      <div className="space-y-3">
                        {recentHires.slice(0, 8).map((hire, index) => (
                          <div key={index} className="d-flex align-items-center p-3 border rounded" style={{ background: '#f8f9fa' }}>
                            <div className="flex-shrink-0 me-3">
                              <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                background: '#10b981',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff'
                              }}>
                                <i className="bi bi-check-lg"></i>
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-bold">{hire.associate_name}</div>
                              <div className="text-muted small">
                                {hire.freelancer_first_name} {hire.freelancer_last_name} • {hire.freelancer_role}
                              </div>
                              <div className="text-muted small">
                                {hire.project_title}
                              </div>
                              <div className="text-muted small">
                                {new Date(hire.hire_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                            <div className="text-end">
                              <span className="badge bg-success">
                                Successful
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
             <div className="bg-white rounded-4 shadow-sm p-4" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)', maxWidth: 1200, margin: '0 auto' }}>
               <h5 style={{ color: accent, fontWeight: 700, marginBottom: 18 }}>ECS Employee Freelancer Request Management</h5>
               <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>Review associate requests for freelancer services and provide curated recommendations</p>
               
               {/* Success Message */}
               {recommendationSuccessMessage && (
                 <div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
                   <i className="bi bi-check-circle me-2"></i>
                   {recommendationSuccessMessage}
                   <button type="button" className="btn-close" onClick={() => setRecommendationSuccessMessage('')}></button>
            </div>
               )}
              
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
                                <strong>Company:</strong> {request.company_name || 'N/A'}
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
                              style={{ 
                                background: (request.recommendation_count && request.recommendation_count > 0) ? '#28a745' : accent, 
                                color: '#fff', 
                                borderRadius: 20 
                              }}
                              onClick={() => openRecommendationsModal(request)}
                            >
                              <i className="bi bi-star me-1"></i>
                              {(request.recommendation_count && request.recommendation_count > 0) ? 'Update Recommendations' : 'Provide Recommendations'}
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
              


           {/* Freelancer Request Details Modal */}
           {showFreelancerRequestDetailsModal && selectedFreelancerRequest && (
             <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1050 }}>
               <div className="modal-dialog modal-lg">
                 <div className="modal-content">
                   <div className="modal-header">
                     <h5 className="modal-title">Freelancer Request Details</h5>
                     <button type="button" className="btn-close" onClick={() => setShowFreelancerRequestDetailsModal(false)}></button>
                  </div>
                   <div className="modal-body">
                     <div className="row mb-3">
                       <div className="col-md-6">
                         <p><strong>Title:</strong> {selectedFreelancerRequest.title}</p>
                         <p><strong>Description:</strong> {selectedFreelancerRequest.description}</p>
                         <p><strong>Required Skills:</strong> {selectedFreelancerRequest.required_skills.join(', ')}</p>
                         <p><strong>Minimum Experience:</strong> {selectedFreelancerRequest.min_experience} years</p>
                  </div>
                       <div className="col-md-6">
                         <p><strong>Budget Range:</strong> {selectedFreelancerRequest.budget_range || 'Not specified'}</p>
                         <p><strong>Urgency Level:</strong> {selectedFreelancerRequest.urgency_level}</p>
                         <p><strong>Preferred Location:</strong> {selectedFreelancerRequest.preferred_location || 'Any'}</p>
                </div>
                     </div>
                     
                     <div className="row mb-3">
                       <div className="col-md-6">
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
                         <p><strong>Email:</strong> {selectedFreelancerRequest.associate_email}</p>
                         <p><strong>Company:</strong> {selectedFreelancerRequest.company_name || 'N/A'}</p>
                         <p><strong>Contact Person:</strong> {selectedFreelancerRequest.contact_person}</p>
                         <p><strong>Industry:</strong> {selectedFreelancerRequest.industry}</p>
                         <p><strong>Submitted:</strong> {new Date(selectedFreelancerRequest.created_at).toLocaleDateString()}</p>
                       </div>
                       <div className="col-md-6">
                         <p><strong>Recommendations:</strong> {selectedFreelancerRequest.recommendation_count || 0}</p>
                         <p><strong>Responses:</strong> {selectedFreelancerRequest.response_count || 0}</p>
                         {selectedFreelancerRequest.reviewed_at && (
                           <p><strong>Reviewed:</strong> {new Date(selectedFreelancerRequest.reviewed_at).toLocaleDateString()}</p>
                         )}
                       </div>
                     </div>
            </div>
            <div className="modal-footer">
                     <button type="button" className="btn btn-secondary" onClick={() => setShowFreelancerRequestDetailsModal(false)}>
                       Close
                </button>
                     {selectedFreelancerRequest.status === 'pending' && (
                <button 
                  type="button" 
                         className="btn btn-primary"
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
             <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1050 }}>
               <div className="modal-dialog modal-xl">
                 <div className="modal-content">
                   <div className="modal-header">
                     <h5 className="modal-title" style={{ color: accent, fontWeight: 700 }}>All Registered Freelancers</h5>
                     <button type="button" className="btn-close" onClick={() => setShowRecommendationsModal(false)}></button>
                   </div>
                   <div className="modal-body">
                     <div className="row mb-4">
                       <div className="col-md-8">
                         <h6 style={{ color: accent, fontWeight: 600 }}>Request: {selectedFreelancerRequest.title}</h6>
                         <p className="text-muted mb-2">{selectedFreelancerRequest.description}</p>
                         <div className="row g-2">
                           <div className="col-md-4">
                             <small><strong>Skills:</strong> {selectedFreelancerRequest.required_skills.join(', ')}</small>
                           </div>
                           <div className="col-md-4">
                             <small><strong>Experience:</strong> {selectedFreelancerRequest.min_experience}+ years</small>
                           </div>
                           <div className="col-md-4">
                             <small><strong>Location:</strong> {selectedFreelancerRequest.preferred_location || 'Any'}</small>
                           </div>
                         </div>
                       </div>
                       <div className="col-md-4">
                         <div className="mb-3">
                           <label className="form-label">ECS Notes:</label>
                           <textarea
                             className="form-control"
                             rows="3"
                             placeholder="Add any notes about these recommendations..."
                             value={adminNotes}
                             onChange={(e) => setAdminNotes(e.target.value)}
                           ></textarea>
                         </div>
                       </div>
                     </div>

                                           <div className="row mb-3">
                        <div className="col-md-4">
                          <label className="form-label fw-bold">Search by Skills:</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g., React, Node.js"
                            value={searchSkills}
                            onChange={(e) => {
                              console.log('🔍 Skills search input changed:', e.target.value);
                              setSearchSkills(e.target.value);
                            }}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label fw-bold">Minimum Experience (years):</label>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="e.g., 3"
                            value={searchExperience}
                            onChange={(e) => {
                              console.log('🔍 Experience search input changed:', e.target.value);
                              setSearchExperience(e.target.value);
                            }}
                            min="0"
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label fw-bold">Status:</label>
                          <select
                            className="form-select"
                            value={searchStatus}
                            onChange={(e) => {
                              console.log('🔍 Status search input changed:', e.target.value);
                              setSearchStatus(e.target.value);
                            }}
                          >
                            <option value="all">All Statuses</option>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                          </select>
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                          <div className="d-flex gap-2 w-100">
                <button 
                              className="btn btn-sm w-100" 
                              style={{ 
                                background: accent, 
                                color: '#fff', 
                                height: '38px',
                                transition: 'all 0.2s ease-in-out',
                                transform: 'scale(1)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = 'none';
                              }}
                              onClick={(e) => {
                                e.target.style.transform = 'scale(0.95)';
                                setTimeout(() => {
                                  e.target.style.transform = 'scale(1)';
                                }, 100);
                                console.log('🔍 Search button clicked');
                                handleSearch();
                              }}
                            >
                              <i className="bi bi-search"></i>
                </button>
                <button 
                              className="btn btn-outline-secondary btn-sm w-100" 
                              style={{ 
                                height: '38px',
                                transition: 'all 0.2s ease-in-out',
                                transform: 'scale(1)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = 'none';
                              }}
                              onClick={(e) => {
                                e.target.style.transform = 'scale(0.95)';
                                setTimeout(() => {
                                  e.target.style.transform = 'scale(1)';
                                }, 100);
                                setSearchSkills('');
                                setSearchExperience('');
                                setSearchStatus('all');
                                setAvailableFreelancers(allFreelancers);
                                console.log('🔄 Search reset - showing all freelancers:', allFreelancers.length);
                              }}
                            >
                              <i className="bi bi-arrow-clockwise"></i>
                </button>
                          </div>
                        </div>
                      </div>

                                           <div className="mb-3">
                        <p className="text-muted mb-0">
                          Showing {availableFreelancers.length} of {allFreelancers.length} freelancers. Use the search above to find specific freelancers.
                        </p>
            </div>

                      <div className="row g-3">
                        {availableFreelancers.map((freelancer) => (
                          <div key={freelancer.freelancer_id} className="col-md-6 col-lg-4">
                            <div className="card shadow-sm h-100 d-flex flex-column" style={{ border: '2px solid #ffd7c2' }}>
                              <div className="card-body p-3 d-flex flex-column">
                                {/* Header Section */}
                                <div className="d-flex align-items-start mb-3">
                                  <div className="form-check me-2">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={selectedFreelancers.includes(freelancer.freelancer_id)}
                                      onChange={(e) => handleFreelancerSelection(freelancer.freelancer_id, e.target.checked)}
                                    />
                                  </div>
                                  <div className="flex-grow-1">
                                    <h6 className="card-title mb-1" style={{ color: accent, fontWeight: 600, fontSize: '14px' }}>
                                      {`${freelancer.first_name} ${freelancer.last_name}`}
                                    </h6>
                                    <small className="text-muted">
                                      ID: {freelancer.freelancer_id} | Selected: {selectedFreelancers.includes(freelancer.freelancer_id) ? 'Yes' : 'No'} | Checkbox visible: Yes
                                    </small>
                                  </div>
                                </div>

                                {/* Content Section - Fixed Height */}
                                <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: '200px' }}>
                                  {/* Role */}
                                  <div className="mb-2">
                                    <strong>Role:</strong> 
                                    <div className="text-muted small">{freelancer.headline || 'Not specified'}</div>
                                  </div>

                                  {/* Skills */}
                                  <div className="mb-2">
                                    <strong>Skills:</strong> 
                                    {freelancer.skills && freelancer.skills.length > 0 && (
                                      <small className="text-muted ms-2">({freelancer.skills.length})</small>
                                    )}
                                    <div className="mt-1" style={{ maxHeight: '60px', overflowY: 'auto' }}>
                                      {freelancer.skills && freelancer.skills.length > 0 ? (
                                        freelancer.skills.map((skill, index) => {
                                          // Handle both new skills structure and legacy structure
                                          const skillName = skill.skill_name || skill;
                                          const proficiencyLevel = skill.proficiency_level;
                                          
                                          return (
                                            <span key={skill.skill_id || index} className="badge bg-light text-dark me-1 mb-1" style={{ fontSize: '10px' }}>
                                              {skillName}
                                              {proficiencyLevel && (
                                                <span className="ms-1" style={{ color: '#666' }}>
                                                  ({proficiencyLevel})
                                                </span>
                                              )}
                                            </span>
                                          );
                                        })
                                      ) : (
                                        <span className="text-muted small">No skills listed</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Experience */}
                                  <div className="mb-2">
                                    <strong>Experience:</strong> 
                                    <span className="text-muted small">{freelancer.experience_years || 0} years</span>
                                  </div>

                                  {/* Contact Info */}
                                  <div className="mb-2">
                                    <strong>Email:</strong> 
                                    <div className="text-muted small text-truncate" title={freelancer.email || 'Not specified'}>
                                      {freelancer.email || 'Not specified'}
                                    </div>
                                  </div>

                                  <div className="mb-2">
                                    <strong>Phone:</strong> 
                                    <div className="text-muted small">{freelancer.phone || 'Not specified'}</div>
                                  </div>

                                  {/* Availability */}
                                  <div className="mb-3">
                                    <strong>Availability:</strong>
                                    <div className="mt-1">
                                      <span style={{ 
                                        background: freelancer.availability_status === 'available' ? '#d4edda' : 
                                                   freelancer.availability_status === 'busy' ? '#fff3cd' : '#f8d7da',
                                        color: freelancer.availability_status === 'available' ? '#155724' : 
                                               freelancer.availability_status === 'busy' ? '#856404' : '#721c24',
                                        padding: '4px 8px', 
                                        borderRadius: 15,
                                        fontSize: 11,
                                        fontWeight: 600
                                      }}>
                                        <i className={`bi ${
                                          freelancer.availability_status === 'available' ? 'bi-check-circle' :
                                          freelancer.availability_status === 'busy' ? 'bi-clock' : 'bi-x-circle'
                                        } me-1`}></i>
                                        {freelancer.availability_status === 'available' ? 'Available for Work' :
                                         freelancer.availability_status === 'busy' ? 'Busy' : 'Not Available'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Footer Section - Always at bottom */}
                                <div className="mt-auto">
                                  <div className="d-flex gap-2 align-items-center mb-2">
                                    <button
                                      type="button"
                                      className="btn btn-sm flex-grow-1"
                                      onClick={() => openFreelancerProfile(freelancer)}
                                      style={{ 
                                        fontSize: '12px',
                                        backgroundColor: '#ffd7c2',
                                        borderColor: '#ffd7c2',
                                        color: '#8b4513'
                                      }}
                                    >
                                      <i className="bi bi-person-lines-fill me-1"></i>
                                      View Profile
                                    </button>
                                  </div>
                                  <div className="form-check">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={highlightedFreelancers.includes(freelancer.freelancer_id)}
                                      onChange={(e) => handleHighlightFreelancer(freelancer.freelancer_id, e.target.checked)}
                                    />
                                    <label className="form-check-label small">
                                      Highlight as top recommendation
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
                   <div className="modal-footer">
                     <button type="button" className="btn btn-secondary" onClick={() => setShowRecommendationsModal(false)}>
                       Cancel
              </button>
              <button 
                         type="button"
                         className="btn"
                         style={{ background: accent, color: '#fff' }}
                         onClick={submitRecommendations}
                         disabled={recommendationsLoading || selectedFreelancers.length === 0}
                       >
                         {recommendationsLoading ? 'Submitting...' : `Submit ${selectedFreelancers.length} Recommendation${selectedFreelancers.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
          </div>
        </div>
           )}

          {/* Freelancer Profile Modal */}
          {showFreelancerProfileModal && selectedFreelancerProfile && (
            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-xl">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" style={{ color: accent, fontWeight: 600 }}>
                      <i className="bi bi-person-lines-fill me-2"></i>
                      Freelancer Profile - {selectedFreelancerProfile.first_name} {selectedFreelancerProfile.last_name}
                    </h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setShowFreelancerProfileModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    {freelancerProfileLoading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border" style={{ color: accent }} role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading detailed profile...</p>
                      </div>
                    ) : (
                      <div className="container-fluid">
                        {/* Profile Header */}
                        <div style={{
                          background: '#fff',
                          borderRadius: 20,
                          padding: '32px',
                          marginBottom: 24,
                          boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
                          border: '1px solid #f0f0f0'
                        }}>
                          <div className="row align-items-center">
                            <div className="col-md-3 text-center">
                              {(() => {
                                const BACKEND_URL = "http://localhost:5000";
                                let imgUrl = "";
                                const hasCustomImage = !!selectedFreelancerProfile?.profile_picture_url;
                                if (hasCustomImage) {
                                  imgUrl = selectedFreelancerProfile.profile_picture_url.startsWith("http")
                                    ? selectedFreelancerProfile.profile_picture_url
                                    : `${BACKEND_URL}${selectedFreelancerProfile.profile_picture_url}?t=${Date.now()}`;
                                } else {
                                  const name = `${selectedFreelancerProfile?.first_name || ""} ${selectedFreelancerProfile?.last_name || ""}`.trim() || "User";
                                  imgUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${accent.replace('#', '')}&color=fff&size=150&bold=true`;
                                }
                                return (
                                  <img
                                    src={imgUrl}
                                    alt="Profile"
                                    style={{
                                      width: 120,
                                      height: 120,
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      border: `4px solid ${accent}`,
                                      marginBottom: 16
                                    }}
                                  />
                                );
                              })()}
                              <div className="mt-2">
                                <span className={`badge ${
                                  selectedFreelancerProfile.availability_status === 'available' ? 'bg-success' :
                                  selectedFreelancerProfile.availability_status === 'busy' ? 'bg-warning' : 'bg-secondary'
                                }`} style={{ fontSize: '12px' }}>
                                  <i className={`bi ${
                                    selectedFreelancerProfile.availability_status === 'available' ? 'bi-check-circle' :
                                    selectedFreelancerProfile.availability_status === 'busy' ? 'bi-clock' : 'bi-x-circle'
                                  } me-1`}></i>
                                  {selectedFreelancerProfile.availability_status === 'available' ? 'Available for Work' :
                                   selectedFreelancerProfile.availability_status === 'busy' ? 'Busy' : 'Not Available'}
                                </span>
                              </div>
                            </div>
                            <div className="col-md-9">
                              <h2 style={{ 
                                fontWeight: 700, 
                                color: '#333', 
                                marginBottom: 8 
                              }}>
                                {selectedFreelancerProfile.first_name} {selectedFreelancerProfile.last_name}
                              </h2>
                              {selectedFreelancerProfile.headline && (
                                <h5 style={{ 
                                  color: accent, 
                                  fontWeight: 600, 
                                  marginBottom: 16 
                                }}>
                                  {selectedFreelancerProfile.headline}
                                </h5>
                              )}
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="d-flex align-items-center mb-3">
                                    <i className="bi bi-envelope me-3" style={{ color: accent, fontSize: 18 }}></i>
                                    <span style={{ color: '#666', fontSize: '15px' }}>{selectedFreelancerProfile.email}</span>
                                  </div>
                                  {selectedFreelancerProfile.phone && (
                                    <div className="d-flex align-items-center mb-3">
                                      <i className="bi bi-telephone me-3" style={{ color: accent, fontSize: 18 }}></i>
                                      <span style={{ color: '#666', fontSize: '15px' }}>{selectedFreelancerProfile.phone}</span>
                                    </div>
                                  )}
                                  {selectedFreelancerProfile.address && (
                                    <div className="d-flex align-items-center mb-3">
                                      <i className="bi bi-geo-alt me-3" style={{ color: accent, fontSize: 18 }}></i>
                                      <span style={{ color: '#666', fontSize: '15px' }}>{selectedFreelancerProfile.address}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="col-md-6">
                                  <div className="d-flex align-items-center mb-3">
                                    <i className="bi bi-briefcase me-3" style={{ color: accent, fontSize: 18 }}></i>
                                    <span style={{ color: '#666', fontSize: '15px' }}>
                                      {selectedFreelancerProfile.experience_years || selectedFreelancerProfile.years_experience || 0} years experience
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-center mb-3">
                                    <i className="bi bi-calendar me-3" style={{ color: accent, fontSize: 18 }}></i>
                                    <span style={{ color: '#666', fontSize: '15px' }}>
                                      Member since {new Date(selectedFreelancerProfile.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {selectedFreelancerProfile.current_status && (
                                    <div className="d-flex align-items-center mb-3">
                                      <i className="bi bi-person-check me-3" style={{ color: accent, fontSize: 18 }}></i>
                                      <span className={`badge ${selectedFreelancerProfile.current_status === 'Available' ? 'bg-success' : 'bg-warning'}`}>
                                        {selectedFreelancerProfile.current_status}
                                      </span>
                                    </div>
                                  )}
                                  {selectedFreelancerProfile.website && (
                                    <div className="d-flex align-items-center mb-3">
                                      <i className="bi bi-globe me-3" style={{ color: accent, fontSize: 18 }}></i>
                                      <a href={selectedFreelancerProfile.website} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'none', fontSize: '15px' }}>
                                        Website
                                      </a>
                                    </div>
                                  )}
                                  {selectedFreelancerProfile.linkedin_url && (
                                    <div className="d-flex align-items-center mb-3">
                                      <i className="bi bi-linkedin me-3" style={{ color: accent, fontSize: 18 }}></i>
                                      <a href={selectedFreelancerProfile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'none', fontSize: '15px' }}>
                                        LinkedIn Profile
                                      </a>
                                    </div>
                                  )}
                                  {selectedFreelancerProfile.github_url && (
                                    <div className="d-flex align-items-center mb-3">
                                      <i className="bi bi-github me-3" style={{ color: accent, fontSize: 18 }}></i>
                                      <a href={selectedFreelancerProfile.github_url} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: 'none', fontSize: '15px' }}>
                                        GitHub Profile
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Professional Summary */}
                        {selectedFreelancerProfile.summary && (
                          <div style={{
                            background: '#fff',
                            borderRadius: 20,
                            padding: '32px',
                            marginBottom: 24,
                            boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
                            border: '1px solid #f0f0f0'
                          }}>
                            <h4 style={{ 
                              fontWeight: 700, 
                              color: '#333', 
                              marginBottom: 16,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10
                            }}>
                              <i className="bi bi-person-lines-fill" style={{ color: accent }}></i>
                              Professional Summary
                            </h4>
                            <p style={{ 
                              color: '#666', 
                              fontSize: 16, 
                              lineHeight: 1.6,
                              margin: 0
                            }}>
                              {selectedFreelancerProfile.summary}
                            </p>
                          </div>
                        )}

                        {/* Education Summary */}
                        {selectedFreelancerProfile.education_summary && (
                          <div style={{
                            background: '#fff',
                            borderRadius: 20,
                            padding: '32px',
                            marginBottom: 24,
                            boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
                            border: '1px solid #f0f0f0'
                          }}>
                            <h4 style={{ 
                              fontWeight: 700, 
                              color: '#333', 
                              marginBottom: 16,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10
                            }}>
                              <i className="bi bi-mortarboard" style={{ color: accent }}></i>
                              Education Summary
                            </h4>
                            <p style={{ 
                              color: '#666', 
                              fontSize: 16, 
                              lineHeight: 1.6,
                              margin: 0
                            }}>
                              {selectedFreelancerProfile.education_summary}
                            </p>
                          </div>
                        )}

                        {/* Work History */}
                        {selectedFreelancerProfile.work_history && (
                          <div style={{
                            background: '#fff',
                            borderRadius: 20,
                            padding: '32px',
                            marginBottom: 24,
                            boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
                            border: '1px solid #f0f0f0'
                          }}>
                            <h4 style={{ 
                              fontWeight: 700, 
                              color: '#333', 
                              marginBottom: 16,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10
                            }}>
                              <i className="bi bi-briefcase" style={{ color: accent }}></i>
                              Work History
                            </h4>
                            <p style={{ 
                              color: '#666', 
                              fontSize: 16, 
                              lineHeight: 1.6,
                              margin: 0
                            }}>
                              {selectedFreelancerProfile.work_history}
                            </p>
                          </div>
                        )}

                        {/* Skills Section */}
                        {selectedFreelancerProfile.skills && selectedFreelancerProfile.skills.length > 0 && (
                          <div style={{
                            background: '#fff',
                            borderRadius: 20,
                            padding: '32px',
                            marginBottom: 24,
                            boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
                            border: '1px solid #f0f0f0'
                          }}>
                            <h4 style={{ 
                              fontWeight: 700, 
                              color: '#333', 
                              marginBottom: 20,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10
                            }}>
                              <i className="bi bi-star" style={{ color: accent }}></i>
                              Skills & Expertise
                            </h4>
                            <div className="row g-3">
                              {selectedFreelancerProfile.skills.map((skill, index) => (
                                <div key={skill.skill_id || index} className="col-md-6 col-lg-4">
                                  <div style={{
                                    background: '#f8f9fa',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    border: '1px solid #e9ecef',
                                    height: '100%'
                                  }}>
                                    <h6 style={{ 
                                      fontWeight: 600, 
                                      color: '#333',
                                      marginBottom: 8
                                    }}>
                                      {skill.skill_name}
                                    </h6>
                                    {skill.proficiency_level && (
                                      <div className="mb-2">
                                        <span className={`badge ${
                                          skill.proficiency_level === 'Expert' ? 'bg-success' :
                                          skill.proficiency_level === 'Advanced' ? 'bg-primary' :
                                          skill.proficiency_level === 'Intermediate' ? 'bg-warning' : 'bg-secondary'
                                        }`} style={{ fontSize: '10px' }}>
                                          {skill.proficiency_level}
                                        </span>
                                      </div>
                                    )}
                                    {skill.years_experience && (
                                      <small className="text-muted">
                                        {skill.years_experience} years experience
                                      </small>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CV Information */}
                        {selectedFreelancerProfile.cv && selectedFreelancerProfile.cv.parsed_data && (
                          <div style={{
                            background: '#fff',
                            borderRadius: 20,
                            padding: '32px',
                            marginBottom: 24,
                            boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
                            border: '1px solid #f0f0f0'
                          }}>

                            
                            {/* Work Experience */}
                            {selectedFreelancerProfile.cv.parsed_data.work_experience && (
                              <div className="mb-4">
                                <h5 style={{ color: '#333', fontWeight: 600, marginBottom: 16 }}>
                                  <i className="bi bi-briefcase me-2" style={{ color: accent }}></i>
                                  Work Experience
                                </h5>
                                {selectedFreelancerProfile.cv.parsed_data.work_experience.map((work, index) => (
                                  <div key={index} className="mb-3 p-3" style={{ 
                                    background: '#f8f9fa', 
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef'
                                  }}>
                                    <h6 style={{ color: '#333', fontWeight: 600, marginBottom: 4 }}>
                                      {work.position || work.job_title || work.title}
                                    </h6>
                                    <p style={{ color: accent, fontWeight: 500, marginBottom: 4 }}>
                                      {work.company}
                                    </p>
                                    <small className="text-muted">
                                      {work.start_date} - {work.end_date || 'Present'}
                                    </small>
                                    {work.description && (
                                      <p style={{ color: '#666', marginTop: 8, marginBottom: 0 }}>
                                        {work.description}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Education */}
                            {selectedFreelancerProfile.cv.parsed_data.education && (
                              <div className="mb-4">
                                <h5 style={{ color: '#333', fontWeight: 600, marginBottom: 16 }}>
                                  <i className="bi bi-mortarboard me-2" style={{ color: accent }}></i>
                                  Education
                                </h5>
                                {selectedFreelancerProfile.cv.parsed_data.education.map((edu, index) => (
                                  <div key={index} className="mb-3 p-3" style={{ 
                                    background: '#f8f9fa', 
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef'
                                  }}>
                                    <h6 style={{ color: '#333', fontWeight: 600, marginBottom: 4 }}>
                                      {edu.degree}
                                    </h6>
                                    <p style={{ color: accent, fontWeight: 500, marginBottom: 4 }}>
                                      {edu.institution}
                                    </p>
                                    <small className="text-muted">
                                      {edu.graduation_year || edu.year}
                                    </small>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}


                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowFreelancerProfileModal(false)}
                    >
                      Close
                    </button>
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
