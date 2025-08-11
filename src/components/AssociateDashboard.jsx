import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

const AssociateDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // Request form state
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    required_skills: '',
    min_experience: '',
    preferred_location: '',
    budget_range: '',
    urgency_level: 'normal'
  });

  // Response form state
  const [responseForm, setResponseForm] = useState({
    response: 'interested',
    notes: ''
  });

  useEffect(() => {
    fetchUserData();
    if (activeTab === 'requests') {
      fetchRequests();
    }
  }, [activeTab]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setRequestLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/associate/freelancer-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setRequestLoading(false);
    }
  };

  const fetchRecommendations = async (requestId) => {
    try {
      setRecommendationsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/associate/freelancer-requests/${requestId}/recommendations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRecommendations(response.data.recommendations);
        setShowRecommendations(true);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      setRequestLoading(true);
      const token = localStorage.getItem('token');
      
      // Convert skills string to array
      const skillsArray = requestForm.required_skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      
      const response = await axios.post('/associate/freelancer-request', {
        ...requestForm,
        required_skills: skillsArray
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Request submitted successfully!');
        setShowRequestForm(false);
        setRequestForm({
          title: '',
          description: '',
          required_skills: '',
          min_experience: '',
          preferred_location: '',
          budget_range: '',
          urgency_level: 'normal'
        });
        fetchRequests();
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleResponseSubmit = async (freelancerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/associate/freelancer-requests/${selectedRequest.request_id}/respond`, {
        freelancer_id: freelancerId,
        response: responseForm.response,
        notes: responseForm.notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Response submitted successfully!');
        setResponseForm({ response: 'interested', notes: '' });
        fetchRequests(); // Refresh to show updated response count
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response. Please try again.');
        }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-warning', text: 'Pending Review' },
      reviewed: { class: 'bg-info', text: 'Reviewed' },
      provided: { class: 'bg-primary', text: 'Recommendations Provided' },
      completed: { class: 'bg-success', text: 'Completed' },
      cancelled: { class: 'bg-danger', text: 'Cancelled' }
    };

    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    
    return (
      <span className={`badge ${config.class} text-white px-2 py-1 rounded-pill`}>
        {config.text}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      low: { class: 'bg-success', text: 'Low' },
      normal: { class: 'bg-warning', text: 'Normal' },
      high: { class: 'bg-danger', text: 'High' },
      urgent: { class: 'bg-danger', text: 'Urgent' }
    };

    const config = urgencyConfig[urgency] || { class: 'bg-secondary', text: urgency };
    
    return (
      <span className={`badge ${config.class} text-white px-2 py-1 rounded-pill`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Welcome back, {user?.first_name}!</h2>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/associate/profile')}
              >
                <i className="bi bi-person-circle me-2"></i>
                Profile
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/associate/change-password')}
              >
                <i className="bi bi-key me-2"></i>
                Change Password
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4" id="dashboardTabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
                type="button"
              >
                <i className="bi bi-house me-2"></i>
                Overview
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
                type="button"
              >
                <i className="bi bi-file-earmark-text me-2"></i>
                Freelancer Requests
                {requests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="badge bg-warning text-dark ms-2">
                    {requests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            </li>
          </ul>

          {/* Tab Content */}
          <div className="tab-content" id="dashboardTabContent">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="tab-pane fade show active">
                <div className="row">
                  <div className="col-md-4 mb-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                          <i className="bi bi-file-earmark-text text-primary" style={{ fontSize: '24px' }}></i>
                        </div>
                        <h5 className="card-title">Total Requests</h5>
                        <h3 className="text-primary mb-0">{requests.length}</h3>
                        <p className="text-muted small mb-0">Freelancer service requests</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                          <i className="bi bi-clock text-warning" style={{ fontSize: '24px' }}></i>
                        </div>
                        <h5 className="card-title">Pending Review</h5>
                        <h3 className="text-warning mb-0">{requests.filter(r => r.status === 'pending').length}</h3>
                        <p className="text-muted small mb-0">Awaiting ECS Admin review</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                          <i className="bi bi-check-circle text-success" style={{ fontSize: '24px' }}></i>
                        </div>
                        <h5 className="card-title">Completed</h5>
                        <h3 className="text-success mb-0">{requests.filter(r => r.status === 'completed').length}</h3>
                        <p className="text-muted small mb-0">Successfully completed</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-transparent border-0">
                        <h5 className="mb-0">Recent Activity</h5>
                      </div>
                      <div className="card-body">
                        {requests.length === 0 ? (
                          <div className="text-center py-4">
                            <i className="bi bi-inbox text-muted" style={{ fontSize: '48px' }}></i>
                            <p className="text-muted mt-3">No requests yet. Submit your first freelancer request to get started!</p>
                            <button 
                              className="btn btn-primary"
                              onClick={() => setActiveTab('requests')}
                            >
                              Submit Request
                            </button>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead>
                                <tr>
                                  <th>Request</th>
                                  <th>Status</th>
                                  <th>Urgency</th>
                                  <th>Created</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {requests.slice(0, 5).map((request) => (
                                  <tr key={request.request_id}>
                                    <td>
                                      <div>
                                        <strong>{request.title}</strong>
                                        <br />
                                        <small className="text-muted">{request.description.substring(0, 50)}...</small>
                                      </div>
                                    </td>
                                    <td>{getStatusBadge(request.status)}</td>
                                    <td>{getUrgencyBadge(request.urgency_level)}</td>
                                    <td>{new Date(request.created_at).toLocaleDateString()}</td>
                                    <td>
                                      <button 
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => {
                                          setSelectedRequest(request);
                                          fetchRecommendations(request.request_id);
                                        }}
                                      >
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
                </div>
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="tab-pane fade show active">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0">Freelancer Service Requests</h4>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowRequestForm(true)}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Submit New Request
                  </button>
                </div>

                {requestLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    {requests.map((request) => (
                      <div key={request.request_id} className="col-md-6 col-lg-4 mb-4">
                        <div className="card border-0 shadow-sm h-100">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-title mb-0">{request.title}</h6>
                              {getStatusBadge(request.status)}
                            </div>
                            
                            <p className="card-text text-muted small mb-3">
                              {request.description.substring(0, 100)}...
                            </p>

                            <div className="mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <small className="text-muted">Skills Required:</small>
                                <small className="text-muted">{request.required_skills.length} skills</small>
                              </div>
                              <div className="d-flex flex-wrap gap-1">
                                {request.required_skills.slice(0, 3).map((skill, index) => (
                                  <span key={index} className="badge bg-light text-dark border px-2 py-1">
                                    {skill}
                                  </span>
                                ))}
                                {request.required_skills.length > 3 && (
                                  <span className="badge bg-light text-dark border px-2 py-1">
                                    +{request.required_skills.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="row text-center mb-3">
                              <div className="col-6">
                                <small className="text-muted d-block">Experience</small>
                                <strong>{request.min_experience || 0}+ years</strong>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">Urgency</small>
                                {getUrgencyBadge(request.urgency_level)}
                              </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                {new Date(request.created_at).toLocaleDateString()}
                              </small>
                              <div className="d-flex gap-2">
                                {request.status === 'provided' && (
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      fetchRecommendations(request.request_id);
                                    }}
                                  >
                                    View Recommendations
                                  </button>
                                )}
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    fetchRecommendations(request.request_id);
                                  }}
                                >
                                  Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {requests.length === 0 && !requestLoading && (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: '64px' }}></i>
                    <h5 className="text-muted mt-3">No requests yet</h5>
                    <p className="text-muted">Submit your first freelancer service request to get started.</p>
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={() => setShowRequestForm(true)}
                    >
                      Submit Your First Request
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Submission Modal */}
      {showRequestForm && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Submit Freelancer Service Request</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowRequestForm(false)}
                ></button>
              </div>
              <form onSubmit={handleRequestSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <label htmlFor="title" className="form-label">Request Title *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="title"
                          name="title"
                          value={requestForm.title}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., Need React Developer for E-commerce App"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="urgency_level" className="form-label">Urgency Level</label>
                        <select
                          className="form-select"
                          id="urgency_level"
                          name="urgency_level"
                          value={requestForm.urgency_level}
                          onChange={handleInputChange}
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Project Description *</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="4"
                      value={requestForm.description}
                      onChange={handleInputChange}
                      required
                      placeholder="Describe your project requirements, goals, and expectations..."
                    ></textarea>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="required_skills" className="form-label">Required Skills *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="required_skills"
                          name="required_skills"
                          value={requestForm.required_skills}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., React, Node.js, PostgreSQL (comma-separated)"
                        />
                        <div className="form-text">Separate multiple skills with commas</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="min_experience" className="form-label">Minimum Experience (years)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="min_experience"
                          name="min_experience"
                          value={requestForm.min_experience}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="e.g., 3"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="preferred_location" className="form-label">Preferred Location</label>
                        <input
                          type="text"
                          className="form-control"
                          id="preferred_location"
                          name="preferred_location"
                          value={requestForm.preferred_location}
                          onChange={handleInputChange}
                          placeholder="e.g., Remote, Johannesburg, Cape Town"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="budget_range" className="form-label">Budget Range</label>
                        <input
                          type="text"
                          className="form-control"
                          id="budget_range"
                          name="budget_range"
                          value={requestForm.budget_range}
                          onChange={handleInputChange}
                          placeholder="e.g., R15,000 - R25,000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowRequestForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={requestLoading}
                  >
                    {requestLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Modal */}
      {showRecommendations && selectedRequest && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Freelancer Recommendations for: {selectedRequest.title}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowRecommendations(false);
                    setSelectedRequest(null);
                    setRecommendations([]);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {recommendationsLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-people text-muted" style={{ fontSize: '48px' }}></i>
                    <p className="text-muted mt-3">No recommendations available yet.</p>
                    <p className="text-muted small">ECS Admin will provide curated freelancer options soon.</p>
                  </div>
                ) : (
                  <div className="row">
                    {recommendations.map((rec) => (
                      <div key={rec.recommendation_id} className="col-md-6 mb-4">
                        <div className={`card border-0 shadow-sm h-100 ${rec.is_highlighted ? 'border-primary border-2' : ''}`}>
                          <div className="card-body">
                            {rec.is_highlighted && (
                              <div className="text-center mb-3">
                                <span className="badge bg-primary px-3 py-2">
                                  <i className="bi bi-star-fill me-2"></i>
                                  ECS Admin Recommended
                                </span>
                              </div>
                            )}
                            
                            <div className="d-flex align-items-center mb-3">
                              <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                                <span className="text-primary fw-bold">
                                  {rec.first_name?.charAt(0)}{rec.last_name?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h6 className="mb-1">{rec.first_name} {rec.last_name}</h6>
                                <p className="text-muted small mb-0">{rec.headline}</p>
                              </div>
                            </div>

                            <div className="mb-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">ECS Admin Rating:</small>
                                <div className="d-flex align-items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <i 
                                      key={i}
                                      className={`bi ${i < (rec.admin_rating || 0) ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
                                    ></i>
                                  ))}
                                  <span className="ms-2 small text-muted">({rec.admin_rating || 0}/5)</span>
                                </div>
                              </div>
                            </div>

                            {rec.admin_notes && (
                              <div className="mb-3">
                                <small className="text-muted d-block mb-1">ECS Admin Notes:</small>
                                <p className="small mb-0 bg-light p-2 rounded">{rec.admin_notes}</p>
                              </div>
                            )}

                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                <i className="bi bi-envelope me-1"></i>
                                {rec.freelancer_email}
                              </small>
                              <div className="d-flex gap-2">
                                <button 
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => {
                                    setResponseForm({ response: 'interested', notes: '' });
                                    handleResponseSubmit(rec.freelancer_id);
                                  }}
                                >
                                  <i className="bi bi-check-circle me-1"></i>
                                  Interested
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => {
                                    setResponseForm({ response: 'not_interested', notes: '' });
                                    handleResponseSubmit(rec.freelancer_id);
                                  }}
                                >
                                  <i className="bi bi-x-circle me-1"></i>
                                  Not Interested
                                </button>
                              </div>
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
                  onClick={() => {
                    setShowRecommendations(false);
                    setSelectedRequest(null);
                    setRecommendations([]);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssociateDashboard;