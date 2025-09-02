import React, { useState, useEffect } from 'react';
import api from '../utils/axios';

const InterviewSchedulingModal = ({ isOpen, onClose, freelancer, request, onScheduleSuccess }) => {
  const [formData, setFormData] = useState({
    interview_type: 'video',
    scheduled_date: '',
    duration_minutes: 60,
    location: '',
    interview_notes: '',
    invitation_message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        interview_type: 'video',
        scheduled_date: '',
        duration_minutes: 60,
        location: '',
        interview_notes: '',
        invitation_message: ''
      });
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const interviewData = {
        request_id: request.request_id,
        freelancer_id: freelancer.freelancer_id,
        ...formData
      };

      const response = await api.post('/interview/schedule', interviewData);

      if (response.data.success) {
        setSuccess('Interview scheduled successfully!');
        if (onScheduleSuccess) {
          onScheduleSuccess();
        }
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Interview scheduling error:', error);
      setError(error.response?.data?.message || 'Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-calendar-event me-2"></i>
              Schedule Interview
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Freelancer Info */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  {freelancer.profile_picture_url ? (
                    <img 
                      src={freelancer.profile_picture_url} 
                      alt="Profile" 
                      className="rounded-circle me-3" 
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style={{ width: '50px', height: '50px' }}>
                      <i className="bi bi-person text-white"></i>
                    </div>
                  )}
                  <div>
                    <h6 className="mb-1">{freelancer.first_name} {freelancer.last_name}</h6>
                    <p className="text-muted mb-0">{freelancer.headline || 'Professional'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="card mb-4">
              <div className="card-body">
                <h6 className="card-title">
                  <i className="bi bi-briefcase me-2"></i>
                  Project Details
                </h6>
                <p className="mb-1"><strong>Title:</strong> {request.title}</p>
                <p className="mb-0"><strong>Description:</strong> {request.description}</p>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="alert alert-success" role="alert">
                <i className="bi bi-check-circle me-2"></i>
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Interview Form */}
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* Interview Type */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-camera-video me-1"></i>
                    Interview Type
                  </label>
                  <select
                    className="form-select"
                    name="interview_type"
                    value={formData.interview_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="video">Video Call (Jitsi Meet)</option>
                    <option value="phone">Phone Call</option>
                    <option value="in_person">In-Person Meeting</option>
                  </select>
                </div>

                {/* Duration */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-clock me-1"></i>
                    Duration (minutes)
                  </label>
                  <select
                    className="form-select"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>

              {/* Scheduled Date & Time */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-calendar-check me-1"></i>
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={handleInputChange}
                  min={getMinDateTime()}
                  required
                />
                <div className="form-text">
                  <i className="bi bi-info-circle me-1"></i>
                  Select a date and time at least 30 minutes from now
                </div>
              </div>

              {/* Location (for in-person interviews) */}
              {formData.interview_type === 'in_person' && (
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-geo-alt me-1"></i>
                    Meeting Location
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter meeting address or location"
                    required={formData.interview_type === 'in_person'}
                  />
                </div>
              )}

              {/* Interview Notes */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-sticky me-1"></i>
                  Interview Notes
                </label>
                <textarea
                  className="form-control"
                  name="interview_notes"
                  value={formData.interview_notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any specific topics or questions you'd like to discuss during the interview..."
                />
              </div>

              {/* Invitation Message */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-envelope me-1"></i>
                  Invitation Message
                </label>
                <textarea
                  className="form-control"
                  name="invitation_message"
                  value={formData.invitation_message}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Personal message to include with the interview invitation..."
                />
                <div className="form-text">
                  <i className="bi bi-info-circle me-1"></i>
                  This message will be sent to the freelancer along with the interview invitation
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  <i className="bi bi-x-circle me-1"></i>
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
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-calendar-plus me-1"></i>
                      Schedule Interview
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSchedulingModal;
