import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const accent = '#fd680e';

const FreelancerCVUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("cv", file);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/freelancer/cv/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(response.data.message || "Upload successful!");
      setTimeout(() => navigate("/freelancer/profile"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Upload failed. Please try again or check your file format."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(120deg, #fff 60%, #f8f4f2 100%)' }}>
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-lg-8 col-xl-6">
            <div className="bg-white rounded-4 shadow-lg p-5" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.07)' }}>
              {/* Header */}
              <div className="text-center mb-5">
                <div className="mb-4">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 80, height: 80, background: 'rgba(253,104,14,0.1)' }}>
                    <i className="bi bi-file-earmark-arrow-up" style={{ fontSize: 32, color: accent }}></i>
                  </div>
                </div>
                <h2 style={{ color: '#444', fontWeight: 700, marginBottom: 8 }}>Upload Your CV</h2>
                <p style={{ color: '#888', fontSize: 16, marginBottom: 0 }}>
                  Share your professional experience and skills with potential associates
                </p>
              </div>

              {/* File Upload Area */}
              <div className="mb-4">
                <div 
                  className="border-2 border-dashed rounded-4 p-5 text-center position-relative"
                  style={{ 
                    border: '2px dashed #ddd',
                    background: '#fafafa',
                    transition: 'all 0.18s ease',
                    cursor: 'pointer'
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = accent;
                    e.currentTarget.style.background = 'rgba(253,104,14,0.05)';
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = '#ddd';
                    e.currentTarget.style.background = '#fafafa';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const droppedFile = e.dataTransfer.files[0];
                    if (droppedFile) {
                      setFile(droppedFile);
                      setMessage("");
                      setError("");
                    }
                    e.currentTarget.style.borderColor = '#ddd';
                    e.currentTarget.style.background = '#fafafa';
                  }}
                  onClick={() => document.getElementById('cv-file-input').click()}
                >
                  {file ? (
                    <div>
                      <i className="bi bi-file-earmark-text" style={{ fontSize: 48, color: accent, marginBottom: 16 }}></i>
                      <h5 style={{ color: '#444', fontWeight: 600, marginBottom: 8 }}>{file.name}</h5>
                      <p style={{ color: '#666', fontSize: 14, marginBottom: 0 }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button 
                        className="btn btn-sm mt-3"
                        style={{ 
                          background: 'transparent', 
                          color: '#df1529', 
                          border: '1px solid #df1529', 
                          borderRadius: 20,
                          fontSize: 12
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setMessage("");
                          setError("");
                        }}
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div>
                      <i className="bi bi-cloud-arrow-up" style={{ fontSize: 48, color: accent, marginBottom: 16 }}></i>
                      <h5 style={{ color: '#444', fontWeight: 600, marginBottom: 8 }}>Drop your CV here</h5>
                      <p style={{ color: '#666', fontSize: 14, marginBottom: 0 }}>
                        or click to browse files
                      </p>
                      <p style={{ color: '#888', fontSize: 12, marginTop: 8, marginBottom: 0 }}>
                        Supports PDF, DOC, DOCX, TXT (Max 10MB)
                      </p>
                    </div>
                  )}
                  <input
                    id="cv-file-input"
                    type="file"
                    className="d-none"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </div>
              </div>

              {/* Upload Button */}
              <div className="mb-4">
                <button
                  type="button"
                  className="btn w-100 dashboard-btn"
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
                  onClick={handleUpload}
                  disabled={uploading || !file}
                >
                  {uploading ? (
                    <span>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Uploading CV...
                    </span>
                  ) : (
                    <span>
                      <i className="bi bi-upload me-2"></i>
                      Upload CV
                    </span>
                  )}
                </button>
              </div>

              {/* Messages */}
              {message && (
                <div className="alert mb-4" style={{ 
                  background: '#d4edda', 
                  color: '#155724', 
                  border: '1px solid #c3e6cb', 
                  borderRadius: 12,
                  padding: '16px 20px',
                  textAlign: 'center',
                  fontWeight: 500
                }}>
                  <i className="bi bi-check-circle me-2"></i>
                  {message}
                </div>
              )}
              {error && (
                <div className="alert mb-4" style={{ 
                  background: '#f8d7da', 
                  color: '#721c24', 
                  border: '1px solid #f5c6cb', 
                  borderRadius: 12,
                  padding: '16px 20px',
                  textAlign: 'center',
                  fontWeight: 500
                }}>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {/* Action Links */}
              <div className="text-center">
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <Link 
                    to="/freelancer-dashboard" 
                    className="btn dashboard-btn"
                    style={{ 
                      background: 'transparent', 
                      color: accent, 
                      border: `2px solid ${accent}`, 
                      borderRadius: 30, 
                      padding: '10px 20px', 
                      fontWeight: 600,
                      fontSize: 14,
                      transition: 'transform 0.18s, box-shadow 0.18s'
                    }}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Dashboard
                  </Link>
                  <Link 
                    to="/freelancer/profile" 
                    className="btn dashboard-btn"
                    style={{ 
                      background: 'transparent', 
                      color: '#666', 
                      border: '2px solid #ddd', 
                      borderRadius: 30, 
                      padding: '10px 20px', 
                      fontWeight: 600,
                      fontSize: 14,
                      transition: 'transform 0.18s, box-shadow 0.18s'
                    }}
                  >
                    <i className="bi bi-person me-2"></i>
                    View Profile
                  </Link>
                </div>
              </div>

              {/* Info Cards */}
              <div className="row mt-5 g-3">
                <div className="col-md-6">
                  <div className="bg-light rounded-3 p-3" style={{ background: 'rgba(253,104,14,0.05)' }}>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-shield-check me-2" style={{ color: accent }}></i>
                      <h6 className="mb-0" style={{ color: '#444', fontWeight: 600 }}>Secure Upload</h6>
                    </div>
                    <p className="mb-0" style={{ color: '#666', fontSize: 13 }}>
                      Your CV is encrypted and stored securely
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-light rounded-3 p-3" style={{ background: 'rgba(253,104,14,0.05)' }}>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-eye me-2" style={{ color: accent }}></i>
                      <h6 className="mb-0" style={{ color: '#444', fontWeight: 600 }}>AI Parsing</h6>
                    </div>
                    <p className="mb-0" style={{ color: '#666', fontSize: 13 }}>
                      Automatically extract skills and experience
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        .dashboard-btn:hover, .dashboard-btn:focus {
          transform: scale(1.07);
          box-shadow: 0 4px 24px rgba(253,104,14,0.18);
          z-index: 2;
        }
      `}</style>
    </div>
  );
};

export default FreelancerCVUpload; 