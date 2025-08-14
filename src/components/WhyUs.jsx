import React from 'react';
import { Link } from 'react-router-dom';

const WhyUs = () => {
  return (
    <section id="why-us" className="why-us section">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Why CV‑Connect?</h2>
        <p>See why thousands of freelancers and companies choose CV-Connect to get work done and find opportunities.</p>
      </div>
      <div className="container">
        <div className="row gy-4" data-aos="fade-up" data-aos-delay="100">
          <div className="col-md-4">
            <div className="card">
              <div className="icon"><i className="bi bi-lightning-charge"></i></div>
              <h2 className="title">Start Working Fast</h2>
              <p>Upload your CV and get matched with projects that fit your skills. Start earning within days.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="icon"><i className="bi bi-shield-check"></i></div>
              <h2 className="title">Trusted Network</h2>
              <p>Work with verified companies and freelancers. Our platform ensures quality and reliability.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="icon"><i className="bi bi-people"></i></div>
              <h2 className="title">Direct Connections</h2>
              <p>Connect directly with clients and freelancers. No middlemen, faster hiring and better rates.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs; 