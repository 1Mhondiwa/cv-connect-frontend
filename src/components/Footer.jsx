import React from 'react';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <h3>CV‑Connect</h3>
      <p>
        Empowering freelancers. Connecting talent with opportunity.<br />
        &copy; {new Date().getFullYear()} CV‑Connect. All rights reserved.
      </p>
      <div className="social-links">
        {/* Add real links as needed */}
        <a href="#" title="LinkedIn"><i className="bi bi-linkedin"></i></a>
        <a href="#" title="Twitter"><i className="bi bi-twitter"></i></a>
        <a href="#" title="Email"><i className="bi bi-envelope"></i></a>
      </div>
      <div className="copyright">
        Designed with <span style={{color: '#fd680e'}}>Siimple</span> template.
      </div>
    </div>
  </footer>
);

export default Footer;
  