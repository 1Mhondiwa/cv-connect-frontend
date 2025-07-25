import React from 'react';
import { useNavigate } from 'react-router-dom';

const accent = '#fd680e';

const WelcomeFreelancer = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(120deg, #fff 60%, #f8f4f2 100%)' }}>
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-lg-8 col-xl-6">
            <div className="bg-white rounded-4 shadow-lg p-5 text-center" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.07)' }}>
              <div className="mb-4">
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 90, height: 90, background: 'rgba(253,104,14,0.1)' }}>
                  <i className="bi bi-emoji-smile" style={{ fontSize: 40, color: accent }}></i>
                </div>
              </div>
              <h2 style={{ color: '#444', fontWeight: 700, marginBottom: 12 }}>Welcome to CV-Connect!</h2>
              <p style={{ color: '#888', fontSize: 18, marginBottom: 24 }}>
                We're excited to have you join our community of talented freelancers.<br/>
                To get started, please upload your CV. This will allow us to auto-create your profile and connect you with opportunities!
              </p>
              <div className="mb-4">
                <button
                  className="btn dashboard-btn"
                  style={{
                    background: accent,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 30,
                    padding: '14px 32px',
                    fontWeight: 600,
                    fontSize: 18,
                    transition: 'transform 0.18s, box-shadow 0.18s'
                  }}
                  onClick={() => navigate('/freelancer/upload')}
                >
                  <i className="bi bi-upload me-2"></i>
                  Upload CV & Get Started
                </button>
              </div>
              <div className="row mt-4 g-3">
                <div className="col-md-6">
                  <div className="bg-light rounded-3 p-3" style={{ background: 'rgba(253,104,14,0.05)' }}>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-shield-check me-2" style={{ color: accent }}></i>
                      <h6 className="mb-0" style={{ color: '#444', fontWeight: 600 }}>Secure & Private</h6>
                    </div>
                    <p className="mb-0" style={{ color: '#666', fontSize: 13 }}>
                      Your CV is encrypted and only used to build your profile.
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-light rounded-3 p-3" style={{ background: 'rgba(253,104,14,0.05)' }}>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-lightbulb me-2" style={{ color: accent }}></i>
                      <h6 className="mb-0" style={{ color: '#444', fontWeight: 600 }}>AI-Powered</h6>
                    </div>
                    <p className="mb-0" style={{ color: '#666', fontSize: 13 }}>
                      We use smart technology to extract your skills and experience.
                    </p>
                  </div>
                </div>
              </div>
              <style>{`
                .dashboard-btn:hover, .dashboard-btn:focus {
                  transform: scale(1.07);
                  box-shadow: 0 4px 24px rgba(253,104,14,0.18);
                  z-index: 2;
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeFreelancer; 