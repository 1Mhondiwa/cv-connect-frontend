import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';

const accent = '#fd680e';

const FreelancerInterviewFeedback = () => {
  const [feedbackData, setFeedbackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyFeedback = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/interview/my-feedback');
      
      if (response.data.success) {
        setFeedbackData(response.data.data);
        console.log('✅ Freelancer feedback loaded:', response.data.data);
      } else {
        setError('Failed to load interview feedback');
      }
    } catch (err) {
      console.error('❌ Error fetching feedback:', err);
      setError('Failed to load interview feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyFeedback();
  }, [fetchMyFeedback]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#28a745'; // Green
    if (rating >= 3.5) return '#ffc107'; // Yellow
    if (rating >= 2.5) return '#fd7e14'; // Orange
    return '#dc3545'; // Red
  };

  const getRecommendationBadge = (recommendation) => {
    switch (recommendation) {
      case 'hire':
        return <span className="badge bg-success">Recommended for Hire</span>;
      case 'maybe':
        return <span className="badge bg-warning">Maybe</span>;
      case 'no_hire':
        return <span className="badge bg-danger">Not Recommended</span>;
      default:
        return <span className="badge bg-secondary">No Recommendation</span>;
    }
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="bi bi-star-fill" style={{ color: '#ffc107' }}></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="bi bi-star-half" style={{ color: '#ffc107' }}></i>);
      } else {
        stars.push(<i key={i} className="bi bi-star" style={{ color: '#dee2e6' }}></i>);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: accent }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading your interview feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
        <button 
          className="btn btn-outline-primary btn-sm ms-3"
          onClick={fetchMyFeedback}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>Try Again
        </button>
      </div>
    );
  }

  if (!feedbackData || feedbackData.interviews.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-chat-square-text display-4 text-muted"></i>
        <h6 className="text-muted mt-3">No Interview Feedback Yet</h6>
        <p className="text-muted">
          Complete interviews to receive feedback from associates.<br/>
          Feedback helps you improve and increase your hiring chances!
        </p>
      </div>
    );
  }

  const { interviews, summary } = feedbackData;

  return (
    <div className="container-fluid">
      {/* Summary Section */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-3">
              <div className="h4 mb-1" style={{ color: accent }}>
                {summary.totalInterviews}
              </div>
              <div className="small text-muted">Total Interviews</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-3">
              <div className="h4 mb-1" style={{ color: getRatingColor(summary.averageRating) }}>
                {summary.averageRating || 'N/A'}
              </div>
              <div className="small text-muted">Average Rating</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-3">
              <div className="h4 mb-1 text-success">
                {summary.hireRecommendations}
              </div>
              <div className="small text-muted">Hire Recommendations</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-3">
              <div className="h4 mb-1" style={{ color: '#17a2b8' }}>
                {summary.feedbackReceived}
              </div>
              <div className="small text-muted">Feedback Received</div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Interview Feedback */}
      <div className="row">
        <div className="col-12">
          <h6 className="mb-3" style={{ color: accent }}>
            <i className="bi bi-journal-text me-2"></i>Interview Feedback History
          </h6>
          
          {interviews.map((interview, index) => (
            <div key={interview.interview_id} className="card border-0 shadow-sm mb-3">
              <div className="card-header bg-transparent border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1" style={{ color: accent }}>
                      {interview.job_title}
                    </h6>
                    <small className="text-muted">
                      {interview.company_industry} • Interviewed by {interview.interviewer_name}
                    </small>
                  </div>
                  <div className="text-end">
                    <div className="small text-muted">{formatDate(interview.scheduled_date)}</div>
                    {interview.recommendation && getRecommendationBadge(interview.recommendation)}
                  </div>
                </div>
              </div>
              
              {interview.feedback_id ? (
                <div className="card-body">
                  {/* Rating Section */}
                  <div className="row g-3 mb-4">
                    {interview.technical_skills_rating && (
                      <div className="col-md-3 col-6">
                        <div className="text-center">
                          <div className="fw-medium mb-1">Technical Skills</div>
                          <div className="mb-1">
                            {renderRatingStars(interview.technical_skills_rating)}
                          </div>
                          <div className="small" style={{ color: getRatingColor(interview.technical_skills_rating) }}>
                            {interview.technical_skills_rating}/5
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {interview.communication_rating && (
                      <div className="col-md-3 col-6">
                        <div className="text-center">
                          <div className="fw-medium mb-1">Communication</div>
                          <div className="mb-1">
                            {renderRatingStars(interview.communication_rating)}
                          </div>
                          <div className="small" style={{ color: getRatingColor(interview.communication_rating) }}>
                            {interview.communication_rating}/5
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {interview.cultural_fit_rating && (
                      <div className="col-md-3 col-6">
                        <div className="text-center">
                          <div className="fw-medium mb-1">Cultural Fit</div>
                          <div className="mb-1">
                            {renderRatingStars(interview.cultural_fit_rating)}
                          </div>
                          <div className="small" style={{ color: getRatingColor(interview.cultural_fit_rating) }}>
                            {interview.cultural_fit_rating}/5
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {interview.overall_rating && (
                      <div className="col-md-3 col-6">
                        <div className="text-center">
                          <div className="fw-medium mb-1">Overall Rating</div>
                          <div className="mb-1">
                            {renderRatingStars(interview.overall_rating)}
                          </div>
                          <div className="small" style={{ color: getRatingColor(interview.overall_rating) }}>
                            {interview.overall_rating}/5
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Written Feedback Section */}
                  <div className="row g-3">
                    {interview.strengths && (
                      <div className="col-md-6">
                        <div className="p-3 rounded" style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb' }}>
                          <h6 className="text-success mb-2">
                            <i className="bi bi-check-circle me-2"></i>Strengths
                          </h6>
                          <p className="mb-0 small">{interview.strengths}</p>
                        </div>
                      </div>
                    )}
                    
                    {interview.areas_for_improvement && (
                      <div className="col-md-6">
                        <div className="p-3 rounded" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
                          <h6 className="text-warning mb-2">
                            <i className="bi bi-lightbulb me-2"></i>Areas for Improvement
                          </h6>
                          <p className="mb-0 small">{interview.areas_for_improvement}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Detailed Feedback */}
                  {interview.detailed_feedback && (
                    <div className="mt-3">
                      <h6 className="text-muted mb-2">
                        <i className="bi bi-chat-left-text me-2"></i>Additional Comments
                      </h6>
                      <div className="p-3 rounded" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                        <p className="mb-0 small">{interview.detailed_feedback}</p>
                      </div>
                    </div>
                  )}

                  {interview.feedback_date && (
                    <div className="mt-3 text-end">
                      <small className="text-muted">
                        <i className="bi bi-calendar3 me-1"></i>
                        Feedback received on {formatDate(interview.feedback_date)}
                      </small>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card-body text-center py-4">
                  <i className="bi bi-hourglass-split display-6 text-muted"></i>
                  <h6 className="text-muted mt-2">Feedback Pending</h6>
                  <p className="text-muted small mb-0">
                    The associate hasn't submitted feedback for this interview yet.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FreelancerInterviewFeedback;
