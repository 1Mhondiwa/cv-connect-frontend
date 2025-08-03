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
  const [newSkill, setNewSkill] = useState({ skill_name: "", proficiency_level: "Intermediate", years_experience: 1 });
  const [editingSkill, setEditingSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [skillError, setSkillError] = useState("");
  const [skillSuccess, setSkillSuccess] = useState("");
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

  const handleSkillChange = (e) => {
    setNewSkill({ ...newSkill, [e.target.name]: e.target.value });
    setSkillError("");
    setSkillSuccess("");
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.skill_name.trim()) {
      setSkillError("Skill name is required.");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("/api/freelancer/skills", newSkill, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setSkills([...skills, { 
          ...newSkill, 
          freelancer_skill_id: response.data.freelancer_skill_id,
          skill_id: response.data.freelancer_skill_id 
        }]);
        setNewSkill({ skill_name: "", proficiency_level: "Intermediate", years_experience: 1 });
        setSkillSuccess("Skill added successfully!");
        setTimeout(() => setSkillSuccess(""), 3000);
      }
    } catch (err) {
      setSkillError(err.response?.data?.message || "Failed to add skill.");
    }
  };

  const handleUpdateSkill = async (skillId, updatedSkill) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`/api/freelancer/skills/${skillId}`, updatedSkill, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setSkills(skills.map(skill => 
          skill.freelancer_skill_id === skillId ? { ...skill, ...updatedSkill } : skill
        ));
        setEditingSkill(null);
        setSkillSuccess("Skill updated successfully!");
        setTimeout(() => setSkillSuccess(""), 3000);
      }
    } catch (err) {
      setSkillError(err.response?.data?.message || "Failed to update skill.");
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`/api/freelancer/skills/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setSkills(skills.filter(skill => skill.freelancer_skill_id !== skillId));
        setSkillSuccess("Skill deleted successfully!");
        setTimeout(() => setSkillSuccess(""), 3000);
      }
    } catch (err) {
      setSkillError(err.response?.data?.message || "Failed to delete skill.");
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

            {/* Skills Management Section */}
            <div className="mb-4">
              <h5 className="mb-3" style={{ color: accent, fontWeight: 600 }}>
                <i className="bi bi-tools me-2"></i>
                Skills & Expertise
              </h5>
              
              {/* Add New Skill Form */}
              <div className="card mb-3" style={{ borderColor: accent }}>
                <div className="card-body">
                  <h6 className="card-title mb-3">Add New Skill</h6>
                  <form onSubmit={handleAddSkill}>
                    <div className="row">
                      <div className="col-md-4 mb-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Skill name"
                          name="skill_name"
                          value={newSkill.skill_name}
                          onChange={handleSkillChange}
                          required
                        />
                      </div>
                      <div className="col-md-3 mb-2">
                        <select
                          className="form-control"
                          name="proficiency_level"
                          value={newSkill.proficiency_level}
                          onChange={handleSkillChange}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                      <div className="col-md-3 mb-2">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Years"
                          name="years_experience"
                          value={newSkill.years_experience}
                          onChange={handleSkillChange}
                          min="0"
                        />
                      </div>
                      <div className="col-md-2 mb-2">
                        <button type="submit" className="btn btn-primary w-100" style={{ background: accent, borderColor: accent }}>
                          Add
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Skills List */}
              {skills.length > 0 && (
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title mb-3">Your Skills</h6>
                    <div className="row g-2">
                      {skills.map((skill) => (
                        <div key={skill.freelancer_skill_id} className="col-md-6">
                          <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                            <div>
                              <strong>{skill.skill_name}</strong>
                              <br />
                              <small className="text-muted">
                                {skill.proficiency_level} • {skill.years_experience} years
                              </small>
                            </div>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => setEditingSkill(skill)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteSkill(skill.freelancer_skill_id)}
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Skill Modal */}
              {editingSkill && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Edit Skill</h5>
                        <button type="button" className="btn-close" onClick={() => setEditingSkill(null)}></button>
                      </div>
                      <div className="modal-body">
                        <div className="mb-3">
                          <label className="form-label">Skill Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editingSkill.skill_name}
                            readOnly
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Proficiency Level</label>
                          <select
                            className="form-control"
                            value={editingSkill.proficiency_level}
                            onChange={(e) => setEditingSkill({...editingSkill, proficiency_level: e.target.value})}
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Years of Experience</label>
                          <input
                            type="number"
                            className="form-control"
                            value={editingSkill.years_experience}
                            onChange={(e) => setEditingSkill({...editingSkill, years_experience: parseInt(e.target.value) || 0})}
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setEditingSkill(null)}>
                          Cancel
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-primary" 
                          style={{ background: accent, borderColor: accent }}
                          onClick={() => handleUpdateSkill(editingSkill.freelancer_skill_id, {
                            proficiency_level: editingSkill.proficiency_level,
                            years_experience: editingSkill.years_experience
                          })}
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="modal-backdrop fade show"></div>
                </div>
              )}

              {skillError && <div className="alert alert-danger mt-2">{skillError}</div>}
              {skillSuccess && <div className="alert alert-success mt-2">{skillSuccess}</div>}
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