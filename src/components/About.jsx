import React from 'react';

const About = () => {
  return (
    <section id="about" className="about section">
      {/* Section Title */}
      <div className="container section-title" data-aos="fade-up">
        <h2>About CV‑Connect</h2>
        <p>Our mission is to streamline the hiring process by connecting verified associates with skilled freelancers, powered by intelligent CV parsing.</p>
      </div>
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row gy-4">
          <div className="col-lg-6">
            <img src="assets/img/about.jpg" className="img-fluid" alt="" />
          </div>
          <div className="col-lg-6 content">
            <h3>Why Choose CV‑Connect?</h3>
            <ul>
              <li><i className="bi bi-file-earmark-text"></i> <span>Automated CV Parsing</span> — Instantly create your profile from your CV.</li>
              <li><i className="bi bi-person-check"></i> <span>Verified Associates</span> — Only trusted companies and recruiters.</li>
              <li><i className="bi bi-search"></i> <span>Skill‑Based Search</span> — Associates can find the right talent, fast.</li>
              <li><i className="bi bi-chat-dots"></i> <span>Real‑Time Messaging</span> — Seamless communication between freelancers and associates.</li>
            </ul>
            <p>CV‑Connect is built for professionals who value efficiency, transparency, and meaningful connections.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
  