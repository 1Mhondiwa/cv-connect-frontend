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
    years_experience: "",
    headline: "",
    summary: "",
    linkedin_url: "",
    github_url: "",
    current_status: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
        years_experience: form.years_experience,
        summary: form.summary,
        headline: form.headline,
        linkedin_url: form.linkedin_url,
        github_url: form.github_url,
        current_status: form.current_status,
        // address is optional, not shown in form
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