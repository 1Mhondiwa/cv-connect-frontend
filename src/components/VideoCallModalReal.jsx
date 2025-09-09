import React, { useState, useEffect, useRef } from 'react';
import WebRTCService from '../services/webrtcService';

const VideoCallModal = ({ isOpen, onClose, interview, userType }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const webrtcServiceRef = useRef(null);
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
      setIsConnecting(true);
      console.log('Starting real WebRTC video call...');
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, or Edge.');
      }

      // Create WebRTC service instance
      webrtcServiceRef.current = new WebRTCService();
      
      // Set up callbacks
      webrtcServiceRef.current.onUserJoined = (data) => {
        console.log('👤 User joined:', data);
        setIsConnecting(false);
      };

      webrtcServiceRef.current.onUserLeft = (data) => {
        console.log('👤 User left:', data);
        setIsConnected(false);
      };

      webrtcServiceRef.current.onRemoteStream = (stream) => {
        console.log('📹 Received remote stream');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
        setIsConnected(true);
        startTimeRef.current = Date.now();
      };

      webrtcServiceRef.current.onConnectionStateChange = (state) => {
        console.log('🔗 Connection state changed:', state);
        setIsConnected(state === 'connected');
      };

      // Initialize WebRTC connection
      const roomId = `interview-${interview.id}`;
      const userId = userType === 'associate' ? 'associate-1' : 'freelancer-1';
      
      await webrtcServiceRef.current.initialize(userType, userId, roomId);
      
      // Set local video stream
      const localStream = webrtcServiceRef.current.getLocalStream();
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }

      console.log('✅ WebRTC video call started successfully');

    } catch (err) {
      console.error('❌ Error starting video call:', err);
      setError(err.message || 'Failed to start video call');
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    if (webrtcServiceRef.current) {
      webrtcServiceRef.current.cleanup();
      webrtcServiceRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsConnected(false);
    setCallDuration(0);
    startTimeRef.current = null;
    setIsConnecting(false);
  };

  const toggleMute = () => {
    if (webrtcServiceRef.current) {
      const isAudioEnabled = webrtcServiceRef.current.toggleAudio();
      setIsMuted(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (webrtcServiceRef.current) {
      const isVideoEnabled = webrtcServiceRef.current.toggleVideo();
      setIsVideoOn(isVideoEnabled);
    }
  };

  const toggleScreenShare = async () => {
    if (webrtcServiceRef.current) {
      if (!isScreenSharing) {
        const success = await webrtcServiceRef.current.startScreenShare();
        setIsScreenSharing(success);
      } else {
        const success = await webrtcServiceRef.current.stopScreenShare();
        setIsScreenSharing(!success);
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-xl h-100">
        <div className="modal-content h-100 border-0 bg-dark">
          {/* Header */}
          <div className="modal-header border-0 bg-dark text-white">
            <h5 className="modal-title">
              <i className="bi bi-camera-video me-2"></i>
              Video Interview - {interview?.title || 'Interview'}
            </h5>
            <div className="d-flex align-items-center">
              {isConnected && (
                <span className="badge bg-success me-3">
                  <i className="bi bi-circle-fill me-1"></i>
                  Connected
                </span>
              )}
              {isConnecting && (
                <span className="badge bg-warning me-3">
                  <i className="bi bi-hourglass-split me-1"></i>
                  Connecting...
                </span>
              )}
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body p-0 bg-dark position-relative" style={{ height: 'calc(100vh - 200px)' }}>
            {error ? (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-white">
                <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '4rem' }}></i>
                <h4 className="mt-3">Connection Error</h4>
                <p className="text-center mb-4">{error}</p>
                <div className="text-center">
                  <small className="text-muted d-block mb-2">
                    Browser: {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                      navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                      navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Unknown'}
                  </small>
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      setError('');
                      startCall();
                    }}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="position-relative h-100">
                {/* Split Screen Layout - Always show both sides */}
                <div className="d-flex h-100">
                  {/* Remote Participant (Left Side) */}
                  <div className="flex-fill bg-dark d-flex flex-column align-items-center justify-content-center position-relative">
                    {!isConnected ? (
                      /* Waiting for other participant */
                      <div className="text-center text-white">
                        <div className="spinner-border mb-3" role="status">
                          <span className="visually-hidden">Waiting...</span>
                        </div>
                        <h5>Waiting for {userType === 'associate' ? 'freelancer' : 'associate'}</h5>
                        <p>The interview will start when both participants join</p>
                        {isConnecting && <small className="text-muted">Establishing connection...</small>}
                      </div>
                    ) : (
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                    <div 
                      className="position-absolute bottom-0 start-0 w-100 text-center py-2"
                      style={{ background: 'rgba(0,0,0,0.7)' }}
                    >
                      <span className="text-white fw-semibold">
                        <i className="bi bi-person-circle me-2"></i>
                        {userType === 'associate' ? 'Freelancer' : 'Associate'}
                        {isConnected && <span className="text-success ms-2">● Connected</span>}
                        {!isConnected && <span className="text-warning ms-2">● Waiting</span>}
                      </span>
                    </div>
                  </div>

                  {/* Local Participant (Right Side) */}
                  <div className="flex-fill bg-secondary d-flex flex-column align-items-center justify-content-center position-relative">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                    />
                    <div 
                      className="position-absolute bottom-0 start-0 w-100 text-center py-2"
                      style={{ background: 'rgba(0,0,0,0.7)' }}
                    >
                      <span className="text-white fw-semibold">
                        <i className="bi bi-person-circle me-2"></i>
                        You ({userType === 'associate' ? 'Associate' : 'Freelancer'})
                        <span className="text-success ms-2">● Ready</span>
                      </span>
                    </div>
                  </div>
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

                    {/* Screen sharing - available for both associates and freelancers */}
                    <button
                      className={`btn btn-lg ${isScreenSharing ? 'btn-warning' : 'btn-outline-light'}`}
                      onClick={toggleScreenShare}
                      title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                    >
                      <i className={`bi ${isScreenSharing ? 'bi-stop-circle' : 'bi-share'}`}></i>
                    </button>

                    <button
                      className="btn btn-danger btn-lg"
                      onClick={onClose}
                      title="End call"
                    >
                      <i className="bi bi-telephone-x"></i>
                    </button>
                  </div>
                </div>

                {/* Call Duration */}
                {isConnected && (
                  <div className="position-absolute top-0 end-0 m-3">
                    <span className="badge bg-dark text-white fs-6">
                      <i className="bi bi-clock me-1"></i>
                      {formatDuration(callDuration)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
