import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon: 'bi bi-briefcase', label: 'Get Hired Fast' },
  { icon: 'bi bi-people', label: 'Find Top Talent' },
  { icon: 'bi bi-chat-dots', label: 'Direct Communication' }
];

const stats = [
  { value: '1000+', label: 'Freelancers Hired' },
  { value: '500+', label: 'Companies Hiring' },
  { value: '98%', label: 'Job Success Rate' }
];

const taglines = [
  "Get Your Next Job Today",
  "Hire the Best Freelancers",
  "Connect. Get Hired. Succeed.",
  "Your Skills, Our Network",
  "Find Your Perfect Match"
];

const Home = () => {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(false);
      setTimeout(() => {
        setTaglineIndex((prev) => (prev + 1) % taglines.length);
        setAnimate(true);
      }, 400);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section
        className="hero d-flex align-items-center justify-content-center"
        style={{
          minHeight: '100vh',
          background: 'url(/assets/img/hero-bg.jpg) center center/cover no-repeat',
          position: 'relative'
        }}
      >
      {/* Overlay for better contrast */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 1
        }}
      />
      <div
        className="container text-center"
        style={{
          position: 'relative',
          zIndex: 2,
          color: '#fff',
          maxWidth: 700,
          padding: '40px 20px',
          borderRadius: 16
        }}
      >
        <h1 style={{ fontWeight: 700, fontSize: '2.8rem', marginBottom: 12 }}>
          Welcome to <span style={{ color: '#fd680e' }}>CV‑Connect</span>
        </h1>
        {/* Sliding Tagline */}
        <div
          style={{
            minHeight: 40,
            marginBottom: 18,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontWeight: 400,
              fontSize: '1.4rem',
              transition: 'transform 0.4s cubic-bezier(.4,2,.6,1), opacity 0.4s',
              transform: animate ? 'translateY(0)' : 'translateY(-30px)',
              opacity: animate ? 1 : 0
            }}
            key={taglineIndex}
          >
            {taglines[taglineIndex]}
                </span>
            </div>
        <p style={{ fontSize: '1.1rem', marginBottom: 28 }}>
          Join thousands of freelancers who are already getting hired through CV-Connect. Upload your CV, get matched with companies, and start earning. For companies, find skilled professionals ready to work on your projects.
        </p>
        {/* Features */}
        <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
          {features.map((f) => (
            <span
              key={f.label}
              className="badge"
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontSize: 16,
                padding: '10px 18px',
                borderRadius: 30,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 500
              }}
            >
              <i className={f.icon} style={{ fontSize: 20, color: '#fd680e' }}></i>
              {f.label}
            </span>
          ))}
                </div>
        {/* CTA Buttons with animation */}
        <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
          <Link
            to="/register"
            className="btn btn-primary hero-cta"
            style={{
              background: '#fd680e',
              border: 'none',
              borderRadius: 30,
              padding: '12px 32px',
              fontSize: 18,
              fontWeight: 600,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              transition: 'transform 0.18s, box-shadow 0.18s'
            }}
          >
                Join as Freelancer
          </Link>
          <Link
            to="/login"
            className="btn btn-outline-light hero-cta"
            style={{
              borderRadius: 30,
              padding: '12px 32px',
              fontSize: 18,
              fontWeight: 600,
              border: '2px solid #fd680e',
              color: '#fd680e',
              background: 'rgba(255,255,255,0.08)',
              transition: 'transform 0.18s, box-shadow 0.18s'
            }}
          >
            Login
          </Link>
            </div>
        {/* Stats */}
        <div className="d-flex justify-content-center gap-4 mt-4 flex-wrap">
          {stats.map((s) => (
            <div key={s.label} style={{ minWidth: 120 }}>
              <div style={{ fontWeight: 700, fontSize: 22, color: '#fd680e' }}>{s.value}</div>
              <div style={{ fontSize: 15, color: '#fff', opacity: 0.85 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Button animation styles */}
      <style>{`
        .hero-cta:hover, .hero-cta:focus {
          transform: scale(1.07);
          box-shadow: 0 4px 24px rgba(253,104,14,0.18);
          z-index: 2;
        }
      `}</style>
    </section>

    {/* Associate Call-to-Action Section */}
    <section className="py-5" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-8 mx-auto text-center">
            <div className="bg-white rounded-4 shadow-sm p-5" style={{ boxShadow: '0 2px 16px rgba(253,104,14,0.08)' }}>
              <div style={{ fontSize: 48, color: '#fd680e', marginBottom: 24 }}>
                <i className="bi bi-building"></i>
              </div>
              <h2 style={{ color: '#333', fontWeight: 700, marginBottom: 16 }}>
                Need Skilled Freelancers for Your Projects?
              </h2>
              <p style={{ fontSize: 18, color: '#666', marginBottom: 32, lineHeight: 1.6 }}>
                Companies are already hiring talented freelancers through CV-Connect. Join as an associate and access our pool of verified professionals ready to work on your projects.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link
                  to="/associate-request"
                  className="btn dashboard-btn"
                  style={{ 
                    background: '#fd680e', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 30, 
                    fontWeight: 600, 
                    fontSize: 16, 
                    padding: '12px 32px',
                    transition: 'transform 0.18s, box-shadow 0.18s'
                  }}
                >
                  <i className="bi bi-arrow-right me-2"></i>
                  Apply to Become Associate
                </Link>
                <Link
                  to="/services"
                  className="btn dashboard-btn"
                  style={{ 
                    background: 'transparent', 
                    color: '#fd680e', 
                    border: '2px solid #fd680e', 
                    borderRadius: 30, 
                    fontWeight: 600, 
                    fontSize: 16, 
                    padding: '12px 32px',
                    transition: 'transform 0.18s, box-shadow 0.18s'
                  }}
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default Home;