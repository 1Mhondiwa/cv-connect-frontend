import React, { useState, useEffect, useRef } from 'react';

const VideoCallModal = ({ isOpen, onClose, interview, userType, onMeetingEnd }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(userType === 'associate');
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCall();
    } else {
      endCall();
    }

    return () => {
      endCall();
    };
  }, [isOpen]);

  useEffect(() => {
    if (isConnected && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isConnected]);

  const startCall = async () => {
    try {
      setError('');
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          // In a real implementation, you would send this to the other peer
          console.log('ICE candidate:', event.candidate);
        }
      };

      // Simulate successful connection immediately
      setIsConnected(true);
      startTimeRef.current = Date.now();

    } catch (err) {
      console.error('Error starting call:', err);
      setError('Failed to start video call. Please check your camera and microphone permissions.');
    }
  };

  const endCall = async () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsConnected(false);
    setCallDuration(0);
    startTimeRef.current = null;

    // If this is the host ending the meeting, update the backend
    if (isHost && interview?.interview_id) {
      try {
        const response = await fetch('/api/interview/status', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            interview_id: interview.interview_id,
            status: 'completed'
          })
        });

        if (response.ok) {
          // Notify parent component that meeting has ended
          if (onMeetingEnd) {
            onMeetingEnd();
          }
        }
      } catch (error) {
        console.error('Error updating meeting status:', error);
      }
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        // Replace video track with screen share
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }

        // Handle screen share end
        videoTrack.onended = () => {
          setIsScreenSharing(false);
        };

        setIsScreenSharing(true);
      } else {
        // Stop screen sharing
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }

        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error('Error toggling screen share:', err);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) {
    return null;
  }

  console.log('VideoCallModal rendering:', { isOpen, interview, userType, isHost });

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content" style={{ height: '90vh', maxHeight: '90vh' }}>
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title">
              <i className="bi bi-camera-video me-2"></i>
              Video Interview - {interview?.request_title}
            </h5>
            <div className="d-flex align-items-center">
              {isConnected && (
                <span className="badge bg-success me-3">
                  <i className="bi bi-circle-fill me-1"></i>
                  {formatDuration(callDuration)}
                </span>
              )}
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
          </div>
          
          <div className="modal-body p-0" style={{ height: 'calc(90vh - 120px)' }}>
            {error && (
              <div className="alert alert-danger m-3" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            <div className="position-relative h-100">
              {/* Remote Video (Main) */}
              <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark d-flex align-items-center justify-content-center">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                />
                {!isConnected && (
                  <div className="text-center text-white">
                    <div className="spinner-border mb-3" role="status">
                      <span className="visually-hidden">Connecting...</span>
                    </div>
                    <h5>Connecting to interview...</h5>
                    <p>Please wait while we establish the video connection.</p>
                  </div>
                )}
              </div>

              {/* Local Video (Picture-in-Picture) */}
              <div 
                className="position-absolute"
                style={{ 
                  top: '20px', 
                  right: '20px', 
                  width: '200px', 
                  height: '150px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '2px solid #fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                />
              </div>

                             {/* Controls */}
               <div className="position-absolute bottom-0 start-0 w-100 p-4">
                 <div className="d-flex justify-content-center gap-3">
                   <button
                     className={`btn btn-lg ${isMuted ? 'btn-danger' : 'btn-outline-light'}`}
                     onClick={toggleMute}
                     title={isMuted ? 'Unmute' : 'Mute'}
                   >
                     <i className={`bi ${isMuted ? 'bi-mic-mute' : 'bi-mic'}`}></i>
                   </button>

                   <button
                     className={`btn btn-lg ${!isVideoOn ? 'btn-danger' : 'btn-outline-light'}`}
                     onClick={toggleVideo}
                     title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                   >
                     <i className={`bi ${isVideoOn ? 'bi-camera-video' : 'bi-camera-video-off'}`}></i>
                   </button>

                   {/* Screen sharing - only for host */}
                   {isHost && (
                     <button
                       className={`btn btn-lg ${isScreenSharing ? 'btn-warning' : 'btn-outline-light'}`}
                       onClick={toggleScreenShare}
                       title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                     >
                       <i className="bi bi-laptop"></i>
                     </button>
                   )}

                   {/* End call button - different behavior for host vs participant */}
                   {isHost ? (
                     <button
                       className="btn btn-lg btn-danger"
                       onClick={endCall}
                       title="End meeting for everyone"
                     >
                       <i className="bi bi-telephone-x"></i>
                     </button>
                   ) : (
                     <button
                       className="btn btn-lg btn-outline-light"
                       onClick={onClose}
                       title="Leave meeting"
                     >
                       <i className="bi bi-box-arrow-right"></i>
                     </button>
                   )}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
