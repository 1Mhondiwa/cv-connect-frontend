import React, { useState, useEffect } from 'react';
import api from '../utils/axios';

const HiringModal = ({ isOpen, onClose, freelancer, request, onHireSuccess }) => {
  const [formData, setFormData] = useState({
    project_title: '',
    project_description: '',
    agreed_rate: '',
    rate_type: 'hourly',
    start_date: '',
    expected_end_date: '',
    contract_pdf: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (request) {
      setFormData({
        project_title: request.title || '',
        project_description: request.description || '',
        agreed_rate: '',
        rate_type: 'hourly',
        start_date: '',
        expected_end_date: '',
        contract_pdf: null
      });
    }
  }, [request]);

  if (!isOpen || !freelancer || !request) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file only.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB.');
        return;
      }
      setFormData(prev => ({
        ...prev,
        contract_pdf: file
      }));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.contract_pdf) {
      setError('Please upload a contract PDF file.');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('request_id', request.request_id);
      formDataToSend.append('freelancer_id', freelancer.freelancer_id);
      formDataToSend.append('project_title', formData.project_title);
      formDataToSend.append('project_description', formData.project_description);
      formDataToSend.append('agreed_rate', formData.agreed_rate);
      formDataToSend.append('rate_type', formData.rate_type);
      formDataToSend.append('start_date', formData.start_date);
      formDataToSend.append('expected_end_date', formData.expected_end_date);
      formDataToSend.append('contract_pdf', formData.contract_pdf);

      const response = await api.post('/hiring/hire', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess('Freelancer hired successfully!');
        if (onHireSuccess) {
          onHireSuccess();
        }
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Hiring error:', error);
      setError(error.response?.data?.message || 'Failed to hire freelancer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" style={{ color: '#8b4513', fontWeight: 600 }}>
              <i className="bi bi-briefcase me-2"></i>
              Hire {freelancer.first_name} {freelancer.last_name}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          
          <div className="modal-body">
            {success && (
              <div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
                <i className="bi bi-check-circle me-2"></i>
                {success}
                <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
              </div>
            )}

            {error && (
              <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}

            <div className="row mb-4">
              <div className="col-md-6">
                <h6 className="fw-bold">Freelancer Details</h6>
                <p><strong>Name:</strong> {freelancer.first_name} {freelancer.last_name}</p>
                <p><strong>Role:</strong> {freelancer.headline}</p>
                {freelancer.hourly_rate && (
                  <p><strong>Hourly Rate:</strong> 
                    <span style={{ 
                      background: '#fff3cd', 
                      color: '#856404', 
                      padding: '2px 6px', 
                      borderRadius: 8,
                      fontSize: '12px',
                      fontWeight: 600,
                      marginLeft: '8px'
                    }}>
                      <i className="bi bi-currency-exchange me-1"></i>
                      R{freelancer.hourly_rate}/hour
                    </span>
                  </p>
                )}
                <p><strong>Rating:</strong> 
                  {[...Array(5)].map((_, i) => (
                    <i 
                      key={i} 
                      className={`bi bi-star${i < (freelancer.admin_rating || 0) ? '-fill' : ''}`}
                      style={{ color: '#ffc107' }}
                    ></i>
                  ))}
                </p>
              </div>
              <div className="col-md-6">
                <h6 className="fw-bold">Project Request</h6>
                <p><strong>Title:</strong> {request.title}</p>
                <p><strong>Skills:</strong> {Array.isArray(request.required_skills) ? request.required_skills.join(', ') : 'Not specified'}</p>
                <p><strong>Experience:</strong> {request.min_experience || 'Not specified'} years</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Project Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="project_title"
                    value={formData.project_title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter project title"
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Rate Type</label>
                  <select
                    className="form-select"
                    name="rate_type"
                    value={formData.rate_type}
                    onChange={handleInputChange}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="fixed">Fixed</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Agreed Rate (ZAR)</label>
                  <div className="input-group">
                    <span className="input-group-text">R</span>
                    <input
                      type="number"
                      className="form-control"
                      name="agreed_rate"
                      value={formData.agreed_rate}
                      onChange={handleInputChange}
                      placeholder="Enter agreed rate"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Expected End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="expected_end_date"
                    value={formData.expected_end_date}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Project Description</label>
                  <textarea
                    className="form-control"
                    name="project_description"
                    value={formData.project_description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe the project scope"
                  ></textarea>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Contract PDF *</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                />
                <small className="text-muted">
                  Upload a PDF document containing the agreed terms, payment schedule, deliverables, and any additional requirements. 
                  Maximum file size: 10MB
                </small>
                {formData.contract_pdf && (
                  <div className="mt-2">
                    <span className="badge bg-success">
                      <i className="bi bi-file-pdf me-1"></i>
                      {formData.contract_pdf.name}
                    </span>
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              className="btn"
              disabled={loading}
              onClick={handleSubmit}
              style={{ 
                backgroundColor: '#ffd7c2',
                borderColor: '#ffd7c2',
                color: '#8b4513',
                transition: 'all 0.3s ease-in-out',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.backgroundColor = '#ffc299';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 215, 194, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.backgroundColor = '#ffd7c2';
                  e.target.style.boxShadow = 'none';
                }
              }}
              onMouseDown={(e) => {
                if (!loading) {
                  e.target.style.transform = 'scale(0.95)';
                }
              }}
              onMouseUp={(e) => {
                if (!loading) {
                  e.target.style.transform = 'scale(1.05)';
                }
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Hiring...
                </>
              ) : (
                <>
                  <i className="bi bi-briefcase me-2"></i>
                  Hire Freelancer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiringModal;
