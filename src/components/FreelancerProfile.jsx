import React, { useEffect, useState, useRef } from "react";
import api from "../utils/axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

const accent = '#fd680e';

const FreelancerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const fileInputRef = useRef();
  const [deleteMsg, setDeleteMsg] = useState("");

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profile) => {
    if (!profile) return 0;
    const fields = [
      'first_name', 'last_name', 'email', 'phone', 'headline', 
      'years_experience', 'summary', 'skills', 'linkedin_url', 
      'github_url', 'current_status', 'profile_picture_url'
    ];
    const completedFields = fields.filter(field => {
      const value = profile[field];
      if (field === 'skills') return value && value.length > 0;
      return value && value.toString().trim() !== '';
    });
    return Math.round((completedFields.length / fields.length) * 100);
  };

  // Add this function in the component scope
  const handleDeleteProfileImage = async () => {
    if (!window.confirm("Delete your profile picture?")) return;
    try {
      await api.delete("/freelancer/profile-image");
      setDeleteMsg("Profile picture deleted.");
      // Refetch profile to ensure UI is in sync
      const response = await api.get("/freelancer/profile");
      if (response.data.success) {
        setProfile(response.data.profile);
      }
    } catch (err) {
      setDeleteMsg(
        err.response?.data?.message ||
        "Failed to delete profile picture."
      );
    }
  };

  // Profile image upload handler
  const handleProfileImageChange = async (e) => {
    setUploadError('');
    setUploadSuccess('');
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post('/freelancer/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        setUploadSuccess('Profile picture updated!');
        setProfile((prev) => ({
          ...prev,
          profile_picture_url: response.data.image_url
        }));
      } else {
        setUploadError(response.data.message || 'Failed to upload image.');
      }
    } catch (err) {
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/freelancer/profile");
        if (response.data.success) {
          setProfile(response.data.profile);
        } else {
          setError(response.data.message || "Failed to load profile.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <section
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(120deg, #fff 60%, #f8f4f2 100%)',
          position: 'relative',
          padding: '40px 0'
        }}
      >
        <div className="text-center">
          <div className="spinner-border" style={{ color: accent, width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-3" style={{ color: '#666', fontSize: 18 }}>Loading your profile...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(120deg, #fff 60%, #f8f4f2 100%)',
          position: 'relative',
          padding: '40px 0'
        }}
      >
        <div className="container" style={{ maxWidth: 600 }}>
          <div className="text-center">
            <div style={{ 
              background: '#fff', 
              borderRadius: 20, 
              padding: '40px 30px', 
              boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
              border: '1px solid #f0f0f0'
            }}>
              <i className="bi bi-exclamation-triangle" style={{ fontSize: 48, color: '#df1529', marginBottom: 20 }}></i>
              <h3 style={{ color: '#333', marginBottom: 15 }}>Failed to load profile</h3>
              <p style={{ color: '#666', marginBottom: 25 }}>{error}</p>
              <p style={{ color: '#888', fontSize: 14 }}>This might be due to an expired session. Please try logging in again.</p>
              <div className="d-flex justify-content-center gap-3 mt-4">
                <button 
                  className="btn" 
                  onClick={() => navigate("/login")}
                  style={{
                    background: accent,
                    color: '#fff',
                    borderRadius: 25,
                    padding: '10px 24px',
                    fontWeight: 600,
                    border: 'none'
                  }}
                >
                  Back to Login
                </button>
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={() => navigate("/freelancer-dashboard")}
                  style={{
                    borderRadius: 25,
                    padding: '10px 24px',
                    fontWeight: 600
                  }}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
        </div>
        </div>
      </section>
    );
  }

  if (!profile) return null;

  const profileCompletion = calculateProfileCompletion(profile);

  return (
    <section
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #fff 60%, #f8f4f2 100%)',
        position: 'relative',
        padding: '40px 0'
      }}
    >
      {/* Navbar */}
      <nav style={{
        width: '100%',
        background: '#fff',
        boxShadow: '0 2px 12px rgba(253,104,14,0.08)',
        padding: '0.7rem 0',
        marginBottom: 24,
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container d-flex justify-content-between align-items-center">
          <Link to="/freelancer-dashboard" style={{ textDecoration: 'none', color: accent, fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>
            CV<span style={{ color: '#333' }}>‑Connect</span>
          </Link>
          <button
            className="btn"
            style={{
              background: accent,
              color: '#fff',
              borderRadius: 25,
              padding: '8px 24px',
              fontWeight: 600,
              border: 'none',
              fontSize: 16
            }}
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </div>
      </nav>
      <div className="container" style={{ maxWidth: 1200 }}>
        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 style={{ 
            fontWeight: 700, 
            color: '#333', 
            marginBottom: 8,
            fontSize: '2.5rem'
          }}>
            My Profile
          </h1>
          <p style={{ 
            color: '#666', 
            fontSize: 18,
            marginBottom: 0
          }}>
            Showcase your skills and experience to potential clients
          </p>
        </div>

        <div className="row g-4">
          {/* Left Column - Profile Info */}
          <div className="col-lg-8">
            {/* Profile Header Card */}
            <div style={{
              background: '#fff',
              borderRadius: 20,
              padding: '32px',
              marginBottom: 24,
              boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
              border: '1px solid #f0f0f0'
            }}>
              <div className="row align-items-center">
                <div className="col-md-3 text-center">
        {(() => {
          const BACKEND_URL = "http://localhost:5000";
          let imgUrl = "";
          const hasCustomImage = !!profile?.profile_picture_url;
          if (hasCustomImage) {
            imgUrl = profile.profile_picture_url.startsWith("http")
              ? profile.profile_picture_url
              : `${BACKEND_URL}${profile.profile_picture_url}?t=${Date.now()}`;
          } else {
            const name = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "User";
                      imgUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${accent.replace('#', '')}&color=fff&size=150&bold=true`;
          }
          return (
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={imgUrl}
                alt="Profile"
                className="rounded-circle border"
                          style={{ 
                            width: 150, 
                            height: 150, 
                            objectFit: "cover",
                            border: '4px solid #fff',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                          }}
                onError={e => {
                  e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=User&background=${accent.replace('#', '')}&color=fff&size=150&bold=true`;
                }}
              />
              {hasCustomImage && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    borderRadius: "50%",
                              padding: "8px 10px",
                              fontSize: 16,
                              zIndex: 2,
                              border: '2px solid #fff'
                  }}
                  title="Delete Profile Picture"
                  onClick={handleDeleteProfileImage}
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
                        {/* Upload Button */}
                        <div className="mt-3">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleProfileImageChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            style={{
                              background: accent,
                              color: '#fff',
                              borderRadius: 20,
                              padding: '8px 16px',
                              fontSize: 14,
                              fontWeight: 600,
                              border: 'none'
                            }}
                          >
                            {uploading ? 'Uploading...' : 'Change Photo'}
                          </button>
                        </div>
                        {uploadError && (
                          <div className="mt-2 alert alert-danger" style={{ fontSize: 12 }}>{uploadError}</div>
                        )}
                        {uploadSuccess && (
                          <div className="mt-2 alert alert-success" style={{ fontSize: 12 }}>{uploadSuccess}</div>
              )}
              {deleteMsg && (
                          <div className="mt-2 alert alert-info" style={{ fontSize: 12 }}>{deleteMsg}</div>
              )}
            </div>
          );
        })()}
      </div>
                <div className="col-md-9">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h2 style={{ 
                        fontWeight: 700, 
                        color: '#333', 
                        marginBottom: 8,
                        fontSize: '2rem'
                      }}>
                        {profile.first_name} {profile.last_name}
                      </h2>
                      <p style={{ 
                        color: accent, 
                        fontSize: 18, 
                        fontWeight: 600,
                        marginBottom: 12
                      }}>
                        {profile.headline || 'Professional Freelancer'}
                      </p>
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <span style={{ 
                          background: '#e8f5e8', 
                          color: '#2d5a2d', 
                          padding: '4px 12px', 
                          borderRadius: 15,
                          fontSize: 14,
                          fontWeight: 600
                        }}>
                          <i className="bi bi-clock me-1"></i>
                          {profile.years_experience || 0} years experience
                        </span>
                        <span style={{ 
                          background: '#fff3cd', 
                          color: '#856404', 
                          padding: '4px 12px', 
                          borderRadius: 15,
                          fontSize: 14,
                          fontWeight: 600
                        }}>
                          <i className="bi bi-geo-alt me-1"></i>
                          {profile.current_status || 'Available'}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/freelancer/edit-profile"
                      className="btn"
                      style={{
                        background: accent,
                        color: '#fff',
                        borderRadius: 25,
                        padding: '10px 20px',
                        fontWeight: 600,
                        border: 'none',
                        fontSize: 14
                      }}
                    >
                      <i className="bi bi-pencil me-2"></i>
                      Edit Profile
                    </Link>
                  </div>
                  
                  {/* Social Links */}
                  <div className="d-flex gap-2 mb-3">
                    {profile.linkedin_url && (
                      <a 
                        href={profile.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm"
                        style={{
                          borderRadius: 20,
                          padding: '6px 12px',
                          fontSize: 14
                        }}
                      >
                        <i className="bi bi-linkedin me-1"></i>
                        LinkedIn
                      </a>
                    )}
                    {profile.github_url && (
                      <a 
                        href={profile.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline-dark btn-sm"
                        style={{
                          borderRadius: 20,
                          padding: '6px 12px',
                          fontSize: 14
                        }}
                      >
                        <i className="bi bi-github me-1"></i>
                        GitHub
                      </a>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="row">
          <div className="col-md-6">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-envelope me-2" style={{ color: accent, fontSize: 16 }}></i>
                        <span style={{ color: '#666' }}>{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-telephone me-2" style={{ color: accent, fontSize: 16 }}></i>
                          <span style={{ color: '#666' }}>{profile.phone}</span>
                        </div>
                      )}
          </div>
          <div className="col-md-6">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-calendar me-2" style={{ color: accent, fontSize: 16 }}></i>
                        <span style={{ color: '#666' }}>
                          Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
          </div>
        </div>

            {/* Summary Section */}
            {profile.summary && (
              <div style={{
                background: '#fff',
                borderRadius: 20,
                padding: '32px',
                marginBottom: 24,
                boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
                border: '1px solid #f0f0f0'
              }}>
                <h4 style={{ 
                  fontWeight: 700, 
                  color: '#333', 
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <i className="bi bi-person-lines-fill" style={{ color: accent }}></i>
                  Professional Summary
                </h4>
                <p style={{ 
                  color: '#666', 
                  fontSize: 16, 
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {profile.summary}
                </p>
        </div>
            )}

            {/* Skills Section */}
            <div style={{
              background: '#fff',
              borderRadius: 20,
              padding: '32px',
              marginBottom: 24,
              boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
              border: '1px solid #f0f0f0'
            }}>
              <h4 style={{ 
                fontWeight: 700, 
                color: '#333', 
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <i className="bi bi-tools" style={{ color: accent }}></i>
                Skills & Expertise
              </h4>
          {profile.skills && profile.skills.length > 0 ? (
                <div className="row g-3">
              {profile.skills.map((skill) => (
                    <div key={skill.freelancer_skill_id || skill.skill_id} className="col-md-6">
                      <div style={{
                        background: '#f8f9fa',
                        borderRadius: 12,
                        padding: '16px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 style={{ 
                            fontWeight: 600, 
                            color: '#333',
                            margin: 0
                          }}>
                  {skill.skill_name}
                          </h6>
                          <span style={{ 
                            background: accent, 
                            color: '#fff', 
                            padding: '4px 8px', 
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 600
                          }}>
                            {skill.proficiency_level || "Expert"}
                          </span>
                        </div>
                  {skill.years_experience !== undefined && (
                          <div style={{ color: '#666', fontSize: 14 }}>
                            <i className="bi bi-clock me-1"></i>
                            {skill.years_experience} years experience
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#888',
                  padding: '40px 20px'
                }}>
                  <i className="bi bi-tools" style={{ fontSize: 48, color: '#ddd', marginBottom: 16 }}></i>
                  <p>No skills listed yet.</p>
                  <Link
                    to="/freelancer/edit-profile"
                    className="btn btn-outline-primary"
                    style={{
                      borderRadius: 25,
                      padding: '8px 20px',
                      fontSize: 14
                    }}
                  >
                    Add Skills
                  </Link>
                </div>
          )}
        </div>

        {/* Additional CV Data Section */}
        {profile.cv && profile.cv.parsed_data && typeof profile.cv.parsed_data === 'object' && (() => {
          const shownFields = [
            'first_name', 'last_name', 'email', 'phone', 'headline', 'years_experience', 'summary', 'skills', 'linkedin_url', 'github_url', 'current_status',
          ];
          const extraEntries = Object.entries(profile.cv.parsed_data).filter(
            ([key]) => !shownFields.includes(key)
          );
          if (extraEntries.length === 0) return null;

          // Helper to format dates
          const formatDate = (val) => {
                if (!val) return <span style={{ color: '#888' }}>N/A</span>;
            const d = new Date(val);
            if (!isNaN(d)) return d.toLocaleDateString();
            // Try year only
            if (/^\d{4}$/.test(val)) return val;
            return val;
          };

          // Helper to render objects/arrays nicely
          const renderValue = (value, parentKey = '') => {
            if (Array.isArray(value)) {
                  if (value.length === 0) return <span style={{ color: '#888' }}>None</span>;
              // Array of objects (e.g. education, work experience)
              if (typeof value[0] === 'object' && value[0] !== null) {
                // Section icon
                let icon = null;
                    if (/education/i.test(parentKey)) icon = <i className="bi bi-mortarboard-fill me-2" style={{ color: accent }}></i>;
                    if (/work|experience/i.test(parentKey)) icon = <i className="bi bi-briefcase-fill me-2" style={{ color: accent }}></i>;
                return (
                  <div>
                        {icon && <div style={{ fontWeight: 600, marginBottom: 12, color: '#333' }}>{icon}{parentKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>}
                    {value.map((item, idx) => (
                          <div key={idx} style={{
                            background: '#f8f9fa',
                            borderRadius: 12,
                            padding: '16px',
                            marginBottom: 12,
                            border: '1px solid #e9ecef'
                          }}>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {Object.entries(item).map(([k, v]) => (
                                <li key={k} style={{ marginBottom: 8 }}>
                                  <strong style={{ color: '#333' }}>{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {/(date|year)/i.test(k) ? formatDate(v) : v}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                );
              }
              // Array of primitives
              return (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {value.map((v, i) => <li key={i} style={{ color: '#666' }}>{v}</li>)}
                </ul>
              );
            } else if (typeof value === 'object' && value !== null) {
              // Single object
              return (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {Object.entries(value).map(([k, v]) => (
                        <li key={k} style={{ marginBottom: 8 }}>
                          <strong style={{ color: '#333' }}>{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {/(date|year)/i.test(k) ? formatDate(v) : v}
                    </li>
                  ))}
                </ul>
              );
            } else {
              // Primitive value
              if (/(date|year)/i.test(parentKey)) return formatDate(value);
                  return value?.toString() || <span style={{ color: '#888' }}>N/A</span>;
            }
          };

          return (
                <div style={{
                  background: '#fff',
                  borderRadius: 20,
                  padding: '32px',
                  marginBottom: 24,
                  boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
                  border: '1px solid #f0f0f0'
                }}>
                  <h4 style={{ 
                    fontWeight: 700, 
                    color: '#333', 
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <i className="bi bi-file-earmark-text" style={{ color: accent }}></i>
                    Additional Information
                  </h4>
                  <div className="row g-4">
                  {extraEntries.map(([key, value]) => (
                      <div key={key} className="col-md-6">
                        <div style={{
                          background: '#f8f9fa',
                          borderRadius: 12,
                          padding: '16px',
                          border: '1px solid #e9ecef'
                        }}>
                          <h6 style={{ 
                            fontWeight: 600, 
                            color: '#333',
                            marginBottom: 12,
                            textTransform: 'capitalize'
                          }}>
                            {key.replace(/_/g, ' ')}
                          </h6>
                          <div style={{ color: '#666' }}>
                            {renderValue(value, key)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
            </div>
          );
        })()}
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="col-lg-4">
            {/* Profile Completion Card */}
            <div style={{
              background: '#fff',
              borderRadius: 20,
              padding: '24px',
              marginBottom: 24,
              boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
              border: '1px solid #f0f0f0'
            }}>
              <h5 style={{ 
                fontWeight: 700, 
                color: '#333', 
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <i className="bi bi-check-circle" style={{ color: accent }}></i>
                Profile Completion
              </h5>
              <div className="text-center mb-3">
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `conic-gradient(${accent} ${profileCompletion * 3.6}deg, #e9ecef 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 18,
                    color: accent
                  }}>
                    {profileCompletion}%
                  </div>
                </div>
                <p style={{ color: '#666', margin: 0 }}>
                  {profileCompletion === 100 ? 'Profile Complete!' : `${100 - profileCompletion}% remaining`}
                </p>
              </div>
              {profileCompletion < 100 && (
                <Link
                  to="/freelancer/edit-profile"
                  className="btn w-100"
                  style={{
                    background: accent,
                    color: '#fff',
                    borderRadius: 25,
                    padding: '10px 20px',
                    fontWeight: 600,
                    border: 'none',
                    fontSize: 14
                  }}
                >
                  Complete Profile
                </Link>
              )}
            </div>

            {/* Quick Actions Card */}
            <div style={{
              background: '#fff',
              borderRadius: 20,
              padding: '24px',
              marginBottom: 24,
              boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
              border: '1px solid #f0f0f0'
            }}>
              <h5 style={{ 
                fontWeight: 700, 
                color: '#333', 
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <i className="bi bi-lightning" style={{ color: accent }}></i>
                Quick Actions
              </h5>
              <div className="d-grid gap-2">
                <Link
                  to="/freelancer/edit-profile"
                  className="btn btn-outline-primary"
                  style={{
                    borderRadius: 25,
                    padding: '10px 20px',
                    fontWeight: 600,
                    fontSize: 14,
                    textAlign: 'left'
                  }}
                >
                  <i className="bi bi-pencil me-2"></i>
                  Edit Profile
                </Link>
                <Link
                  to="/freelancer/cv-upload"
                  className="btn btn-outline-success"
                  style={{
                    borderRadius: 25,
                    padding: '10px 20px',
                    fontWeight: 600,
                    fontSize: 14,
                    textAlign: 'left'
                  }}
                >
                  <i className="bi bi-upload me-2"></i>
                  Upload CV
                </Link>
                <Link
                  to="/freelancer-dashboard"
                  className="btn btn-outline-secondary"
                  style={{
                    borderRadius: 25,
                    padding: '10px 20px',
                    fontWeight: 600,
                    fontSize: 14,
                    textAlign: 'left'
                  }}
                >
                  <i className="bi bi-house me-2"></i>
                  Back to Dashboard
                </Link>
              </div>
            </div>

            {/* Profile Stats Card */}
            <div style={{
              background: '#fff',
              borderRadius: 20,
              padding: '24px',
              marginBottom: 24,
              boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
              border: '1px solid #f0f0f0'
            }}>
              <h5 style={{ 
                fontWeight: 700, 
                color: '#333', 
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <i className="bi bi-graph-up" style={{ color: accent }}></i>
                Profile Stats
              </h5>
              <div className="row g-3">
                <div className="col-6">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontWeight: 700, 
                      fontSize: 24, 
                      color: accent 
                    }}>
                      {profile.skills?.length || 0}
                    </div>
                    <div style={{ 
                      fontSize: 12, 
                      color: '#666',
                      textTransform: 'uppercase',
                      fontWeight: 600
                    }}>
                      Skills
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontWeight: 700, 
                      fontSize: 24, 
                      color: accent 
                    }}>
                      {profile.years_experience || 0}
                    </div>
                    <div style={{ 
                      fontSize: 12, 
                      color: '#666',
                      textTransform: 'uppercase',
                      fontWeight: 600
                    }}>
                      Years Exp
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontWeight: 700, 
                      fontSize: 24, 
                      color: accent 
                    }}>
                      {profile.linkedin_url ? 1 : 0}
                    </div>
                    <div style={{ 
                      fontSize: 12, 
                      color: '#666',
                      textTransform: 'uppercase',
                      fontWeight: 600
                    }}>
                      Social Links
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontWeight: 700, 
                      fontSize: 24, 
                      color: accent 
                    }}>
                      {profileCompletion}
                    </div>
                    <div style={{ 
                      fontSize: 12, 
                      color: '#666',
                      textTransform: 'uppercase',
                      fontWeight: 600
                    }}>
                      Complete %
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreelancerProfile; 