import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ECSEmployeeCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    position: '',
    employee_id_number: '',
    secretKey: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  // SECURITY NOTE: This route should not be exposed publicly in production
  // Consider adding additional security measures like IP whitelisting or a hardcoded token

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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    // Required fields validation
    if (!formData.first_name) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }
    if (!formData.position) {
      newErrors.position = 'Position is required';
    }

    // Secret key validation
    if (!formData.secretKey) {
      newErrors.secretKey = 'Secret key is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        position: formData.position.trim(),
        employee_id_number: formData.employee_id_number.trim() || null,
        secretKey: formData.secretKey
      };

      const response = await axios.post('/api/auth/create-ecs-employee', requestData);

      if (response.data.success) {
        setSuccessMessage('ECS Employee account created successfully! Redirecting to login...');
        
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify({
          user_id: response.data.data.user_id,
          email: response.data.data.email,
          user_type: 'ecs_employee'
        }));
        
        // Redirect to admin dashboard after a short delay
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      } else {
        setErrorMessage(response.data.message || 'ECS Employee creation failed');
      }
    } catch (error) {
      console.error('ECS Employee creation error:', error);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.path] = err.msg;
        });
        setErrors(backendErrors);
      } else {
        setErrorMessage('ECS Employee creation failed. Please check your secret key and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ecs-employee-create" className="contact section">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Create ECS Employee Account</h2>
        <p>⚠️ SECURITY: This route should not be exposed publicly</p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Security Warning */}
            <div className="alert alert-warning mb-4" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Security Notice:</strong> This page is for creating ECS Employee accounts only. 
              It should be protected and not accessible to the public in production environments.
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="sent-message mb-4">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="error-message mb-4">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="php-email-form" data-aos="fade-up" data-aos-delay="300">
              <div className="row gy-4">
                {/* Email */}
                <div className="col-md-12">
                  <input 
                    type="email" 
                    name="email" 
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="Employee Email" 
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {/* First Name and Last Name */}
                <div className="col-md-6">
                  <input 
                    type="text" 
                    name="first_name" 
                    className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                    placeholder="First Name" 
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                  {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
                </div>

                <div className="col-md-6">
                  <input 
                    type="text" 
                    name="last_name" 
                    className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                    placeholder="Last Name" 
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                  {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
                </div>

                {/* Phone and Department */}
                <div className="col-md-6">
                  <input 
                    type="tel" 
                    name="phone" 
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    placeholder="Phone Number" 
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                </div>

                <div className="col-md-6">
                  <input 
                    type="text" 
                    name="department" 
                    className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                    placeholder="Department" 
                    value={formData.department}
                    onChange={handleChange}
                  />
                  {errors.department && <div className="invalid-feedback">{errors.department}</div>}
                </div>

                {/* Position and Employee ID Number */}
                <div className="col-md-6">
                  <input 
                    type="text" 
                    name="position" 
                    className={`form-control ${errors.position ? 'is-invalid' : ''}`}
                    placeholder="Position/Job Title" 
                    value={formData.position}
                    onChange={handleChange}
                  />
                  {errors.position && <div className="invalid-feedback">{errors.position}</div>}
                </div>

                <div className="col-md-6">
                  <input 
                    type="text" 
                    name="employee_id_number" 
                    className="form-control"
                    placeholder="Employee ID Number (Optional)" 
                    value={formData.employee_id_number}
                    onChange={handleChange}
                  />
                </div>

                {/* Password */}
                <div className="col-md-6">
                  <div className="position-relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      name="password" 
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Password" 
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute end-0 top-0 h-100 d-flex align-items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ zIndex: 10 }}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                {/* Confirm Password */}
                <div className="col-md-6">
                  <div className="position-relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password" 
                      className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
                      placeholder="Confirm Password" 
                      value={formData.confirm_password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute end-0 top-0 h-100 d-flex align-items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ zIndex: 10 }}
                    >
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  {errors.confirm_password && <div className="invalid-feedback">{errors.confirm_password}</div>}
                </div>

                {/* Secret Key */}
                <div className="col-md-12">
                  <div className="position-relative">
                    <input 
                      type={showSecretKey ? "text" : "password"}
                      name="secretKey" 
                      className={`form-control ${errors.secretKey ? 'is-invalid' : ''}`}
                      placeholder="ECS Employee Secret Key" 
                      value={formData.secretKey}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute end-0 top-0 h-100 d-flex align-items-center"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      style={{ zIndex: 10 }}
                    >
                      <i className={`bi ${showSecretKey ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  {errors.secretKey && <div className="invalid-feedback">{errors.secretKey}</div>}
                  <small className="form-text text-muted">
                    Enter the ECS_EMPLOYEE_SECRET_KEY value from your backend .env file
                  </small>
                </div>

                {/* Submit Button */}
                <div className="col-md-12 text-center">
                  <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating ECS Employee...
                      </>
                    ) : (
                      'Create ECS Employee Account'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ECSEmployeeCreate;
