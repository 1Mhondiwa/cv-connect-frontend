import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
  return (
    <section id="services" className="services section light-background">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>What You Get</h2>
        <p>Everything you need to find work, hire talent, and grow your business.</p>
      </div>
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
            <div className="service-item position-relative">
              <div className="icon"><i className="bi bi-file-earmark-arrow-up"></i></div>
              <h3>Quick Profile Setup</h3>
              <p>Upload your CV and get a professional profile that companies can see and hire from.</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
            <div className="service-item position-relative">
              <div className="icon"><i className="bi bi-search"></i></div>
              <h3>Find the Right Match</h3>
              <p>Companies can search and find freelancers with the exact skills they need for their projects.</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
            <div className="service-item position-relative">
              <div className="icon"><i className="bi bi-person-check"></i></div>
              <h3>Verified Users</h3>
              <p>All freelancers and companies are verified, so you can trust who you're working with.</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="400">
            <div className="service-item position-relative">
              <div className="icon"><i className="bi bi-chat-dots"></i></div>
              <h3>Direct Communication</h3>
              <p>Talk directly with clients and freelancers to discuss projects, rates, and get hired faster.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services; 