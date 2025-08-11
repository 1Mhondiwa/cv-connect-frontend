import React from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const accent = '#fd680e';

  return (
    <section id="contact" className="contact section" style={{ padding: '120px 0 80px 0', background: 'linear-gradient(120deg, #fff 60%, #f8f4f2 100%)' }}>
      {/* Section Title */}
      <div className="container section-title text-center" data-aos="fade-up">
        <h2 style={{ color: accent, fontWeight: 700, marginBottom: 16 }}>Get In Touch</h2>
        <p style={{ fontSize: 18, color: '#666', maxWidth: 600, margin: '0 auto' }}>
          Ready to transform your hiring process? Connect with CV-Connect and discover how we're revolutionizing talent acquisition.
        </p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        {/* Business Contact Cards */}
        <div className="row gy-4 mb-5" data-aos="fade-up" data-aos-delay="200">
          <div className="col-lg-4">
            <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
              <div className="card-body text-center p-4">
                <div style={{ fontSize: 48, color: accent, marginBottom: 20 }}>
                  <i className="bi bi-building"></i>
                </div>
                <h4 style={{ color: '#333', fontWeight: 700, marginBottom: 12 }}>Partnership Inquiries</h4>
                <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6 }}>
                  Interested in becoming an associate company? Join our network of trusted partners.
                </p>
                <Link 
                  to="/associate-request" 
                  className="btn"
                  style={{
                    background: accent,
                    color: '#fff',
                    borderRadius: 25,
                    padding: '10px 24px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    marginTop: 16
                  }}
                >
                  Apply as Associate
                </Link>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
              <div className="card-body text-center p-4">
                <div style={{ fontSize: 48, color: accent, marginBottom: 20 }}>
                  <i className="bi bi-headset"></i>
                </div>
                <h4 style={{ color: '#333', fontWeight: 700, marginBottom: 12 }}>Support & Help</h4>
                <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6 }}>
                  Need assistance with your account or have technical questions? Our support team is here to help.
                </p>
                <div className="mt-3">
                  <p style={{ margin: 0, fontSize: 14, color: '#888' }}>
                    <i className="bi bi-envelope me-2"></i>
                    support@cvconnect.com
                  </p>
                  <p style={{ margin: 0, fontSize: 14, color: '#888' }}>
                    <i className="bi bi-clock me-2"></i>
                    Mon-Fri: 9AM-6PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
              <div className="card-body text-center p-4">
                <div style={{ fontSize: 48, color: accent, marginBottom: 20 }}>
                  <i className="bi bi-chat-dots"></i>
                </div>
                <h4 style={{ color: '#333', fontWeight: 700, marginBottom: 12 }}>Business Development</h4>
                <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6 }}>
                  Looking to integrate CV-Connect into your enterprise? Let's discuss strategic partnerships.
                </p>
                <div className="mt-3">
                  <p style={{ margin: 0, fontSize: 14, color: '#888' }}>
                    <i className="bi bi-envelope me-2"></i>
                    business@cvconnect.com
                  </p>
                  <p style={{ margin: 0, fontSize: 14, color: '#888' }}>
                    <i className="bi bi-telephone me-2"></i>
                    +1 (555) 123-4567
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="row mt-5" data-aos="fade-up" data-aos-delay="300">
          <div className="col-lg-8 mx-auto">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
              <div className="card-body p-5">
                <div className="row">
                  <div className="col-md-6">
                    <h5 style={{ color: accent, fontWeight: 700, marginBottom: 20 }}>About CV-Connect</h5>
                    <p style={{ color: '#666', lineHeight: 1.7, marginBottom: 20 }}>
                      CV-Connect is a revolutionary platform that bridges the gap between skilled freelancers and forward-thinking companies. 
                      Our mission is to streamline the hiring process while ensuring quality matches for both parties.
                    </p>
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-geo-alt me-3" style={{ color: accent, fontSize: 18 }}></i>
                      <div>
                        <strong style={{ color: '#333' }}>Headquarters</strong><br />
                        <span style={{ color: '#666', fontSize: 14 }}>Johannesburg, South Africa</span>
                      </div>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <i className="bi bi-envelope me-3" style={{ color: accent, fontSize: 18 }}></i>
                      <div>
                        <strong style={{ color: '#333' }}>General Inquiries</strong><br />
                        <span style={{ color: '#666', fontSize: 14 }}>info@cvconnect.com</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h5 style={{ color: accent, fontWeight: 700, marginBottom: 20 }}>Quick Links</h5>
                    <div className="d-grid gap-2">
                      <Link 
                        to="/about" 
                        className="btn btn-outline-secondary"
                        style={{ 
                          borderRadius: 8, 
                          textAlign: 'left',
                          borderColor: '#ddd',
                          color: '#666'
                        }}
                      >
                        <i className="bi bi-info-circle me-2"></i>
                        Learn About Our Mission
                      </Link>
                      <Link 
                        to="/services" 
                        className="btn btn-outline-secondary"
                        style={{ 
                          borderRadius: 8, 
                          textAlign: 'left',
                          borderColor: '#ddd',
                          color: '#666'
                        }}
                      >
                        <i className="bi bi-gear me-2"></i>
                        Explore Our Services
                      </Link>
                      <Link 
                        to="/associate-request" 
                        className="btn btn-outline-secondary"
                        style={{ 
                          borderRadius: 8, 
                          textAlign: 'left',
                          borderColor: '#ddd',
                          color: '#666'
                        }}
                      >
                        <i className="bi bi-building me-2"></i>
                        Become an Associate
                      </Link>
                      <Link 
                        to="/register" 
                        className="btn btn-outline-secondary"
                        style={{ 
                          borderRadius: 8, 
                          textAlign: 'left',
                          borderColor: '#ddd',
                          color: '#666'
                        }}
                      >
                        <i className="bi bi-person-plus me-2"></i>
                        Join as Freelancer
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="row mt-5" data-aos="fade-up" data-aos-delay="400">
          <div className="col-12">
            <div className="text-center">
              <h4 style={{ color: '#333', fontWeight: 700, marginBottom: 30 }}>Platform Statistics</h4>
              <div className="row">
                <div className="col-md-3 col-6 mb-4">
                  <div className="text-center">
                    <div style={{ fontSize: 36, color: accent, fontWeight: 700, marginBottom: 8 }}>500+</div>
                    <div style={{ color: '#666', fontSize: 14 }}>Active Freelancers</div>
                  </div>
                </div>
                <div className="col-md-3 col-6 mb-4">
                  <div className="text-center">
                    <div style={{ fontSize: 36, color: accent, fontWeight: 700, marginBottom: 8 }}>50+</div>
                    <div style={{ color: '#666', fontSize: 14 }}>Associate Companies</div>
                  </div>
                </div>
                <div className="col-md-3 col-6 mb-4">
                  <div className="text-center">
                    <div style={{ fontSize: 36, color: accent, fontWeight: 700, marginBottom: 8 }}>1000+</div>
                    <div style={{ color: '#666', fontSize: 14 }}>Successful Matches</div>
                  </div>
                </div>
                <div className="col-md-3 col-6 mb-4">
                  <div className="text-center">
                    <div style={{ fontSize: 36, color: accent, fontWeight: 700, marginBottom: 8 }}>95%</div>
                    <div style={{ color: '#666', fontSize: 14 }}>Satisfaction Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        .card:hover {
          transform: translateY(-5px);
          transition: transform 0.3s ease;
        }
        .btn:hover {
          transform: scale(1.05);
          transition: transform 0.2s ease;
        }
      `}</style>
    </section>
  );
};

export default Contact; 