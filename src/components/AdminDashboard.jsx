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
  
  // Enhanced statistics
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  
  // Analytics tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('90d');
  const [analyticsData, setAnalyticsData] = useState({
    registrationTrends: [],
    userTypeDistribution: [],
    userActivityStatus: [],
    systemPerformance: null
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, timeRange]);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
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

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      
      // Load registration trends
      const trendsResponse = await api.get(`/admin/analytics/registration-trends?days=${timeRange === '30d' ? 30 : timeRange === '60d' ? 60 : 90}`);
      if (trendsResponse.data.success) {
        setAnalyticsData(prev => ({ ...prev, registrationTrends: trendsResponse.data.data }));
      }

      // Load user type distribution
      const distributionResponse = await api.get('/admin/analytics/user-type-distribution');
      if (distributionResponse.data.success) {
        setAnalyticsData(prev => ({ ...prev, userTypeDistribution: distributionResponse.data.data }));
      }

      // Load user activity status
      const activityResponse = await api.get('/admin/analytics/user-activity-status');
      if (activityResponse.data.success) {
        setAnalyticsData(prev => ({ ...prev, userActivityStatus: activityResponse.data.data }));
      }

      // Load system performance
      const performanceResponse = await api.get('/admin/analytics/system-performance');
      if (performanceResponse.data.success) {
        setAnalyticsData(prev => ({ ...prev, systemPerformance: performanceResponse.data.data }));
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderDashboard = () => (
    <div className="tab-content">
      <div className="row">
        <div className="col-md-12">
          <h3>System Overview</h3>
          {statsLoading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : stats ? (
            <div className="row">
              <div className="col-md-3 mb-3">
                <div className="card bg-primary text-white">
                  <div className="card-body">
                    <h5 className="card-title">Total Users</h5>
                    <h2>{Object.values(stats.users).reduce((a, b) => a + b, 0)}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <h5 className="card-title">Total CVs</h5>
                    <h2>{stats.total_cvs}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card bg-info text-white">
                  <div className="card-body">
                    <h5 className="card-title">Total Jobs</h5>
                    <h2>{stats.total_jobs}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card bg-warning text-white">
                  <div className="card-body">
                    <h5 className="card-title">Total Messages</h5>
                    <h2>{stats.total_messages}</h2>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-danger">{statsError}</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="tab-content">
      <div className="row">
        <div className="col-md-12 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <h3>Analytics Dashboard</h3>
            <select 
              className="form-select w-auto"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="30d">Last 30 Days</option>
              <option value="60d">Last 60 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
        
        {analyticsLoading ? (
          <div className="col-md-12 text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Registration Trends Chart */}
            <div className="col-md-8 mb-4">
              <div className="card">
                <div className="card-header">
                  <h5>User Registration Trends</h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData.registrationTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="freelancers" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                      <Area type="monotone" dataKey="associates" stackId="1" stroke="#ffc658" fill="#ffc658" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* User Type Distribution */}
            <div className="col-md-4 mb-4">
              <div className="card">
                <div className="card-header">
                  <h5>User Type Distribution</h5>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.userTypeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
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

            {/* System Performance */}
            {analyticsData.systemPerformance && (
              <div className="col-md-12 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5>Real-time System Performance</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <div className="text-center">
                          <h4 className="text-primary">{analyticsData.systemPerformance.total_users}</h4>
                          <p className="text-muted">Active Users</p>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h4 className="text-success">{analyticsData.systemPerformance.total_cvs}</h4>
                          <p className="text-muted">Total CVs</p>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h4 className="text-info">{analyticsData.systemPerformance.total_jobs}</h4>
                          <p className="text-muted">Job Postings</p>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center">
                          <h4 className="text-warning">{analyticsData.systemPerformance.recent_users_24h}</h4>
                          <p className="text-muted">New Users (24h)</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        Last updated: {new Date(analyticsData.systemPerformance.timestamp).toLocaleString()}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.user_type !== 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Access denied. You must be an admin to view this dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1>ECS Admin Dashboard</h1>
              <p className="text-muted">Welcome back, {user.email}</p>
            </div>
            <div className="col-md-6 text-end">
              <button className="btn btn-outline-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        <div className="row">
          <div className="col-md-3">
            <div className="nav flex-column nav-pills">
              <button 
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <i className="bi bi-speedometer2"></i> Dashboard
              </button>
              <button 
                className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <i className="bi bi-graph-up"></i> Analytics
              </button>
            </div>
          </div>
          
          <div className="col-md-9">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'analytics' && renderAnalytics()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ESCAdminDashboard;
