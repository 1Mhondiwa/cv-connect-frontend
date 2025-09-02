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

      // Simulate connection and show remote participant
      setTimeout(async () => {
        setIsConnected(true);
        startTimeRef.current = Date.now();
        
        // Simulate remote participant by creating a second stream
        // In a real app, this would come from the other user
        await simulateRemoteParticipant();
      }, 2000);

    } catch (err) {
      console.error('Error starting call:', err);
      setError('Failed to start video call. Please check your camera and microphone permissions.');
    }
  };

  const simulateRemoteParticipant = async () => {
    try {
      // Create a canvas element to simulate remote participant
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      
      let animationTime = 0;
      
      // Draw a more realistic placeholder for remote participant
      const drawRemoteParticipant = () => {
        animationTime += 0.1;
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#34495e');
        gradient.addColorStop(1, '#2c3e50');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw animated avatar circle
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 - 30;
        const radius = 60 + Math.sin(animationTime) * 5;
        
        // Avatar background
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Avatar icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👤', centerX, centerY + 15);
        
        // Participant name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(userType === 'associate' ? 'Freelancer' : 'Associate', centerX, centerY + 100);
        
        // Connection status
        ctx.font = '14px Arial';
        ctx.fillStyle = '#2ecc71';
        ctx.fillText('● Connected', centerX, centerY + 125);
        
        // Simulated audio visualizer
        for (let i = 0; i < 10; i++) {
          const barHeight = Math.random() * 20 + 5;
          const x = centerX - 50 + (i * 10);
          const y = centerY + 140;
          
          ctx.fillStyle = `rgba(46, 204, 113, ${Math.random() * 0.8 + 0.2})`;
          ctx.fillRect(x, y, 8, barHeight);
        }
      };
      
      // Animate the placeholder at 30fps
      const animationInterval = setInterval(drawRemoteParticipant, 33);
      
      // Clean up animation when component unmounts
      const cleanup = () => clearInterval(animationInterval);
      
      // Get stream from canvas
      const canvasStream = canvas.captureStream(30);
      
      // Set as remote video
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = canvasStream;
      }
      
      // Store cleanup function for later use
      remoteVideoRef.current._cleanup = cleanup;
      
    } catch (err) {
      console.error('Error simulating remote participant:', err);
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
                {error}
              </div>
            )}

                         <div className="position-relative h-100">
               {!isConnected ? (
                 /* Connection Screen */
                 <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark d-flex align-items-center justify-content-center">
                   <div className="text-center text-white">
                     <div className="spinner-border mb-3" role="status">
                       <span className="visually-hidden">Connecting...</span>
                     </div>
                     <h5>Connecting to interview...</h5>
                     <p>Please wait while we establish the video connection.</p>
                   </div>
                 </div>
               ) : (
                 /* Split Screen Layout - Both participants visible */
                 <div className="d-flex h-100">
                   {/* Remote Participant (Left Side) */}
                   <div className="flex-fill bg-dark d-flex flex-column align-items-center justify-content-center position-relative">
                     <video
                       ref={remoteVideoRef}
                       autoPlay
                       playsInline
                       className="w-100 h-100"
                       style={{ objectFit: 'cover' }}
                     />
                     <div 
                       className="position-absolute bottom-0 start-0 w-100 text-center py-2"
                       style={{ background: 'rgba(0,0,0,0.7)' }}
                     >
                       <span className="text-white fw-semibold">
                         <i className="bi bi-person-circle me-2"></i>
                         {userType === 'associate' ? 'Freelancer' : 'Associate'}
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
                       </span>
                     </div>
                   </div>
                 </div>
               )}

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
