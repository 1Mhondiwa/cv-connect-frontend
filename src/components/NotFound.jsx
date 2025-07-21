import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <section className="contact section">
      <div className="container section-title" data-aos="fade-up">
        <h2>404 - Page Not Found</h2>
        <p>The page you are looking for does not exist</p>
      </div>

      <div className="container text-center" data-aos="fade-up" data-aos-delay="100">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h3>Oops! Page not found</h3>
            <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
            <Link to="/" className="btn-get-started">Go Back Home</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound; 