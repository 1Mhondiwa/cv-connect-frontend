import React from 'react';

const About = () => {
  return (
    <section id="about" className="about section">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>About CV‑Connect</h2>
        <p>We're the platform where freelancers get hired and companies find the talent they need. Join thousands of professionals who are already working and earning through CV-Connect.</p>
      </div>
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row gy-4">
          <div className="col-lg-6">
            <img src="assets/img/about.jpg" className="img-fluid" alt="" />
          </div>
          <div className="col-lg-6 content">
            <h3>Why People Choose CV‑Connect?</h3>
            <ul>
              <li><i className="bi bi-file-earmark-text"></i> <span>Quick Profile Setup</span> — Upload your CV and start getting job offers.</li>
              <li><i className="bi bi-person-check"></i> <span>Verified Companies</span> — Work with trusted businesses and recruiters.</li>
              <li><i className="bi bi-search"></i> <span>Smart Job Matching</span> — Get matched with projects that fit your skills.</li>
              <li><i className="bi bi-chat-dots"></i> <span>Direct Communication</span> — Talk directly with clients and get hired faster.</li>
            </ul>
            <p>CV‑Connect is where professionals come to find work and companies come to find talent. Start earning today.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
  