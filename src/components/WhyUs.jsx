import React from 'react';
import { Link } from 'react-router-dom';

const WhyUs = () => {
  return (
    <section id="why-us" className="why-us section">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Why CV‑Connect?</h2>
        <p>Discover the advantages of a platform designed for modern talent and forward-thinking associates.</p>
      </div>
      <div className="container">
        <div className="row gy-4" data-aos="fade-up" data-aos-delay="100">
          <div className="col-md-4">
            <div className="card">
              <div className="icon"><i className="bi bi-lightning-charge"></i></div>
              <h2 className="title">Instant Profiles</h2>
              <p>Upload your CV and let our system build your professional profile in seconds.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="icon"><i className="bi bi-shield-check"></i></div>
              <h2 className="title">Verified Network</h2>
              <p>Work with trusted associates and companies, all verified by our admin team.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="icon"><i className="bi bi-people"></i></div>
              <h2 className="title">Smart Connections</h2>
              <p>Find and connect with the right people, based on skills, experience, and goals.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs; 