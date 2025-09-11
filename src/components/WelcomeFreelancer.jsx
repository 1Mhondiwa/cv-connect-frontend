import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import api from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import CVTemplate from './CVTemplate';

const accent = '#fd680e';

const WelcomeFreelancer = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showTemplate, setShowTemplate] = useState(false);
  const { logout } = useAuth();

  const handleButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = null;
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    setMessage("");
    setError("");
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("cv", file);
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/freelancer/cv/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(response.data.message || "Upload successful!");
      setTimeout(() => navigate("/freelancer-dashboard"), 1800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Upload failed. Please try again or check your file format."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCreateCV = async (file, formData) => {
    setMessage("");
    setError("");
    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("cv", file);
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/freelancer/cv/upload",
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(response.data.message || "CV created and uploaded successfully!");
      setShowTemplate(false);
      setTimeout(() => navigate("/freelancer-dashboard"), 1800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create CV. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCancelTemplate = () => {
    setShowTemplate(false);
  };

  // Show CV template if user chooses to create one
  if (showTemplate) {
    return (
      <CVTemplate
        onSave={handleCreateCV}
        onCancel={handleCancelTemplate}
      />
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(120deg, #fff 60%, #f8f4f2 100%)' }}>
      {/* Dashboard Navbar */}
      <nav className="dashboard-navbar">
        <div className="container d-flex justify-content-between align-items-center">
          <span style={{ textDecoration: 'none', color: accent, fontWeight: 700, fontSize: 22, letterSpacing: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
            className="d-flex align-items-center"
          >
            <img 
              src="/assets/img/cv-connect_logo.png" 
              alt="CV-Connect Logo" 
              style={{
                height: 32,
                width: 32,
                marginRight: 8,
                borderRadius: '50%'
              }}
            />
            CV<span style={{ color: '#333' }}>Connect</span>
          </span>
          <button
            className="btn logout-btn"
            onClick={() => { logout(); navigate('/'); }}
          >
            <i className="bi bi-box-arrow-right"></i>Logout
          </button>
        </div>
      </nav>
      {/* Main Content */}
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-lg-8 col-xl-6">
            <div className="bg-white rounded-4 shadow-lg p-5 text-center" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.07)' }}>
              <div className="mb-4">
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 90, height: 90, background: 'rgba(253,104,14,0.1)' }}>
                  <i className="bi bi-emoji-smile" style={{ fontSize: 40, color: accent }}></i>
                </div>
              </div>
              <h2 style={{ color: '#444', fontWeight: 700, marginBottom: 12 }}>Welcome to CV-Connect!</h2>
              <p style={{ color: '#888', fontSize: 18, marginBottom: 24 }}>
                We're excited to have you join our community of talented freelancers.<br/>
                To get started, please upload your CV or create a new one. This will allow us to auto-create your profile and connect you with opportunities!
              </p>
              <div className="mb-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <button
                      className="btn dashboard-btn w-100"
                      style={{
                        background: accent,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 30,
                        padding: '14px 24px',
                        fontWeight: 600,
                        fontSize: 16,
                        transition: 'transform 0.18s, box-shadow 0.18s'
                      }}
                      onClick={handleButtonClick}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Uploading...
                        </span>
                      ) : (
                        <span>
                          <i className="bi bi-upload me-2"></i>
                          Upload Existing CV
                        </span>
                      )}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="d-none"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </div>
                  <div className="col-md-6">
                    <button
                      className="btn dashboard-btn w-100"
                      style={{
                        background: 'linear-gradient(135deg, #8B4513 0%, #fd680e 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 30,
                        padding: '14px 24px',
                        fontWeight: 600,
                        fontSize: 16,
                        transition: 'transform 0.18s, box-shadow 0.18s'
                      }}
                      onClick={() => setShowTemplate(true)}
                      disabled={uploading}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Create New CV
                    </button>
                  </div>
                </div>
                {message && (
                  <div className="alert mt-4" style={{ background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', borderRadius: 12, padding: '16px 20px', textAlign: 'center', fontWeight: 500 }}>
                    <i className="bi bi-check-circle me-2"></i>
                    {message}
                  </div>
                )}
                {error && (
                  <div className="alert mt-4" style={{ background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: 12, padding: '16px 20px', textAlign: 'center', fontWeight: 500 }}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
              </div>
              <div className="row mt-4 g-3">
                <div className="col-md-6">
                  <div className="bg-light rounded-3 p-3" style={{ background: 'rgba(253,104,14,0.05)' }}>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-shield-check me-2" style={{ color: accent }}></i>
                      <h6 className="mb-0" style={{ color: '#444', fontWeight: 600 }}>Secure & Private</h6>
                    </div>
                    <p className="mb-0" style={{ color: '#666', fontSize: 13 }}>
                      Your CV is encrypted and only used to build your profile.
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-light rounded-3 p-3" style={{ background: 'rgba(253,104,14,0.05)' }}>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-lightbulb me-2" style={{ color: accent }}></i>
                      <h6 className="mb-0" style={{ color: '#444', fontWeight: 600 }}>AI-Powered</h6>
                    </div>
                    <p className="mb-0" style={{ color: '#666', fontSize: 13 }}>
                      We use smart technology to extract your skills and experience.
                    </p>
                  </div>
                </div>
              </div>
              <style>{`
                .dashboard-btn:hover, .dashboard-btn:focus {
                  transform: scale(1.05);
                  box-shadow: 0 4px 24px rgba(253,104,14,0.18);
                  z-index: 2;
                }
                .dashboard-btn[style*="background: linear-gradient"]:hover {
                  box-shadow: 0 4px 24px rgba(253,104,14,0.18);
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeFreelancer; 