import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

const accent = '#fd680e';

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
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/freelancer/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setForm({
            ...form,
            ...response.data.profile,
            email: response.data.profile.email || "",
          });
          setSkills(response.data.profile.skills || []);
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
    e.stopPropagation(); // Prevent form submission
    if (!newSkill.skill_name.trim()) {
      setSkillsError("Skill name is required.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log("Adding skill:", newSkill); // Debug log
      
      const response = await axios.post(
        "/api/freelancer/skills",
        {
          skill_name: newSkill.skill_name.trim(),
          proficiency_level: newSkill.proficiency_level,
          years_experience: parseInt(newSkill.years_experience) || 0
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log("Add skill response:", response.data); // Debug log
      
      if (response.data.success) {
        // Refresh skills list
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
      console.error("Add skill error:", err); // Debug log
      setSkillsError(err.response?.data?.message || "Failed to add skill.");
    }
  };

  const refreshSkills = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/freelancer/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const token = localStorage.getItem("token");
      console.log("Updating skill:", skillId, editingSkillData); // Debug log
      
      const response = await axios.put(
        `/api/freelancer/skills/${skillId}`,
        {
          proficiency_level: editingSkillData.proficiency_level,
          years_experience: parseInt(editingSkillData.years_experience) || 0
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log("Update skill response:", response.data); // Debug log
      
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
      console.error("Update skill error:", err); // Debug log
      setSkillsError(err.response?.data?.message || "Failed to update skill.");
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log("Deleting skill:", skillId); // Debug log
      
      const response = await axios.delete(
        `/api/freelancer/skills/${skillId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log("Delete skill response:", response.data); // Debug log
      
      if (response.data.success) {
        await refreshSkills();
        setSkillsSuccess("Skill deleted successfully!");
        setTimeout(() => setSkillsSuccess(""), 3000);
      } else {
        setSkillsError(response.data.message || "Failed to delete skill.");
      }
    } catch (err) {
      console.error("Delete skill error:", err); // Debug log
      setSkillsError(err.response?.data?.message || "Failed to delete skill.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    // Basic validation
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
      };
      const response = await axios.put(
        "/api/freelancer/profile",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setSuccess("Profile updated successfully!");
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
      <div className="container" style={{ maxWidth: 600, margin: "40px auto" }}>
        <div className="card shadow p-4">
          <h2 className="mb-4 text-center">Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">First Name</label>
                <input type="text" className="form-control" name="first_name" value={form.first_name} onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Last Name</label>
                <input type="text" className="form-control" name="last_name" value={form.last_name} onChange={handleChange} required />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" name="email" value={form.email} readOnly disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input type="text" className="form-control" name="phone" value={form.phone || ""} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Address</label>
              <input type="text" className="form-control" name="address" value={form.address || ""} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Job Title</label>
              <input type="text" className="form-control" name="headline" value={form.headline || ""} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Experience (years)</label>
              <input type="number" min="0" className="form-control" name="years_experience" value={form.years_experience || ""} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Summary</label>
              <textarea className="form-control" name="summary" value={form.summary || ""} onChange={handleChange} rows={3} />
            </div>
            <div className="mb-3">
              <label className="form-label">LinkedIn URL</label>
              <input type="url" className="form-control" name="linkedin_url" value={form.linkedin_url || ""} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">GitHub URL</label>
              <input type="url" className="form-control" name="github_url" value={form.github_url || ""} onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label className="form-label">Current Status</label>
              <input type="text" className="form-control" name="current_status" value={form.current_status || ""} onChange={handleChange} />
            </div>

            {/* Skills Section */}
            <div className="mb-4">
              <h5 className="mb-3" style={{ color: accent, fontWeight: 600 }}>
                <i className="bi bi-tools me-2"></i>
                Skills & Expertise
              </h5>
              
              {/* Add New Skill Form */}
              <div className="card mb-3" style={{ borderColor: accent }}>
                <div className="card-header" style={{ background: accent, color: 'white', fontWeight: 600 }}>
                  Add New Skill
                </div>
                <div className="card-body">
                  <form onSubmit={handleAddSkill} onClick={(e) => e.stopPropagation()}>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <label className="form-label">Skill Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="skill_name" 
                          value={newSkill.skill_name} 
                          onChange={handleNewSkillChange}
                          placeholder="e.g., JavaScript, React, Python"
                        />
                      </div>
                      <div className="col-md-3 mb-2">
                        <label className="form-label">Proficiency Level</label>
                        <select 
                          className="form-control" 
                          name="proficiency_level" 
                          value={newSkill.proficiency_level} 
                          onChange={handleNewSkillChange}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                      <div className="col-md-3 mb-2">
                        <label className="form-label">Years Experience</label>
                        <input 
                          type="number" 
                          min="0" 
                          className="form-control" 
                          name="years_experience" 
                          value={newSkill.years_experience} 
                          onChange={handleNewSkillChange}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-sm" style={{ background: accent, color: 'white', border: 'none' }}>
                      <i className="bi bi-plus me-1"></i>
                      Add Skill
                    </button>
                  </form>
                </div>
              </div>

              {/* Skills List */}
              {skills.length > 0 && (
                <div className="card" onClick={(e) => e.stopPropagation()}>
                  <div className="card-header" style={{ background: '#f8f9fa', fontWeight: 600 }}>
                    Your Skills ({skills.length})
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      {skills.map((skill) => (
                        <div key={skill.freelancer_skill_id} className="col-md-6">
                          <div style={{
                            background: '#f8f9fa',
                            borderRadius: 12,
                            padding: '16px',
                            border: '1px solid #e9ecef',
                            position: 'relative'
                          }}>
                            {editingSkill === skill.freelancer_skill_id ? (
                              <div>
                                <div className="mb-2">
                                  <label className="form-label" style={{ fontSize: 14, fontWeight: 600 }}>Skill Name</label>
                                  <input 
                                    type="text" 
                                    className="form-control form-control-sm" 
                                    value={skill.skill_name} 
                                    readOnly
                                  />
                                </div>
                                <div className="row mb-2">
                                  <div className="col-6">
                                    <label className="form-label" style={{ fontSize: 14, fontWeight: 600 }}>Level</label>
                                    <select 
                                      className="form-control form-control-sm" 
                                      value={editingSkillData.proficiency_level || "Intermediate"}
                                      onChange={(e) => setEditingSkillData({ ...editingSkillData, proficiency_level: e.target.value })}
                                    >
                                      <option value="Beginner">Beginner</option>
                                      <option value="Intermediate">Intermediate</option>
                                      <option value="Advanced">Advanced</option>
                                      <option value="Expert">Expert</option>
                                    </select>
                                  </div>
                                  <div className="col-6">
                                    <label className="form-label" style={{ fontSize: 14, fontWeight: 600 }}>Years</label>
                                    <input 
                                      type="number" 
                                      min="0" 
                                      className="form-control form-control-sm" 
                                      value={editingSkillData.years_experience || ""} 
                                      onChange={(e) => setEditingSkillData({ ...editingSkillData, years_experience: e.target.value })}
                                    />
                                  </div>
                                </div>
                                <div className="d-flex gap-2">
                                  <button 
                                    type="button"
                                    className="btn btn-sm btn-success"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleUpdateSkill(skill.freelancer_skill_id);
                                    }}
                                  >
                                    <i className="bi bi-check me-1"></i>
                                    Save
                                  </button>
                                  <button 
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setEditingSkill(null);
                                      setEditingSkillData({});
                                    }}
                                  >
                                    <i className="bi bi-x me-1"></i>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
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
                                    {skill.proficiency_level || "Intermediate"}
                                  </span>
                                </div>
                                {skill.years_experience !== undefined && skill.years_experience !== null && (
                                  <div style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>
                                    <i className="bi bi-clock me-1"></i>
                                    {skill.years_experience} years experience
                                  </div>
                                )}
                                <div className="d-flex gap-2">
                                  <button 
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      startEditingSkill(skill);
                                    }}
                                  >
                                    <i className="bi bi-pencil me-1"></i>
                                    Edit
                                  </button>
                                  <button 
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteSkill(skill.freelancer_skill_id);
                                    }}
                                  >
                                    <i className="bi bi-trash me-1"></i>
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* No Skills Message */}
              {skills.length === 0 && (
                <div className="card" onClick={(e) => e.stopPropagation()}>
                  <div className="card-body text-center" style={{ color: '#888', padding: '40px 20px' }}>
                    <i className="bi bi-tools" style={{ fontSize: 48, color: '#ddd', marginBottom: 16 }}></i>
                    <p>No skills listed yet. Add your first skill above!</p>
                  </div>
                </div>
              )}

              {/* Skills Messages */}
              {skillsError && <div className="alert alert-danger mt-3" onClick={(e) => e.stopPropagation()}>{skillsError}</div>}
              {skillsSuccess && <div className="alert alert-success mt-3" onClick={(e) => e.stopPropagation()}>{skillsSuccess}</div>}
            </div>

            {error && <div className="alert alert-danger text-center">{error}</div>}
            {success && <div className="alert alert-success text-center">{success}</div>}
            <div className="d-grid mt-3">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
          <div className="text-center mt-3">
            <button className="btn btn-link" onClick={() => navigate("/freelancer/profile")}>Cancel</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreelancerEditProfile; 