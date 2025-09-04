import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkFreelancerCV = async () => {
      if (requiredRole === 'freelancer' && isAuthenticated && user?.user_type === 'freelancer') {
        setChecking(true);
        try {
          const token = localStorage.getItem('token');
          const profileRes = await api.get('/freelancer/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (profileRes.data.success) {
            if (!profileRes.data.profile.cv) {
              // Use setTimeout to avoid setState during render
              setTimeout(() => {
                navigate('/freelancer/welcome', { replace: true });
              }, 0);
            }
          }
        } catch (err) {
          // If profile fetch fails, let the route render (could be handled elsewhere)
          console.warn('Error checking freelancer CV:', err);
        } finally {
          setChecking(false);
        }
      }
    };
    checkFreelancerCV();
    // Only run when user, isAuthenticated, or requiredRole changes
  }, [user, isAuthenticated, requiredRole, navigate]);

  if (loading || checking) {
    return <div className="min-vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border" style={{ color: '#fd680e' }} role="status"></div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.user_type !== requiredRole) {
    // Optionally redirect to a not-authorized page
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute; 