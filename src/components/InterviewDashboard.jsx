import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import InterviewFeedbackModal from './InterviewFeedbackModal';
import VideoCallModal from './VideoCallModal';

const InterviewDashboard = ({ userType }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedInterviewForFeedback, setSelectedInterviewForFeedback] = useState(null);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [selectedInterviewForCall, setSelectedInterviewForCall] = useState(null);

  useEffect(() => {
    fetchInterviews();
  }, [filter]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await api.get(`/interview/${params}`);
      
      if (response.data.success) {
        setInterviews(response.data.interviews);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setError('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (interviewId, newStatus) => {
    try {
      const response = await api.put('/interview/status', {
        interview_id: interviewId,
        status: newStatus
      });

      if (response.data.success) {
        // Refresh interviews
        await fetchInterviews();
      }
    } catch (error) {
      console.error('Error updating interview status:', error);
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { class: 'bg-primary', text: 'Scheduled', icon: 'bi-calendar-event' },
      in_progress: { class: 'bg-warning', text: 'In Progress', icon: 'bi-play-circle' },
      completed: { class: 'bg-success', text: 'Completed', icon: 'bi-check-circle' },
      cancelled: { class: 'bg-danger', text: 'Cancelled', icon: 'bi-x-circle' },
      rescheduled: { class: 'bg-info', text: 'Rescheduled', icon: 'bi-arrow-clockwise' }
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    
    return (
      <span className={`badge ${config.class} d-flex align-items-center`}>
        <i className={`bi ${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  const getInterviewTypeIcon = (type) => {
    const icons = {
      video: 'bi-camera-video',
      phone: 'bi-telephone',
      in_person: 'bi-geo-alt'
    };
    return icons[type] || 'bi-question-circle';
  };

  const openInterviewDetails = (interview) => {
    setSelectedInterview(interview);
    setShowDetails(true);
  };

  const closeInterviewDetails = () => {
    setSelectedInterview(null);
    setShowDetails(false);
  };

  const openFeedbackModal = (interview) => {
    setSelectedInterviewForFeedback(interview);
    setShowFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setSelectedInterviewForFeedback(null);
    setShowFeedbackModal(false);
  };

  const handleFeedbackSuccess = () => {
    fetchInterviews(); // Refresh interviews to show updated feedback
    closeFeedbackModal();
  };

  const startVideoCall = async (interview) => {
    console.log('startVideoCall called:', { interview, userType });
    
    if (interview.interview_type === 'video') {
      // Only associates can start meetings
      if (userType === 'associate') {
        console.log('Associate starting video call...');
        
        // First update status to in_progress
        await handleStatusUpdate(interview.interview_id, 'in_progress');
        
        // Then open the video call modal
        setSelectedInterviewForCall(interview);
        setShowVideoCallModal(true);
        
        console.log('Video call modal should be open now');
      }
    } else {
      // For non-video interviews, just update status
      handleStatusUpdate(interview.interview_id, 'in_progress');
    }
  };

  const joinVideoCall = (interview) => {
    if (interview.interview_type === 'video' && interview.status === 'in_progress') {
      // Freelancers can only join if meeting is in progress
      setSelectedInterviewForCall(interview);
      setShowVideoCallModal(true);
    }
  };

  const handleMeetingEnd = () => {
    // Refresh interviews to show updated status
    fetchInterviews();
    closeVideoCallModal();
  };

  const closeVideoCallModal = () => {
    setShowVideoCallModal(false);
    setSelectedInterviewForCall(null);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading interviews...</span>
        </div>
        <p className="mt-3 text-muted">Loading your interviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div className="interview-dashboard">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">
            <i className="bi bi-calendar-event me-2"></i>
            Interview Dashboard
          </h4>
          <p className="text-muted mb-0">
            Manage your {userType === 'associate' ? 'scheduled' : 'upcoming'} interviews
          </p>
        </div>
        
        {/* Filter Dropdown */}
        <div className="dropdown">
          <button 
            className="btn btn-outline-secondary dropdown-toggle" 
            type="button" 
            data-bs-toggle="dropdown"
          >
            <i className="bi bi-funnel me-1"></i>
            Filter: {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
          <ul className="dropdown-menu">
            <li><button className="dropdown-item" onClick={() => setFilter('all')}>All Interviews</button></li>
            <li><button className="dropdown-item" onClick={() => setFilter('scheduled')}>Scheduled</button></li>
            <li><button className="dropdown-item" onClick={() => setFilter('in_progress')}>In Progress</button></li>
            <li><button className="dropdown-item" onClick={() => setFilter('completed')}>Completed</button></li>
            <li><button className="dropdown-item" onClick={() => setFilter('cancelled')}>Cancelled</button></li>
          </ul>
        </div>
      </div>

      {/* Interviews List */}
      {interviews.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-calendar-x display-1 text-muted"></i>
          <h5 className="mt-3 text-muted">No interviews found</h5>
          <p className="text-muted">
            {filter === 'all' 
              ? 'You don\'t have any interviews yet.' 
              : `No interviews with status "${filter}" found.`
            }
          </p>
        </div>
      ) : (
        <div className="row">
          {interviews.map((interview) => (
            <div key={interview.interview_id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center">
                      <i className={`bi ${getInterviewTypeIcon(interview.interview_type)} text-primary me-2`}></i>
                      <span className="text-capitalize fw-semibold">
                        {interview.interview_type.replace('_', ' ')}
                      </span>
                    </div>
                    {getStatusBadge(interview.status)}
                  </div>

                  {/* Interview Info */}
                  <div className="mb-3">
                    <h6 className="card-title mb-2">
                      {userType === 'associate' 
                        ? `${interview.freelancer_first_name} ${interview.freelancer_last_name}`
                        : interview.associate_company || 'Company Interview'
                      }
                    </h6>
                    <p className="text-muted small mb-1">
                      <i className="bi bi-briefcase me-1"></i>
                      {interview.request_title}
                    </p>
                    <p className="text-muted small mb-1">
                      <i className="bi bi-clock me-1"></i>
                      {formatDateTime(interview.scheduled_date)}
                    </p>
                    <p className="text-muted small">
                      <i className="bi bi-hourglass-split me-1"></i>
                      {interview.duration_minutes} minutes
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm flex-grow-1"
                      onClick={() => openInterviewDetails(interview)}
                    >
                      <i className="bi bi-eye me-1"></i>
                      View Details
                    </button>
                    
                    {interview.status === 'scheduled' && userType === 'associate' && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => startVideoCall(interview)}
                      >
                        <i className="bi bi-camera-video me-1"></i>
                        Start Interview
                      </button>
                    )}
                    
                    {interview.status === 'in_progress' && userType === 'associate' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleStatusUpdate(interview.interview_id, 'completed')}
                      >
                        <i className="bi bi-check-circle me-1"></i>
                        End Interview
                      </button>
                    )}

                    {interview.status === 'in_progress' && userType === 'freelancer' && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => joinVideoCall(interview)}
                      >
                        <i className="bi bi-camera-video me-1"></i>
                        Join Interview
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interview Details Modal */}
      {showDetails && selectedInterview && (
        <InterviewDetailsModal
          interview={selectedInterview}
          userType={userType}
          onClose={closeInterviewDetails}
          onStatusUpdate={handleStatusUpdate}
          onOpenFeedback={openFeedbackModal}
          onStartVideoCall={userType === 'associate' ? startVideoCall : joinVideoCall}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedInterviewForFeedback && (
        <InterviewFeedbackModal
          isOpen={showFeedbackModal}
          onClose={closeFeedbackModal}
          interview={selectedInterviewForFeedback}
          userType={userType}
          onSubmitSuccess={handleFeedbackSuccess}
        />
      )}

      {/* Video Call Modal */}
      {console.log('Modal state:', { showVideoCallModal, selectedInterviewForCall })}
      {showVideoCallModal && selectedInterviewForCall && (
        <VideoCallModal
          isOpen={showVideoCallModal}
          onClose={closeVideoCallModal}
          interview={selectedInterviewForCall}
          userType={userType}
          onMeetingEnd={handleMeetingEnd}
        />
      )}
    </div>
  );
};

// Interview Details Modal Component
const InterviewDetailsModal = ({ interview, userType, onClose, onStatusUpdate, onOpenFeedback, onStartVideoCall }) => {

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canSubmitFeedback = () => {
    return interview.status === 'completed' && 
           !interview.feedback?.some(f => f.evaluator_type === userType);
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-calendar-event me-2"></i>
              Interview Details
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Interview Info */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h6>Interview Information</h6>
                <p><strong>Type:</strong> {interview.interview_type.replace('_', ' ')}</p>
                <p><strong>Date & Time:</strong> {formatDateTime(interview.scheduled_date)}</p>
                <p><strong>Duration:</strong> {interview.duration_minutes} minutes</p>
                <p><strong>Status:</strong> {interview.status}</p>
                {interview.interview_type === 'video' && (
                  <p><strong>Video Call:</strong> 
                    <span className="text-success ms-1">
                      <i className="bi bi-camera-video me-1"></i>
                      {userType === 'associate' ? 'Start Video Call' : 'Join Video Call'}
                    </span>
                  </p>
                )}
              </div>
              <div className="col-md-6">
                <h6>Project Details</h6>
                <p><strong>Title:</strong> {interview.request_title}</p>
                <p><strong>Description:</strong> {interview.request_description}</p>
                {interview.location && (
                  <p><strong>Location:</strong> {interview.location}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            {interview.interview_notes && (
              <div className="mb-4">
                <h6>Interview Notes</h6>
                <p className="text-muted">{interview.interview_notes}</p>
              </div>
            )}

            {/* Feedback Section */}
            {interview.feedback && interview.feedback.length > 0 && (
              <div className="mb-4">
                <h6>Feedback</h6>
                {interview.feedback.map((fb, index) => (
                  <div key={index} className="card mb-2">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <span className="fw-semibold">
                          {fb.evaluator_type === 'associate' ? 'Associate Feedback' : 'Freelancer Feedback'}
                        </span>
                        <span className="badge bg-primary">
                          Overall: {fb.overall_rating}/5
                        </span>
                      </div>
                      {fb.detailed_feedback && (
                        <p className="mt-2 mb-0">{fb.detailed_feedback}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="d-flex gap-2 justify-content-end">
              {canSubmitFeedback() && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => onOpenFeedback(interview)}
                >
                  <i className="bi bi-star me-1"></i>
                  Submit Feedback
                </button>
              )}
              
              {interview.status === 'scheduled' && userType === 'associate' && (
                <button
                  className="btn btn-success"
                  onClick={() => onStartVideoCall(interview)}
                >
                  <i className="bi bi-camera-video me-1"></i>
                  Start Interview
                </button>
              )}
              
              {interview.status === 'in_progress' && userType === 'associate' && (
                <button
                  className="btn btn-primary"
                  onClick={() => onStatusUpdate(interview.interview_id, 'completed')}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  End Interview
                </button>
              )}

              {interview.status === 'in_progress' && userType === 'freelancer' && (
                <button
                  className="btn btn-success"
                  onClick={() => onStartVideoCall(interview)}
                >
                  <i className="bi bi-camera-video me-1"></i>
                  Join Interview
                </button>
              )}
              
              <button
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewDashboard;
