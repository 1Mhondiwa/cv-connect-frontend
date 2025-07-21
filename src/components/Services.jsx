import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
  return (
    <section id="services" className="services section light-background">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>Platform Features</h2>
        <p>Everything you need to connect, collaborate, and succeed.</p>
      </div>
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
            <div className="service-item position-relative">
              <div className="icon"><i className="bi bi-file-earmark-arrow-up"></i></div>
              <h3>Automated CV Parsing</h3>
              <p>Upload your CV and let our AI extract your skills, experience, and more.</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
            <div className="service-item position-relative">
              <div className="icon"><i className="bi bi-search"></i></div>
              <h3>Skill‑Based Search</h3>
              <p>Associates can search for freelancers by skills, experience, and job title.</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
            <div className="service-item position-relative">
              <div className="icon"><i className="bi bi-person-check"></i></div>
              <h3>Verified Associates</h3>
              <p>Only approved associates can access the platform, ensuring trust and quality.</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="400">
            <div className="service-item position-relative">
              <div className="icon"><i className="bi bi-chat-dots"></i></div>
              <h3>Real‑Time Messaging</h3>
              <p>Communicate instantly and securely with associates and freelancers.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services; 