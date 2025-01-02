import React, { useState, useEffect } from 'react';
import '../styles/loader.css';
import logo from '../images/logo.svg'; // Adjust the path to your logo image

const Loader = ({ loading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prevProgress + 10;
        });
      }, 200);
    }
  }, [loading]);

  return (
    <div className={`loader-container ${!loading && 'loaded'}`}>
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      {loading && (
        <>
          <div className="loading-text">Loading...</div>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
        </>
      )}
    </div>
  );
};

export default Loader;
