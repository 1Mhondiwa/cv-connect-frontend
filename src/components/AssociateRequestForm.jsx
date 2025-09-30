import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';

const accent = '#fd680e';

const AssociateRequestForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    company_name: '',
    industry: '',
    contact_person: '',
    phone: '',
    address: '',
    website: '',
    request_reason: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }

    if (!formData.contact_person) {
      newErrors.contact_person = 'Contact person is required';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.company_name) {
      newErrors.company_name = 'Company name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('Submitting associate request:', formData);
      const response = await api.post('/associate-request/submit', formData);
      console.log('Response received:', response.data);
      
      if (response.data.success) {
        setSuccess(true);
        setFormData({
          email: '',
          company_name: '',
          industry: '',
          contact_person: '',
          phone: '',
          address: '',
          website: '',
          request_reason: ''
        });
      } else {
        setError(response.data.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="contact section">
        <div className="container" data-aos="fade-up">
          <div className="row gy-4">
            <div className="col-lg-8 mx-auto">
              <div className="bg-white rounded-4 shadow-sm p-5 text-center" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
                <div style={{ fontSize: 64, color: accent, marginBottom: 24 }}>
                  <i className="bi bi-check-circle"></i>
                </div>
                <h3 style={{ color: accent, fontWeight: 700, marginBottom: 16 }}>Request Submitted Successfully!</h3>
                <p style={{ fontSize: 18, color: '#666', marginBottom: 32 }}>
                  Thank you for your interest in joining CV-Connect as an associate company. 
                  ESC will review your request and get back to you soon.
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <Link to="/" className="btn dashboard-btn" style={{ background: accent, color: '#fff', border: 'none', borderRadius: 30, fontWeight: 600, fontSize: 16, padding: '12px 32px' }}>
                    Back to Home
                  </Link>
                  <button 
                    onClick={() => setSuccess(false)} 
                    className="btn dashboard-btn" 
                    style={{ background: '#6c757d', color: '#fff', border: 'none', borderRadius: 30, fontWeight: 600, fontSize: 16, padding: '12px 32px' }}
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="contact section">
      <div className="container" data-aos="fade-up">
        <div className="row gy-4">
          <div className="col-lg-8 mx-auto">
            <div className="bg-white rounded-4 shadow-sm p-5" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)', border: '2px solid rgba(253, 104, 14, 0.2)' }}>
              <div className="text-center mb-5">
                <h2 style={{ color: accent, fontWeight: 700, marginBottom: 16 }}>Become an Associate Company</h2>
                <p style={{ fontSize: 18, color: '#666' }}>
                  Join CV-Connect as an associate company to access our pool of talented freelancers. 
                  ESC will review your request and approve qualified companies.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger mb-4" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="php-email-form">
                <div className="row gy-4">
                  <div className="col-md-6">
                    <label className="form-label">Company Name *</label>
                    <input 
                      type="text" 
                      name="company_name" 
                      className={`form-control ${errors.company_name ? 'is-invalid' : ''}`}
                      placeholder="Your Company Name" 
                      value={formData.company_name}
                      onChange={handleChange}
                    />
                    {errors.company_name && <div className="invalid-feedback">{errors.company_name}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email Address *</label>
                    <input 
                      type="email" 
                      name="email" 
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="company@example.com" 
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Industry *</label>
                    <input 
                      type="text" 
                      name="industry" 
                      className={`form-control ${errors.industry ? 'is-invalid' : ''}`}
                      placeholder="e.g., Technology, Healthcare, Finance" 
                      value={formData.industry}
                      onChange={handleChange}
                    />
                    {errors.industry && <div className="invalid-feedback">{errors.industry}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Contact Person *</label>
                    <input 
                      type="text" 
                      name="contact_person" 
                      className={`form-control ${errors.contact_person ? 'is-invalid' : ''}`}
                      placeholder="Full Name" 
                      value={formData.contact_person}
                      onChange={handleChange}
                    />
                    {errors.contact_person && <div className="invalid-feedback">{errors.contact_person}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Phone Number *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      placeholder="+1 (555) 123-4567" 
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Website (Optional)</label>
                    <input 
                      type="url" 
                      name="website" 
                      className="form-control"
                      placeholder="https://www.yourcompany.com" 
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Company Address (Optional)</label>
                    <textarea 
                      name="address" 
                      className="form-control" 
                      rows="3"
                      placeholder="Enter your company address"
                      value={formData.address}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Why do you want to join CV-Connect? (Optional)</label>
                    <textarea 
                      name="request_reason" 
                      className="form-control" 
                      rows="4"
                      placeholder="Tell us about your company and why you're interested in accessing our freelancer network..."
                      value={formData.request_reason}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="col-12 text-center">
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="btn dashboard-btn" 
                      style={{ background: accent, color: '#fff', border: 'none', borderRadius: 30, fontWeight: 600, fontSize: 16, padding: '12px 32px', transition: 'transform 0.18s, box-shadow 0.18s' }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Submitting Request...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </button>
                  </div>
                </div>
              </form>

              <div className="text-center mt-4">
                <small className="text-muted">
                  By submitting this request, you agree to our terms and conditions. 
                  ESC will review your application and contact you within 2-3 business days.
                </small>
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
        .is-invalid {
          border-color: #df1529 !important;
        }
        .invalid-feedback {
          color: #df1529;
        }
        .form-label {
          font-weight: 600;
          color: #444;
          margin-bottom: 8px;
        }
        .form-control {
          border-radius: 12px;
          border: 2px solid #e9ecef;
          padding: 12px 16px;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .form-control:focus {
          border-color: ${accent};
          box-shadow: 0 0 0 0.2rem rgba(253,104,14,0.25);
        }
      `}</style>
    </section>
  );
};

export default AssociateRequestForm; 