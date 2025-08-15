import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const ECSEmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('associate-requests');
  const [associateRequests, setAssociateRequests] = useState([]);
  const [freelancerRequests, setFreelancerRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [freelancers, setFreelancers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user && user.user_type === 'ecs_employee') {
      loadAssociateRequests();
      loadFreelancers();
    }
  }, [user, currentPage]);

  const loadAssociateRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ecs-employee/associate-requests?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssociateRequests(data.requests);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading associate requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFreelancerRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ecs-employee/associate-freelancer-requests?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFreelancerRequests(data.requests);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading freelancer requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFreelancers = async () => {
    try {
      const response = await fetch('/api/admin/freelancers?limit=1000', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFreelancers(data.freelancers);
      }
    } catch (error) {
      console.error('Error loading freelancers:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openModal = (type, request = null) => {
    setModalType(type);
    setSelectedRequest(request);
    setFormData({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setFormData({});
  };

  const handleAssociateRequestReview = async (requestId, status, notes) => {
    try {
      const response = await fetch(`/api/ecs-employee/associate-requests/${requestId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        const data = await response.json();
        if (status === 'approved' && data.data?.tempPassword) {
          alert(`Request approved! Temporary password: ${data.data.tempPassword}`);
        } else {
          alert(`Request ${status} successfully!`);
        }
        loadAssociateRequests();
        closeModal();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error reviewing request:', error);
      alert('Error reviewing request');
    }
  };

  const handleFreelancerRecommendations = async (requestId) => {
    try {
      const response = await fetch(`/api/ecs-employee/associate-freelancer-requests/${requestId}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Recommendations added successfully!');
        loadFreelancerRequests();
        closeModal();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding recommendations:', error);
      alert('Error adding recommendations');
    }
  };

  const handleStatusUpdate = async (requestId, status, notes) => {
    try {
      const response = await fetch(`/api/ecs-employee/associate-freelancer-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, admin_notes: notes })
      });

      if (response.ok) {
        alert('Status updated successfully!');
        loadFreelancerRequests();
        closeModal();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const renderAssociateRequests = () => (
    <div className="tab-content">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Associate Requests</h3>
        <button className="btn btn-primary" onClick={() => loadAssociateRequests()}>
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Industry</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {associateRequests.map((request) => (
                <tr key={request.request_id}>
                  <td>{request.company_name}</td>
                  <td>{request.contact_person}</td>
                  <td>{request.email}</td>
                  <td>{request.industry}</td>
                  <td>
                    <span className={`badge bg-${request.status === 'pending' ? 'warning' : request.status === 'approved' ? 'success' : 'danger'}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>
                    {request.status === 'pending' && (
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => openModal('approve', request)}
                        >
                          <i className="bi bi-check-circle"></i> Approve
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => openModal('reject', request)}
                        >
                          <i className="bi bi-x-circle"></i> Reject
                        </button>
                      </div>
                    )}
                    <button 
                      className="btn btn-sm btn-info ms-1"
                      onClick={() => openModal('view', request)}
                    >
                      <i className="bi bi-eye"></i> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderFreelancerRequests = () => (
    <div className="tab-content">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Associate Freelancer Requests</h3>
        <button className="btn btn-primary" onClick={() => loadFreelancerRequests()}>
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact Person</th>
                <th>Title</th>
                <th>Required Skills</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {freelancerRequests.map((request) => (
                <tr key={request.request_id}>
                  <td>{request.company_name}</td>
                  <td>{request.contact_person}</td>
                  <td>{request.title}</td>
                  <td>{request.required_skills}</td>
                  <td>
                    <span className={`badge bg-${request.status === 'pending' ? 'warning' : request.status === 'provided' ? 'success' : 'info'}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>
                    {request.status === 'pending' && (
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => openModal('recommendations', request)}
                      >
                        <i className="bi bi-person-plus"></i> Add Recommendations
                      </button>
                    )}
                    <button 
                      className="btn btn-sm btn-info ms-1"
                      onClick={() => openModal('view-freelancer', request)}
                    >
                      <i className="bi bi-eye"></i> View
                    </button>
                    <button 
                      className="btn btn-sm btn-warning ms-1"
                      onClick={() => openModal('status', request)}
                    >
                      <i className="bi bi-pencil"></i> Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {modalType === 'approve' && 'Approve Associate Request'}
                {modalType === 'reject' && 'Reject Associate Request'}
                {modalType === 'view' && 'View Associate Request Details'}
                {modalType === 'recommendations' && 'Add Freelancer Recommendations'}
                {modalType === 'view-freelancer' && 'View Freelancer Request Details'}
                {modalType === 'status' && 'Update Request Status'}
              </h5>
              <button type="button" className="btn-close" onClick={closeModal}></button>
            </div>
            <div className="modal-body">
              {modalType === 'approve' && (
                <div>
                  <p>Are you sure you want to approve this associate request?</p>
                  <div className="mb-3">
                    <label className="form-label">Notes (optional):</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              )}
              
              {modalType === 'reject' && (
                <div>
                  <p>Are you sure you want to reject this associate request?</p>
                  <div className="mb-3">
                    <label className="form-label">Rejection Reason:</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      required
                    ></textarea>
                  </div>
                </div>
              )}
              
              {modalType === 'view' && selectedRequest && (
                <div>
                  <h6>Company Details</h6>
                  <p><strong>Company Name:</strong> {selectedRequest.company_name}</p>
                  <p><strong>Contact Person:</strong> {selectedRequest.contact_person}</p>
                  <p><strong>Email:</strong> {selectedRequest.email}</p>
                  <p><strong>Phone:</strong> {selectedRequest.phone}</p>
                  <p><strong>Industry:</strong> {selectedRequest.industry}</p>
                  <p><strong>Address:</strong> {selectedRequest.address}</p>
                  <p><strong>Website:</strong> {selectedRequest.website}</p>
                  <p><strong>Status:</strong> {selectedRequest.status}</p>
                  <p><strong>Created:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</p>
                  {selectedRequest.notes && (
                    <p><strong>Notes:</strong> {selectedRequest.notes}</p>
                  )}
                </div>
              )}
              
              {modalType === 'recommendations' && selectedRequest && (
                <div>
                  <h6>Select Freelancers</h6>
                  <div className="mb-3">
                    <label className="form-label">Freelancers:</label>
                    <select 
                      multiple 
                      className="form-select" 
                      size="8"
                      value={formData.freelancer_ids || []}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setFormData({...formData, freelancer_ids: selected});
                      }}
                    >
                      {freelancers.map((freelancer) => (
                        <option key={freelancer.freelancer_id} value={freelancer.freelancer_id}>
                          {freelancer.first_name} {freelancer.last_name} - {freelancer.skills}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes:</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      value={formData.admin_notes || ''}
                      onChange={(e) => setFormData({...formData, admin_notes: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              )}
              
              {modalType === 'view-freelancer' && selectedRequest && (
                <div>
                  <h6>Request Details</h6>
                  <p><strong>Company:</strong> {selectedRequest.company_name}</p>
                  <p><strong>Contact Person:</strong> {selectedRequest.contact_person}</p>
                  <p><strong>Title:</strong> {selectedRequest.title}</p>
                  <p><strong>Required Skills:</strong> {selectedRequest.required_skills}</p>
                  <p><strong>Description:</strong> {selectedRequest.description}</p>
                  <p><strong>Status:</strong> {selectedRequest.status}</p>
                  <p><strong>Created:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
              )}
              
              {modalType === 'status' && selectedRequest && (
                <div>
                  <div className="mb-3">
                    <label className="form-label">New Status:</label>
                    <select 
                      className="form-select"
                      value={formData.status || selectedRequest.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="provided">Provided</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notes:</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      value={formData.admin_notes || ''}
                      onChange={(e) => setFormData({...formData, admin_notes: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {modalType === 'approve' && (
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={() => handleAssociateRequestReview(selectedRequest.request_id, 'approved', formData.notes)}
                >
                  Approve
                </button>
              )}
              
              {modalType === 'reject' && (
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleAssociateRequestReview(selectedRequest.request_id, 'rejected', formData.notes)}
                >
                  Reject
                </button>
              )}
              
              {modalType === 'recommendations' && (
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => handleFreelancerRecommendations(selectedRequest.request_id)}
                  disabled={!formData.freelancer_ids || formData.freelancer_ids.length === 0}
                >
                  Add Recommendations
                </button>
              )}
              
              {modalType === 'status' && (
                <button 
                  type="button" 
                  className="btn btn-warning"
                  onClick={() => handleStatusUpdate(selectedRequest.request_id, formData.status, formData.admin_notes)}
                >
                  Update Status
                </button>
              )}
              
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user || user.user_type !== 'ecs_employee') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          Access denied. You must be an ECS Employee to view this dashboard.
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
              <h1>ECS Employee Dashboard</h1>
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
                className={`nav-link ${activeTab === 'associate-requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('associate-requests')}
              >
                <i className="bi bi-building"></i> Associate Requests
              </button>
              <button 
                className={`nav-link ${activeTab === 'freelancer-requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('freelancer-requests')}
              >
                <i className="bi bi-person-workspace"></i> Freelancer Requests
              </button>
            </div>
          </div>
          
          <div className="col-md-9">
            {activeTab === 'associate-requests' && renderAssociateRequests()}
            {activeTab === 'freelancer-requests' && renderFreelancerRequests()}
          </div>
        </div>
      </div>

      {renderModal()}
    </div>
  );
};

export default ECSEmployeeDashboard;
