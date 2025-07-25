import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import MainPage from './components/MainPage';
import About from './components/About';
import WhyUs from './components/WhyUs';
import Services from './components/Services';
import Contact from './components/Contact';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FreelancerDashboard from './components/FreelancerDashboard';
import AdminCreate from './components/AdminCreate';
import AdminDashboard from './components/AdminDashboard';
import AssociateDashboard from './components/AssociateDashboard';
import NotFound from './components/NotFound';
import Footer from './components/Footer';
import Preloader from './components/Preloader';
import FreelancerCVUpload from './components/FreelancerCVUpload';
import FreelancerProfile from './components/FreelancerProfile';
import FreelancerEditProfile from './components/FreelancerEditProfile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import WelcomeFreelancer from './components/WelcomeFreelancer';

function ScrollTopButton() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed',
        right: 24,
        bottom: 32,
        zIndex: 3000,
        background: '#fd680e',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: 48,
        height: 48,
        boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
        fontSize: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.18s'
      }}
      aria-label="Scroll to top"
    >
      <i className="bi bi-arrow-up-short"></i>
    </button>
  );
}

function AppRoutes() {
  const location = useLocation();
  // Hide Navbar on dashboard pages, freelancer upload, freelancer profile, and freelancer edit profile page
  const hideNavbar =
    location.pathname.startsWith('/freelancer-dashboard') ||
    location.pathname.startsWith('/freelancer/upload') ||
    location.pathname.startsWith('/freelancer/profile') ||
    location.pathname.startsWith('/freelancer/edit') ||
    location.pathname.startsWith('/associate/dashboard') ||
    location.pathname.startsWith('/admin/dashboard');

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/whyus" element={<WhyUs />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/freelancer-dashboard" element={<ProtectedRoute requiredRole="freelancer"><FreelancerDashboard /></ProtectedRoute>} />
            <Route path="/freelancer/upload" element={<ProtectedRoute requiredRole="freelancer"><FreelancerCVUpload /></ProtectedRoute>} />
            <Route path="/freelancer/profile" element={<ProtectedRoute requiredRole="freelancer"><FreelancerProfile /></ProtectedRoute>} />
            <Route path="/freelancer/edit" element={<ProtectedRoute requiredRole="freelancer"><FreelancerEditProfile /></ProtectedRoute>} />
            <Route path="/freelancer/welcome" element={<WelcomeFreelancer />} />
          {/* Associate Routes - Not linked in public navigation */}
            <Route path="/associate/dashboard" element={<ProtectedRoute requiredRole="associate"><AssociateDashboard /></ProtectedRoute>} />
          {/* Admin Routes - Not linked in public navigation */}
          <Route path="/admin/create" element={<AdminCreate />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        
        {/* Scroll Top */}
        <a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center">
          <i className="bi bi-arrow-up-short"></i>
        </a>

        {/* Preloader */}
        <Preloader />
        <ScrollTopButton />
      </>
    );
}

function App() {
  return (
    <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
    </AuthProvider>
  );
}

export default App;
