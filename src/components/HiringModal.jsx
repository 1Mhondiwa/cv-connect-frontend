import React, { useState } from 'react';
import api from '../utils/axios';

const HiringModal = ({ isOpen, onClose, freelancer, request, onHireSuccess }) => {
  const [formData, setFormData] = useState({
    project_title: request?.title || '',
    project_description: request?.description || '',
    agreed_terms: '',
    agreed_rate: '',
    rate_type: 'hourly',
    start_date: '',
    expected_end_date: '',
    associate_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const hiringData = {
        request_id: request.request_id,
        freelancer_id: freelancer.freelancer_id,
        ...formData
      };

      const response = await api.post('/hiring/hire', hiringData);

      if (response.data.success) {
        setSuccess('Freelancer hired successfully!');
        setFormData({
          project_title: '',
          project_description: '',
          agreed_terms: '',
          agreed_rate: '',
          rate_type: 'hourly',
          start_date: '',
          expected_end_date: '',
          associate_notes: ''
        });
        
        // Call success callback to refresh data
        if (onHireSuccess) {
          onHireSuccess();
        }
        
        // Close modal after 2 seconds
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

  if (!isOpen || !freelancer || !request) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
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
            {/* Success Message */}
            {success && (
              <div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
                <i className="bi bi-check-circle me-2"></i>
                {success}
                <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}

            {/* Freelancer Info */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h6 className="fw-bold">Freelancer Details</h6>
                <p><strong>Name:</strong> {freelancer.first_name} {freelancer.last_name}</p>
                <p><strong>Role:</strong> {freelancer.headline}</p>
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
                <p><strong>Skills:</strong> {request.required_skills.join(', ')}</p>
                <p><strong>Experience:</strong> {request.min_experience} years</p>
              </div>
            </div>

            {/* Hiring Form */}
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
                  <label className="form-label">Agreed Rate</label>
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
                <label className="form-label">Agreed Terms *</label>
                <textarea
                  className="form-control"
                  name="agreed_terms"
                  value={formData.agreed_terms}
                  onChange={handleInputChange}
                  rows="4"
                  required
                  placeholder="Enter the terms agreed upon with the freelancer (payment schedule, deliverables, etc.)"
                ></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label">Additional Notes</label>
                <textarea
                  className="form-control"
                  name="associate_notes"
                  value={formData.associate_notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any additional notes or special requirements"
                ></textarea>
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
                  className="btn btn-primary"
                  disabled={loading}
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
            </form>
          </div>
        </div>
      </div>
      
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>
    </div>
  );
};

export default HiringModal;
