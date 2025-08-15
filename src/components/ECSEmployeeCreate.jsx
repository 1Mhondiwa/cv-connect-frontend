import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminCreate.css';

const ECSEmployeeCreate = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    secretKey: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/create-ecs-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          secretKey: formData.secretKey
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('ECS Employee created successfully! You can now login.');
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          secretKey: ''
        });
      } else {
        setError(data.message || 'Failed to create ECS Employee');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-create-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">
                  <i className="bi bi-person-badge"></i> Create ECS Employee Account
                </h3>
              </div>
              <div className="card-body">
                {message && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                  </div>
                )}
                
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <i className="bi bi-envelope"></i> Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      <i className="bi bi-lock"></i> Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter password (min 6 characters)"
                      minLength="6"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      <i className="bi bi-lock-fill"></i> Confirm Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm password"
                      minLength="6"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="secretKey" className="form-label">
                      <i className="bi bi-key"></i> ECS Employee Secret Key
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="secretKey"
                      name="secretKey"
                      value={formData.secretKey}
                      onChange={handleChange}
                      required
                      placeholder="Enter ECS Employee secret key"
                    />
                    <div className="form-text">
                      <i className="bi bi-info-circle"></i> You need the correct secret key to create an ECS Employee account.
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus"></i> Create ECS Employee Account
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-3 text-center">
                  <p className="text-muted">
                    <i className="bi bi-shield-check"></i> This form is for authorized personnel only.
                  </p>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigate('/login')}
                  >
                    <i className="bi bi-arrow-left"></i> Back to Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ECSEmployeeCreate;
