import React, { useState, useEffect, useRef } from 'react';

const VideoCallModal = ({ isOpen, onClose, interview, userType }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState('');
  
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
      console.log('Starting video call...');
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, or Edge.');
      }

      // Try different media configurations for better browser compatibility
      let stream;
      const mediaConfigs = [
        // First try: Full HD video with audio
        { video: { width: 1280, height: 720, facingMode: 'user' }, audio: true },
        // Fallback 1: Standard HD video with audio
        { video: { width: 640, height: 480, facingMode: 'user' }, audio: true },
        // Fallback 2: Basic video with audio
        { video: true, audio: true },
        // Fallback 3: Audio only
        { video: false, audio: true }
      ];

      let lastError;
      for (let i = 0; i < mediaConfigs.length; i++) {
        try {
          console.log(`Trying media config ${i + 1}:`, mediaConfigs[i]);
          stream = await navigator.mediaDevices.getUserMedia(mediaConfigs[i]);
          console.log('Successfully got media stream:', stream);
          break;
        } catch (err) {
          console.warn(`Media config ${i + 1} failed:`, err);
          lastError = err;
          
          // If it's a permission denied error, don't try fallbacks
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            throw err;
          }
        }
      }

      if (!stream) {
        throw lastError || new Error('Unable to access camera or microphone');
      }
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection with more robust configuration
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10
      };

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        console.log('Adding track:', track.kind, track.label);
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream (will only work when another user actually joins)
      peerConnectionRef.current.ontrack = (event) => {
        console.log('Received remote track:', event);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setIsConnected(true);
          startTimeRef.current = Date.now();
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          // In a real implementation, you would send this to the other peer
          console.log('ICE candidate:', event.candidate);
        }
      };

      // Handle connection state changes
      peerConnectionRef.current.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnectionRef.current.connectionState);
      };

      // Handle ICE connection state changes
      peerConnectionRef.current.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnectionRef.current.iceConnectionState);
      };

      console.log('Video call started successfully');

      // In production, the remote participant connection would be handled by
      // WebRTC signaling server when another user actually joins the call

    } catch (err) {
      console.error('Error starting call:', err);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to start video call. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Camera and microphone access was denied. Please:' +
          '\n1. Click the camera icon in your browser\'s address bar' +
          '\n2. Allow access to camera and microphone' +
          '\n3. Refresh the page and try again';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera or microphone found. Please connect a camera and microphone and try again.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera or microphone is already in use by another application. Please close other applications and try again.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += 'Camera requirements not supported. Your camera may not support the required settings.';
      } else if (err.name === 'SecurityError') {
        errorMessage += 'Security error. Please ensure you\'re using HTTPS and try again.';
      } else if (err.message.includes('browser does not support')) {
        errorMessage = err.message;
      } else {
        errorMessage += 'Please check your camera and microphone permissions and try again. Error: ' + err.message;
      }
      
      setError(errorMessage);
    }
  };

  const simulateRemoteVideoFeed = async () => {
    try {
      // Simulate a second camera feed (in real app, this would come from the other user)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Set as remote video to simulate the other participant
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        setIsConnected(true);
        startTimeRef.current = Date.now();
      }
      
    } catch (err) {
      console.error('Error simulating remote video feed:', err);
      // Fallback to placeholder if no second camera available
      await createPlaceholderFeed();
    }
  };

  const createPlaceholderFeed = async () => {
    // Create a simple placeholder that looks more like a real video call
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    // Draw a waiting state
    const drawWaitingState = () => {
      // Dark background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Center text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for other participant...', canvas.width / 2, canvas.height / 2 - 20);
      
      ctx.font = '16px Arial';
      ctx.fillStyle = '#cccccc';
      ctx.fillText(userType === 'associate' ? 'Waiting for freelancer to join' : 'Connecting to associate...', canvas.width / 2, canvas.height / 2 + 20);
    };
    
    drawWaitingState();
    const canvasStream = canvas.captureStream(1);
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = canvasStream;
    }
  };

  const endCall = () => {
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

    // Clean up remote participant animation
    if (remoteVideoRef.current && remoteVideoRef.current._cleanup) {
      remoteVideoRef.current._cleanup();
    }

    setIsConnected(false);
    setCallDuration(0);
    startTimeRef.current = null;
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

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content" style={{ height: '90vh' }}>
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
                <div style={{ whiteSpace: 'pre-line' }}>{error}</div>
                <div className="mt-3 d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <strong>Browser:</strong> {navigator.userAgent.includes('Edge') ? 'Microsoft Edge' : 
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
            )}

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
                     <i className="bi bi-laptop"></i>
                   </button>

                   {/* Different end call behaviors for associate vs freelancer */}
                   {userType === 'associate' ? (
                     <button
                       className="btn btn-lg btn-danger"
                       onClick={onClose}
                       title="End interview for everyone"
                     >
                       <i className="bi bi-telephone-x"></i>
                     </button>
                   ) : (
                     <button
                       className="btn btn-lg btn-outline-light"
                       onClick={onClose}
                       title="Leave interview"
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
