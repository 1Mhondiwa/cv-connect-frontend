import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const accent = '#fd680e';
const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://cv-connect-backend-1r7p.onrender.com';

const FreelancerEditProfile = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    years_experience: "",
    headline: "",
    summary: "",
    linkedin_url: "",
    github_url: "",
    current_status: "",
    hourly_rate: "",
  });
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [skillsError, setSkillsError] = useState("");
  const [skillsSuccess, setSkillsSuccess] = useState("");
  const [editingSkill, setEditingSkill] = useState(null);
  const [newSkill, setNewSkill] = useState({
    skill_name: "",
    proficiency_level: "Intermediate",
    years_experience: ""
  });
  const [editingSkillData, setEditingSkillData] = useState({});
  
  // CV Parsed Data State
  const [cvData, setCvData] = useState({
    work_experience: [],
    education: []
  });
  const [editingWork, setEditingWork] = useState(null);
  const [newWork, setNewWork] = useState({
    title: "",
    company: "",
    start_date: "",
    end_date: "",
    description: ""
  });
  const [editingWorkData, setEditingWorkData] = useState({});
  const [workError, setWorkError] = useState("");
  const [workSuccess, setWorkSuccess] = useState("");

  // Education State
  const [editingEducation, setEditingEducation] = useState(null);
  const [newEducation, setNewEducation] = useState({
    degree: "",
    field: "",
    institution: "",
    year: ""
  });
  const [editingEducationData, setEditingEducationData] = useState({});
  const [educationError, setEducationError] = useState("");
  const [educationSuccess, setEducationSuccess] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/freelancer/profile");
        if (response.data.success) {
          setForm({
            ...form,
            ...response.data.profile,
            email: response.data.profile.email || "",
          });
          setSkills(response.data.profile.skills || []);
          
          // Load CV parsed data - preserve original data exactly as parsed
          if (response.data.profile.cv && response.data.profile.cv.parsed_data) {
            const parsedData = response.data.profile.cv.parsed_data;
            
            // Load work experience exactly as it was parsed from CV
            const workExperience = parsedData.work_experience || [];
            console.log('Original CV work experience:', workExperience);
            
            // Load education exactly as it was parsed from CV
            const education = parsedData.education || [];
            console.log('Original CV education:', education);
            
            setCvData({
              work_experience: workExperience,
              education: education
            });
          }
        } else {
          setError(response.data.message || "Failed to load profile.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleNewSkillChange = (e) => {
    setNewSkill({ ...newSkill, [e.target.name]: e.target.value });
    setSkillsError("");
    setSkillsSuccess("");
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newSkill.skill_name.trim()) {
      setSkillsError("Skill name is required.");
      return;
    }

    try {
      console.log("Adding skill:", newSkill);
      
      const response = await api.post(
        "/freelancer/skills",
        {
          skill_name: newSkill.skill_name.trim(),
          proficiency_level: newSkill.proficiency_level,
          years_experience: parseInt(newSkill.years_experience) || 0
        }
      );
      
      console.log("Add skill response:", response.data);
      
      if (response.data.success) {
        await refreshSkills();
        setNewSkill({
          skill_name: "",
          proficiency_level: "Intermediate",
          years_experience: ""
        });
        setSkillsSuccess("Skill added successfully!");
        setTimeout(() => setSkillsSuccess(""), 3000);
      } else {
        setSkillsError(response.data.message || "Failed to add skill.");
      }
    } catch (err) {
      console.error("Add skill error:", err);
      setSkillsError(err.response?.data?.message || "Failed to add skill.");
    }
  };

  const refreshSkills = async () => {
    try {
      const response = await api.get("/freelancer/profile");
      if (response.data.success) {
        setSkills(response.data.profile.skills || []);
      }
    } catch (err) {
      console.error("Error refreshing skills:", err);
    }
  };

  const startEditingSkill = (skill) => {
    setEditingSkill(skill.freelancer_skill_id);
    setEditingSkillData({
      proficiency_level: skill.proficiency_level || "Intermediate",
      years_experience: skill.years_experience || ""
    });
  };

  const handleUpdateSkill = async (skillId) => {
    try {
      console.log("Updating skill:", skillId, editingSkillData);
      
      const response = await api.put(
        `/freelancer/skills/${skillId}`,
        {
          proficiency_level: editingSkillData.proficiency_level,
          years_experience: parseInt(editingSkillData.years_experience) || 0
        }
      );
      
      console.log("Update skill response:", response.data);
      
      if (response.data.success) {
        await refreshSkills();
        setEditingSkill(null);
        setEditingSkillData({});
        setSkillsSuccess("Skill updated successfully!");
        setTimeout(() => setSkillsSuccess(""), 3000);
      } else {
        setSkillsError(response.data.message || "Failed to update skill.");
      }
    } catch (err) {
      console.error("Update skill error:", err);
      setSkillsError(err.response?.data?.message || "Failed to update skill.");
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) {
      return;
    }

    try {
      console.log("Deleting skill:", skillId);
      
      const response = await api.delete(
        `/freelancer/skills/${skillId}`
      );
      
      console.log("Delete skill response:", response.data);
      
      if (response.data.success) {
        await refreshSkills();
        setSkillsSuccess("Skill deleted successfully!");
        setTimeout(() => setSkillsSuccess(""), 3000);
      } else {
        setSkillsError(response.data.message || "Failed to delete skill.");
      }
    } catch (err) {
      console.error("Delete skill error:", err);
      setSkillsError(err.response?.data?.message || "Failed to delete skill.");
    }
  };

  // Work Experience Functions
  const handleNewWorkChange = (e) => {
    const { name, value } = e.target;
    setNewWork(prev => ({
      ...prev,
      [name]: value
    }));
    setWorkError("");
    setWorkSuccess("");
  };

  // Add work experience with API integration
  const handleAddWork = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newWork.title.trim() || !newWork.company.trim()) {
      setWorkError("Job title and company are required.");
      return;
    }

    try {
      console.log("Adding work experience:", newWork);
      
      const response = await api.post(
        "/freelancer/work-experience",
        {
          title: newWork.title.trim(),
          company: newWork.company.trim(),
          start_date: newWork.start_date || "",
          end_date: newWork.end_date || "",
          description: newWork.description || ""
        }
      );
      
      console.log("Add work experience response:", response.data);
      
      if (response.data.success) {
        await refreshWorkExperience();
        setNewWork({
          title: "",
          company: "",
          start_date: "",
          end_date: "",
          description: ""
        });
        setWorkSuccess("Work experience added successfully!");
        setTimeout(() => setWorkSuccess(""), 3000);
      } else {
        setWorkError(response.data.message || "Failed to add work experience.");
      }
    } catch (err) {
      console.error("Add work experience error:", err);
      setWorkError(err.response?.data?.message || "Failed to add work experience.");
    }
  };

  const refreshWorkExperience = async () => {
    try {
      const response = await api.get("/freelancer/profile");
      if (response.data.success) {
        // Update CV data with fresh work experience - preserve original data exactly
        if (response.data.profile.cv && response.data.profile.cv.parsed_data) {
          const parsedData = response.data.profile.cv.parsed_data;
          const workExperience = parsedData.work_experience || [];
          console.log('Refreshed work experience:', workExperience);
          
          setCvData(prev => ({
            ...prev,
            work_experience: workExperience
          }));
        }
      }
    } catch (err) {
      console.error("Error refreshing work experience:", err);
    }
  };

  const startEditingWork = (work) => {
    setEditingWork(work.id);
    setEditingWorkData({
      title: work.title || "",
      company: work.company || "",
      start_date: work.start_date || "",
      end_date: work.end_date || "",
      description: work.description || ""
    });
  };

  // Update work experience with API integration
  const handleUpdateWork = async (workId) => {
    try {
      if (!editingWorkData.title.trim() || !editingWorkData.company.trim()) {
        setWorkError("Job title and company are required.");
        return;
      }

      console.log("Updating work experience:", workId, editingWorkData);
      
      const response = await api.put(
        `/freelancer/work-experience/${workId}`,
        {
          title: editingWorkData.title.trim(),
          company: editingWorkData.company.trim(),
          start_date: editingWorkData.start_date || "",
          end_date: editingWorkData.end_date || "",
          description: editingWorkData.description || ""
        }
      );
      
      console.log("Update work experience response:", response.data);
      
      if (response.data.success) {
        await refreshWorkExperience();
        setEditingWork(null);
        setEditingWorkData({});
        setWorkSuccess("Work experience updated successfully!");
        setTimeout(() => setWorkSuccess(""), 3000);
      } else {
        setWorkError(response.data.message || "Failed to update work experience.");
      }
    } catch (err) {
      console.error("Update work experience error:", err);
      setWorkError(err.response?.data?.message || "Failed to update work experience.");
    }
  };

  // Delete work experience with API integration
  const handleDeleteWork = async (workId) => {
    if (!window.confirm("Are you sure you want to delete this work experience?")) {
      return;
    }

    try {
      console.log("Deleting work experience:", workId);
      
      const response = await api.delete(
        `/freelancer/work-experience/${workId}`
      );
      
      console.log("Delete work experience response:", response.data);
      
      if (response.data.success) {
        await refreshWorkExperience();
        setWorkSuccess("Work experience deleted successfully!");
        setTimeout(() => setWorkSuccess(""), 3000);
      } else {
        setWorkError(err.response?.data?.message || "Failed to delete work experience.");
      }
    } catch (err) {
      console.error("Delete work experience error:", err);
      setWorkError(err.response?.data?.message || "Failed to delete work experience.");
    }
  };

  // Education Functions
  const handleNewEducationChange = (e) => {
    const { name, value } = e.target;
    setNewEducation(prev => ({
      ...prev,
      [name]: value
    }));
    setEducationError("");
    setEducationSuccess("");
  };

  // Add education with API integration
  const handleAddEducation = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newEducation.degree.trim() || !newEducation.institution.trim()) {
      setEducationError("Degree and institution are required.");
      return;
    }

    try {
      console.log("Adding education:", newEducation);
      
      const response = await api.post(
        "/freelancer/education",
        {
          degree: newEducation.degree.trim(),
          institution: newEducation.institution.trim(),
          field: newEducation.field || "",
          year: newEducation.year || ""
        }
      );
      
      console.log("Add education response:", response.data);
      
      if (response.data.success) {
        await refreshEducation();
        setNewEducation({
          degree: "",
          field: "",
          institution: "",
          year: ""
        });
        setEducationSuccess("Education added successfully!");
        setTimeout(() => setEducationSuccess(""), 3000);
      } else {
        setEducationError(response.data.message || "Failed to add education.");
      }
    } catch (err) {
      console.error("Add education error:", err);
      setEducationError(err.response?.data?.message || "Failed to add education.");
    }
  };

  const refreshEducation = async () => {
    try {
      const response = await api.get("/freelancer/profile");
      if (response.data.success) {
        // Update CV data with fresh education - preserve original data exactly
        if (response.data.profile.cv && response.data.profile.cv.parsed_data) {
          const parsedData = response.data.profile.cv.parsed_data;
          const education = parsedData.education || [];
          console.log('Refreshed education:', education);
          
          setCvData(prev => ({
            ...prev,
            education: education
          }));
        }
      }
    } catch (err) {
      console.error("Error refreshing education:", err);
    }
  };

  const startEditingEducation = (edu) => {
    setEditingEducation(edu.id);
    setEditingEducationData({
      degree: edu.degree || "",
      field: edu.field || "",
      institution: edu.institution || "",
      year: edu.year || ""
    });
  };

  // Update education with API integration
  const handleUpdateEducation = async () => {
    try {
      if (!editingEducationData.degree.trim() || !editingEducationData.institution.trim()) {
        setEducationError("Degree and institution are required.");
        return;
      }

      console.log("Updating education:", editingEducation, editingEducationData);
      
      const response = await api.put(
        `/freelancer/education/${editingEducation}`,
        {
          degree: editingEducationData.degree.trim(),
          institution: editingEducationData.institution.trim(),
          field: editingEducationData.field || "",
          year: editingEducationData.year || ""
        }
      );
      
      console.log("Update education response:", response.data);
      
      if (response.data.success) {
        await refreshEducation();
        setEditingEducation(null);
        setEditingEducationData({});
        setEducationSuccess("Education updated successfully!");
        setTimeout(() => setEducationSuccess(""), 3000);
      } else {
        setEducationError(response.data.message || "Failed to update education.");
      }
    } catch (err) {
      console.error("Update education error:", err);
      setEducationError(err.response?.data?.message || "Failed to update education.");
    }
  };

  // Delete education with API integration
  const handleDeleteEducation = async (educationId) => {
    if (!window.confirm("Are you sure you want to delete this education?")) {
      return;
    }

    try {
      console.log("Deleting education:", educationId);
      
      const response = await api.delete(
        `/freelancer/education/${educationId}`
      );
      
      console.log("Delete education response:", response.data);
      
      if (response.data.success) {
        await refreshEducation();
        setEducationSuccess("Education deleted successfully!");
        setTimeout(() => setEducationSuccess(""), 3000);
      } else {
        setEducationError(response.data.message || "Failed to delete education.");
      }
    } catch (err) {
      console.error("Delete education error:", err);
      setEducationError(err.response?.data?.message || "Failed to delete education.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("First and last name are required.");
      setSubmitting(false);
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        address: form.address,
        years_experience: form.years_experience,
        summary: form.summary,
        headline: form.headline,
        linkedin_url: form.linkedin_url,
        github_url: form.github_url,
        current_status: form.current_status,
        hourly_rate: form.hourly_rate,
      };
      
      // Update profile data
      const response = await api.put(
        "/freelancer/profile",
        payload
      );
      
      if (response.data.success) {
        // Update CV parsed data if there are changes
        if (cvData.work_experience.length > 0) {
          try {
            const cvResponse = await api.put(
              "/freelancer/cv/parsed-data",
              {
                parsed_data: {
                  work_experience: cvData.work_experience
                }
              }
            );
            
            if (cvResponse.data.success) {
              setSuccess("Profile and CV data updated successfully!");
            } else {
              console.warn("Failed to update CV parsed data:", cvResponse.data.message);
              setSuccess("Profile updated successfully! CV data update failed.");
            }
          } catch (cvErr) {
            console.warn("Failed to update CV parsed data:", cvErr);
            setSuccess("Profile updated successfully! CV data update failed.");
          }
        } else {
        setSuccess("Profile updated successfully!");
        }
        
        setTimeout(() => navigate("/freelancer/profile"), 1500);
      } else {
        setError(response.data.message || "Update failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <section
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #fff 60%, #f8f4f2 100%)',
        position: 'relative',
        padding: '0 0 40px 0'
      }}
    >
      {/* Fixed Navbar */}
      <nav className="freelancer-edit-profile-navbar">
        <div className="container d-flex justify-content-between align-items-center">
          <Link to="/freelancer-dashboard" style={{ textDecoration: 'none', color: accent, fontWeight: 700, fontSize: 22, letterSpacing: 1 }} className="d-flex align-items-center">
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
            CV<span style={{ color: '#333' }}>‑Connect</span>
          </Link>
          <button
            className="btn logout-btn"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <i className="bi bi-box-arrow-right"></i>Logout
          </button>
        </div>
      </nav>

      {/* Main Content with top margin for fixed navbar */}
      <div className="freelancer-edit-profile-content">
        <div className="container-fluid" style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
          {/* Page Header */}
          <div className="text-center mb-4">
            <h1 style={{ color: accent, fontWeight: 700, fontSize: '2.5rem', marginBottom: '8px' }}>
              <i className="bi bi-person-gear me-3"></i>
              Edit Your Profile
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem', margin: 0 }}>
              Update your information and manage your skills to attract better opportunities
            </p>
          </div>

          {/* Horizontal Layout */}
          <div className="row g-4">
            {/* Left Column - Profile Form */}
            <div className="col-lg-8">
              <div className="card shadow-sm" style={{ borderRadius: '16px', border: 'none' }}>
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    {/* Personal Information */}
                    <div className="mb-5">
                      <div className="d-flex align-items-center mb-4">
                        <div style={{
                          background: `linear-gradient(135deg, ${accent}, #ff8533)`,
                          borderRadius: '12px',
                          padding: '12px',
                          marginRight: '16px'
                        }}>
                          <i className="bi bi-person" style={{ color: '#fff', fontSize: '20px' }}></i>
                        </div>
                        <div>
                          <h4 style={{ color: '#333', fontWeight: 600, margin: 0 }}>Personal Information</h4>
                          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Basic details about yourself</p>
                        </div>
                      </div>
                      
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold" style={{ color: '#333' }}>First Name *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            name="first_name" 
                            value={form.first_name} 
                            onChange={handleChange} 
                            required 
                            style={{ borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px' }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold" style={{ color: '#333' }}>Last Name *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            name="last_name" 
                            value={form.last_name} 
                            onChange={handleChange} 
                            required 
                            style={{ borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px' }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold" style={{ color: '#333' }}>Email Address</label>
                          <input 
                            type="email" 
                            className="form-control" 
                            name="email" 
                            value={form.email} 
                            readOnly 
                            disabled 
                            style={{ 
                              backgroundColor: '#f8f9fa', 
                              borderRadius: '10px', 
                              border: '2px solid #e9ecef', 
                              padding: '12px 16px' 
                            }} 
                          />
                          <small className="text-muted">Email cannot be changed</small>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold" style={{ color: '#333' }}>Phone Number</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            name="phone" 
                            value={form.phone || ""} 
                            onChange={handleChange} 
                            placeholder="+1 (555) 123-4567" 
                            style={{ borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px' }}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold" style={{ color: '#333' }}>Address</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            name="address" 
                            value={form.address || ""} 
                            onChange={handleChange} 
                            placeholder="Enter your full address" 
                            style={{ borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="mb-5">
                      <div className="d-flex align-items-center mb-4">
                        <div style={{
                          background: `linear-gradient(135deg, ${accent}, #ff8533)`,
                          borderRadius: '12px',
                          padding: '12px',
                          marginRight: '16px'
                        }}>
                          <i className="bi bi-briefcase" style={{ color: '#fff', fontSize: '20px' }}></i>
                        </div>
                        <div>
                          <h4 style={{ color: '#333', fontWeight: 600, margin: 0 }}>Professional Information</h4>
                          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Your work experience and expertise</p>
                        </div>
                      </div>
                      
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold" style={{ color: '#333' }}>Professional Title/Role</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            name="headline" 
                            value={form.headline || ""} 
                            onChange={handleChange} 
                            placeholder="e.g., Software Developer, Graphic Designer, Electrician" 
                            style={{ borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px' }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold" style={{ color: '#333' }}>Years of Experience</label>
                          <input 
                            type="number" 
                            min="0" 
                            max="50" 
                            className="form-control" 
                            name="years_experience" 
                            value={form.years_experience || ""} 
                            onChange={handleChange} 
                            placeholder="e.g., 5" 
                            style={{ borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px' }}
                          />
                        </div>
                      </div>
                      
                      <div className="row g-3 mt-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold" style={{ color: '#333' }}>Hourly Rate (ZAR)</label>
                          <div className="input-group">
                            <span className="input-group-text">R</span>
                            <input 
                              type="number" 
                              min="0" 
                              step="0.01"
                              className="form-control" 
                              name="hourly_rate" 
                              value={form.hourly_rate || ""} 
                              onChange={handleChange} 
                              placeholder="e.g., 500" 
                              style={{ borderRadius: '0 10px 10px 0', border: '2px solid #e9ecef', padding: '12px 16px' }}
                            />
                          </div>
                          <small className="text-muted">Set your hourly rate in South African Rand</small>
                        </div>
                      </div>
                      
                      <div className="row g-3 mt-3">
                        <div className="col-12">
                          <label className="form-label fw-semibold" style={{ color: '#333' }}>Professional Summary</label>
                          <textarea 
                            className="form-control" 
                            name="summary" 
                            value={form.summary || ""} 
                            onChange={handleChange} 
                            rows={4}
                            placeholder="Write a brief professional summary about yourself, your expertise, and what you can offer to potential clients..."
                            style={{ borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="mb-5">
                      <div className="d-flex align-items-center mb-4">
                        <div style={{
                          background: `linear-gradient(135deg, ${accent}, #ff8533)`,
                          borderRadius: '12px',
                          padding: '12px',
                          marginRight: '16px'
                        }}>
                          <i className="bi bi-link-45deg" style={{ color: '#fff', fontSize: '20px' }}></i>
                        </div>
                        <div>
                          <h4 style={{ color: '#333', fontWeight: 600, margin: 0 }}>Social Links</h4>
                          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Your professional online presence</p>
                        </div>
                      </div>
                      
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold" style={{ color: '#333' }}>LinkedIn URL</label>
                          <input 
                            type="url" 
                            className="form-control" 
                            name="linkedin_url" 
                            value={form.linkedin_url || ""} 
                            onChange={handleChange} 
                            placeholder="https://linkedin.com/in/yourusername" 
                            style={{ borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px' }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold" style={{ color: '#333' }}>GitHub URL</label>
                          <input 
                            type="url" 
                            className="form-control" 
                            name="github_url" 
                            value={form.github_url || ""} 
                            onChange={handleChange} 
                            placeholder="https://github.com/yourusername" 
                            style={{ borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Form Messages */}
                    {error && (
                      <div className="alert alert-danger alert-dismissible fade show" role="alert" style={{ borderRadius: '12px', border: 'none' }}>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError("")}></button>
                      </div>
                    )}
                    {success && (
                      <div className="alert alert-success alert-dismissible fade show" role="alert" style={{ borderRadius: '12px', border: 'none' }}>
                        <i className="bi bi-check-circle me-2"></i>
                        {success}
                        <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
                      </div>
                    )}

                    {/* Form Actions */}
                    <div className="d-flex gap-3 justify-content-end">
                      <Link 
                        to="/freelancer/profile" 
                        className="btn btn-outline-secondary"
                        style={{ 
                          borderRadius: '25px', 
                          padding: '12px 32px',
                          fontWeight: 600,
                          fontSize: '16px'
                        }}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Profile
                      </Link>
                      <button 
                        type="submit" 
                        className="btn" 
                        disabled={submitting}
                        style={{ 
                          background: `linear-gradient(135deg, ${accent}, #ff8533)`, 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '25px', 
                          padding: '12px 32px',
                          fontWeight: 600,
                          fontSize: '16px'
                        }}
                      >
                        {submitting ? (
                          <span>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving Changes...
                          </span>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Save Profile Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Right Column - Skills Management */}
            <div className="col-lg-4">
              <div className="card shadow-sm sticky-top" style={{ borderRadius: '16px', border: 'none', top: '100px' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div style={{
                      background: `linear-gradient(135deg, ${accent}, #ff8533)`,
                      borderRadius: '12px',
                      padding: '12px',
                      marginRight: '16px'
                    }}>
                      <i className="bi bi-tools" style={{ color: '#fff', fontSize: '20px' }}></i>
                    </div>
                    <div>
                      <h4 style={{ color: '#333', fontWeight: 600, margin: 0 }}>Skills & Expertise</h4>
                      <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Manage your technical skills</p>
                    </div>
                  </div>

                  {/* Add New Skill Form */}
                  <div className="card mb-4" style={{ borderRadius: '12px', border: `2px solid ${accent}20` }}>
                    <div className="card-header" style={{ 
                      background: `linear-gradient(135deg, ${accent}, #ff8533)`, 
                      color: 'white', 
                      fontWeight: 600, 
                      borderRadius: '10px 10px 0 0',
                      border: 'none'
                    }}>
                      <i className="bi bi-plus-circle me-2"></i>
                      Add New Skill
                    </div>
                    <div className="card-body p-3">
                      <form onSubmit={handleAddSkill}>
                        <div className="mb-3">
                          <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#333' }}>Skill Name *</label>
                          <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            name="skill_name" 
                            value={newSkill.skill_name} 
                            onChange={handleNewSkillChange}
                            placeholder="e.g., JavaScript, React, Python"
                            required
                            style={{ borderRadius: '8px', border: '2px solid #e9ecef' }}
                          />
                        </div>
                        <div className="row mb-3">
                          <div className="col-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#333' }}>Level</label>
                            <select 
                              className="form-control form-control-sm" 
                              name="proficiency_level" 
                              value={newSkill.proficiency_level} 
                              onChange={handleNewSkillChange}
                              style={{ borderRadius: '8px', border: '2px solid #e9ecef' }}
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                              <option value="Expert">Expert</option>
                            </select>
                          </div>
                          <div className="col-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#333' }}>Years</label>
                            <input 
                              type="number" 
                              min="0" 
                              className="form-control form-control-sm" 
                              name="years_experience" 
                              value={newSkill.years_experience} 
                              onChange={handleNewSkillChange}
                              placeholder="0"
                              style={{ borderRadius: '8px', border: '2px solid #e9ecef' }}
                            />
                          </div>
                        </div>
                        <button 
                          type="submit" 
                          className="btn btn-sm w-100" 
                          style={{ 
                            background: `linear-gradient(135deg, ${accent}, #ff8533)`, 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '20px', 
                            padding: '8px 16px',
                            fontWeight: 600
                          }}
                        >
                          <i className="bi bi-plus me-1"></i>
                          Add Skill
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Skills Messages */}
                  {skillsError && (
                    <div className="alert alert-danger alert-dismissible fade show py-2" role="alert" style={{ borderRadius: '10px', fontSize: '14px' }}>
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {skillsError}
                      <button type="button" className="btn-close btn-close-sm" onClick={() => setSkillsError("")}></button>
                    </div>
                  )}
                  {skillsSuccess && (
                    <div className="alert alert-success alert-dismissible fade show py-2" role="alert" style={{ borderRadius: '10px', fontSize: '14px' }}>
                      <i className="bi bi-check-circle me-2"></i>
                      {skillsSuccess}
                      <button type="button" className="btn-close btn-close-sm" onClick={() => setSkillsSuccess("")}></button>
                    </div>
                  )}

                  {/* Skills List */}
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {skills.length > 0 && (
                      <div className="mb-3">
                        <h6 style={{ color: '#333', fontWeight: 600, marginBottom: '16px' }}>
                          <i className="bi bi-list-check me-2"></i>
                          Your Skills ({skills.length})
                        </h6>
                        <div className="d-flex flex-column gap-3">
                          {skills.map((skill) => (
                            <div key={skill.freelancer_skill_id} style={{
                              background: '#f8f9fa',
                              borderRadius: '12px',
                              padding: '16px',
                              border: '1px solid #e9ecef',
                              position: 'relative'
                            }}>
                              {editingSkill === skill.freelancer_skill_id ? (
                                <div>
                                  <div className="mb-2">
                                    <label className="form-label fw-semibold" style={{ fontSize: '12px', color: '#333' }}>Skill Name</label>
                                    <input 
                                      type="text" 
                                      className="form-control form-control-sm" 
                                      value={skill.skill_name} 
                                      readOnly
                                      style={{ borderRadius: '8px', border: '2px solid #e9ecef', fontSize: '12px' }}
                                    />
                                  </div>
                                  <div className="row mb-2">
                                    <div className="col-6">
                                      <label className="form-label fw-semibold" style={{ fontSize: '12px', color: '#333' }}>Level</label>
                                      <select 
                                        className="form-control form-control-sm" 
                                        value={editingSkillData.proficiency_level || "Intermediate"}
                                        onChange={(e) => setEditingSkillData({ ...editingSkillData, proficiency_level: e.target.value })}
                                        style={{ borderRadius: '8px', border: '2px solid #e9ecef', fontSize: '12px' }}
                                      >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                        <option value="Expert">Expert</option>
                                      </select>
                                    </div>
                                    <div className="col-6">
                                      <label className="form-label fw-semibold" style={{ fontSize: '12px', color: '#333' }}>Years</label>
                                      <input 
                                        type="number" 
                                        min="0" 
                                        className="form-control form-control-sm" 
                                        value={editingSkillData.years_experience || ""} 
                                        onChange={(e) => setEditingSkillData({ ...editingSkillData, years_experience: e.target.value })}
                                        style={{ borderRadius: '8px', border: '2px solid #e9ecef', fontSize: '12px' }}
                                      />
                                    </div>
                                  </div>
                                  <div className="d-flex gap-2">
                                    <button 
                                      type="button"
                                      className="btn btn-sm btn-success flex-fill"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleUpdateSkill(skill.freelancer_skill_id);
                                      }}
                                      style={{ borderRadius: '8px', fontSize: '12px' }}
                                    >
                                      <i className="bi bi-check me-1"></i>
                                      Save
                                    </button>
                                    <button 
                                      type="button"
                                      className="btn btn-sm btn-secondary flex-fill"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setEditingSkill(null);
                                        setEditingSkillData({});
                                      }}
                                      style={{ borderRadius: '8px', fontSize: '12px' }}
                                    >
                                      <i className="bi bi-x me-1"></i>
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 style={{ 
                                      fontWeight: 600, 
                                      color: '#333',
                                      margin: 0,
                                      fontSize: '14px'
                                    }}>
                                      {skill.skill_name}
                                    </h6>
                                    <span style={{ 
                                      background: `linear-gradient(135deg, ${accent}, #ff8533)`, 
                                      color: '#fff', 
                                      padding: '4px 8px', 
                                      borderRadius: '12px',
                                      fontSize: '11px',
                                      fontWeight: 600
                                    }}>
                                      {skill.proficiency_level || "Intermediate"}
                                    </span>
                                  </div>
                                  {skill.years_experience !== undefined && skill.years_experience !== null && (
                                    <div style={{ color: '#666', fontSize: '12px', marginBottom: '12px' }}>
                                      <i className="bi bi-clock me-1"></i>
                                      {skill.years_experience} years experience
                                    </div>
                                  )}
                                  <div className="d-flex gap-2">
                                    <button 
                                      type="button"
                                      className="btn btn-sm btn-outline-primary flex-fill"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        startEditingSkill(skill);
                                      }}
                                      style={{ borderRadius: '8px', fontSize: '12px' }}
                                    >
                                      <i className="bi bi-pencil me-1"></i>
                                      Edit
                                    </button>
                                    <button 
                                      type="button"
                                      className="btn btn-sm btn-outline-danger flex-fill"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteSkill(skill.freelancer_skill_id);
                                      }}
                                      style={{ borderRadius: '8px', fontSize: '12px' }}
                                    >
                                      <i className="bi bi-trash me-1"></i>
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Skills Message */}
                    {skills.length === 0 && (
                      <div className="text-center" style={{ color: '#888', padding: '40px 20px' }}>
                        <i className="bi bi-tools" style={{ fontSize: '48px', color: '#ddd', marginBottom: '16px' }}></i>
                        <p className="mb-0" style={{ fontSize: '14px' }}>No skills listed yet. Add your first skill above!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Work Experience Section - Full Width Below Main Form */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card shadow-sm" style={{ borderRadius: '16px', border: 'none' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div style={{
                      background: `linear-gradient(135deg, ${accent}, #ff8533)`,
                      borderRadius: '12px',
                      padding: '12px',
                      marginRight: '16px'
                    }}>
                      <i className="bi bi-briefcase-fill" style={{ color: '#fff', fontSize: '20px' }}></i>
                    </div>
                    <div>
                      <h4 style={{ color: '#333', fontWeight: 600, margin: 0 }}>Work Experience</h4>
                      <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Your professional work history</p>
                    </div>
                  </div>

                  {/* Add Work Experience Form */}
                  <div className="card mb-4" style={{ borderRadius: '12px', border: `2px solid ${accent}20` }}>
                    <div className="card-header" style={{ 
                      background: `linear-gradient(135deg, ${accent}, #ff8533)`, 
                      color: 'white', 
                      fontWeight: 600, 
                      borderRadius: '10px 10px 0 0',
                      border: 'none'
                    }}>
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Work Experience
                    </div>
                    <div className="card-body p-3">
                      <form onSubmit={handleAddWork}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#333' }}>Job Title *</label>
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              name="title" 
                              value={newWork.title} 
                              onChange={handleNewWorkChange}
                              placeholder="e.g., Senior Developer"
                              required
                              style={{ borderRadius: '8px', border: '2px solid #e9ecef' }}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#333' }}>Company *</label>
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              name="company" 
                              value={newWork.company} 
                              onChange={handleNewWorkChange}
                              placeholder="Company name"
                              required
                              style={{ borderRadius: '8px', border: '2px solid #e9ecef' }}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#333' }}>Start Date</label>
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              name="start_date" 
                              value={newWork.start_date} 
                              onChange={handleNewWorkChange}
                              placeholder="e.g., January 2020"
                              style={{ borderRadius: '8px', border: '2px solid #e9ecef' }}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#333' }}>End Date</label>
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              name="end_date" 
                              value={newWork.end_date} 
                              onChange={handleNewWorkChange}
                              placeholder="e.g., December 2023 or Present"
                              style={{ borderRadius: '8px', border: '2px solid #e9ecef' }}
                            />
                          </div>
                          <div className="col-12">
                            <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#333' }}>Description</label>
                            <textarea 
                              className="form-control form-control-sm" 
                              name="description" 
                              value={newWork.description} 
                              onChange={handleNewWorkChange}
                              rows={3}
                              placeholder="Describe your responsibilities and achievements..."
                              style={{ borderRadius: '8px', border: '2px solid #e9ecef' }}
                            />
                          </div>
                        </div>
                        <div className="mt-3 text-center">
                          <button 
                            type="submit" 
                            className="btn btn-sm" 
                            style={{ 
                              background: `linear-gradient(135deg, ${accent}, #ff8533)`, 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '20px', 
                              padding: '8px 24px',
                              fontWeight: 600
                            }}
                          >
                            <i className="bi bi-plus me-1"></i>
                            Add Work Experience
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Work Experience Messages */}
                  {workError && (
                    <div className="alert alert-danger alert-dismissible fade show py-2" role="alert" style={{ borderRadius: '10px', fontSize: '14px' }}>
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {workError}
                      <button type="button" className="btn-close btn-close-sm" onClick={() => setWorkError("")}></button>
                    </div>
                  )}
                  {workSuccess && (
                    <div className="alert alert-success alert-dismissible fade show py-2" role="alert" style={{ borderRadius: '10px', fontSize: '14px' }}>
                      <i className="bi bi-check-circle me-2"></i>
                      {workSuccess}
                      <button type="button" className="btn-close btn-close-sm" onClick={() => setWorkSuccess("")}></button>
                    </div>
                  )}

                  {/* Work Experience List */}
                  <div>
                    {cvData.work_experience.length > 0 && (
                      <div className="mb-3">
                        <h6 style={{ color: '#333', fontWeight: 600, marginBottom: '16px' }}>
                          <i className="bi bi-list-check me-2"></i>
                          Your Work Experience ({cvData.work_experience.length})
                        </h6>
                        <div className="d-flex flex-column gap-3">
                          {cvData.work_experience.map((work) => (
                            <div key={work.id} style={{
                              background: '#f8f9fa',
                              borderRadius: '12px',
                              padding: '16px',
                              border: '1px solid #e9ecef',
                              position: 'relative'
                            }}>
                              {editingWork === work.id ? (
                                <div>
                                  <div className="row g-2 mb-2">
                                    <div className="col-md-6">
                                      <label className="form-label fw-semibold" style={{ fontSize: '12px', color: '#333' }}>Job Title *</label>
                                      <input 
                                        type="text" 
                                        className="form-control form-control-sm" 
                                        value={editingWorkData.title || ""} 
                                        onChange={(e) => setEditingWorkData({ ...editingWorkData, title: e.target.value })}
                                        style={{ borderRadius: '8px', border: '2px solid #e9ecef', fontSize: '12px' }}
                                        required
                                      />
                                    </div>
                                    <div className="col-md-6">
                                      <label className="form-label fw-semibold" style={{ fontSize: '12px', color: '#333' }}>Company *</label>
                                      <input 
                                        type="text" 
                                        className="form-control form-control-sm" 
                                        value={editingWorkData.company || ""} 
                                        onChange={(e) => setEditingWorkData({ ...editingWorkData, company: e.target.value })}
                                        style={{ borderRadius: '8px', border: '2px solid #e9ecef', fontSize: '12px' }}
                                        required
                                      />
                                    </div>
                                    <div className="col-md-6">
                                      <label className="form-label fw-semibold" style={{ fontSize: '12px', color: '#333' }}>Start Date</label>
                                      <input 
                                        type="text" 
                                        className="form-control form-control-sm" 
                                        value={editingWorkData.start_date || ""} 
                                        onChange={(e) => setEditingWorkData({ ...editingWorkData, start_date: e.target.value })}
                                        placeholder="e.g., January 2020"
                                        style={{ borderRadius: '8px', border: '2px solid #e9ecef', fontSize: '12px' }}
                                      />
                                    </div>
                                    <div className="col-md-6">
                                      <label className="form-label fw-semibold" style={{ fontSize: '12px', color: '#333' }}>End Date</label>
                                      <input 
                                        type="text" 
                                        className="form-control form-control-sm" 
                                        value={editingWorkData.end_date || ""} 
                                        onChange={(e) => setEditingWorkData({ ...editingWorkData, end_date: e.target.value })}
                                        placeholder="e.g., December 2023 or Present"
                                        style={{ borderRadius: '8px', border: '2px solid #e9ecef', fontSize: '12px' }}
                                      />
                                    </div>
                                  </div>
                                  <div className="mb-2">
                                    <label className="form-label fw-semibold" style={{ fontSize: '12px', color: '#333' }}>Description</label>
                                    <textarea 
                                      className="form-control form-control-sm" 
                                      value={editingWorkData.description || ""} 
                                      onChange={(e) => setEditingWorkData({ ...editingWorkData, description: e.target.value })}
                                      rows={2}
                                      style={{ borderRadius: '8px', border: '2px solid #e9ecef', fontSize: '12px' }}
                                    />
                                  </div>
                                  <div className="d-flex gap-2">
                                    <button 
                                      type="button"
                                      className="btn btn-sm btn-success flex-fill"
                                      onClick={() => handleUpdateWork(work.id)}
                                      style={{ borderRadius: '8px', fontSize: '12px' }}
                                    >
                                      <i className="bi bi-check me-1"></i>
                                      Save
                                    </button>
                                    <button 
                                      type="button"
                                      className="btn btn-sm btn-secondary flex-fill"
                                      onClick={() => {
                                        setEditingWork(null);
                                        setEditingWorkData({});
                                      }}
                                      style={{ borderRadius: '8px', fontSize: '12px' }}
                                    >
                                      <i className="bi bi-x me-1"></i>
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                      <h6 style={{ 
                                        fontWeight: 600, 
                                        color: '#333',
                                        margin: 0,
                                        fontSize: '14px'
                                      }}>
                                        {work.title}
                                      </h6>
                                      <p style={{ 
                                        color: accent, 
                                        margin: 0,
                                        fontSize: '13px',
                                        fontWeight: 500
                                      }}>
                                        {work.company}
                                      </p>
                                    </div>
                                    <span style={{ 
                                      background: '#6c757d', 
                                      color: '#fff', 
                                      padding: '4px 8px', 
                                      borderRadius: '12px',
                                      fontSize: '11px',
                                      fontWeight: 600
                                    }}>
                                      Experience
                                    </span>
                                  </div>
                                  <div style={{ color: '#666', fontSize: '12px', marginBottom: '12px' }}>
                                    <i className="bi bi-calendar me-1"></i>
                                    {work.start_date} - {work.end_date || 'Present'}
                                  </div>
                                  {work.description && (
                                    <div style={{ color: '#666', fontSize: '12px', marginBottom: '12px' }}>
                                      {work.description}
                                    </div>
                                  )}
                                  <div className="d-flex gap-2">
                                    <button 
                                      type="button"
                                      className="btn btn-sm btn-outline-primary flex-fill"
                                      onClick={() => startEditingWork(work)}
                                      style={{ borderRadius: '8px', fontSize: '12px' }}
                                    >
                                      <i className="bi bi-pencil me-1"></i>
                                      Edit
                                    </button>
                                    <button 
                                      type="button"
                                      className="btn btn-sm btn-outline-danger flex-fill"
                                      onClick={() => handleDeleteWork(work.id)}
                                      style={{ borderRadius: '8px', fontSize: '12px' }}
                                    >
                                      <i className="bi bi-trash me-1"></i>
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Work Experience Message */}
                    {cvData.work_experience.length === 0 && (
                      <div className="text-center" style={{ color: '#888', padding: '40px 20px' }}>
                        <i className="bi bi-briefcase" style={{ fontSize: '48px', color: '#ddd', marginBottom: '16px' }}></i>
                        <p className="mb-0" style={{ fontSize: '14px' }}>No work experience listed yet. Add your first work experience above!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Education Section - Full Width Below Work Experience */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card shadow-sm" style={{ borderRadius: '16px', border: 'none' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div style={{
                      background: `linear-gradient(135deg, ${accent}, #ff8533)`,
                      borderRadius: '12px',
                      padding: '12px',
                      marginRight: '16px'
                    }}>
                      <i className="bi bi-mortarboard-fill" style={{ color: '#fff', fontSize: '20px' }}></i>
                    </div>
                    <div>
                      <h4 style={{ color: '#333', fontWeight: 600, margin: 0 }}>Education</h4>
                      <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Your academic background and qualifications</p>
                    </div>
                  </div>

                  {/* Add Education Form */}
                  <div className="card mb-4" style={{ borderRadius: '12px', border: `2px solid ${accent}20` }}>
                    <div className="card-header" style={{ 
                      background: `linear-gradient(135deg, ${accent}, #ff8533)`, 
                      color: 'white', 
                      fontWeight: 600, 
                      borderRadius: '10px 10px 0 0',
                      border: 'none'
                    }}>
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Education
                    </div>
                    <div className="card-body p-3">
                      <form onSubmit={handleAddEducation}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#333' }}>Degree *</label>
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              name="degree" 
                              value={newEducation.degree} 
                              onChange={handleNewEducationChange}
                              placeholder="e.g., Bachelor's, Master's"
                              required
                              style={{ borderRadius: '8px', border: '2px solid #e9ecef' }}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#333' }}>Institution *</label>
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              name="institution" 
                              value={newEducation.institution} 
                              onChange={handleNewEducationChange}
                              placeholder="University/College name"
                              required
                              style={{ borderRadius: '8px', border: '2px solid #e9ecef' }}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#333' }}>Field of Study</label>
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              name="field" 
                              value={newEducation.field} 
                              onChange={handleNewEducationChange}
                              placeholder="e.g., Computer Science"
                              style={{ borderRadius: '8px', border: '2px solid #e9ecef' }}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold" style={{ fontSize: '14px', color: '#333' }}>Year</label>
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              name="year" 
                              value={newEducation.year} 
                              onChange={handleNewEducationChange}
                              placeholder="e.g., 2020"
                              style={{ borderRadius: '8px', border: '2px solid #e9ecef' }}
                            />
                          </div>
                        </div>
                        <div className="mt-3 text-center">
                          <button 
                            type="submit" 
                            className="btn btn-sm" 
                            style={{ 
                              background: `linear-gradient(135deg, ${accent}, #ff8533)`, 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '20px', 
                              padding: '8px 24px',
                              fontWeight: 600
                            }}
                          >
                            <i className="bi bi-plus me-1"></i>
                            Add Education
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Education Messages */}
                  {educationError && (
                    <div className="alert alert-danger alert-dismissible fade show py-2" role="alert" style={{ borderRadius: '10px', fontSize: '14px' }}>
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {educationError}
                      <button type="button" className="btn-close btn-close-sm" onClick={() => setEducationError("")}></button>
                    </div>
                  )}
                  {educationSuccess && (
                    <div className="alert alert-success alert-dismissible fade show py-2" role="alert" style={{ borderRadius: '10px', fontSize: '14px' }}>
                      <i className="bi bi-check-circle me-2"></i>
                      {educationSuccess}
                      <button type="button" className="btn-close btn-close-sm" onClick={() => setEducationSuccess("")}></button>
                    </div>
                  )}

                  {/* Education List */}
                  <div>
                    {cvData.education.length > 0 && (
                      <div className="mb-3">
                        <h6 style={{ color: '#333', fontWeight: 600, marginBottom: '16px' }}>
                          <i className="bi bi-mortarboard me-2"></i>
                          Your Education ({cvData.education.length})
                        </h6>
                        <div className="d-flex flex-column gap-3">
                          {cvData.education.map((edu) => (
                            <div key={edu.id} style={{
                              background: '#f8f9fa',
                              borderRadius: '12px',
                              padding: '16px',
                              border: '1px solid #e9ecef',
                              position: 'relative'
                            }}>
                              {editingEducation === edu.id ? (
                                <div>
                                  <div className="row g-2 mb-2">
                                    <div className="col-md-6">
                                      <label className="form-label fw-semibold" style={{ fontSize: '12px', color: '#333' }}>Degree *</label>
                                      <input 
                                        type="text" 
                                        className="form-control form-control-sm" 
                                        value={editingEducationData.degree || ""} 
                                        onChange={(e) => setEditingEducationData({ ...editingEducationData, degree: e.target.value })}
                                        style={{ borderRadius: '8px', border: '2px solid #e9ecef', fontSize: '12px' }}
                                        required
                                      />
                                    </div>
                                    <div className="col-md-6">
                                      <label className="form-label fw-semibold" style={{ fontSize: '12px', color: '#333' }}>Institution *</label>
                                      <input 
                                        type="text" 
                                        className="form-control form-control-sm" 
                                        value={editingEducationData.institution || ""} 
                                        onChange={(e) => setEditingEducationData({ ...editingEducationData, institution: e.target.value })}
                                        style={{ borderRadius: '8px', border: '2px solid #e9ecef', fontSize: '12px' }}
                                        required
                                      />
                                    </div>
                                    <div className="col-md-6">
                                      <label className="form-label fw-semibold" style={{ fontSize: '12px', color: '#333' }}>Field of Study</label>
                                      <input 
                                        type="text" 
                                        className="form-control form-control-sm" 
                                        value={editingEducationData.field || ""} 
                                        onChange={(e) => setEditingEducationData({ ...editingEducationData, field: e.target.value })}
                                        style={{ borderRadius: '8px', border: '2px solid #e9ecef', fontSize: '12px' }}
                                      />
                                    </div>
                                    <div className="col-md-6">
                                      <label className="form-label fw-semibold" style={{ fontSize: '12px', color: '#333' }}>Year</label>
                                      <input 
                                        type="text" 
                                        className="form-control form-control-sm" 
                                        value={editingEducationData.year || ""} 
                                        onChange={(e) => setEditingEducationData({ ...editingEducationData, year: e.target.value })}
                                        placeholder="e.g., 2020"
                                        style={{ borderRadius: '8px', border: '2px solid #e9ecef', fontSize: '12px' }}
                                      />
                                    </div>
                                  </div>
                                  <div className="d-flex gap-2">
                                    <button 
                                      type="button"
                                      className="btn btn-sm btn-success flex-fill"
                                      onClick={handleUpdateEducation}
                                      style={{ borderRadius: '8px', fontSize: '12px' }}
                                    >
                                      <i className="bi bi-check me-1"></i>
                                      Save
                                    </button>
                                    <button 
                                      type="button"
                                      className="btn btn-sm btn-secondary flex-fill"
                                      onClick={() => {
                                        setEditingEducation(null);
                                        setEditingEducationData({});
                                      }}
                                      style={{ borderRadius: '8px', fontSize: '12px' }}
                                    >
                                      <i className="bi bi-x me-1"></i>
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                      <h6 style={{ 
                                        fontWeight: 600, 
                                        color: '#333',
                                        margin: 0,
                                        fontSize: '14px'
                                      }}>
                                        {edu.degree} {edu.field && `in ${edu.field}`}
                                      </h6>
                                      <p style={{ 
                                        color: accent, 
                                        margin: 0,
                                        fontSize: '13px',
                                        fontWeight: 500
                                      }}>
                                        {edu.institution}
                                      </p>
                                    </div>
                                    <span style={{ 
                                      background: '#6c757d', 
                                      color: '#fff', 
                                      padding: '4px 8px', 
                                      borderRadius: '12px',
                                      fontSize: '11px',
                                      fontWeight: 600
                                    }}>
                                      Education
                                    </span>
                                  </div>
                                  <div style={{ color: '#666', fontSize: '12px', marginBottom: '12px' }}>
                                    <i className="bi bi-calendar me-1"></i>
                                    {edu.year || 'Year not specified'}
                                  </div>
                                  
                                  <div className="d-flex gap-2">
                                    <button 
                                      type="button"
                                      className="btn btn-sm btn-outline-primary flex-fill"
                                      onClick={() => startEditingEducation(edu)}
                                      style={{ borderRadius: '8px', fontSize: '12px' }}
                                    >
                                      <i className="bi bi-pencil me-1"></i>
                                      Edit
                                    </button>
                                    <button 
                                      type="button"
                                      className="btn btn-sm btn-outline-danger flex-fill"
                                      onClick={() => handleDeleteEducation(edu.id)}
                                      style={{ borderRadius: '8px', fontSize: '12px' }}
                                    >
                                      <i className="bi bi-trash me-1"></i>
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Education Message */}
                    {cvData.education.length === 0 && (
                      <div className="text-center" style={{ color: '#888', padding: '40px 20px' }}>
                        <i className="bi bi-mortarboard" style={{ fontSize: '48px', color: '#ddd', marginBottom: '16px' }}></i>
                        <p className="mb-0" style={{ fontSize: '14px' }}>No education listed yet. Add your first education above!</p>
                      </div>
                    )}
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

export default FreelancerEditProfile; 