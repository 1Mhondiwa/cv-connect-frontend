import React, { useEffect } from 'react';

const Preloader = () => {
  useEffect(() => {
    // Remove preloader when component mounts
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.display = 'none';
    }
  }, []);

  return (
    <div id="preloader">
      <div className="line"></div>
    </div>
  );
};

export default Preloader; 