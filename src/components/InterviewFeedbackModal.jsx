import React, { useState } from 'react';
import api from '../utils/axios';

const InterviewFeedbackModal = ({ isOpen, onClose, interview, userType, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    technical_skills_rating: '',
    communication_rating: '',
    cultural_fit_rating: '',
    overall_rating: '',
    strengths: '',
    areas_for_improvement: '',
    recommendation: '',
    detailed_feedback: ''
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
      const feedbackData = {
        interview_id: interview.interview_id,
        ...formData
      };

      const response = await api.post('/interview/feedback', feedbackData);

      if (response.data.success) {
        setSuccess('Feedback submitted successfully!');
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      setError(error.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (name, label, required = false) => {
    return (
      <div className="mb-3">
        <label className="form-label fw-semibold">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <div className="d-flex gap-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              className={`btn btn-outline-warning ${formData[name] >= rating ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, [name]: rating }))}
              style={{ 
                width: '40px', 
                height: '40px',
                border: formData[name] >= rating ? '2px solid #ffc107' : '1px solid #dee2e6'
              }}
            >
              <i className={`bi bi-star${formData[name] >= rating ? '-fill' : ''}`}></i>
            </button>
          ))}
        </div>
        <div className="form-text">
          {formData[name] ? `${formData[name]} star${formData[name] !== 1 ? 's' : ''}` : 'Click to rate'}
        </div>
      </div>
    );
  };

  if (!isOpen || !interview) {
    return null;
  }

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-star me-2"></i>
              Interview Feedback
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Interview Info */}
            <div className="card mb-4">
              <div className="card-body">
                <h6 className="card-title">
                  <i className="bi bi-calendar-event me-2"></i>
                  Interview Details
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Date:</strong> {new Date(interview.scheduled_date).toLocaleDateString()}</p>
                    <p className="mb-1"><strong>Type:</strong> {interview.interview_type.replace('_', ' ')}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Duration:</strong> {interview.duration_minutes} minutes</p>
                    <p className="mb-1"><strong>Project:</strong> {interview.request_title}</p>
                  </div>
                </div>
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

            {/* Feedback Form */}
            <form onSubmit={handleSubmit}>
              {/* Rating Section */}
              <div className="mb-4">
                <h6 className="mb-3">
                  <i className="bi bi-star-fill me-2"></i>
                  Ratings
                </h6>
                
                <div className="row">
                  <div className="col-md-6">
                    {renderStarRating('technical_skills_rating', 'Technical Skills')}
                  </div>
                  <div className="col-md-6">
                    {renderStarRating('communication_rating', 'Communication')}
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    {renderStarRating('cultural_fit_rating', 'Cultural Fit')}
                  </div>
                  <div className="col-md-6">
                    {renderStarRating('overall_rating', 'Overall Rating', true)}
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Recommendation <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  name="recommendation"
                  value={formData.recommendation}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select recommendation</option>
                  <option value="hire">Hire - Strong candidate</option>
                  <option value="maybe">Maybe - Consider for other projects</option>
                  <option value="no_hire">No Hire - Not a good fit</option>
                </select>
              </div>

              {/* Strengths */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-check-circle me-1"></i>
                  Strengths
                </label>
                <textarea
                  className="form-control"
                  name="strengths"
                  value={formData.strengths}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="What were the candidate's main strengths during the interview?"
                />
              </div>

              {/* Areas for Improvement */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-arrow-up-circle me-1"></i>
                  Areas for Improvement
                </label>
                <textarea
                  className="form-control"
                  name="areas_for_improvement"
                  value={formData.areas_for_improvement}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="What areas could the candidate improve on?"
                />
              </div>

              {/* Detailed Feedback */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <i className="bi bi-chat-text me-1"></i>
                  Detailed Feedback
                </label>
                <textarea
                  className="form-control"
                  name="detailed_feedback"
                  value={formData.detailed_feedback}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Provide detailed feedback about the interview experience, candidate performance, and any other relevant observations..."
                />
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
                  disabled={loading || !formData.overall_rating || !formData.recommendation}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-1"></i>
                      Submit Feedback
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

export default InterviewFeedbackModal;
